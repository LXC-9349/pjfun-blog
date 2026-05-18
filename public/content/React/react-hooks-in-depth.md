---
title: React Hooks 核心原理：我不是在背 API
date: 2026-05-16
cover: https://picsum.photos/seed/react-hooks/800/400
desc: 从 useState 到 useReducer，理解 React Hooks 的设计动机和底层机制——而不是只背表面用法
tags: [React, Hooks, JavaScript, 前端框架]
---

## Hooks 不是魔法

很多人学 Hooks 的方式是记住几个函数签名：`useState(initial)`、`useEffect(fn, deps)`、`useContext(ctx)`——然后就开始写了。

这种方式能写出能跑的代码，但遇到复杂场景时容易出 Bug。因为你不理解 Hooks 的**执行模型**——为什么不能放在条件语句里？为什么依赖数组要填对？为什么 useCallback 有时候有用有时候没用？

这篇文章不讲 API 用法，讲的是 Hooks 为什么这么设计。

## useState：不是"声明了一个变量"

看这段代码：

```javascript
const [count, setCount] = useState(0)
```

很多人把它理解成"声明了一个状态变量"。这不是不对，但这个理解不够——你错过了最关键的区别：**普通变量在函数执行完毕后就销毁了，React 状态被保存在了 Fiber 节点上**。

### React 如何"记住"状态

每次组件渲染时，`useState` 都会被调用一次。但它返回的值不是每次重新计算的——而是从挂在 Fiber 节点上的**链表**中取出来的。

```
Fiber 节点
  ├── memoizedState → Hook0 (useState)
  │                    ├── queue: [update1, update2, ...]
  │                    ├── memoizedState: "当前状态值"
  │                    └── next → Hook1 (useEffect)
  │                                ├── ...
  │                                └── next → Hook2 (useRef)
  │                                            └── ...
```

每一次 `useState` 调用，React 都会在 Fiber 的 Hook 链表中追加一个节点。这就是 **为什么 Hooks 不能放在条件语句或循环中**——条件变化会导致 Hook 链表错位。

### setCount 发生了什么事

```javascript
setCount(count + 1)
// 或者
setCount(prev => prev + 1)
```

当 setCount 被调用时：
1. 更新被添加到对应 Hook 的更新队列中
2. React 标记该组件需要重新渲染
3. 下次渲染时，React 计算队列中的所有更新，得到新的状态值

这就是为什么连续调用 `setCount(count + 1)` 三次，count 只会增加 1 而不是 3——因为每次读取的 `count` 都是同一个快照值。函数式更新 `setCount(prev => prev + 1)` 能解决这个问题，因为它操作的是队列中的"待定状态"。

## useEffect：副作用是有时间点的

```javascript
useEffect(() => {
  document.title = `点击了 ${count} 次`
}, [count])
```

useEffect 的核心设计思想是**与渲染过程分离**。

组件的渲染分为两个阶段：
- **Render 阶段**：调用组件函数，生成虚拟 DOM（此时应该没有副作用）
- **Commit 阶段**：将虚拟 DOM 提交到真实 DOM（副作用在这里执行）

useEffect 的回调在 **Commit 阶段之后**（浏览器完成布局和绘制之后）异步执行。这和旧的类组件中的 `componentDidMount` 不同——后者是同步执行的。

### 清理函数的时机

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick')
  }, 1000)
  
  // 清理函数
  return () => {
    clearInterval(timer)
  }
}, [])
```

清理函数在两种情况下执行：
1. 组件卸载时
2. 依赖变化导致重新执行 effect 之前

****依赖数组的作用**不是"监听变化"，而是"决定是否需要重新创建 effect"**。每次渲染都会创建新的 effect 函数，但 React 只在依赖变化时才执行新函数（并清理旧的）。

### 空依赖数组和缺少依赖

```javascript
// 组件挂载时执行一次
useEffect(() => {
  fetchData()
}, [])

