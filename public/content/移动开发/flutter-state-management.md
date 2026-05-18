---
title: Flutter 状态管理方案对比：Provider、Riverpod、Bloc 怎么选
date: 2026-05-17
cover: https://picsum.photos/seed/flutter-state/800/400
desc: 从实际项目经验出发，对比主流 Flutter 状态管理方案的优劣和适用场景
tags: [Flutter, 状态管理, Riverpod, Bloc, 移动开发]
---

## Flutter 的状态挑战

Flutter 是声明式 UI 框架——UI 是状态的函数：`UI = f(state)`。当状态变化时，整个 widget 树会重建。

`setState` 的问题：
- 只能管理局部状态
- 状态无法跨 widget 共享
- 状态逻辑和 UI 混在一起

## Provider：最简单的方案

### 基本用法

```dart
// 1. 定义状态
class CounterModel extends ChangeNotifier {
  int _count = 0;
  int get count => _count;
  
  void increment() {
    _count++;
    notifyListeners();  // 通知监听者重建
  }
}

// 2. 在顶层提供
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CounterModel(),
      child: MyApp(),
    ),
  );
}

// 3. 在子组件中消费
class CounterDisplay extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final count = context.watch<CounterModel>().count;  // 自动重建
    return Text('Count: $count');
  }
}

class CounterButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final model = context.read<CounterModel>();  // 不监听
    return ElevatedButton(
      onPressed: () => model.increment(),
      child: Text('Increment'),
    );
  }
}
```

### 适用场景

- 小型到中型项目
- 团队对 Flutter 不太熟悉
- 状态逻辑不复杂

### 缺点

- 运行时错误：`ProviderNotFoundException`（忘记在顶层提供）
- 无法在 Provider 外部测试
- 依赖 `BuildContext`，在某些场景下不方便

## Riverpod：Provider 的进化版

### 核心改进

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';

// 1. 定义 Provider（编译时安全）
@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0;
  
  void increment() => state++;
}

// 2. 使用（不需要 BuildContext）
class CounterDisplay extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);  // 编译时检查
    return Text('Count: $count');
  }
}

// 3. 组合 Provider
@riverpod
class UserPosts extends _$UserPosts {
  @override
  Future<List<Post>> build(String userId) async {
    final user = ref.watch(userProvider(userId));
    return fetchPosts(user.id);
  }
}
```

### 优势

- **编译时安全**：不会在运行时找不到 Provider
- **不需要 BuildContext**：可以在任何地方使用
- **自动依赖追踪**：Provider 之间可以互相依赖
- **更好的测试性**：Provider 可以独立测试

### 适用场景

- 中大型项目
- 需要组合多个状态源
- 团队希望有更好的类型安全

## Bloc/Cubit：事件驱动

### Cubit（简化版）

```dart
// 1. 定义 Cubit
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);
  
  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
}

// 2. 使用
class CounterPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => CounterCubit(),
      child: Scaffold(
        body: BlocBuilder<CounterCubit, int>(
          builder: (context, count) => Text('Count: $count'),
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => context.read<CounterCubit>().increment(),
          child: Icon(Icons.add),
        ),
      ),
    );
  }
}
```

### Bloc（完整版，带事件）

```dart
// 事件
abstract class CounterEvent {}
class Increment extends CounterEvent {}
class Decrement extends CounterEvent {}

// Bloc
class CounterBloc extends Bloc<CounterEvent, int> {
  CounterBloc() : super(0) {
    on<Increment>((event, emit) => emit(state + 1));
    on<Decrement>((event, emit) => emit(state - 1));
  }
}

// 使用
BlocProvider(
  create: (_) => CounterBloc(),
  child: BlocBuilder<CounterBloc, int>(
    builder: (context, state) => Text('Count: $state'),
  ),
)
```

### 适用场景

- 大型项目，复杂业务逻辑
- 需要严格的状态流转追踪
- 团队协作，需要统一的架构规范

### 缺点

- 样板代码多
- 学习曲线陡
- 简单场景过度设计

## GetX：争议最大的方案

```dart
// 1. 定义 Controller
class CounterController extends GetxController {
  var count = 0.obs;  // 响应式变量
  
  void increment() => count++;
}

// 2. 使用
class CounterPage extends StatelessWidget {
  final controller = Get.put(CounterController());
  
  @override
  Widget build(BuildContext context) {
    return Obx(() => Text('Count: ${controller.count.value}'));
  }
}
```

### 优点

- 极简 API，上手快
- 内置路由管理、依赖注入、国际化
- 代码量少

### 缺点

- 偏离 Flutter 的设计哲学（全局单例）
- 不利于测试
- 社区争议大，部分开发者不推荐

## 选择策略

| 项目规模 | 推荐方案 | 理由 |
|----------|----------|------|
| 小型（< 10 页面） | Provider | 简单、官方推荐 |
| 中型（10-30 页面） | Riverpod | 类型安全、组合性好 |
| 大型（> 30 页面） | Bloc/Riverpod | 架构清晰、可维护性强 |
| 快速原型 | GetX | 开发速度快 |
| 企业级项目 | Bloc | 规范统一、易于团队协作 |

## 实际案例：电商 App 状态管理

```dart
// 使用 Riverpod 管理电商 App 状态

// 用户状态
@riverpod
class User extends _$User {
  @override
  Future<UserModel?> build() async {
    final prefs = ref.watch(sharedPreferencesProvider);
    final token = prefs.getString('token');
    if (token == null) return null;
    return fetchUser(token);
  }
  
  Future<void> login(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => authRepository.login(email, password));
  }
}

// 购物车状态
@riverpod
class Cart extends _$Cart {
  @override
  List<CartItem> build() => [];
  
  void addItem(Product product) {
    final existing = state.indexWhere((item) => item.productId == product.id);
    if (existing >= 0) {
      state = [
        ...state.sublist(0, existing),
        state[existing].copyWith(quantity: state[existing].quantity + 1),
        ...state.sublist(existing + 1),
      ];
    } else {
      state = [...state, CartItem(productId: product.id, quantity: 1)];
    }
  }
  
  double get total => state.fold(0, (sum, item) => sum + item.price * item.quantity);
}

// 商品列表（依赖用户状态）
@riverpod
Future<List<Product>> products(ProductsRef ref, {String? category}) async {
  final user = ref.watch(userProvider);
  return productRepository.fetchAll(
    category: category,
    userId: user.value?.id,  // 个性化推荐
  );
}
```

## 性能对比

| 方案 | 重建范围 | 内存占用 | 启动时间 |
|------|----------|----------|----------|
| Provider | 精确到 watch 的 widget | 低 | 快 |
| Riverpod | 精确到 watch 的 widget | 低 | 快 |
| Bloc | 精确到 BlocBuilder | 中 | 中 |
| GetX | 全局 Obx | 中 | 快 |

## 总结

状态管理没有银弹。选择建议：

1. **新项目**：从 Riverpod 开始（类型安全 + 组合性）
2. **已有 Provider 项目**：不需要迁移，Provider 够用
3. **企业项目**：Bloc（规范 + 可追溯）
4. **避免**：在大型项目中使用 `setState` 管理全局状态

核心原则：**状态管理方案应该让代码更清晰，而不是更复杂。**
