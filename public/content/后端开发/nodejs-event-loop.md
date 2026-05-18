---
title: Node.js 事件循环机制解密：从调用栈到 microtask
date: 2026-05-16
cover: https://picsum.photos/seed/nodejs-loop/800/400
desc: 深入 Node.js 事件循环的六个阶段，理解 setTimeout、setImmediate、nextTick 的执行顺序与原理
tags: [Node.js, 事件循环, 异步编程, JavaScript]
---

## 一个让新手崩溃的问题

```javascript
setTimeout(() => console.log('timeout'), 0)
setImmediate(() => console.log('immediate'))
process.nextTick(() => console.log('nextTick'))
Promise.resolve().then(() => console.log('promise'))
console.log('sync')
```

这道题在面试里出现频率极高，但真正理解背后原理的人并不多。运行结果是什么？为什么？这不是背答案就能解决的问题——它涉及 Node.js 事件循环最核心的设计。

先记住这一点：**JavaScript 是单线程的，但 Node.js 不是**。

## 事件循环不是 V8 的东西

很多人以为事件循环是 JavaScript 语言的一部分，其实是错的。V8 只管执行 JavaScript 代码，事件循环是 libuv 库实现的。Node.js 启动时，会初始化事件循环，然后处理各类任务。

这个循环在 C 语言层面实现，但我们可以通过它的行为来理解其工作原理。

## 六个阶段的核心架构

事件循环分六个阶段，每个阶段都有一个 **FIFO 回调队列**。宏任务的回调会进对应阶段的队列，微任务则有单独的队列。

```
   ┌───────────────────────────┐
┌─>│           timers          │ ← setTimeout/setInterval 到期回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ ← I/O 回调推迟到下一轮
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ ← 内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ ← 轮询 I/O，核心阶段
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ ← setImmediate 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │ ← close 事件
│  └───────────────────────────┘
└───────────────────────────────┘
```

关键规则：**每进入一个阶段，先执行该阶段队列中所有宏任务，然后执行所有微任务（nextTick 队列优先于 Promise 队列），再进入下一阶段。**

## 第一阶段：timers

`setTimeout(cb, delay)` 到期后，cb 进入 timers 队列。但注意——"到期"不意味着精确执行。

```javascript
const start = Date.now()

setTimeout(() => {
  console.log('定时器到期，延迟了', Date.now() - start, 'ms')
}, 100)

// 模拟一个阻塞操作
while (Date.now() - start < 200) {
  // 空转 200ms
}
```

输出不是 100ms，而是接近 200ms。因为定时器到期时，事件循环可能还在 poll 阶段或者正在执行其他回调，只有回到 timers 阶段才会处理到期的定时器。

这就是为什么 `setTimeout(fn, 0)` 不是真正的"立即执行"——它只是告诉系统"尽快把回调加入 timers 队列"，但具体什么时候执行要看事件循环的进度。

## 第二阶段：pending callbacks

这个阶段处理某些被延迟到下一轮循环的 I/O 回调。比如 TCP 连接错误、文件读取重试等。日常开发很少直接接触到这个阶段。

## 第三阶段：idle, prepare

仅供 libuv 内部使用，开发者不需要关心。

## 第四阶段：poll（核心！）

poll 阶段是事件循环中最复杂的部分，做了三件事：

1. **计算阻塞时间**：检查 timers 队列，找最近到期的定时器，计算还有多久
2. **轮询 I/O**：阻塞等待 I/O 事件（文件读写、网络请求等完成）
3. **处理回调**：I/O 完成后，回调进入 poll 队列

```javascript
const fs = require('fs')

// I/O 操作
fs.readFile(__filename, () => {
  console.log('I/O 回调')
})

// 这个会先执行？还是会后执行？
setTimeout(() => console.log('timeout'), 0)
setImmediate(() => console.log('immediate'))
```

在 I/O 回调外部，`setTimeout(fn, 0)` 和 `setImmediate` 的执行顺序不确定，取决于系统性能。但在 I/O 回调内部，**setImmediate 永远先执行**：

```javascript
const fs = require('fs')

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'))
  setImmediate(() => console.log('immediate'))
  // 输出顺序：immediate → timeout
})
```

原因：事件循环当前在 poll 阶段，处理完 I/O 回调后会进入 check 阶段（执行 setImmediate），而 timers 阶段要等到下一次循环。

## 第五阶段：check

