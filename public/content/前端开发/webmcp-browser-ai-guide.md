---
title: WebMCP：让浏览器成为 AI Agent 的游乐场
date: 2026-05-18
cover: https://picsum.photos/seed/webmcp-browser/800/400
desc: Chrome 已原生支持 WebMCP，你的网站可以直接暴露工具给 AI Agent，无需屏幕抓取
tags: [WebMCP, 浏览器, AI Agent, Chrome, W3C]
---

## 屏幕抓取的死胡同

之前的 AI Agent 操作网站的方式：截图 → 视觉模型识别 → 计算坐标 → 模拟点击。

这个过程有什么问题？

- **慢**：一次操作 5-10 秒
- **不准**：页面更新后坐标可能已经变了
- **贵**：每次都要跑视觉模型
- **脆弱**：任何 UI 变动都可能让 Agent 挂掉

2026 年 3 月，Chrome 发布了 WebMCP 早期预览版。这是一个革命性的改变：**网站可以主动向 AI Agent 暴露结构化的工具接口**。

## WebMCP 是什么？

WebMCP 是 MCP（Model Context Protocol）的浏览器变体，由 W3C Web Machine Learning Community Group 制定标准。

```
传统方式：
AI Agent → 截图 → 视觉模型 → 坐标 → 点击（脆弱、慢）

WebMCP 方式：
AI Agent ←→ WebMCP API ←→ 网站工具（直接、可靠）
```

核心思想：**与其让 AI 猜你的 UI，不如直接告诉 AI 你能做什么**。

## 一个简单的例子

假设你运营一个电商网站，想让 AI Agent 能帮用户下单。

### Step 1：定义工具

```javascript
// 在你的网站里注册 WebMCP 工具
const tools = [
  {
    name: "search_products",
    description: "搜索商品",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词" },
        category: { type: "string", enum: ["electronics", "clothing", "books"] }
      },
      required: ["query"]
    }
  },
  {
    name: "add_to_cart",
    description: "添加商品到购物车",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "string" },
        quantity: { type: "integer", default: 1 }
      },
      required: ["product_id"]
    }
  },
  {
    name: "checkout",
    description: "结算购物车",
    inputSchema: {
      type: "object",
      properties: {
        shipping_address: { type: "string" },
        payment_method: { type: "string", enum: ["credit_card", "paypal"] }
      },
      required: ["shipping_address", "payment_method"]
    }
  }
];
```

### Step 2：注册到浏览器

```javascript
// 检查浏览器是否支持 WebMCP
if ('webMCP' in navigator) {
  // 注册工具
  await navigator.webMCP.registerTools(tools, {
    // 工具调用时的处理函数
    onInvoke: async (toolName, params) => {
      switch (toolName) {
        case "search_products":
          const results = await fetch(`/api/search?q=${params.query}`);
          return await results.json();
          
        case "add_to_cart":
          await fetch('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify(params)
          });
          return { success: true, message: "已添加到购物车" };
          
        case "checkout":
          const order = await fetch('/api/checkout', {
            method: 'POST',
            body: JSON.stringify(params)
          });
          return await order.json();
      }
    }
  });
  
  console.log("WebMCP 工具已注册，AI Agent 现在可以操作你的网站了");
}
```

### Step 3：AI Agent 调用

现在，用户可以对 AI 说：

> "帮我在这个网站买一件黑色T恤，送到公司地址"

AI Agent 会：

1. 调用 `search_products` 搜索 "黑色T恤"
2. 用户确认款式
3. 调用 `add_to_cart` 加入购物车
4. 调用 `checkout` 完成下单

全程不需要截图、不需要视觉识别、不需要猜 UI。

## 完整实现

### 前端：注册工具和处理器

