import type { Plugin, ResolvedConfig } from 'vite';

export default function vitePluginCdn(base:string): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'vite-plugin-cdn',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx: { path: string; filename: string; bundle?: any }): string {
        const bundle = ctx.bundle || {};
        const injectedFiles: string[] = [];

        // 提取 JS 文件路径，改进正则表达式以匹配带有各种属性的script标签
        const scriptTags = html.match(/<script\b[^>]*src\s*=\s*["']([^"']*)["'][^>]*>/gi) || [];
        const jsFiles = scriptTags.map(tag => {
          const srcMatch = tag.match(/src\s*=\s*["']([^"']*)["']/i);
          return srcMatch ? srcMatch[1] : '';
        }).filter(src => src.length > 0);

        // 合并注入的文件路径
        injectedFiles.push(...jsFiles);
        // 过滤 bundle，只保留注入到 index.html 的文件
        const injectedBundleFiles = Object.values(bundle).filter((file: any) => {
          return injectedFiles.some(injected =>{
            return injected.includes(file.name)&&file.fileName.endsWith('.js')
        });
        });

        if (config.command === 'build') {
          // console.log('======= DEBUG INFO =======');
          // console.log('Base path:', base);
          // console.log('All bundle files:', Object.values(bundle).map((file: any) => file.fileName));
          // console.log('JS files found in HTML:', jsFiles);
          // console.log('Injected files:', injectedFiles);
          console.log('Injected bundle files:', injectedBundleFiles.map((file: any) => file.fileName));
          // console.log('=========================');
        }

        // ========== STEP 1: 移除所有 injectedBundleFiles 对应的标签 ==========
        injectedBundleFiles.forEach((file: any) => {
          const fileName = file.fileName;
          console.log(fileName)
          // 更新正则表达式以匹配带有各种属性的script标签
          const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义特殊字符
          const scriptRegex = new RegExp(`<script[^>]*src=["'][^"']*${escapedFileName}["'][^>]*></script>`, 'g');
          html = html.replace(scriptRegex, ''); // 移除 script 标签
        });

        // ========== STEP 2: 注入自定义加载逻辑 ==========
        const pjJsResources = injectedBundleFiles.map((file: any) => `'${base}${file.fileName}'`).join(',');
        const originalScriptTag = `
        <script>
            const pjJsResources=[${pjJsResources}]
        </script>
        <script src="${base}pj_public.js"></script>
        `;

        const scriptReplace = '<script replace />';
        html = html.replace(scriptReplace, originalScriptTag);

        return html;
      }
    }
  };
}