setImmediate 的回调在这个阶段执行。它与 setTimeout(fn, 0) 的区别就在于所属阶段不同——setImmediate 在 check 阶段，setTimeout 在 timers 阶段。

```javascript
// 判断当前是否在 I/O 回调中
function isInIOCallback() {
  // 通过 setImmediate 和 setTimeout 的执行顺序判断
  let inIO = false
  setImmediate(() => { inIO = true })
  // 如果 setTimeout 在 setImmediate 之前执行，
  // 说明不在 I/O 回调中
}
```

## 第六阶段：close callbacks

处理 socket.on('close')、stream.destroy() 等 close 事件的回调。

```javascript
const net = require('net')
const server = net.createServer()

server.on('connection', (socket) => {
  socket.on('close', () => {
    console.log('连接关闭回调')
  })
  socket.destroy()
})
```

## 最关键的规则：微任务插队

微任务（nextTick 和 Promise）在任何**宏任务阶段切换时**都会被执行。而且 nextTick 的优先级高于 Promise 回调。

```javascript
Promise.resolve().then(() => console.log('Promise'))
process.nextTick(() => console.log('nextTick'))

// 输出顺序：nextTick → Promise
```

继续深入：

```javascript
process.nextTick(() => {
  console.log('nextTick-1')
  process.nextTick(() => {
    console.log('nextTick-2')
    process.nextTick(() => {
      console.log('nextTick-3')
    })
  })
})

setTimeout(() => console.log('timeout'), 0)
```

这个代码有个陷阱：nextTick 可以递归调用自己。如果不小心写了无限递归的 nextTick，事件循环会永远卡在微任务处理阶段，I/O 永远得不到处理——这就是 **I/O starvation**。

```javascript
function recursiveNextTick() {
  process.nextTick(recursiveNextTick)
}
recursiveNextTick()
// 后面所有的 setTimeout/setImmediate/I/O 都不会执行！
```

Node.js 有一个 `process.maxListeners` 警告，但没有对 nextTick 深度做硬限制——所以写代码时要注意。

## 回到开头的问题

```javascript
setTimeout(() => console.log('timeout'), 0)
setImmediate(() => console.log('immediate'))
process.nextTick(() => console.log('nextTick'))
Promise.resolve().then(() => console.log('promise'))
console.log('sync')
```

执行流程：

1. 同步代码先执行：`sync`
2. 事件循环开始，进入 timers 阶段前，处理微任务：`nextTick` → `promise`
3. timers 阶段执行 setTimeout 回调：`timeout`
4. 进入 check 阶段执行 setImmediate 回调：`immediate`

所以输出是：**sync → nextTick → promise → timeout → immediate**

等等，有没有可能 timeout 在 immediate 之后？当代码不在 I/O 回调中时，这取决于系统性能——timers 阶段可能还没来得及处理到期的定时器。所以严格来说，这个顺序在 I/O 回调**外部**是不确定的。

## 实际开发中的影响

理解事件循环对写生产代码有什么实际帮助？很多。

```javascript
// 坏做法：阻塞事件循环
function heavyCalculation() {
  for (let i = 0; i < 1e9; i++) {
    // 密集计算
  }
}

// 好做法：拆分任务
function heavyCalculationAsync() {
  return new Promise(resolve => {
    setImmediate(() => {
      // 分批处理，让事件循环有时间处理 I/O
      for (let i = 0; i < 1e6; i++) { /* ... */ }
      resolve()
    })
  })
}
```

另一个常见场景：在大量数据中逐条处理时，用 setImmediate 让步：

```javascript
function processLargeArray(arr, handler, callback) {
  let index = 0
  
  function next() {
    if (index >= arr.length) return callback()
    
    // 每处理 1000 条，让出事件循环一次
    const batch = Math.min(1000, arr.length - index)
    for (let i = 0; i < batch; i++) {
      handler(arr[index++])
    }
    
    setImmediate(next)
  }
  
  next()
}
```

如果不用 setImmediate 让步，在这 1000 万条数据处理完之前，整个服务器不会响应任何 HTTP 请求。

## 总结

事件循环不是黑魔法，它只是一套精心设计的排队机制。六个阶段、微任务插队、poll 阻塞等待——每个设计决策都有它的理由。

写 Node.js 代码时，脑子里始终保留这个循环图，很多性能问题和顺序问题就能一眼看穿。
