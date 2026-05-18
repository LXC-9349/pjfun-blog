---
title: React Native 2026：新架构、性能优化和跨平台实践
date: 2026-05-17
cover: https://picsum.photos/seed/rn-modern/800/400
desc: 全面介绍 React Native 的新架构（Fabric + TurboModules）和现代开发实践
tags: [React Native, 跨平台, 移动开发, 性能优化]
---

## RN 新架构：Fabric + TurboModules

### 旧架构的问题

```
旧架构（Bridge 模式）：
[JS 线程] ←→ [JSON 序列化] ←→ [Bridge] ←→ [JSON 反序列化] ←→ [Native 线程]

问题：
1. 所有通信都要经过 Bridge（异步、有延迟）
2. JSON 序列化/反序列化有性能开销
3. 无法同步调用 Native 方法
```

### 新架构

```
新架构（JSI 模式）：
[JS 线程] ←→ [JSI（C++ 层）] ←→ [Native 模块]

优势：
1. JS 直接持有 Native 对象的引用
2. 同步调用 Native 方法
3. 无需 JSON 序列化
```

### 性能提升数据

| 指标 | 旧架构 | 新架构 | 提升 |
|------|--------|--------|------|
| 列表滚动帧率 | 45-55 fps | 58-60 fps | +15% |
| 首次渲染时间 | 800ms | 500ms | -37% |
| Bridge 通信延迟 | 5-10ms | < 1ms | -90% |
| 内存占用 | 基准 | -15% | 更好 |

## Expo vs CLI：2026 年选哪个

### 推荐：Expo

2026 年，Expo 已经是 React Native 开发的事实标准：

```bash
# 创建项目
npx create-expo-app@latest my-app --template

# 开发
npx expo start

# 构建
npx expo run:ios
npx expo run:android

# OTA 更新
npx expo update
```

### Expo 的优势

- **预构建配置**：不需要手动配置 Xcode / Android Studio
- **EAS Build**：云端构建，不需要本地 macOS
- **Expo Router**：基于文件的路由（类似 Next.js）
- **开发服务器**：热重载、错误覆盖、DevTools
- **SDK 统一**：所有依赖版本由 Expo 管理

### 什么时候用 CLI

- 需要深度定制原生代码
- 已有原生项目需要集成 RN
- 需要 Expo 不支持的原生库

## 性能优化

### 列表虚拟化

```tsx
import { FlashList } from '@shopify/flash-list';

// ❌ 不要用 FlatList 渲染大量数据
<FlatList
  data={items}  // 10000 条
  renderItem={({ item }) => <ItemCard item={item} />}
/>

// ✅ 用 FlashList
<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  estimatedItemSize={100}  // 关键：预估每项高度
  keyExtractor={(item) => item.id}
/>
```

FlashList 比 FlatList 快 2-3 倍，因为它只渲染可见区域的 item。

### 图片优化

```tsx
import { Image } from 'expo-image';

// ✅ expo-image 比 RN 原生 Image 更好
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  contentFit="cover"
  placeholder={blurhash}  // 占位图
  cachePolicy="memory-disk"  // 缓存策略
  style={{ width: 300, height: 200 }}
/>
```

### JSI 原生模块

```cpp
// 用 C++ 写高性能模块（直接通过 JSI 调用）
// NativeMath.cpp
#include <jsi/jsi.h>

using namespace facebook::jsi;

void installNativeMath(Runtime& rt) {
  auto add = Function::createFromHostFunction(
    rt,
    PropNameID::forAscii(rt, "nativeAdd"),
    2,
    [](Runtime& rt, const Value& thisVal, const Value* args, size_t count) -> Value {
      double a = args[0].asNumber();
      double b = args[1].asNumber();
      return Value(a + b);  // 同步返回，不需要 Promise
    }
  );
  rt.global().setProperty(rt, "nativeAdd", std::move(add));
}
```

