import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PackageManifest {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

// 依赖版本统一来源于 package.json，避免 CDN 地址与本地依赖版本脱节
const packageManifest: PackageManifest = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
);

/**
 * 读取依赖在 package.json 中声明的版本
 * @param name - 依赖名
 * @returns 去掉 ^ ~ >= 等范围前缀后的具体版本号
 */
function getPackageVersion(name: string): string {
    const declared = packageManifest.dependencies?.[name] ?? packageManifest.devDependencies?.[name];
    if (!declared) {
        throw new Error(`[build_cdn] package.json 中未声明依赖 ${name}，无法生成 CDN 地址`);
    }
    const version = declared.replace(/^[^\d]+/, '');
    if (!/^\d/.test(version)) {
        throw new Error(`[build_cdn] 依赖 ${name} 的版本 "${declared}" 无法解析为具体版本号`);
    }
    return version;
}

interface CdnSources {
    jsdelivr: string;
    noisework: string;
    jsdmirrorcn: string;
    topthink: string;
    mengze: string;
    liumingye: string;
    unpkg: string;
    pj_unpkg: string;
    esm: string;
}

interface LibraryConfig {
    isMain?: boolean;
    externals?: string;
    /** 不进入首屏脚本清单，由业务代码按需加载（见 src/utils/cdn.ts） */
    lazy?: boolean;
    js: string[];
    css?: string[];
}

interface Libraries {
    [key: string]: LibraryConfig;
}

interface BackupCdnKeys {
    [key: string]: string;
}

interface ProcessCdnResourcesParams {
    resources: string[];
    cdnSources: CdnSources;
}

interface CdnResult {
    js: string[];
    css: string[];
    external: string[];
    modules: string[];
    global: { [key: string]: string };
    global_cdn: string[];
    mainJs: string[];
    /** 按需库：库名 -> 逗号分隔的候选 URL（写入 window.PJ_LAZY_LIBS） */
    lazy: { [key: string]: string };
}

