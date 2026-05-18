---
title: Python 异步编程：从回调到 async/await
date: 2026-05-16
cover: https://picsum.photos/seed/python-async/800/400
desc: 系统讲解 Python 异步编程的演进——为什么需要异步、asyncio 的工作原理、以及在什么场景下真正有用
tags: [Python, 异步编程, asyncio, 后端开发]
---

## 异步编程到底解决了什么问题

Python 的异步编程经常被误解为"能让代码跑得更快"。不对。

异步编程解决的核心问题是：**在等待 I/O 的时候不要阻塞 CPU**。

当你发起一个网络请求，或者读一个文件，或者查询数据库，程序大部分时间不是在"计算"，而是在**等待**。等待网络包到达，等待磁盘转完，等待数据库返回结果。这些等待的时间里，CPU 是空闲的。

同步代码的做法是：等。CPU 空转，啥也不干，等结果回来了再继续。

异步代码的做法是：在等的时候，去做别的事情。等别人的结果回来了，再回来继续处理。

这不是让你的代码"变快"，而是让 **CPU 的利用率更高**。

## 从同步到异步的演进

### 同步方式（最直观）

```python
import requests

def fetch_user(user_id):
    print(f"开始获取用户 {user_id}")
    response = requests.get(f"https://api.example.com/users/{user_id}")
    print(f"用户 {user_id} 获取完成")
    return response.json()

# 依次获取 3 个用户，总耗时 = 3 次网络请求的时间之和
users = [fetch_user(1), fetch_user(2), fetch_user(3)]
```

总耗时 = 请求1 + 请求2 + 请求3。如果每次请求 200ms，总共 600ms。但 CPU 绝大部分时间在空等。

### 多线程方式（解决得不好）

```python
import threading
import requests

results = {}
threads = []

def fetch_user(user_id):
    response = requests.get(f"https://api.example.com/users/{user_id}")
    results[user_id] = response.json()

for uid in [1, 2, 3]:
    t = threading.Thread(target=fetch_user, args=(uid,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(results)
```

多线程确实可以让请求并发执行，但 Python 有 GIL（全局解释器锁）。对于 CPU 密集型任务，多线程是假的并发。但对于 I/O 密集型任务多线程确实能工作——因为 GIL 会在 I/O 等待时释放。

问题是线程的代价：每个线程需要分配独立的栈空间，上下文切换有开销。如果要同时处理几千个连接，线程方案就不太合适了。

### 异步方式（真正解决问题）

```python
import asyncio
import aiohttp

async def fetch_user(session, user_id):
    print(f"开始获取用户 {user_id}")
    async with session.get(f"https://api.example.com/users/{user_id}") as response:
        data = await response.json()
        print(f"用户 {user_id} 获取完成")
        return data

async def main():
    async with aiohttp.ClientSession() as session:
        # 并发执行 3 个请求
        tasks = [fetch_user(session, uid) for uid in [1, 2, 3]]
        results = await asyncio.gather(*tasks)
        print(results)

asyncio.run(main())
```

总耗时约等于最慢的那次请求（而不是三次之和）。

## asyncio 的工作原理

### 事件循环

这是 asyncio 的核心——一个不断运行的循环：

```python
# 简化版事件循环
def event_loop(tasks):
    ready = list(tasks)
    waiting = []
    
    while ready or waiting:
        # 1. 执行就绪的协程
        for coro in ready:
            try:
                coro.send(None)  # 执行到下一个 await
            except StopIteration:
                pass  # 协程执行完毕
            else:
                waiting.append(coro)
        
        # 2. 等待 I/O（实际实现中会使用 select/epoll）
        ready = waiting
        waiting = []
```

当然真正的实现比这个复杂得多（包括回调调度、异常处理、超时管理等），但核心思想就是：**把控制权交还给事件循环，由它来决定下一步执行哪个协程**。

### await 到底做了什么

当一个协程执行到 `await` 时，它做两件事：
1. 把当前状态保存下来
2. 把控制权交还给事件循环

事件循环拿到控制权后，可以去执行其他就绪的协程。当 `await` 的那个操作完成了（比如 HTTP 响应回来了），事件循环会回来继续执行这个协程剩下的部分。

```python
async def example():
    print("1: 开始执行")
    await asyncio.sleep(1)  # 交出控制权，1 秒后回来
    print("2: 继续执行")
    result = await fetch_data()  # 再次交出控制权
    print("3: 拿到结果:", result)
```

函数的执行在 `await` 处被"暂停"，然后在事件循环的调度下"恢复"。协程不是"在后台执行"——它只是**被暂停了**，腾出的 CPU 时间片可以给其他协程用。

## 什么时候用

### 适用场景

```python
# ✅ 网络请求（HTTP API 调用）
async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

# ✅ 数据库查询（异步驱动）
async def get_users():
    async with async_session() as session:
        return await session.execute("SELECT * FROM users")

# ✅ 文件 I/O（使用 aiofiles）
async def read_config():
    async with aiofiles.open("config.json") as f:
        return await f.read()
```

### 不适用场景

```python
# ❌ CPU 密集型计算
async def calculate_primes(n):
    # 这个函数会阻塞事件循环
    # 因为计算素数不需要 I/O 等待
    result = []
    for num in range(2, n):
        if all(num % i != 0 for i in range(2, int(num**0.5) + 1)):
            result.append(num)
    return result
```

CPU 密集型任务不会释放 GIL，即使写成 async 也不会让其他协程有机会执行。对于这类任务，应该用多进程或线程池：

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor

async def calculate_primes_async(n):
    loop = asyncio.get_event_loop()
    with ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, calculate_primes, n)
    return result
```

## 踩过的坑

### 坑一：在同步代码中调用异步函数

```python
async def fetch_data():
    await asyncio.sleep(1)
    return "data"

# ❌ 错误：这返回一个协程对象，不是数据
data = fetch_data()
print(data)  # <coroutine object ...>

# ✅ 正确
data = await fetch_data()

# ✅ 或者如果你在同步代码中：
data = asyncio.run(fetch_data())
```

### 坑二：阻塞事件循环

```python
async def handler():
    # ❌ time.sleep() 会阻塞整个事件循环
    time.sleep(5)
    return "done"

    # ✅ 应该用 asyncio.sleep()
    await asyncio.sleep(5)
    return "done"
```

任何同步的阻塞操作（`time.sleep`、`requests.get`、`socket.accept`）都会阻塞事件循环，导致所有并发任务暂停。

### 坑三：忘记创建 Task

```python
async def main():
    # ❌ 这样写是顺序执行的
    result1 = await fetch(1)
    result2 = await fetch(2)
    
    # ✅ 这样写才是并发的
    task1 = asyncio.create_task(fetch(1))
    task2 = asyncio.create_task(fetch(2))
    result1 = await task1
    result2 = await task2
    
    # 或者用 gather
    results = await asyncio.gather(fetch(1), fetch(2))
```

## 什么时候值得用异步

一个客观的判断标准：如果应用大部分时间花在等待 I/O 上（网络请求、文件读取、数据库查询），异步编程能带来显著的吞吐量提升。

但如果你的应用主要是 CPU 计算（数据处理、图像渲染、算法计算），异步编程不仅没帮助，还会增加复杂性。用多进程或直接同步代码可能更好。

对于 web 框架：FastAPI、aiohttp 等服务端框架，异步是标配——因为一个 web 服务器就是 I/O 密集型的典型场景。

对于脚本工具：如果你只是写一个几分钟运行一次的数据抓取脚本，同步代码完全够用。不需要为了"技术先进"而用异步。
