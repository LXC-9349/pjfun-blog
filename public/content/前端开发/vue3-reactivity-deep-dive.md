---
title: Vue3 响应式原理深入解析
date: 2026-05-17
cover: https://picsum.photos/seed/vue3-reactivity/800/400
desc: 从 Proxy 到依赖追踪，深入理解 Vue3 响应式系统的底层实现原理
tags: [Vue3, 响应式, 源码分析, 前端开发]
---

## 为什么需要理解响应式原理

很多开发者会用 `ref` 和 `reactive`，但不清楚它们背后发生了什么。理解原理不仅能帮你避免常见陷阱，还能在性能优化时做出正确决策。

## 核心概念：Proxy

Vue3 的响应式系统基于 ES6 的 `Proxy`，取代了 Vue2 的 `Object.defineProperty`。

### Proxy vs Object.defineProperty

```javascript
// Vue2 的方式 - 只能拦截已知属性
Object.defineProperty(obj, 'name', {
  get() { console.log('读取 name') },
  set(val) { console.log('设置 name:', val) }
})

// Vue3 的方式 - 可以拦截所有操作
const proxy = new Proxy(obj, {
  get(target, key) {
    console.log('读取', key)
    return target[key]
  },
  set(target, key, value) {
    console.log('设置', key, value)
    target[key] = value
    return true
  }
})
```

**Proxy 的优势**：
- 可以检测属性的添加和删除
- 可以拦截数组的索引访问和修改
- 可以拦截 `Map`、`Set` 等集合类型
- 性能更好（惰性代理，不需要递归遍历）

## 响应式系统架构

```
ref / reactive
      ↓
  reactive effect (Proxy)
      ↓
  track (收集依赖)
      ↓
  trigger (触发更新)
      ↓
  scheduler (调度执行)
      ↓
  组件更新 / 计算属性更新
```

## ref 的实现原理

### 基本结构

```typescript
function ref<T>(value: T): Ref<T> {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean): Ref {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T
  public dep?: Dep = undefined

  constructor(value: T, public readonly __v_isRef = true) {
    this._rawValue = value
    this._value = convert(value) // 如果是对象，转为 reactive
  }

  get value() {
    trackRefValue(this) // 收集依赖
    return this._value
  }

  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = convert(newVal)
      triggerRefValue(this) // 触发更新
    }
  }
}
```

### 依赖收集与触发

```typescript
// 依赖收集
function trackRefValue(ref: RefImpl) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

// 触发更新
function triggerRefValue(ref: RefImpl) {
  triggerEffects(ref.dep)
}
```

## reactive 的实现原理

### Proxy 拦截

```typescript
function reactive<T extends object>(target: T): Reactive<T> {
  return createReactiveObject(target, mutableHandlers)
}

const mutableHandlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    track(target, TrackOpTypes.GET, key) // 收集依赖
    return isObject(res) ? reactive(res) : res // 深层响应式
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if (target === toRaw(receiver)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue) // 触发更新
    }
    return result
  },
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key)
    const result = Reflect.deleteProperty(target, key)
    if (hadKey) {
      trigger(target, TriggerOpTypes.DELETE, key) // 触发更新
    }
    return result
  }
}
```

### 深层响应式

`reactive` 在 `get` 时才会递归转换子对象，这是**惰性**的——只有访问到的属性才会被代理，提升了性能。

```javascript
const state = reactive({
  a: { b: { c: 1 } }
})
// 此时只有 state.a 被代理，a.b.c 还没有
console.log(state.a.b.c)
// 现在 a.b 和 a.b.c 才被代理
```

## effect 与依赖追踪

### 核心数据结构

```typescript
// targetMap: 存储所有响应式对象的依赖
// Map<target, Map<key, Set<effect>>>
const targetMap = new WeakMap()

function track(target, type, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  if (activeEffect) {
    dep.add(activeEffect)
  }
}

function trigger(target, type, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}
```

### effect 执行流程

