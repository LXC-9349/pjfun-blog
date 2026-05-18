---
title: Python 数据分析实战：Pandas 高效处理百万级数据
date: 2026-05-17
cover: https://picsum.photos/seed/python-data-analysis/800/400
desc: 从实际数据分析项目出发，讲解 Pandas 的高效用法和常见性能陷阱
tags: [Python, Pandas, 数据分析, 数据处理]
---

## Pandas 性能优化的核心原则

**向量化操作 > apply > 循环**

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({'a': range(1000000), 'b': range(1000000)})

# ❌ 最慢：Python 循环
result = []
for _, row in df.iterrows():
    result.append(row['a'] + row['b'])

# ⚠️ 较慢：apply
result = df.apply(lambda row: row['a'] + row['b'], axis=1)

# ✅ 最快：向量化
result = df['a'] + df['b']
```

性能对比（100 万行）：

| 方法 | 时间 | 相对速度 |
|------|------|----------|
| 循环 (iterrows) | 45s | 1x |
| apply | 3.5s | 13x |
| 向量化 | 0.005s | 9000x |

## 数据读取优化

### 指定 dtype

```python
# ❌ 让 Pandas 自动推断（慢且可能出错）
df = pd.read_csv('data.csv')

# ✅ 指定 dtype（快且准确）
df = pd.read_csv('data.csv', dtype={
    'user_id': 'int32',
    'product_id': 'int32',
    'category': 'category',
    'is_active': 'bool',
    'price': 'float32',
})
```

### 只读取需要的列

```python
# 只读取需要的列，减少内存
df = pd.read_csv('data.csv', usecols=['user_id', 'price', 'date'])
```

### 分块读取

```python
# 大文件分块处理
chunk_size = 100000
results = []

for chunk in pd.read_csv('large_file.csv', chunksize=chunk_size):
    # 处理每个块
    processed = chunk[chunk['price'] > 100]
    results.append(processed)

df = pd.concat(results, ignore_index=True)
```

### Parquet 格式

```python
# CSV → Parquet（一次转换，后续都用 Parquet）
df = pd.read_csv('data.csv')
df.to_parquet('data.parquet', engine='pyarrow')

# 读取 Parquet（比 CSV 快 5-10 倍）
df = pd.read_parquet('data.parquet')

# Parquet 支持列裁剪和谓词下推
df = pd.read_parquet('data.parquet', columns=['user_id', 'price'])
df = pd.read_parquet('data.parquet', filters=[('price', '>', 100)])
```

## 内存优化

### 查看内存使用

```python
df.info(memory_usage='deep')

# 每列的内存使用
for col in df.columns:
    memory_mb = df[col].memory_usage(deep=True) / 1024 / 1024
    print(f"{col}: {memory_mb:.2f} MB")
```

### 数据类型降级

```python
def optimize_dataframe(df):
    """自动优化 DataFrame 的数据类型"""
    for col in df.columns:
        col_type = df[col].dtype
        
        if col_type == 'object':
            # 字符串 → category（如果唯一值少）
            num_unique = df[col].nunique()
            num_total = len(df[col])
            if num_unique / num_total < 0.5:
                df[col] = df[col].astype('category')
        
        elif col_type in ['int64', 'float64']:
            # 降级到更小的类型
            c_min = df[col].min()
            c_max = df[col].max()
            
            if col_type == 'int64':
                if c_min > -128 and c_max < 127:
                    df[col] = df[col].astype('int8')
                elif c_min > -32768 and c_max < 32767:
                    df[col] = df[col].astype('int16')
                elif c_min > -2147483648 and c_max < 2147483647:
                    df[col] = df[col].astype('int32')
            
            elif col_type == 'float64':
                df[col] = df[col].astype('float32')
    
    return df

# 使用
df = optimize_dataframe(df)
# 通常可以减少 50-90% 的内存
```

### Pyarrow 后端

```python
# Pandas 2.0+ 支持 Pyarrow 后端
df = pd.read_csv('data.csv', engine='pyarrow')

# 或者转换现有 DataFrame
df = df.convert_dtypes(dtype_backend='pyarrow')
```

## 常用高效操作

### merge vs join

```python
# merge（推荐，更灵活）
result = df1.merge(df2, on='user_id', how='left')

# join（需要设置索引）
result = df1.set_index('user_id').join(df2.set_index('user_id'), how='left')
```

### groupby 优化

```python
# ❌ 慢：多次 groupby
avg_price = df.groupby('category')['price'].mean()
total_sales = df.groupby('category')['quantity'].sum()

# ✅ 快：一次 groupby + agg
result = df.groupby('category').agg(
    avg_price=('price', 'mean'),
    total_sales=('quantity', 'sum'),
    order_count=('order_id', 'nunique'),
)
```

### 窗口函数

```python
# 移动平均
df['ma_7d'] = df.groupby('product_id')['sales'].transform(
    lambda x: x.rolling(7, min_periods=1).mean()
)

