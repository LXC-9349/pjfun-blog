---
title: Vite 高级配置
date: 2025-12-05
desc: 深入了解 Vite 构建工具的各种高级配置选项
cover: 	https://img0.baidu.com/it/u=899788717,490343799&fm=253&fmt=auto&app=138&f=JPEG
tags: [Vite, 构建工具, 性能优化]
---
我将帮您完善这份 Vite 高级配置文档，增加更多实用的内容和细节。

## 环境变量和模式

Vite 在一个特殊的 `import.meta.env` 对象上暴露环境变量。可以在生产构建时使用这些变量来替换开发环境中的值。

### 环境变量类型

```js
// vite.config.js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION)
  }
})
```


Vite 提供了以下内置环境变量：

- `import.meta.env.MODE`: {string} 应用运行的模式
- `import.meta.env.BASE_URL`: {string} 部署应用时的基本 URL
- `import.meta.env.PROD`: {boolean} 应用是否运行在生产环境
- `import.meta.env.DEV`: {boolean} 应用是否运行在开发环境
- `import.meta.env.SSR`: {boolean} 应用是否运行在服务端渲染模式

### 环境文件加载优先级

Vite 支持从环境文件中加载额外的环境变量：

1. `.env.[mode].local` (最高优先级)
2. `.env.[mode]`
3. `.env.local`
4. `.env` (最低优先级)

## 优化构建

可以通过多种方式优化构建输出：

### 分块策略

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'axios']
        }
      }
    }
  }
})
```


### 预加载和代码分割

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
```


### Polyfill 配置

```js
// vite.config.js
export default defineConfig({
  build: {
    polyfillModulePreload: true,
    target: ['es2015']
  }
})
```


## 插件系统

Vite 的插件系统基于 Rollup 构建，同时扩展了一些特定于 Vite 的选项。

### 自定义插件示例

```js
// 自定义插件示例
export default function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      // 转换模块代码
      if (id.endsWith('.vue')) {
        // 处理 Vue 文件
        return code.replace(/console\.log/g, '// console.log')
      }
      return code
    },
    config(config) {
      // 修改配置
      config.define = config.define || {}
      config.define.__CUSTOM_FLAG__ = true
    }
  }
}
```


### 常用插件配置

```js
// vite.config.js
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    jsx({
      // JSX 配置选项
      transformOn: true,
      mergeProps: true
    })
  ]
})
```


## 开发服务器配置

### 代理设置

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```


### HTTPS 配置

```js
// vite.config.js
import fs from 'fs'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem')
    }
  }
})
```


## 构建优化技巧

### 预构建依赖优化

```js
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    include: ['lodash', 'axios'],
    exclude: ['some-esm-only-library']
  }
})
```


### CSS 优化

```js
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "src/styles/variables.scss";`
      }
    },
    postcss: {
      plugins: [
        require('autoprefixer')({
          overrideBrowserslist: ['> 1%', 'last 2 versions']
        })
      ]
    }
  }
})
```


### 资源处理

```js
// vite.config.js
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // 小于 4kb 的资源内联为 base64
    assetsDir: 'static',     // 静态资源目录
    outDir: 'dist'           // 输出目录
  }
})
```


## 高级功能配置

### 多页面应用配置

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        nested: path.resolve(__dirname, 'nested/index.html')
      }
    }
  }
})
```


### 库模式构建

```js
// vite.config.js
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      formats: ['es', 'umd'],
      fileName: (format) => `my-lib.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```


通过合理地运用这些配置选项，可以充分发挥 Vite 的性能优势，并根据具体项目需求定制构建流程。