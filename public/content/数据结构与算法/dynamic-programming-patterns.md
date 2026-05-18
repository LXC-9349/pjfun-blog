---
title: 动态规划套路总结：从入门到面试不再害怕
date: 2026-05-17
cover: https://picsum.photos/seed/dp-patterns/800/400
desc: 系统梳理动态规划的常见模式和解题模板，配合可视化示例帮助理解
tags: [动态规划, 算法, 面试, LeetCode]
---

## 为什么 DP 让人害怕

动态规划（Dynamic Programming）之所以难，是因为它需要**逆向思维**——不是从问题出发找答案，而是从答案反推问题。

但 DP 其实有套路。掌握几个常见模式后，大部分 DP 题都可以用模板解决。

## DP 解题四步法

```
1. 定义状态：dp[i] 代表什么？
2. 状态转移方程：dp[i] 和 dp[i-1]、dp[i-2]... 的关系是什么？
3. 初始条件：dp[0]、dp[1] 等于多少？
4. 计算顺序：从小到大还是从大到小？
```

## 模式一：一维 DP

### 爬楼梯（最基础的 DP）

```python
# 问题：每次可以爬 1 或 2 阶，爬到第 n 阶有多少种方法？

# 1. 状态：dp[i] = 爬到第 i 阶的方法数
# 2. 转移：dp[i] = dp[i-1] + dp[i-2]（从 i-1 爬 1 步，或从 i-2 爬 2 步）
# 3. 初始：dp[0] = 1, dp[1] = 1
# 4. 顺序：从 2 到 n

def climbStairs(n: int) -> int:
    if n <= 1:
        return 1
    
    dp = [0] * (n + 1)
    dp[0] = dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]

# 空间优化：只需要前两个值
def climbStairs_optimized(n: int) -> int:
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b
```

### 打家劫舍

```python
# 问题：不能偷相邻的房子，最多能偷多少？

# 1. 状态：dp[i] = 前 i 个房子能偷的最大金额
# 2. 转移：dp[i] = max(dp[i-1], dp[i-2] + nums[i])
#          不偷第 i 个 vs 偷第 i 个
# 3. 初始：dp[0] = nums[0], dp[1] = max(nums[0], nums[1])

def rob(nums: list[int]) -> int:
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    
    prev2, prev1 = 0, 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + num)
    
    return prev1
```

### 最长递增子序列（LIS）

```python
# 问题：找到最长递增子序列的长度

# O(n²) DP 解法
def lengthOfLIS(nums: list[int]) -> int:
    n = len(nums)
    dp = [1] * n  # dp[i] = 以 nums[i] 结尾的 LIS 长度
    
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    
    return max(dp)

# O(n log n) 贪心 + 二分
def lengthOfLIS_optimized(nums: list[int]) -> int:
    tails = []  # tails[i] = 长度为 i+1 的 LIS 的最小末尾
    
    for num in nums:
        # 二分查找第一个 >= num 的位置
        left, right = 0, len(tails)
        while left < right:
            mid = (left + right) // 2
            if tails[mid] < num:
                left = mid + 1
            else:
                right = mid
        
        if left == len(tails):
            tails.append(num)
        else:
            tails[left] = num
    
    return len(tails)
```

## 模式二：二维 DP

### 最长公共子序列（LCS）

```python
# 问题：两个字符串的最长公共子序列长度

# 1. 状态：dp[i][j] = text1[:i] 和 text2[:j] 的 LCS 长度
# 2. 转移：
#    如果 text1[i-1] == text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1
#    否则: dp[i][j] = max(dp[i-1][j], dp[i][j-1])

def longestCommonSubsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]
```

### 编辑距离

```python
# 问题：word1 转换成 word2 最少需要多少步（插入、删除、替换）

def minDistance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # 初始条件
    for i in range(m + 1):
        dp[i][0] = i  # 删除 i 个字符
    for j in range(n + 1):
        dp[0][j] = j  # 插入 j 个字符
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]  # 不需要操作
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],    # 删除
                    dp[i][j-1],    # 插入
                    dp[i-1][j-1]   # 替换
                )
    
    return dp[m][n]
```

## 模式三：背包问题

### 0-1 背包

```python
# 问题：n 个物品，每个有重量和价值，背包容量为 W，最大价值是多少？

def knapsack(weights: list[int], values: list[int], W: int) -> int:
    n = len(weights)
    dp = [0] * (W + 1)
    
    for i in range(n):
        # 从后往前遍历（每个物品只能用一次）
        for j in range(W, weights[i] - 1, -1):
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    
    return dp[W]
```

### 完全背包

```python
# 问题：物品可以无限使用

def completeKnapsack(weights: list[int], values: list[int], W: int) -> int:
    dp = [0] * (W + 1)
    
    for i in range(len(weights)):
        # 从前往后遍历（物品可以重复使用）
        for j in range(weights[i], W + 1):
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    
    return dp[W]
```

**关键区别**：0-1 背包从后往前遍历，完全背包从前往后遍历。

## 模式四：区间 DP

### 石子合并

```python
# 问题：n 堆石子排成一排，每次合并相邻两堆，代价是两堆石子数之和，求最小总代价

def mergeStones(stones: list[int]) -> int:
    n = len(stones)
    # 前缀和
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + stones[i]
    
    # dp[i][j] = 合并 stones[i..j] 的最小代价
    dp = [[0] * n for _ in range(n)]
    
    for length in range(2, n + 1):  # 区间长度
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k+1][j])
            dp[i][j] += prefix[j+1] - prefix[i]  # 加上本次合并的代价
    
    return dp[0][n-1]
```

## 记忆化搜索 vs 递推

```python
# 记忆化搜索（自顶向下）
def fib_memo(n: int) -> int:
    memo = {}
    
    def helper(n):
        if n <= 1:
            return n
        if n not in memo:
            memo[n] = helper(n-1) + helper(n-2)
        return memo[n]
    
    return helper(n)

# 递推（自底向上）
def fib_dp(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b
```

**选择建议**：
- 面试时：记忆化搜索更容易写（思路自然）
- 生产环境：递推更高效（没有递归开销）
- 状态转移复杂时：记忆化搜索（只计算需要的状态）

## 面试中如何快速识别 DP 题

看到以下关键词，大概率是 DP：

| 关键词 | 可能的模式 |
|--------|-----------|
| "最多"、"最少"、"最大"、"最小" | 一维/二维 DP |
| "有多少种方法" | 一维 DP（计数） |
| "子序列"、"子串" | 一维/二维 DP |
| "不能相邻" | 打家劫舍模式 |
| "选择/不选择" | 背包模式 |
| "合并"、"分割" | 区间 DP |

## 总结

DP 的套路其实就几个：

1. **一维 DP**：状态只依赖前几个值（爬楼梯、打家劫舍）
2. **二维 DP**：状态依赖两个维度（LCS、编辑距离）
3. **背包 DP**：选或不选的问题（0-1 背包、完全背包）
4. **区间 DP**：合并/分割区间的问题（石子合并）

掌握这四步法 + 四个模式，面试中的 DP 题基本都能搞定。