// 这里的 eslint-plugin-react-hooks 会警告：
// 如果 fetchData 内部使用了 props 或 state 的值
// 空数组意味着 effect 永远不会重新执行
// 所以它拿到的是闭包中的"旧值"
```

正确的做法：

```javascript
// 如果依赖来自外部
useEffect(() => {
  fetchData(userId)
}, [userId])

// 或者使用 ref 来绕过
const latestCallback = useRef()
latestCallback.current = () => fetchData(userId)

useEffect(() => {
  latestCallback.current()
}, [])
```

## useMemo 和 useCallback：不要滥用

这两个 API 的作用是**记忆化**——避免在每次渲染时都重新计算或创建函数。

```javascript
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}, [items])

const handleClick = useCallback(() => {
  setCount(prev => prev + 1)
}, [])
```

### 什么时候真的需要用

```javascript
// 1. 计算量真的很大
const sortedList = useMemo(() => {
  return hugeList.sort((a, b) => expensiveCompare(a, b))
}, [hugeList])

// 2. 引用相等性对子组件很重要（配合 React.memo）
const handleSubmit = useCallback((data) => {
  form.submit(data)
}, [form])

return <ExpensiveForm onSubmit={handleSubmit} />
```

### 什么时候不需要

```javascript
// 不需要 useMemo——计算不贵
const total = items.length

// 不需要 useCallback——子组件没有用 React.memo
const handleClick = () => setOpen(!open)
return <button onClick={handleClick}>切换</button>
```

一个经验法则：**先用 useMemo 和 useCallback 写出正确代码，然后只在性能分析（Profiler）发现瓶颈时添加优化**。过早优化是万恶之源。

## useRef：不只是 DOM 引用

```javascript
const inputRef = useRef(null)
// ref 对象在组件的整个生命周期内保持不变
// 改变 .current 属性不会触发重新渲染

<input ref={inputRef} />

// 你可以在 effect 中操作 DOM
useEffect(() => {
  inputRef.current?.focus()
}, [])
```

useRef 的核心特性：**它像一个盒子，你可以往里面放任何东西，而且这个盒子在渲染之间保持不变**。

实用场景：

```javascript
// 保存定时器 ID
const timerRef = useRef(null)

const startTimer = () => {
  timerRef.current = setInterval(tick, 1000)
}

const stopTimer = () => {
  clearInterval(timerRef.current)
}

// 记住上一次的值
function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current  // 返回的是上一次渲染时的值
}

// 保存不需要触发重新渲染的可变状态
const renderCountRef = useRef(0)
renderCountRef.current++
```

## useReducer：当 useState 不够用

```javascript
const initialState = { count: 0, step: 1 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.payload }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  return (
    <>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <input
        value={state.step}
        onChange={e => dispatch({ type: 'setStep', payload: +e.target.value })}
      />
    </>
  )
}
```

useReducer 的适用场景不是状态很复杂——而是**多个状态更新之间有关联**。比如"增加计数"和"检查是否达到上限"这两个逻辑应该放在一起。

## 自定义 Hooks：逻辑复用的真正方案

Hooks 之前，React 的逻辑复用靠 mixins（已被弃用）和高阶组件（HOC，代码理解成本高）。

Hooks 的方案：**用函数封装逻辑**。

```javascript
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return size
}

// 在组件中使用
function Dashboard() {
  const { width, height } = useWindowSize()
  const isMobile = width < 768
  // ...
}
```

自定义 Hook 的核心：**返回你需要的数据和函数**。它就是一个函数，内部用了 React 的 Hooks。

## 写在最后

理解 React Hooks 的关键不在于记 API，而在于理解它的**执行模型**：

1. 组件函数每次渲染都会执行
2. Hooks 按调用顺序从 Fiber 链表中取数据
3. Effect 在渲染完成后异步执行
4. 依赖数组控制"是否跳过执行"

当你脑子里有这个模型后，遇到 Bug 时你猜的到原因——而不用靠"试试把依赖加进去"碰运气。
