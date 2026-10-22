import {defineConfig, loadEnv, type Plugin} from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import createExternal from 'vite-plugin-external'
import {genNavPlugin} from './tooling/vite-plugin-gen-nav'
import {studioPlugin} from './tooling/vite-plugin-studio'
import {genBackgroundsPlugin} from './tooling/vite-plugin-gen-backgrounds'
import path, {resolve} from "path";
import {readFile, writeFile} from 'node:fs/promises'
import IconsResolver from 'unplugin-icons/resolver'
import {ViteImageOptimizer} from 'vite-plugin-image-optimizer'
import {getCDN} from './tooling/build_cdn'
import vitePluginCdn from './tooling/vite-plugin-cdn'
import {createHtmlPlugin} from 'vite-plugin-html'
import { rssPlugin } from './tooling/vite-plugin-rss'
import { sitemapPlugin } from './tooling/vite-plugin-sitemap'
import {VitePWA} from 'vite-plugin-pwa'
import {createSiteConfig} from "./src/constants/site";
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";
import {autoPasswordHashPlugin} from './tooling/vite-plugin-auto-password-hash';

export default defineConfig((config) => {

    // 加载环境变量（config 钩子早于 Vite 内部的 loadEnv，需在此显式读取）
    const env = loadEnv(config.mode, process.cwd(), '')
    const readEnv = (key: string, fallback: string): string => env[key] || process.env[key] || fallback
    const isProduction = config.mode === 'production';
    // 获取 VITE_BASE 环境变量，统一补齐尾部斜杠
    const rawBase = readEnv('VITE_BASE', '/')
    const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
    // 构建期站点信息同样以 .env 为准（不能使用在 config 阶段被提前求值的 SITE_CONFIG）
    const site = createSiteConfig(readEnv)
    // const base = '/pjfun-blog/';
    console.log('base:', base)
    // 构建版本号：同时注入客户端（__APP_VERSION__）与 version.json，保证版本来源一致
    // 通过进程环境变量缓存：Vite 会多次解析配置，重复取 Date.now() 会让 index.html 与产物文件名错位
    const buildVersion = process.env.PJ_BUILD_VERSION || (process.env.PJ_BUILD_VERSION = String(Date.now()))
    //开启cdn打包
    const openCdn = isProduction;
    const cdnConfig = getCDN(!isProduction)
    const externalsKey = [
        'vue-router',
    ]

    // 文章页专用的解析类依赖：单独成块，首屏不加载
    const MARKDOWN_PKGS = ['marked', 'marked-gfm-heading-id', 'dompurify']
    // 重型懒加载库：只被异步 chunk 引用，独立成块后不会进入首屏
    const HEAVY_PKGS: Record<string, string> = {
        'highlight.js': 'vendor.highlight',
        'pdfjs-dist': 'vendor.pdf',
        'mammoth': 'vendor.mammoth'
    }
    // mammoth 的依赖树（jszip / pako 等）：一并归入 Word 预览 chunk，避免被 vendor.more 拽进首屏
    const MAMMOTH_PKGS = new Set([
        'xmldom-xmldom', 'argparse', 'base64-js', 'dingbat-to-unicode',
        'jszip', 'lop', 'underscore', 'xmlbuilder', 'sprintf-js',
        'lie', 'immediate', 'pako', 'readable-stream', 'setimmediate',
        'inherits', 'string_decoder', 'util-deprecate', 'safe-buffer',
        'core-util-is', 'process-nextick-args', 'isarray'
    ])

    // 导航数据文件名与构建版本绑定：每次发布都是全新 URL，CDN / SW 缓存无法命中旧内容
    const PJ_BLOG_NAV_NAME=`nav-version-${buildVersion}.json`
    const PJ_BLOG_TREE_NAME=`tree-version-${buildVersion}.json`
    return {
        base, // 设置 base 路径
        define: {
            __APP_VERSION__: JSON.stringify(buildVersion)
        },
        plugins: [
            vue(),
            Pages({dirs: 'src/pages'}),
            createSvgIconsPlugin({
                iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
                symbolId: 'icon-[name]'
            }),
            genBackgroundsPlugin(),
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
            Icons({compiler: 'vue3', autoInstall: true}),  // 新增：自动按需加载所有 iconify-icon
            genNavPlugin(PJ_BLOG_NAV_NAME,PJ_BLOG_TREE_NAME,base),
            // 本地创作台：仅 dev server 生效，生产构建自动排除
            studioPlugin(),
            VitePWA({
                registerType: 'autoUpdate',
                // 注册代码内联进 index.html：避免固定 URL 的 registerSW.js 被 CDN 长期缓存
                injectRegister: 'inline',
                workbox: {
                    // 不预缓存 index.html：SPA 入口必须走网络，否则 SW 会一直返回旧页面
                    globPatterns: ['**/*.{js,css,ico,svg}'],
                    // 图片体积大且已有 image-cache 运行时缓存，不进入预缓存清单，避免拖慢 SW 安装
                    globIgnores: [
                        '**/img/**',
                        '**/bg/**',
                        // 重型懒加载库不预缓存，避免安装 SW 时下载数 MB
                        '**/vendor.highlight-*.js',
                        '**/vendor.pdf-*.js',
                        '**/vendor.mammoth-*.js'
                    ],
                    // 关闭离线导航回退，保证每次导航都拿到最新入口 HTML
                    navigateFallback: undefined,
                    cleanupOutdatedCaches: true,
                    skipWaiting: true,
                    clientsClaim: true,
                    maximumFileSizeToCacheInBytes: 5000000, // 5MB
                    // 数据类资源一律 NetworkFirst：先取网络最新数据，失败或超时才回退缓存
                    runtimeCaching: [
                        {
                            // SPA 导航请求：在线拿最新 HTML，离线回退缓存，不走预缓存
                            urlPattern: ({ request }) => request.mode === 'navigate',
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'html-cache',
                                networkTimeoutSeconds: 3,
                                expiration: {
                                    maxEntries: 5,
                                    maxAgeSeconds: 60 * 60 * 24
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: /^.*\/generated\/.*\.json$/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'nav-data-cache',
                                networkTimeoutSeconds: 5,
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 // 24 小时
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: /^.*\/content\/.*$/i,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'article-content-cache',
                                networkTimeoutSeconds: 10,
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 60 * 24 * 7 // 7 天
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: /^.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'image-cache',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 天
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        }
                    ]
                },
                strategies: 'generateSW',
                filename: `sw-${buildVersion}.js`,
                manifest: {
                    name: site.title,
                    short_name: site.title,
                    description: site.description,
                    start_url: base,
                    scope: base,
                    lang: 'zh-CN',
                    theme_color: '#fff7ed',
                    icons: [
                        {
                            src: `${base}img/192x192.png`,
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: `${base}img/512x512.png`,
                            sizes: '512x512',
                            type: 'image/png',
                        },
                    ],
                },
            }),
            ViteImageOptimizer({
                // 配置图像优化选项
                png: {
                    quality: 80 // PNG 压缩质量
                },
                jpeg: {
                    quality: 80 // JPEG 压缩质量
                },
                jpg: {
                    quality: 80
                },
                gif: {
                    effort: 3 // GIF 优化级别
                },
                svg: {
                    plugins: [
                        {name: 'cleanupAttrs'}
                    ]
                },
                webp: {
                    quality: 75 // WebP 格式支持
                },
                include: /\.(png|jpe?g|gif|svg)$/i, // 优化指定格式
                exclude: /node_modules/ // 排除 node_modules 中的图像
            }),
            openCdn && createExternal({
                interop: 'auto',
                externals: cdnConfig.global
            }),
            openCdn && vitePluginCdn(base, buildVersion),
            createHtmlPlugin({
                minify: true,
                // template: './index.html',
                inject: {
                    data: {
                        cdn: isProduction,
                        global_cdn: cdnConfig.global_cdn || [],
                        cssList: cdnConfig.css || [],
                        mainJsList: cdnConfig.mainJs || [],
                        jsList: cdnConfig.js || [],
                        // 按需库（PDF / Word / 代码高亮）：写入 window.PJ_LAZY_LIBS，不参与首屏加载
                        lazyLibs: cdnConfig.lazy || {},
                        PJ_BLOG_NAV_NAME,
                        PJ_BLOG_TREE_NAME,
                        buildVersion,
                        basePath: base,
                        // 站点文案统一来源于 constants
                        siteTitle: site.title,
                        siteIcon: site.icon,
                        siteUrl: site.url,
                        loadingText: site.loadingText,
                        jsDisabledNotice: site.jsDisabledNotice,
                        globalTexts: site.publicTexts
                    }
                }
            }),
            isProduction&&versionPlugin (buildVersion),
            autoPasswordHashPlugin(),
            rssPlugin(site),
            sitemapPlugin(site),
            isProduction && inject404BasePlugin(base),
        ].filter(Boolean),
        assetsInclude: ['**/*.pdf', '**/*.doc', '**/*.docx', '**/*.xls', '**/*.xlsx'],
        server: {
            host: '0.0.0.0',
            port: 1022, // 修改端口为3000
            strictPort: false, // 存在冲突端口，则继续下找可用端口
            open: true,
            cors: true,
            hmr: {
                overlay: true
            },
            fs: {
                allow: ['..']  // 允许访问项目根目录外的文件（包括 content）
            },
            mimeTypes: {
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.xls': 'application/vnd.ms-excel',
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        },
        resolve: {
            alias: {
                '@': path.join(__dirname, './src'),
                '~': path.resolve(__dirname, './'),
            },
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
        },
        build: {
            assetsDir: 'static',
            target: 'esnext',
            modulePreload: {polyfill: false},
            chunkSizeWarningLimit: 3000,
            copyPublicDir: true,
            sourcemap: isProduction ? false : 'inline',
            // 生产环境下移除 console 和 debugger
            minify: isProduction ? 'terser' : false,
            cssCodeSplit: true,
            terserOptions: isProduction ? {
                compress: {
                    drop_console: true,
                    drop_debugger: false,
                    pure_funcs: ['console.log', 'console.info'],
                    pure_getters: true,
                    keep_fargs: false,
                    passes: 3,
                },
                mangle: {
                    toplevel: true, // 混淆顶级作用域的变量名
                    keep_classnames: false, // 不保留类名
                    keep_fnames: false, // 不保留函数名
                },
                format: {
                    comments: false, // 移除注释
                },
            } : {},
            dynamicImportVarsOptions: {
                // 动态导入变量优化
                include: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.vue']
            },
            rollupOptions: {
                external: openCdn ? cdnConfig.external : [],
                maxParallelFileOps: 40,
                output: {
                    globals: openCdn ? cdnConfig.global : {},
                    // 移除打包产物中的注释
                    entryFileNames: isProduction
                        ? 'static/js/[name]-[hash:8].js'
                        : '[name].js',
                    chunkFileNames: isProduction
                        ? 'static/js/[name]-[hash:8].js'
                        : '[name].js',
                    assetFileNames: isProduction
                        ? 'static/[ext]/[name]-[hash:8].[ext]'
                        : '[name].[ext]',

                    manualChunks(id: string) {
                        if (isProduction) {
                            if (id.includes('node_modules')) {
                                const pkgName = getPkg(id, 'node_modules', 'vendor.others')
                                if (externalsKey.includes(pkgName)) {
                                    return `vendor.${pkgName}`
                                }
                                // Markdown 解析 / 净化只在文章详情页使用，单独拆出避免进入首屏共享 chunk
                                if (MARKDOWN_PKGS.includes(pkgName)) {
                                    return 'vendor.markdown'
                                }
                                // 代码高亮 / PDF / Word 解析器：仅异步 chunk 引用
                                const heavyChunk = HEAVY_PKGS[pkgName]
                                if (heavyChunk) {
                                    return heavyChunk
                                }
                                if (MAMMOTH_PKGS.has(pkgName)) {
                                    return 'vendor.mammoth'
                                }
                                return 'vendor.more'
                            }
                            if (id.includes('src/utils')) {
                                return `pjt.tool`
                            }
                        }
                    },
                }
            }
        },
        optimizeDeps: {
            include: ['@babel/runtime/helpers/extends']
        }
    }
})

function getPkg(id: string, path: string, def: string) {
    const segments = id.toString().split(path + '/')
    const pkgPath = segments[segments.length - 1]
    if (!pkgPath) {
        console.log('No package path found, using ', def)
        return def
    }
    const match = pkgPath.match(/^(@[^/]+\/[^/]+|[^/]+)/)
    if (!match) {
        console.log('Invalid package name, using ', def)
        return def
    }
    return match[0].replace(/^@/, '').replace(/\//, '-')
}

/** 把 404.html 中的 __BASE_PATH__ 替换为构建时的部署基础路径 */
function inject404BasePlugin (base: string): Plugin {
  let outDir = 'dist'
  return {
    name: 'pjfun:inject-404-base',
    apply: 'build',
    configResolved (config) {
      outDir = path.resolve(config.root, config.build.outDir || 'dist')
    },
    async closeBundle () {
      const file = path.resolve(outDir, '404.html')
      try {
        const html = await readFile(file, 'utf-8')
        await writeFile(file, html.split('__BASE_PATH__').join(base), 'utf-8')
      } catch (error) {
        console.warn('[404-base] 404.html 处理失败：', error)
      }
    }
  }
}

function versionPlugin (version: string): Plugin  {    return {
        name: 'generate-version',
        apply: 'build',
        async generateBundle (_, bundle) {
            const payload = {
                v: version
            }
            bundle['version.json'] = {
                fileName: 'version.json',
                source: JSON.stringify(payload, null, 2),
                type: 'asset' as const,
                name: undefined,
                names: [],
                needsCodeReference: false,
                originalFileName: null,
                originalFileNames: []
            }
        }
    }
}