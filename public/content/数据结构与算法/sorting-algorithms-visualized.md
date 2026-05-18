---
title: 排序算法可视化理解：不只是背复杂度
date: 2026-05-16
cover: https://picsum.photos/seed/sorting-algos/800/400
desc: 用直观的方式理解七种经典排序算法——不靠记忆，靠理解数据在每一步是如何变化的
tags: [算法, 排序, 数据结构, 编程基础]
---

## 排序算法到底有什么用

很多人觉得排序算法面试完就用不上了——工作中谁自己写排序？调 `Array.sort()` 不就完了？

但排序算法的价值不在"排序"本身，而在于它展示了几种基础的算法设计思想：
- **分治**（归并排序、快速排序）
- **交换**（冒泡、快排）
- **插入和选择**（插入排序、选择排序）
- **基于堆的数据结构**（堆排序）

这些思想在你写代码时无处不在。理解了排序算法，你就理解了这些基础设计模式。

## 先说一个观察：所有排序算法都可被"步骤化"理解

不要读文字描述，要看每一步数据的变化。我把算法**抽象看**作一个过程，观察每一步数组的状态变化。

例如，对于数组 `[5, 2, 4, 1, 3]`，无论什么排序算法都在做同一件事：**改变元素的排列顺序**，只是走的路径不同。

## 冒泡排序：相邻比较，大数上浮

```javascript
function bubbleSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
      }
    }
    if (!swapped) break  // 没有交换，已排序
  }
  return arr
}
```

跟踪执行过程（数组 `[5, 2, 4, 1, 3]`）：

```
初始: [5, 2, 4, 1, 3]
第1轮: [2, 4, 1, 3, 5]  → 5 冒到最后
第2轮: [2, 1, 3, 4, 5]  → 4 冒到倒数第二
第3轮: [1, 2, 3, 4, 5]  → 3 就位
第4轮: [1, 2, 3, 4, 5]  → 已有序，swapped=false，提前结束
```

**特点**：每轮确定一个最大值放在末尾。用 `swapped` 标记可以提前结束。

**时间**：O(n²) | **空间**：O(1) | **稳定**：是

实际工作中我不会用它排序几千条数据，但它的"两两比较，逐步就位"的思路在 UI 动画中很好用——并行处理一组元素的过渡效果时，可以逐轮推进。

## 选择排序：找最小的，放最前面

```javascript
function selectionSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j
    }
    if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
  }
  return arr
}
```

```
初始: [5, 2, 4, 1, 3]
第1轮: [1, 2, 4, 5, 3]  → 选 1 放到索引 0
第2轮: [1, 2, 4, 5, 3]  → 选 2 放到索引 1（已经在正确位置）
第3轮: [1, 2, 3, 5, 4]  → 选 3 放到索引 2
第4轮: [1, 2, 3, 4, 5]  → 选 4 放到索引 3
```

**特点**：每轮选最小值放到已排序区末尾。比较次数固定（n(n-1)/2），但交换次数少（n-1）。

**时间**：O(n²) | **空间**：O(1) | **稳定**：否（因为"远距离交换"可能改变相等元素的相对顺序）

## 插入排序：打牌时怎么理牌的？

```javascript
function insertionSort(arr) {
  const n = arr.length
  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
  }
  return arr
}
```

```
初始: [5, 2, 4, 1, 3]
手拿: [5] | 待处理: [2, 4, 1, 3]
↓ 插入 2
[2, 5] | [4, 1, 3]
↓ 插入 4
[2, 4, 5] | [1, 3]
↓ 插入 1
[1, 2, 4, 5] | [3]
↓ 插入 3
[1, 2, 3, 4, 5]
```

**现实对应**：打扑克时，把新拿到的牌插入到已经排好序的手牌中。

**特性**：对于**几乎有序**的数据，插入排序非常快——只需 O(n)。这是很多高级排序（如 Timsort）在数据接近有序时使用插入排序的原因。

## 归并排序：先拆后合，分治思想

```javascript
function mergeSort(arr) {
  if (arr.length <= 1) return arr
  
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  
  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++])
  }
  return [...result, ...left.slice(i), ...right.slice(j)]
}
```

```
初始: [5, 2, 4, 1, 3]
↓ 拆分
[5, 2] 和 [4, 1, 3]
↓ 继续拆
[5], [2] 和 [4], [1, 3]
↓ 继续拆  
[5], [2] 和 [4], [1], [3]
↓ 开始合
[2, 5] 和 [1, 3, 4]
↓ 合
[1, 2, 3, 4, 5]
```

**特点**：
- 稳定排序（相等元素保持原顺序）
- 需要 O(n) 额外空间（不是原地排序）
- 对链表排序非常高效

## 快速排序：选个基准，分而治之

```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIdx = partition(arr, low, high)
    quickSort(arr, low, pivotIdx - 1)
    quickSort(arr, pivotIdx + 1, high)
  }
  return arr
}

function partition(arr, low, high) {
  // 选最后一个元素作为枢轴
  const pivot = arr[high]
  let i = low - 1
  
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
  return i + 1
}
```

```
初始: [5, 2, 4, 1, 3]  基准: 3
↓ 分区后: [2, 1, 3, 5, 4]  基准 3 在索引 2
      左边([2,1])     右边([5,4])
↓ 左边分区: [1, 2]    右边分区: [4, 5]
↓ 合并: [1, 2, 3, 4, 5]
```

**特点**：
- 平均 O(n log n)，最坏 O(n²)
- 最坏情况发生在数据已经有序或逆序（取决于基准选择策略）
- 可以通过随机选基准来避免最坏情况

```javascript
// 随机选基准，避免最坏情况
function partition(arr, low, high) {
  const randomIdx = low + Math.floor(Math.random() * (high - low + 1))
  [arr[randomIdx], arr[high]] = [arr[high], arr[randomIdx]]
  // ... 后续不变
}
```

## 什么时候用什么排序

```
场景                             推荐
─────────────────────────────────────────────────
数据量很小（< 50）               插入排序
数据几乎有序                     插入排序（接近 O(n)）
数据量大，需要稳定排序            归并排序
数据量大，不需要稳定              快速排序
需要最坏情况也有保证             堆排序或归并排序
数据在链表里                     归并排序（不需要额外空间？看实现）
不确定用什么                     用 `Array.sort()`（V8 引擎用 Timsort）
```

## 工程中的排序：V8 的 Timsort

JavaScript 引擎 V8 使用的排序算法是 **Timsort**——一种混合稳定排序算法，结合了归并排序和插入排序。

核心思想：
1. 将数据分成多个"run"（有序子序列）
2. 对每个小 run 用插入排序（小规模时插入排序更快）
3. 合并 runs（用归并方式）

Timsort 对于真实世界的数据（往往包含部分有序的片段）表现优异。它也是 Python 和 Java 的默认排序算法。

## 写在最后

排序算法是算法设计的"Hello World"——它们简单到足以在一篇文章中讲清楚，又复杂到展示了多种经典的设计范式。

我更建议用可视化的方式去学习它们。有一些很好的可视化排序网站（如 visualgo.net），看一次动画演示比读十篇文章更能理解每一种算法"长什么样"。

理解了排序算法之后，再去学其他算法（二分搜索、动态规划、图算法）时，你会发现很多思想是相通的——排序算法的每种设计模式，在其他算法中都能找到影子。