export function getCDN(LOCAL_DEBUG: boolean): CdnResult {
    // CDN 源模板 https://github.com/jsdmirror/JSDMirror
    //https://scdn.xn--kiv.fun/npm/
    const cdnSources: CdnSources = {
        jsdelivr: 'https://gcore.jsdelivr.net/npm',
        noisework: 'https://jsd.cdn.noisework.cn/npm',//jsdelivr
        jsdmirrorcn: 'https://cdn.jsdmirror.cn/npm',//jsdelivr
        topthink: 'https://jsdelivr.topthink.com/npm',//jsdelivr
        mengze: 'https://cdn.mengze.vip/npm',//jsdelivr
        liumingye: 'https://cdn.liumingye.cn/npm',//jsdelivr
        //https://jsd.nmmsl.top/
        //https://cdn.jsdmirror.com/npm
        unpkg: 'https://unpkg.com',
        pj_unpkg: 'https://unpkg.pjfun.top',
        esm: 'https://esm.sh',
    };

    // 依赖版本（从 package.json 动态读取，不再写死）
    // 注意：highlight.js / pdfjs-dist / mammoth 体积大且仅文章页、文档页使用，
    // 不走 CDN 全局脚本（external 会生成顶层全局访问代码，必然进入首屏 chunk），
    // 改为本地打包 + 动态导入，由路由/异步组件触发加载。
    const versions = {
        vue: getPackageVersion('vue'),
        vueRouter: getPackageVersion('vue-router'),
    };

    // 核心库配置
    const libraries: Libraries = {
        vue: {
            isMain: true,
            externals: 'Vue',
            js: [
                `${cdnSources.jsdelivr}/vue@${versions.vue}/dist/vue.global.prod.min.js`,
                `${cdnSources.unpkg}/vue@${versions.vue}/dist/vue.global.prod.js`,
                `${cdnSources.esm}/vue@${versions.vue}/dist/vue.global.prod.js`
            ]
        },
        'vue-router': {
            externals: 'VueRouter',
            js: [
                `${cdnSources.jsdelivr}/vue-router@${versions.vueRouter}/dist/vue-router.global.prod.min.js`,
                `${cdnSources.unpkg}/vue-router@${versions.vueRouter}/dist/vue-router.global.prod.js`,
                `${cdnSources.esm}/vue-router@${versions.vueRouter}/dist/vue-router.global.prod.js`
            ]
        },
    };

    // 为 vite-plugin-externals 生成配置
    let external: string[] = [];
    let js: string[] = [];
    let css: string[] = [];
    let mainJs: string[] = [];
    const modules: string[] = [];
    const global_cdn: string[] = [];
    let global: { [key: string]: string } = {};
    const lazy: { [key: string]: string } = {};

    // CDN 源（按优先级顺序）
    const backupCdnKeys: BackupCdnKeys = {
        'cdn_pu': cdnSources.pj_unpkg,
        'cdn_nw': cdnSources.noisework,
        'cdn_jsm': cdnSources.jsdmirrorcn,
        'cdn_th': cdnSources.topthink,
        'cdn_mz': cdnSources.mengze,
        'cdn_ly': cdnSources.liumingye,
    };

    Object.entries(backupCdnKeys).forEach(([key, value]) => {
        global_cdn.push('const ' + key + '="' + value + '"');
    });

    /**
     * 处理 CDN 资源 URL
     * @param resources - 资源 URL 数组
     * @param cdnSources - 所有 CDN 源配置
     * @returns 处理后的资源 URL 数组
     */
    function processCdnResources({ resources, cdnSources }: ProcessCdnResourcesParams): string[] {
        // 过滤掉 esm 资源
        const filteredResources = resources.filter(
            url => !url.includes(cdnSources.esm)
        );

        // 查找主 CDN 资源
        const primaryResource = filteredResources.find(
            url => url.includes(cdnSources.jsdelivr)
        );
        const secondResource = filteredResources.find(
            url => url.includes(cdnSources.unpkg)
        );

        if (primaryResource && secondResource) {
            // 提取主资源路径（去除主 CDN 前缀）
            const resourcePath = primaryResource.replace(cdnSources.jsdelivr, '');
            const resourcePathSecond = secondResource.replace(cdnSources.unpkg, '');

            // 在数组开头添加备用 CDN 源
            const backupResources = Object.keys(backupCdnKeys).map(key => {
                if (backupCdnKeys[key].includes('unpkg')) {
                    return '${' + key + '}' + resourcePathSecond;
                }
                return '${' + key + '}' + resourcePath;
            });

            return [...backupResources, ...filteredResources];
        }

        return filteredResources;
    }

    // 重构后的代码
    Object.entries(libraries).forEach(([key, lib]) => {
        if (lib.externals && !LOCAL_DEBUG) {
            external.push(key);
            global[key] = lib.externals;

            const isMain = lib.isMain || false;

            // 处理 JS 资源
            const jsItems = processCdnResources({
                resources: lib.js,
                cdnSources
            });

            if (lib.lazy) {
                // 按需库：只登记 URL，由业务代码触发加载
                lazy[key] = jsItems.join(',');
            } else if (isMain) {
                mainJs.push(jsItems.join(','));
            } else {
                js.push(jsItems.join(','));
            }

            // 处理 CSS 资源
            if (lib.css && lib.css.length > 0) {
                const cssItems = processCdnResources({
                    resources: lib.css,
                    cdnSources
                });
                css.push(cssItems.join(','));
            }
        }
    });

    // 本地调试模式不使用 CDN
    if (LOCAL_DEBUG) {
        external = [];
        js = [];
        css = [];
        global = {};
        mainJs = [];
    }
    console.log('global', global);
    console.log('external', external);

    return {
        js,
        css,
        external,
        modules,
        global,
        global_cdn,
        mainJs,
        lazy
    };
}
