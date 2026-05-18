---
title: 大模型微调实战：LoRA、QLoRA 和全参数微调的选择
date: 2026-05-17
cover: https://picsum.photos/seed/llm-finetuning/800/400
desc: 从实战角度讲解大语言模型微调的完整流程，包括数据准备、训练策略和评估方法
tags: [LLM, 微调, LoRA, 深度学习]
---

## 什么时候需要微调

```
用户需求 → 选择方案
├── 通用问答 → 直接用基础模型（不需要微调）
├── 特定领域知识 → RAG（检索增强生成）
├── 特定输出格式/风格 → 微调
├── 特定任务能力（分类、抽取） → 微调
└── 完全定制的行为 → 微调 + RLHF
```

**微调 vs RAG 的选择**：
- 需要模型学习**新知识** → RAG
- 需要模型学习**新行为**（格式、风格、任务） → 微调
- 两者经常结合使用

## 微调方案对比

| 方案 | 显存需求 | 训练速度 | 效果 | 适用场景 |
|------|----------|----------|------|----------|
| **全参数微调** | 80GB+ (7B) | 慢 | 最好 | 有充足算力，追求极致效果 |
| **LoRA** | 24GB (7B) | 快 | 接近全参数 | 大多数场景的首选 |
| **QLoRA** | 10GB (7B) | 中 | 略低于 LoRA | 单卡消费级 GPU |

## LoRA 原理

LoRA（Low-Rank Adaptation）的核心思想：**不修改原始模型权重，而是在旁边加一个小的适配层**。

```
原始权重 W (d×k)  ← 冻结，不更新
      ↓
输出 = W·x + ΔW·x
           ↑
      ΔW = A·B  (A: d×r, B: r×k, r << d,k)
```

- 原始权重 W 完全冻结
- 只训练 A 和 B 两个小矩阵
- r（秩）通常设为 8-64，远小于 d 和 k
- 参数量减少 10000 倍

## 数据准备

### 指令微调数据格式

```json
[
  {
    "instruction": "将以下中文翻译成英文",
    "input": "今天天气很好，适合出去散步",
    "output": "The weather is nice today, perfect for going out for a walk."
  },
  {
    "instruction": "分析以下评论的情感",
    "input": "这部电影太棒了，演员演技一流，剧情紧凑",
    "output": "情感：正面（积极）\n理由：评论中使用了'太棒了'、'一流'、'紧凑'等正面词汇"
  },
  {
    "instruction": "从以下文本中提取人名",
    "input": "张三和李四是北京大学的教授，他们和王五一起发表了论文",
    "output": "人名：张三、李四、王五"
  }
]
```

### 数据质量要求

| 指标 | 要求 | 说明 |
|------|------|------|
| 数量 | 1000-10000 条 | 太少容易过拟合，太多收益递减 |
| 质量 | 人工审核 | 垃圾数据 = 垃圾模型 |
| 多样性 | 覆盖所有场景 | 不要只有一种类型的指令 |
| 格式 | 统一 | 所有样本遵循相同的格式 |

### 数据生成（用 GPT-4 辅助）

```python
import openai

def generate_training_data(seed_examples, target_count=5000):
    """用 GPT-4 生成更多训练数据"""
    prompt = f"""请根据以下示例，生成更多类似的指令微调数据。

示例：
{seed_examples}

要求：
1. 保持相同的格式
2. 覆盖不同的主题和场景
3. 输出为 JSON 数组
"""
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8
    )
    
    return parse_json(response.choices[0].message.content)
```

## 使用 Unsloth 加速微调

Unsloth 是目前最快的微调框架，比 Hugging Face 原生快 2-5 倍。

```python
# pip install unsloth
from unsloth import FastLanguageModel
import torch

# 加载模型（自动优化）
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3-8b-bnb-4bit",
    max_seq_length=2048,
    load_in_4bit=True,  # 4-bit 量化
)

# 添加 LoRA 适配器
model = FastLanguageModel.get_peft_model(
    model,
    r=16,              # LoRA 秩
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

# 准备数据
from datasets import Dataset
train_dataset = Dataset.from_list(training_data)

# 训练
from trl import SFTTrainer
from transformers import TrainingArguments

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=train_dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        max_steps=60,          # 或 num_train_epochs=3
        learning_rate=2e-4,    # LoRA 推荐的学习率
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        output_dir="outputs",
        optim="adamw_8bit",
    ),
)

trainer.train()
model.save_pretrained("lora_adapter")
```