```typescript
let activeEffect: ReactiveEffect | undefined

class ReactiveEffect {
  constructor(public fn: Function) {}
  
  run() {
    activeEffect = this
    try {
      return this.fn()
    } finally {
      activeEffect = undefined
    }
  }
}

function effect(fn: Function) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}
```

### 实际执行示例

```javascript
const state = reactive({ count: 0 })

effect(() => {
  console.log('count 变了:', state.count)
})
// 执行流程：
// 1. effect 运行，activeEffect 指向当前 effect
// 2. 读取 state.count → track 收集当前 effect 到 state.count 的依赖集合
// 3. 执行完毕，activeEffect 清空

state.count = 1
// 执行流程：
// 1. 设置 state.count → trigger 找到 state.count 的依赖集合
// 2. 执行集合中的所有 effect
// 输出: "count 变了: 1"
```

## computed 的实现

```typescript
function computed<T>(getter: ComputedGetter<T>): ComputedRef<T> {
  return new ComputedRefImpl(getter)
}

class ComputedRefImpl {
  private _value!: T
  private _dirty = true
  public dep?: Dep
  public effect: ReactiveEffect

  constructor(getter: ComputedGetter<T>) {
    this.effect = new ReactiveEffect(() => getter(this._value))
    this.effect.scheduler = () => {
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    }
  }

  get value() {
    if (this._dirty) {
      this._value = this.effect.run()
      this._dirty = false
    }
    trackRefValue(this)
    return this._value
  }
}
```

**关键点**：
- `_dirty` 标记是否需要重新计算
- `scheduler` 在依赖变化时将 `_dirty` 设为 `true`
- 只有访问 `.value` 时才真正重新计算（惰性求值）

## watch 的实现原理

```typescript
function watch(source, cb, options) {
  return doWatch(source, cb, options)
}

function doWatch(source, cb, { immediate, deep }) {
  let getter: () => any
  
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    deep = true
  } else if (isFunction(source)) {
    getter = source
  }

  let oldValue
  const job = () => {
    const newValue = getter()
    if (deep || hasChanged(newValue, oldValue)) {
      cb(newValue, oldValue)
      oldValue = newValue
    }
  }

  const effect = new ReactiveEffect(getter, job)
  
  if (immediate) {
    job()
  } else {
    oldValue = effect.run()
  }
  
  return () => effect.stop()
}
```

## 常见陷阱与解决方案

### 陷阱一：解构丢失响应式

```javascript
const state = reactive({ count: 0 })
const { count } = state // ❌ 丢失响应式

// 解决方案：使用 toRefs
const { count } = toRefs(state) // ✅ 保持响应式
```

### 陷阱二：替换整个对象

```javascript
const state = reactive({ count: 0 })
state = reactive({ count: 1 }) // ❌ 响应式连接断开

// 解决方案：使用 Object.assign
Object.assign(state, { count: 1 }) // ✅ 保持响应式
```

### 陷阱三：数组索引直接赋值

```javascript
// Vue3 中已经支持，但需要注意
const arr = reactive([1, 2, 3])
arr[0] = 10 // ✅ Vue3 的 Proxy 可以拦截

// Vue2 中需要用 Vue.set
```

## 性能优化建议

| 场景 | 建议 |
|------|------|
| 大列表数据 | 使用 `shallowRef` 或 `shallowReactive` |
| 不需要深层响应式 | 使用 `shallowReactive` |
| 只读数据 | 使用 `readonly` 包装 |
| 频繁更新的对象 | 避免使用 `reactive`，用 `ref` 替代 |

## 总结

Vue3 响应式系统的核心：

1. **Proxy** 提供拦截能力，比 Vue2 的 `Object.defineProperty` 更强大
2. **track** 在读取时收集依赖，**trigger** 在修改时触发更新
3. **effect** 是响应式的执行单元，computed 和 watch 都基于它
4. **惰性求值** 和 **惰性代理** 是性能优化的关键

理解这些原理后，你就能写出更高效、更可靠的 Vue3 代码。