```html
<!DOCTYPE html>
<html>
<head>
  <title>智能电商</title>
</head>
<body>
  <!-- 你的普通网站 UI -->
  <div id="app">
    <input type="text" id="search" placeholder="搜索商品...">
    <div id="products"></div>
    <button id="cart">购物车 (0)</button>
  </div>

  <script type="module">
    // WebMCP 配置
    const MCP_CONFIG = {
      name: "智能电商",
      description: "一个支持 AI Agent 操作的电商网站",
      version: "1.0.0"
    };

    // 工具定义
    const tools = [
      {
        name: "search_products",
        description: "搜索商品，支持关键词和分类筛选",
        inputSchema: {
          type: "object",
          properties: {
            query: { 
              type: "string", 
              description: "搜索关键词" 
            },
            category: { 
              type: "string", 
              enum: ["all", "electronics", "clothing", "books"],
              default: "all"
            },
            price_range: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" }
              }
            }
          },
          required: ["query"]
        }
      },
      {
        name: "get_product_detail",
        description: "获取商品详情",
        inputSchema: {
          type: "object",
          properties: {
            product_id: { type: "string" }
          },
          required: ["product_id"]
        }
      },
      {
        name: "add_to_cart",
        description: "添加商品到购物车",
        inputSchema: {
          type: "object",
          properties: {
            product_id: { type: "string" },
            quantity: { type: "integer", minimum: 1, default: 1 }
          },
          required: ["product_id"]
        }
      },
      {
        name: "get_cart",
        description: "查看购物车内容",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "checkout",
        description: "结算购物车",
        inputSchema: {
          type: "object",
          properties: {
            address: { 
              type: "object",
              properties: {
                recipient: { type: "string" },
                phone: { type: "string" },
                province: { type: "string" },
                city: { type: "string" },
                detail: { type: "string" }
              },
              required: ["recipient", "phone", "province", "city", "detail"]
            },
            payment: {
              type: "string",
              enum: ["alipay", "wechat", "credit_card"]
            }
          },
          required: ["address", "payment"]
        }
      }
    ];

    // 工具处理器
    const handlers = {
      async search_products(params) {
        const { query, category, price_range } = params;
        let url = `/api/products/search?q=${encodeURIComponent(query)}`;
        if (category && category !== "all") {
          url += `&category=${category}`;
        }
        if (price_range) {
          url += `&min=${price_range.min || 0}&max=${price_range.max || 999999}`;
        }
        
        const res = await fetch(url);
        const products = await res.json();
        
        // 同时更新页面 UI（让用户看到发生了什么）
        renderProducts(products);
        
        return {
          message: `找到 ${products.length} 个商品`,
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.thumbnail
          }))
        };
      },

      async get_product_detail(params) {
        const res = await fetch(`/api/products/${params.product_id}`);
        return await res.json();
      },

      async add_to_cart(params) {
        const { product_id, quantity = 1 } = params;
        
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id, quantity })
        });
        
        const result = await res.json();
        
        // 更新购物车 UI
        updateCartBadge(result.cart_count);
        
        return {
          success: true,
          message: `已添加 ${quantity} 件商品到购物车`,
          cart_count: result.cart_count
        };
      },

      async get_cart() {
        const res = await fetch('/api/cart');
        return await res.json();
      },

      async checkout(params) {
        const { address, payment } = params;
        
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, payment })
        });
        
        const order = await res.json();
        
        // 跳转到订单页面
        window.location.href = `/orders/${order.id}`;
        
        return {
          success: true,
          message: "订单创建成功",
          order_id: order.id,
          total: order.total
        };
      }
    };

    // 注册 WebMCP
    async function initWebMCP() {
      if (!('webMCP' in navigator)) {
        console.log("当前浏览器不支持 WebMCP");
        return;
      }

      try {
        await navigator.webMCP.register(tools, {
          config: MCP_CONFIG,
          onInvoke: async (toolName, params) => {
            console.log(`WebMCP 调用: ${toolName}`, params);
            
            const handler = handlers[toolName];
            if (!handler) {
              throw new Error(`未知工具: ${toolName}`);
            }
            
            return await handler(params);
          },
          
          // 权限请求（可选）
          onPermissionRequest: async (toolName, params) => {
            // 对于敏感操作，可以请求用户确认
            if (toolName === "checkout") {
              const confirmed = confirm(
                `AI Agent 请求执行结算操作\n` +
                `支付方式: ${params.payment}\n` +
                `收件人: ${params.address.recipient}\n\n` +
                `是否允许？`
              );
              return confirmed ? "granted" : "denied";
            }
            return "granted";
          }
        });
        
        console.log("WebMCP 注册成功");
      } catch (err) {
        console.error("WebMCP 注册失败:", err);
      }
    }

    // 页面加载时初始化
    initWebMCP();
  </script>
</body>
</html>
```

## 与 MCP 的区别

| 维度 | MCP | WebMCP |
|------|-----|--------|
| 运行环境 | 服务端进程 | 浏览器网页 |
| 传输方式 | stdio / SSE | 浏览器原生 API |
| 工具定义 | Python/TS 代码 | JavaScript 对象 |
| 认证 | 自己实现 | 浏览器管理 |
| 适用场景 | 后端工具、数据库 | 网站操作、前端交互 |

**WebMCP 的优势**：
- 不需要部署额外服务
- 浏览器原生支持，无需安装
- 用户可以看到 AI 在操作什么（透明）
- 天然支持用户授权

