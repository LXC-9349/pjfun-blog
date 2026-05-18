---
title: 图算法图解：BFS、DFS、最短路径和拓扑排序
date: 2026-05-17
cover: https://picsum.photos/seed/graph-algorithms/800/400
desc: 用可视化的方式讲解图的核心算法，配合代码实现和实际应用场景
tags: [图算法, BFS, DFS, 最短路径, 数据结构]
---

## 图的表示

### 邻接矩阵 vs 邻接表

```python
# 图：A → B, A → C, B → C, C → D

# 邻接矩阵（适合稠密图）
#     A  B  C  D
# A [ 0, 1, 1, 0 ]
# B [ 0, 0, 1, 0 ]
# C [ 0, 0, 0, 1 ]
# D [ 0, 0, 0, 0 ]

# 邻接表（适合稀疏图，更常用）
graph = {
    'A': ['B', 'C'],
    'B': ['C'],
    'C': ['D'],
    'D': []
}
```

| 操作 | 邻接矩阵 | 邻接表 |
|------|---------|--------|
| 检查边是否存在 | O(1) | O(degree) |
| 遍历所有邻居 | O(V) | O(degree) |
| 空间复杂度 | O(V²) | O(V + E) |

**经验法则**：E << V² 时用邻接表，E ≈ V² 时用邻接矩阵。

## BFS（广度优先搜索）

### 原理

BFS 像水波一样向外扩散——先访问距离起点 1 步的节点，再访问 2 步的，以此类推。

```
    A
   / \
  B   C
   \ /
    D
     \
      E

BFS 顺序: A → B → C → D → E
```

### 代码实现

```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    
    while queue:
        node = queue.popleft()
        print(node, end=' ')
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

# BFS 求最短路径（无权图）
def bfs_shortest_path(graph, start, end):
    queue = deque([(start, [start])])
    visited = {start}
    
    while queue:
        node, path = queue.popleft()
        
        if node == end:
            return path
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None  # 不可达
```

### 应用场景

- **最短路径**（无权图）：BFS 天然保证第一次到达终点时路径最短
- **社交网络**：找到你的二度、三度好友
- **层序遍历**：二叉树的层序遍历就是 BFS
- **连通分量**：找到图中的所有连通区域

## DFS（深度优先搜索）

### 原理

DFS 像走迷宫——一条路走到底，走不通了再回溯。

```
    A
   / \
  B   C
   \ /
    D
     \
      E

DFS 顺序: A → B → C → D → E（或 A → C → D → E → B）
```

### 代码实现

```python
def dfs_recursive(graph, node, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(node)
    print(node, end=' ')
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)

# 迭代版本（用栈）
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        print(node, end=' ')
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
```

### 应用场景

- **连通分量**：岛屿数量问题
- **拓扑排序**：课程表问题
- **路径查找**：迷宫求解
- **环检测**：判断图中是否有环

## Dijkstra 算法（最短路径）

### 原理

Dijkstra 是"贪心版 BFS"——每次都选距离起点最近的未访问节点。

```
    A --4-- B --2-- D
    |       |       |
    1       3       1
    |       |       |
    C --5-- E --1-- F

求 A 到所有节点的最短路径：
A→A: 0
A→C: 1
A→B: 4
A→E: 4 (A→C→E = 1+5=6, A→B→E = 4+3=7, 但 A→C→... 更优需要继续计算)
```

### 代码实现

```python
import heapq

def dijkstra(graph, start):
    # graph: {node: [(neighbor, weight), ...]}
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    prev = {node: None for node in graph}
    pq = [(0, start)]  # (distance, node)
    
    while pq:
        d, node = heapq.heappop(pq)
        
        if d > dist[node]:
            continue  # 已经找到更短的路径
        
        for neighbor, weight in graph[node]:
            new_dist = dist[node] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = node
                heapq.heappush(pq, (new_dist, neighbor))
    
    return dist, prev

# 重建路径
def reconstruct_path(prev, start, end):
    path = []
    node = end
    while node is not None:
        path.append(node)
        node = prev[node]
    return path[::-1]
```

### 限制

- **不能有负权边**：负权边会让贪心策略失效
- 有负权边时用 **Bellman-Ford**

## Bellman-Ford 算法

```python
def bellman_ford(edges, vertices, start):
    """
    edges: [(u, v, weight), ...]
    vertices: 顶点数量
    """
    dist = [float('inf')] * vertices
    dist[start] = 0
    
    # 松弛 V-1 次
    for _ in range(vertices - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    
    # 检查负权环
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None  # 存在负权环
    
    return dist
```

## 拓扑排序

### Kahn 算法（基于入度）

```python
from collections import deque, defaultdict

def topological_sort_kahn(graph, num_nodes):
    # 计算入度
    in_degree = [0] * num_nodes
    for node in graph:
        for neighbor in graph[node]:
            in_degree[neighbor] += 1
    
    # 入度为 0 的节点入队
    queue = deque([i for i in range(num_nodes) if in_degree[i] == 0])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in graph.get(node, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    if len(result) != num_nodes:
        return None  # 有环，无法拓扑排序
    
    return result
```

### 课程表问题（LeetCode 207）

```python
def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    graph = defaultdict(list)
    in_degree = [0] * numCourses
    
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1
    
    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
    count = 0
    
    while queue:
        node = queue.popleft()
        count += 1
        
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    return count == numCourses
```

## 并查集（Union-Find）

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # 路径压缩
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False  # 已经在同一个集合
        
        # 按秩合并
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        
        return True

# 应用：朋友圈问题（LeetCode 547）
def findCircleNum(isConnected: list[list[int]]) -> int:
    n = len(isConnected)
    uf = UnionFind(n)
    components = n
    
    for i in range(n):
        for j in range(i + 1, n):
            if isConnected[i][j] and uf.union(i, j):
                components -= 1
    
    return components
```

## 算法选择速查表

| 问题 | 算法 | 时间复杂度 |
|------|------|-----------|
| 无权图最短路径 | BFS | O(V + E) |
| 有权图最短路径（无负权） | Dijkstra | O((V + E) log V) |
| 有权图最短路径（有负权） | Bellman-Ford | O(V × E) |
| 所有点对最短路径 | Floyd-Warshall | O(V³) |
| 拓扑排序 | Kahn / DFS | O(V + E) |
| 连通分量 | BFS / DFS / 并查集 | O(V + E) |
| 最小生成树 | Kruskal / Prim | O(E log V) |

## 总结

图算法的核心思想：

1. **BFS**：层序扩散，适合最短路径（无权）
2. **DFS**：深度探索，适合连通性和路径查找
3. **Dijkstra**：贪心 + 优先队列，适合有权图最短路径
4. **拓扑排序**：入度递减，适合依赖关系
5. **并查集**：集合合并，适合连通性判断

理解每种算法的适用场景比记住代码更重要。
