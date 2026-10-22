// 类型声明文件，用于声明通过 CDN 引入的模块

declare global {
  interface Window {
    marked: typeof import('marked').marked;
    markedGfmHeadingId: typeof import('marked-gfm-heading-id');
    DOMPurify: typeof import('dompurify');
    hljs: typeof import('highlight.js');
    pdfjsLib: typeof import('pdfjs-dist');
    // 不蒜子统计数据（由 src/utils/site-stats.ts 写入）
    site_pv?: number;
    page_pv?: number;
    site_uv?: number;
  }
}

export {};