### 硬件需求

| 模型 | 方案 | 显存 | 推荐 GPU |
|------|------|------|----------|
| Llama-3-8B | QLoRA (4-bit) | ~10GB | RTX 3080/4060 |
| Llama-3-8B | LoRA (16-bit) | ~20GB | RTX 3090/4090 |
| Llama-3-8B | 全参数 | ~80GB | A100 80GB |
| Qwen2.5-72B | QLoRA | ~48GB | 2× A100 40GB |

## 训练参数选择

### 关键参数

```python
training_args = {
    "learning_rate": 2e-4,       # LoRA 推荐 1e-4 ~ 5e-4
    "per_device_train_batch_size": 2,  # 显存允许的最大值
    "gradient_accumulation_steps": 4,  # 等效 batch_size = 2×4 = 8
    "num_train_epochs": 3,       # 或 max_steps
    "warmup_ratio": 0.05,        # 预热 5%
    "lr_scheduler_type": "cosine",  # 余弦退火
    "weight_decay": 0.01,
    "max_grad_norm": 1.0,        # 梯度裁剪
}
```

### 调参经验

- **学习率**：LoRA 用 2e-4，全参数用 1e-5 ~ 5e-5
- **Epoch**：3 轮通常够了，太多会过拟合
- **Batch Size**：越大越稳定，但受显存限制
- **LoRA 秩 (r)**：8 够用，16 更好，32 以上收益递减

## 评估方法

### 自动评估

```python
def evaluate_model(model, tokenizer, test_data):
    """在测试集上评估"""
    correct = 0
    total = len(test_data)
    
    for item in test_data:
        prompt = format_prompt(item["instruction"], item["input"])
        output = generate(model, tokenizer, prompt)
        
        # 简单匹配评估
        if item["output"].strip().lower() in output.strip().lower():
            correct += 1
    
    accuracy = correct / total
    print(f"准确率: {accuracy:.2%}")
    return accuracy
```

### 人工评估

自动评估只能检查格式正确性，真正的质量需要人工评估：

| 维度 | 评分标准 |
|------|----------|
| 准确性 | 回答是否正确 |
| 完整性 | 是否遗漏关键信息 |
| 相关性 | 是否回答了问题 |
| 流畅性 | 语言是否自然 |

## 实际案例：客服领域 LLM 微调

```python
# 客服场景的训练数据
customer_service_data = [
    {
        "instruction": "处理客户投诉",
        "input": "我买的商品有质量问题，要求退款！",
        "output": "非常抱歉给您带来不便。我理解您的感受，请提供以下信息以便我为您处理：\n1. 订单号\n2. 商品照片\n3. 具体问题描述\n\n我们将在收到信息后 24 小时内为您处理退款。"
    },
    {
        "instruction": "查询订单状态",
        "input": "我的订单什么时候能到？",
        "output": "请提供您的订单号，我来帮您查询物流状态。"
    },
    # ... 更多数据
]

# 训练后测试
test_queries = [
    "我收到的商品是坏的，我要退货",
    "订单号 123456 的物流信息",
    "你们支持哪些支付方式？"
]

for query in test_queries:
    response = generate(model, tokenizer, query)
    print(f"Q: {query}")
    print(f"A: {response}")
    print("---")
```

## 部署微调后的模型

```python
# 合并 LoRA 权重到基础模型
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3-8b-bnb-4bit",
)
model.load_adapter("lora_adapter")
model = model.merge_and_unload()

# 保存完整模型
model.save_pretrained("merged_model")
tokenizer.save_pretrained("merged_model")

# 用 vLLM 部署（高性能推理）
# pip install vllm
from vllm import LLM, SamplingParams

llm = LLM(model="merged_model", tensor_parallel_size=1)
sampling_params = SamplingParams(temperature=0.7, max_tokens=512)

outputs = llm.generate(["你好，请介绍一下自己"], sampling_params)
print(outputs[0].outputs[0].text)
```

## 总结

微调的关键要点：

1. **数据质量 > 数据数量**——1000 条高质量数据胜过 10000 条垃圾数据
2. **LoRA 是性价比最高的方案**——效果接近全参数，显存需求只有 1/4
3. **Unsloth 让微调变得简单**——消费级 GPU 就能微调 8B 模型
4. **评估不能只看自动指标**——人工评估才是最终标准
5. **微调 + RAG 是最佳组合**——微调学行为，RAG 学知识
