import {defineConfig, type Plugin} from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import createExternal from 'vite-plugin-external'
import {genNavPlugin} from './vite-plugin-gen-nav'
import path, {resolve} from "path";
import IconsResolver from 'unplugin-icons/resolver'
import {ViteImageOptimizer} from 'vite-plugin-image-optimizer'
import {getCDN} from './package/build_cdn'
import vitePluginCdn from './package/vite-plugin-cdn'
import {createHtmlPlugin} from 'vite-plugin-html'
// import { rssPlugin } from './package/vite-plugin-rss'
import {VitePWA} from 'vite-plugin-pwa'
import {SITE_CONFIG} from "./src/constants";
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";

export default defineConfig((config) => {

    // 加载环境变量
    const isProduction = config.mode === 'production';
    // 获取 VITE_BASE 环境变量，如果未设置则根据是否为生产环境决定默认值
    const base = process.env.VITE_BASE || '/';
    // const base = '/pjfun-blog/';
    console.log('base:', base)
    //开启cdn打包
    const openCdn = isProduction;
    const cdnConfig = getCDN(!isProduction)
    let externalsKey = [
        'vue-router',
        'highlight.js',
    ]

    const PJ_BLOG_NAV_NAME='nav'+generateRandomString()+'.json'
    const PJ_BLOG_TREE_NAME='tree'+generateRandomString()+'.json'
    return {
        base, // 设置 base 路径
        plugins: [
            vue(),
            Pages({dirs: 'src/pages'}),
            createSvgIconsPlugin({
                iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
                symbolId: 'icon-[name]'
            }),
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
            VitePWA({
                registerType: 'autoUpdate',
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                    maximumFileSizeToCacheInBytes: 5000000, // 5MB
                },
                manifest: {
                    name: SITE_CONFIG.title,
                    short_name: SITE_CONFIG.title,
                    description: SITE_CONFIG.description,
                    theme_color: '#ffffff',
                    icons: [
                        {
                            src: '/img/192x192.png',
                            sizes: '192x192',
                            type: 'image/png',
                        },
                        {
                            src: '/img/512x512.png',
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
            openCdn && vitePluginCdn(base),
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
                        PJ_BLOG_NAV_NAME,
                        PJ_BLOG_TREE_NAME
                    }
                }
            }),
            isProduction&&versionPlugin (),
            // rssPlugin(),
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
                    comments: true, // 移除注释
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
                                } else {
                                    return 'vendor.more'
                                }
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

function generateRandomString(haveMin:boolean= false): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    if(haveMin){
        return `_${year}${month}${day}${hours}${minutes}`;
    }else{
        return `_${year}${month}${day}${hours}`;
    }
}

function versionPlugin (): Plugin  {
    return {
        name: 'generate-version',
        apply: 'build',
        async generateBundle (_, bundle) {
            const version = {
                v: Date.now()
            }
            bundle['version.json'] = {
                fileName: 'version.json',
                source: JSON.stringify(version, null, 2),
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