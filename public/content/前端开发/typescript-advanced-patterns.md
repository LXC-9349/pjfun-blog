---
title: TypeScript 高级类型与编程模式
date: 2026-05-16
cover: https://picsum.photos/seed/typescript-advanced/800/400
desc: 深入 TypeScript 条件类型、映射类型、模板字面量类型等高级特性
tags: [TypeScript, 类型系统, 前端开发, JavaScript]
---

## 前言

TypeScript 的类型系统是图灵完备的——这意味着你可以在类型层面进行任意复杂的计算。本文将深入 TypeScript 的高级类型特性，带你从"会用"走向"精通"。

## 泛型进阶

### 约束与条件类型

```typescript
// 基础约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// 条件类型基础
type IsString<T> = T extends string ? true : false
type A = IsString<'hello'>  // true
type B = IsString<123>      // false

// 多层条件
type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object'
```

### infer 关键字：在条件类型中提取类型

`infer` 是 TypeScript 最强大的特性之一，它允许在条件类型中推断类型变量：

```typescript
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// 提取 Promise 内部类型
type Unwrap<T> = T extends Promise<infer U> ? U : T
type Result = Unwrap<Promise<string>>  // string

// 提取数组元素类型
type ElementType<T> = T extends (infer U)[] ? U : never
type Items = ElementType<string[]>  // string

// 提取函数参数类型
type Params<T> = T extends (...args: infer P) => any ? P : never
```

## 映射类型：批量转换类型

### 基础映射

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Optional<T> = {
  [P in keyof T]?: T[P]
}

type Nullable<T> = {
  [P in keyof T]: T[P] | null
}
```

### 键名重映射

TypeScript 4.1+ 支持通过 `as` 子句重映射键名：

```typescript
// 加前缀
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }

// 过滤键
type Methods<T> = {
  [P in keyof T as T[P] extends Function ? P : never]: T[P]
}
```

### 实战：深度 Partial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

interface Config {
  server: {
    host: string
    port: number
    auth: { username: string; password: string }
  }
  cache: { ttl: number; strategy: string }
}

type PartialConfig = DeepPartial<Config>
// 所有属性都变为可选，包括嵌套属性
```

## 模板字面量类型

模板字面量类型在 TypeScript 4.1 中引入，开启了字符串类型操作的新维度：

### 基本用法

```typescript
type EventName = `on${Capitalize<string>}`
type ClickEvent = `onClick`  // OK
type ChangeEvent = `onChange`  // OK
```

### 结合联合类型

```typescript
type Vertical = 'top' | 'bottom'
type Horizontal = 'left' | 'right'

type Position = `${Vertical}-${Horizontal}`
// 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

// 实际应用：CSS 属性
type CssValue = string | number
type CssProperties = {
  [P in `margin${Capitalize<Vertical>}` | `margin`]?: CssValue
}
```

### 类型安全的 API 路径

```typescript
type ApiPath = `api/v1/${string}/${string}`

function apiGet<T>(path: ApiPath): Promise<T> {
  return fetch(`/${path}`).then(r => r.json())
}

// ✓ 正确
apiGet('api/v1/users/list')
// ✗ 错误：类型不匹配
// apiGet('api/v2/users/list')
```

### 字符串操作工具类型

```typescript
// 移除前缀
type TrimPrefix<T extends string, Prefix extends string> =
  T extends `${Prefix}${infer Rest}` ? Rest : T

type Path = '/api/v1/users'
type CleanPath = TrimPrefix<Path, '/api'>  // '/v1/users'

// 分割字符串
type Split<T extends string, Sep extends string> =
  T extends `${infer Head}${Sep}${infer Tail}`
    ? [Head, ...Split<Tail, Sep>]
    : [T]
```

## 类型体操实战

### 实战一：类型安全的 Builder 模式

```typescript
class QueryBuilder<T extends Record<string, any>> {
  private conditions: string[] = []

  where<K extends keyof T>(key: K, op: '=' | '>' | '<', value: T[K]): this {
    this.conditions.push(`${String(key)} ${op} ${value}`)
    return this
  }

  build(): string {
    return `SELECT * FROM table WHERE ${this.conditions.join(' AND ')}`
  }
}

// 使用
interface User { id: number; name: string; age: number }
new QueryBuilder<User>()
  .where('age', '>', 18)
  .where('name', '=', 'Alice')
  .build()
```

### 实战二：Redux 风格的类型安全 Action

```typescript
type ActionMap<P extends Record<string, any>> = {
  [K in keyof P]: P[K] extends undefined
    ? { type: K }
    : { type: K; payload: P[K] }
}

type Actions = ActionMap<{
  increment: undefined
  setUser: { id: number; name: string }
  setTheme: 'light' | 'dark'
}>

// Actions 等价于：
// { type: 'increment' }
// { type: 'setUser'; payload: { id: number; name: string } }
// { type: 'setTheme'; payload: 'light' | 'dark' }
```

### 实战三：类型安全的事件发射器

```typescript
type EventMap = {
  click: { x: number; y: number }
  change: { value: string }
  focus: undefined
}

class TypedEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    // 实现略
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    // 实现略
  }
}

const emitter = new TypedEmitter<EventMap>()
emitter.on('click', (data) => {
  console.log(data.x, data.y)  // 类型安全
})
```

## 实用工具类型实现

```typescript
// 非空数组
type NonEmptyArray<T> = [T, ...T[]]

// 只读非空数组
type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]]

// 函数签名
type Overload<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : never

// 联合类型转交叉类型
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends
  (k: infer I) => void ? I : never
```

## 项目中的类型安全实践

### API 响应类型

```typescript
interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

interface UserDTO {
  id: number
  username: string
  email: string
  createdAt: string
}

async function fetchUser(id: number): Promise<ApiResponse<UserDTO>> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}
```

### 类型守卫与断言

```typescript
// 自定义类型守卫
function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { code: 400 | 500 } {
  return response.code >= 400
}

// 断言函数
function assertUserDTO(data: unknown): asserts data is UserDTO {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Not a valid user data')
  }
  if (!('id' in data) || !('username' in data)) {
    throw new Error('Missing required fields')
  }
}
```

## 总结

TypeScript 的高级类型系统为代码带来了前所未有的安全性和表达能力。关键在于：

1. **条件类型** + **infer** 是类型编程的基石
2. **映射类型** + **重映射** 提供了批量转换类型的利器
3. **模板字面量类型** 让字符串层面也能享受类型安全
4. 类型编程应以实际需求为导向，避免过度抽象

掌握这些高级特性后，你将能够设计出既灵活又安全的类型系统，让 TypeScript 真正成为你的"超能力"。