**WebMCP 的局限**：
- 只能在浏览器里用
- 页面关闭后工具就不可用了
- 需要网站主动实现，不能用于第三方网站

## 安全考虑

### 权限控制

不要让 AI Agent 随意调用敏感操作：

```javascript
const SENSITIVE_TOOLS = ["checkout", "delete_account", "change_password"];

await navigator.webMCP.register(tools, {
  onInvoke: async (toolName, params) => {
    // 敏感操作需要二次确认
    if (SENSITIVE_TOOLS.includes(toolName)) {
      const confirmed = await showConfirmDialog(toolName, params);
      if (!confirmed) {
        return { error: "用户拒绝操作" };
      }
    }
    
    return await handlers[toolName](params);
  }
});
```

### 参数验证

不要信任 AI 传入的参数：

```javascript
import { z } from 'zod';

const schemas = {
  search_products: z.object({
    query: z.string().max(100),
    category: z.enum(["all", "electronics", "clothing", "books"]).optional(),
    price_range: z.object({
      min: z.number().min(0).optional(),
      max: z.number().max(1000000).optional()
    }).optional()
  }),
  
  checkout: z.object({
    address: z.object({
      recipient: z.string().max(50),
      phone: z.string().regex(/^1[3-9]\d{9}$/),
      province: z.string(),
      city: z.string(),
      detail: z.string().max(200)
    }),
    payment: z.enum(["alipay", "wechat", "credit_card"])
  })
};

async function validateAndInvoke(toolName, params) {
  const schema = schemas[toolName];
  if (schema) {
    const result = schema.safeParse(params);
    if (!result.success) {
      return { error: "参数验证失败", details: result.error.errors };
    }
    params = result.data;
  }
  
  return await handlers[toolName](params);
}
```

### 操作日志

记录所有 AI 操作，用于审计：

```javascript
const auditLog = [];

await navigator.webMCP.register(tools, {
  onInvoke: async (toolName, params) => {
    const startTime = Date.now();
    const record = {
      timestamp: new Date().toISOString(),
      tool: toolName,
      params: params,
      agent: navigator.webMCP.currentAgent, // 当前调用的 Agent
      result: null,
      duration: null
    };
    
    try {
      const result = await handlers[toolName](params);
      record.result = result;
      return result;
    } catch (err) {
      record.error = err.message;
      throw err;
    } finally {
      record.duration = Date.now() - startTime;
      auditLog.push(record);
      
      // 发送到服务器存档
      fetch('/api/audit', {
        method: 'POST',
        body: JSON.stringify(record)
      });
    }
  }
});
```

## 兼容性检测

```javascript
async function checkWebMCPSupport() {
  const support = {
    basic: 'webMCP' in navigator,
    tools: false,
    resources: false,
    prompts: false
  };
  
  if (support.basic) {
    const capabilities = await navigator.webMCP.getCapabilities();
    support.tools = capabilities.tools;
    support.resources = capabilities.resources;
    support.prompts = capabilities.prompts;
  }
  
  return support;
}

// 使用
const support = await checkWebMCPSupport();
if (!support.basic) {
  console.log("当前浏览器不支持 WebMCP，请升级到 Chrome 120+ 或 Edge 120+");
} else if (!support.tools) {
  console.log("当前浏览器版本支持 WebMCP 但不支持工具功能");
}
```

## 对 SEO 的影响

WebMCP 开启了一个新话题：**AI Visibility（AI 可见性）**。

以前的 SEO 是让搜索引擎能理解你的内容，现在的 AI Visibility 是让 AI Agent 能理解你的功能。

```javascript
// 为 AI Agent 提供更丰富的上下文
await navigator.webMCP.register(tools, {
  config: {
    name: "我的商店",
    description: "销售电子产品、服装、图书的综合电商平台",
    
    // 暴露网站的能力给 AI
    capabilities: [
      "支持商品搜索和筛选",
      "支持购物车管理",
      "支持在线支付和订单追踪",
      "支持 7 天无理由退货"
    ],
    
    // 暴露常见问题
    faqs: [
      { q: "如何修改收货地址？", a: "在订单详情页点击修改地址" },
      { q: "支持哪些支付方式？", a: "支付宝、微信、信用卡" }
    ]
  }
});
```

## 总结

WebMCP 是 AI Agent 与网站交互的未来。它解决了屏幕抓取的所有痛点：

- **快**：直接 API 调用，毫秒级响应
- **准**：结构化参数，不会点错
- **省**：不需要视觉模型
- **稳**：UI 变化不影响 Agent

如果你的网站想支持 AI Agent 操作，现在是时候开始实现了。Chrome 已经支持，其他浏览器跟进只是时间问题。