```tsx
// 在 JS 中直接调用
const result = globalThis.nativeAdd(2, 3);  // 5，同步调用
```

## 导航方案

### Expo Router（推荐）

```tsx
// app/(tabs)/index.tsx
export default function HomeScreen() {
  return (
    <View>
      <Text>Home</Text>
      <Link href="/profile/123">View Profile</Link>
    </View>
  );
}

// app/profile/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  return <Text>Profile {id}</Text>;
}
```

Expo Router 的优势：
- 基于文件的路由（不需要配置路由表）
- 支持嵌套路由、动态路由、组路由
- 深度链接开箱即用
- 和 React Navigation 底层兼容

## 原生模块开发

### 什么时候需要写原生代码

- 需要访问原生 API（蓝牙、NFC、生物识别）
- 需要高性能计算（图像处理、音频处理）
- Expo 没有对应的库

### Turbo Module 示例

```typescript
// NativeCamera.ts
import { requireNativeModule } from 'expo';

export const NativeCamera = requireNativeModule('NativeCamera');

// 使用
const photo = await NativeCamera.takePhoto({
  quality: 0.8,
  cameraType: 'back',
});
```

```swift
// NativeCamera.swift (iOS)
@objc(NativeCamera)
class NativeCamera: NSObject {
  @objc
  func takePhoto(_ resolve: @escaping RCTPromiseResolveBlock,
                 reject: @escaping RCTPromiseRejectBlock) {
    // 原生相机代码
  }
}
```

## OTA 更新

```bash
# 安装 EAS Update
npx expo install expo-updates

# 发布更新
eas update --branch production --message "Fix login bug"

# 回滚
eas update --branch production --message "Revert"
```

OTA 更新的优势：
- 不需要经过 App Store 审核
- 用户可以即时获得修复
- 支持灰度发布

**限制**：不能更新原生代码（Native Module），只能更新 JS 和资源文件。

## RN vs Flutter：选择建议

| 维度 | React Native | Flutter |
|------|-------------|---------|
| 语言 | TypeScript/JavaScript | Dart |
| UI 渲染 | 原生组件 | 自绘引擎（Skia/Impeller） |
| 性能 | 接近原生 | 接近原生 |
| 生态 | npm（更大） | pub.dev |
| 学习曲线 | 低（会 React 就会 RN） | 中（需要学 Dart） |
| 原生集成 | 需要原生知识 | 需要原生知识 |
| 热重载 | ✅ | ✅ |
| Web 支持 | 有限 | ✅ |

**选择 RN 的场景**：
- 团队已有 React/TypeScript 经验
- 需要复用 Web 端的组件和逻辑
- 项目需要快速迭代

**选择 Flutter 的场景**：
- 需要高度一致的跨平台 UI
- 团队没有 React 经验
- 需要 Web 桌面端支持

## 真实项目：从 0 到 1 搭建跨平台 App

### 项目结构

```
my-app/
├── app/                    # Expo Router 路由
│   ├── (auth)/            # 认证相关页面
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # 主 Tab 页面
│   │   ├── index.tsx      # 首页
│   │   ├── search.tsx
│   │   ├── cart.tsx
│   │   └── profile.tsx
│   └── product/
│       └── [id].tsx       # 商品详情
├── components/            # 共享组件
├── hooks/                 # 自定义 Hooks
├── services/              # API 服务
├── store/                 # 状态管理（Zustand）
├── utils/                 # 工具函数
└── assets/               # 静态资源
```

### 状态管理（Zustand）

```typescript
import { create } from 'zustand';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id),
  })),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
```

## 总结

React Native 在 2026 年已经非常成熟：

1. **新架构**解决了 Bridge 性能瓶颈
2. **Expo** 让开发体验接近 Web 开发
3. **Expo Router** 提供了现代化的路由方案
4. **OTA 更新**让热修复成为可能
5. **TypeScript** 提供了完整的类型安全

如果你已经有 React 经验，RN 是跨平台开发的最佳选择。
