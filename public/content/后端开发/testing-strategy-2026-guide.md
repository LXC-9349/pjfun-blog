---
title: 测试策略实战：2026 年的前端测试金字塔
date: 2026-05-18
cover: https://picsum.photos/seed/testing-strategy-2026/800/400
desc: Vitest 负责 unit，Playwright 负责 E2E，本文详解现代测试策略的正确打开方式
tags: [测试, Vitest, Playwright, E2E, 单元测试]
---

## 测试的痛苦

你有没有经历过这些：

- 单元测试 100% 覆盖，上线后还是出 bug
- E2E 测试不稳定，时过时不过
- 测试套件跑 30 分钟，没人愿意等
- 写测试的时间比写代码还长

问题不在于"测试没用"，而在于**测试策略不对**。

## 测试金字塔

```
        △
       ╱ ╲
      ╱ E2E╲        ← 少量，只测关键路径
     ╱───────╲
    ╱ Integration╲   ← 适量，测组件组合
   ╱─────────────╲
  ╱   Unit Tests  ╲  ← 大量，测纯逻辑
 ╱─────────────────╲
```

| 层级 | 数量 | 速度 | 成本 | 测试什么 |
|------|------|------|------|----------|
| Unit | 多 | 快 | 低 | 纯函数、工具类 |
| Integration | 中 | 中 | 中 | 组件交互、API |
| E2E | 少 | 慢 | 高 | 用户关键路径 |

**错误做法**：倒金字塔（大量 E2E，少量单元测试）
- 测试套件跑 30 分钟
- 失败时难以定位问题

**正确做法**：正金字塔
- 单元测试保证逻辑正确
- 集成测试保证组件协作
- E2E 保证关键用户流程

## Unit Testing：Vitest

### 为什么选 Vitest

| 维度 | Vitest | Jest |
|------|--------|------|
| 启动速度 | < 1s | 3-5s |
| HMR | ✅ 原生支持 | ❌ |
| ESM | ✅ 原生支持 | 需配置 |
| TypeScript | ✅ 开箱即用 | 需配置 |
| Vite 集成 | ✅ 完美 | 需额外配置 |

### 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### 测试纯函数

```typescript
// src/utils/calculate.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount, formatPrice } from './calculate';

describe('calculateDiscount', () => {
  it('should apply percentage discount', () => {
    expect(calculateDiscount(100, { type: 'percentage', value: 20 })).toBe(80);
  });

  it('should apply fixed discount', () => {
    expect(calculateDiscount(100, { type: 'fixed', value: 15 })).toBe(85);
  });

  it('should not exceed item price', () => {
    expect(calculateDiscount(50, { type: 'fixed', value: 100 })).toBe(0);
  });

  // 边界情况
  it('should handle zero price', () => {
    expect(calculateDiscount(0, { type: 'percentage', value: 20 })).toBe(0);
  });

  it('should throw on invalid discount type', () => {
    expect(() => calculateDiscount(100, { type: 'invalid', value: 10 }))
      .toThrow('Invalid discount type');
  });
});

describe('formatPrice', () => {
  it('should format price with currency', () => {
    expect(formatPrice(1234.5, 'USD')).toBe('$1,234.50');
  });

  it('should handle different currencies', () => {
    expect(formatPrice(1234.5, 'EUR')).toBe('€1,234.50');
    expect(formatPrice(1234.5, 'JPY')).toBe('¥1,235');
  });
});
```

### 测试 React 组件

```typescript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should render with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show loading spinner when loading', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should apply variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');
  });
});
```

### 测试 Hooks

```typescript
// src/hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('should decrement', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('should not go below min', () => {
    const { result } = renderHook(() => useCounter(0, { min: 0 }));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(0);
  });
});
```

### Mock API 调用

```typescript
// src/api/user.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchUser, updateUser } from './user';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

afterEach(() => {
  mockFetch.mockReset();
});

describe('fetchUser', () => {
  it('should fetch user by id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'John' }),
    });

    const user = await fetchUser('1');

    expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
    expect(user).toEqual({ id: '1', name: 'John' });
  });

  it('should throw on not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchUser('999')).rejects.toThrow('User not found');
  });
});

describe('updateUser', () => {
  it('should send PATCH request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'Updated' }),
    });

    await updateUser('1', { name: 'Updated' });

    expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
  });
});
```

## Integration Testing

### 测试组件集成

