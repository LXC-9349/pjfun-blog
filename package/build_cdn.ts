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

    // 核心库配置
    const libraries: Libraries = {
        vue: {
            isMain: true,
            externals: 'Vue',
            js: [
                `${cdnSources.jsdelivr}/vue@3.5.25/dist/vue.global.prod.min.js`,
                `${cdnSources.unpkg}/vue@3.5.25/dist/vue.global.prod.js`,
                `${cdnSources.esm}/vue@3.5.25/dist/vue.global.prod.js`
            ]
        },
        'vue-router': {
            externals: 'VueRouter',
            js: [
                `${cdnSources.jsdelivr}/vue-router@4.6.3/dist/vue-router.global.prod.min.js`,
                `${cdnSources.unpkg}/vue-router@4.6.3/dist/vue-router.global.prod.js`,
                `${cdnSources.esm}/vue-router@4.6.3/dist/vue-router.global.prod.js`
            ]
        },
        'highlight.js': {
            externals: 'hljs',
            js: [
                `${cdnSources.jsdelivr}/@highlightjs/cdn-assets@11.11.1/highlight.min.js`,
                `${cdnSources.unpkg}/@highlightjs/cdn-assets@11.11.1/highlight.min.js`,
                `${cdnSources.esm}/@highlightjs/cdn-assets@11.11.1/highlight.min.js`
            ]
        },
    };

    // 为 vite-plugin-externals 生成配置
    let external: string[] = [];
    let modules: string[] = [];
    let js: string[] = [];
    let css: string[] = [];
    let mainJs: string[] = [];
    let global_cdn: string[] = [];
    let global: { [key: string]: string } = {};

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

            if (isMain) {
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
        mainJs
    };
}