# 累计求和
df['cumulative_sales'] = df.groupby('product_id')['sales'].cumsum()

# 排名
df['rank'] = df.groupby('category')['sales'].rank(ascending=False)

# 同比/环比
df['prev_month_sales'] = df.groupby('product_id')['sales'].shift(1)
df['mom_growth'] = (df['sales'] - df['prev_month_sales']) / df['prev_month_sales']
```

## 时间序列处理

```python
# 设置时间索引
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date')

# 重采样
daily = df.resample('D')['sales'].sum()      # 按天
weekly = df.resample('W')['sales'].sum()     # 按周
monthly = df.resample('ME')['sales'].sum()   # 按月

# 滚动窗口
df['ma_30d'] = df['sales'].rolling(30).mean()
df['std_30d'] = df['sales'].rolling(30).std()

# 时间偏移
df['next_day_sales'] = df['sales'].shift(-1)
df['prev_day_sales'] = df['sales'].shift(1)
```

## 数据清洗

### 缺失值处理

```python
# 查看缺失情况
df.isnull().sum()
df.isnull().mean()  # 缺失比例

# 填充
df['price'].fillna(df['price'].median(), inplace=True)  # 中位数填充
df['category'].fillna('Unknown', inplace=True)           # 固定值填充
df['price'].fillna(method='ffill', inplace=True)         # 前向填充

# 删除
df.dropna(subset=['user_id'], inplace=True)  # 删除关键字段缺失的行
```

### 异常值检测

```python
# IQR 方法
Q1 = df['price'].quantile(0.25)
Q3 = df['price'].quantile(0.75)
IQR = Q3 - Q1

lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

outliers = df[(df['price'] < lower_bound) | (df['price'] > upper_bound)]

# 处理异常值
df = df[(df['price'] >= lower_bound) & (df['price'] <= upper_bound)]
```

## 可视化

### 选择指南

| 场景 | 推荐库 | 说明 |
|------|--------|------|
| 快速探索 | Matplotlib | 内置于 Pandas，`df.plot()` |
| 统计图表 | Seaborn | 美观，统计功能强 |
| 交互式 | Plotly | 可缩放、可悬停 |
| Dashboard | Streamlit | 快速搭建数据应用 |

### 示例

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Pandas 内置绘图
df.groupby('category')['sales'].sum().plot(kind='bar')

# Seaborn
sns.scatterplot(data=df, x='price', y='sales', hue='category')

# Plotly（交互式）
import plotly.express as px
fig = px.line(df, x='date', y='sales', color='category',
              title='销售趋势')
fig.show()
```

## 实际案例：100 万行电商数据分析

```python
import pandas as pd
import numpy as np

# 读取数据（优化后）
df = pd.read_parquet('sales_2026.parquet')
df = optimize_dataframe(df)

print(f"数据量: {len(df):,} 行, {len(df.columns)} 列")
print(f"内存: {df.memory_usage(deep=True).sum() / 1024 / 1024:.1f} MB")

# 1. 销售概览
summary = df.groupby('category').agg(
    total_sales=('amount', 'sum'),
    order_count=('order_id', 'nunique'),
    avg_price=('price', 'mean'),
    avg_quantity=('quantity', 'mean'),
).sort_values('total_sales', ascending=False)

# 2. 月度趋势
df['month'] = df['date'].dt.to_period('M')
monthly = df.groupby('month')['amount'].sum()
monthly_growth = monthly.pct_change()

# 3. 用户分析
user_stats = df.groupby('user_id').agg(
    total_orders=('order_id', 'nunique'),
    total_spent=('amount', 'sum'),
    avg_order_value=('amount', 'mean'),
    first_order=('date', 'min'),
    last_order=('date', 'max'),
)

# RFM 分析
user_stats['recency'] = (pd.Timestamp.now() - user_stats['last_order']).dt.days
user_stats['frequency'] = user_stats['total_orders']
user_stats['monetary'] = user_stats['total_spent']

# 4. 商品分析
product_performance = df.groupby('product_id').agg(
    total_sold=('quantity', 'sum'),
    revenue=('amount', 'sum'),
    return_rate=('is_returned', 'mean'),
).sort_values('revenue', ascending=False)

# 5. 导出报告
with pd.ExcelWriter('sales_report.xlsx', engine='openpyxl') as writer:
    summary.to_excel(writer, sheet_name='销售概览')
    monthly.to_excel(writer, sheet_name='月度趋势')
    user_stats.to_excel(writer, sheet_name='用户分析')
    product_performance.to_excel(writer, sheet_name='商品分析')
```

## 总结

Pandas 高效处理的关键：

1. **永远用向量化操作**——避免 iterrows 和 apply
2. **读取时指定 dtype**——减少内存和推断时间
3. **用 Parquet 替代 CSV**——读写快 5-10 倍
4. **优化数据类型**——int64→int32，object→category
5. **一次 groupby + 多 agg**——避免多次分组
6. **超过 1000 万行考虑 Polars**——比 Pandas 快 5-10 倍
