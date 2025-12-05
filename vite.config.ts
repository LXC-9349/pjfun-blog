import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite'
import { genNavPlugin } from './vite-plugin-gen-nav'
import path from "path";
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000, // 修改端口为3000
    strictPort: false, // 存在冲突端口，则继续下找可用端口
    open: true,
    cors: true,
    hmr: {
      overlay: true
    },
    fs: {
      allow: ['..']  // 允许访问项目根目录外的文件（包括 content）
    }
  },
  plugins: [
    vue(),
    Pages({ dirs: 'src/pages' }),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
      resolvers: [
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    UnoCSS(),
    Icons({ compiler: 'vue3', autoInstall: true }),  // 新增：自动按需加载所有 iconify-icon
    genNavPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, './src'),
      '~': path.resolve(__dirname, './'),
      // vue: 'vue/dist/vue.esm-browser.prod.js',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  build: {
    copyPublicDir: true
  }
})