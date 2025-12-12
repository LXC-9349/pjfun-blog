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

        // 提取 JS 文件路径
        const jsFiles = html.match(/<script[^>]+src="([^"]+)"/g)?.map(match => {
          return match.match(/src="([^"]+)"/)![1];
        }) || [];

        // 合并注入的文件路径
        injectedFiles.push(...jsFiles);

        // 过滤 bundle，只保留注入到 index.html 的文件
        const injectedBundleFiles = Object.values(bundle).filter((file: any) => {
          return injectedFiles.some(injected =>
              file.fileName === injected.replace(/^\/+/g, '') // 移除路径前缀
          );
        });

        if (config.command === 'build') {
          console.log('Files injected into index.html:', injectedBundleFiles.map((file: any) => file.fileName));
        }

        // ========== STEP 1: 移除所有 injectedBundleFiles 对应的标签 ==========
        injectedBundleFiles.forEach((file: any) => {
          const fileName = file.fileName;
          const scriptRegex = new RegExp(`<script[^>]+src=["']\\/?${fileName}["'][^>]*>`, 'g');
          html = html.replace(scriptRegex, ''); // 移除 script 标签
        });

        // ========== STEP 2: 注入自定义加载逻辑 ==========
        const pjJsResources = injectedBundleFiles.map((file: any) => `'/${file.fileName}'`).join(',');
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