```typescript
// src/features/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 创建 wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('LoginForm', () => {
  it('should submit form with valid credentials', async () => {
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />, { wrapper: createWrapper() });

    // 填写表单
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // 提交
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // 等待异步操作
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error for invalid email', async () => {
    render(<LoginForm onLogin={vi.fn()} />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });
});
```

### 测试 API 集成（MSW）

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    
    if (id === '999') {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({
      id,
      name: 'John Doe',
      email: 'john@example.com',
    });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        token: 'fake-jwt-token',
        user: { id: '1', email: body.email },
      });
    }
    
    return new HttpResponse(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401 }
    );
  }),
];
```

```typescript
// test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// test/setup.ts (更新)
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// src/api/auth.test.ts
import { describe, it, expect } from 'vitest';
import { login } from './auth';

describe('login', () => {
  it('should return token on success', async () => {
    const result = await login({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result.token).toBe('fake-jwt-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('should throw on invalid credentials', async () => {
    await expect(login({
      email: 'wrong@example.com',
      password: 'wrong',
    })).rejects.toThrow('Invalid credentials');
  });
});
```

## E2E Testing：Playwright

### 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 测试关键用户流程

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    // 使用 getByRole 而不是 CSS 选择器
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('password');
    await page.getByRole('button', { name: /login/i }).click();

    // 等待导航
    await expect(page).toHaveURL(/\/dashboard/);
    
    // 验证用户信息显示
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: /email/i }).fill('wrong@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('wrong');
    await page.getByRole('button', { name: /login/i }).click();

    // 验证错误消息
    await expect(page.getByRole('alert')).toContainText(/invalid credentials/i);
  });
});
```

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 登录（复用登录状态）
    await page.goto('/login');
    await page.getByRole('textbox', { name: /email/i }).fill('test@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('password');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should complete checkout', async ({ page }) => {
    // 添加商品到购物车
    await page.goto('/products');
    await page.getByRole('article').first().getByRole('button', { name: /add to cart/i }).click();
    
    // 验证购物车更新
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    // 进入购物车
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page).toHaveURL(/\/cart/);

    // 结算
    await page.getByRole('button', { name: /checkout/i }).click();
    
    // 填写地址
    await page.getByRole('textbox', { name: /address/i }).fill('123 Main St');
    await page.getByRole('textbox', { name: /city/i }).fill('New York');
    await page.getByRole('button', { name: /place order/i }).click();

    // 验证订单成功
    await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible();
  });
});
```

### Page Object Model

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

```typescript
// e2e/auth.spec.ts (使用 POM)
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password');
  
  await expect(page).toHaveURL(/\/dashboard/);
});
```

### 减少测试不稳定性

```typescript
// ❌ 不稳定：依赖固定等待时间
await page.waitForTimeout(1000);
await expect(page.getByText('Loaded')).toBeVisible();

// ✅ 稳定：等待条件
await expect(page.getByText('Loaded')).toBeVisible({ timeout: 5000 });

// ❌ 不稳定：使用 CSS 选择器
await page.locator('.submit-btn').click();

// ✅ 稳定：使用语义选择器
await page.getByRole('button', { name: /submit/i }).click();

// ❌ 不稳定：测试依赖共享状态
test('test A', async ({ page }) => {
  // 修改数据库状态
});

test('test B', async ({ page }) => {
  // 依赖 test A 的状态
});

// ✅ 稳定：测试隔离
test('test A', async ({ page }) => {
  // 独立设置测试数据
});

test('test B', async ({ page }) => {
  // 独立设置测试数据
});
```

## 测试覆盖率目标

| 类型 | 目标覆盖率 | 实际可接受 |
|------|-----------|-----------|
| 关键业务逻辑 | 90%+ | 80%+ |
| 工具函数 | 100% | 90%+ |
| UI 组件 | 70%+ | 60%+ |
| E2E 流程 | 关键路径 100% | 核心流程 |

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 总结

2026 年的测试策略：

1. **金字塔结构**：大量单元测试 + 适量集成测试 + 少量 E2E
2. **工具选择**：Vitest 负责单元和集成，Playwright 负责 E2E
3. **测试优先级**：关键业务逻辑 > 工具函数 > UI 组件
4. **稳定性**：语义选择器 + 等待条件 + 测试隔离

测试的目标不是 100% 覆盖率，而是**对代码的信心**。写有价值的测试，而不是为了覆盖率数字。
