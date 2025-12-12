// 类型声明文件，用于声明通过 CDN 引入的模块

declare global {
  interface Window {
    marked: typeof import('marked').marked;
    markedGfmHeadingId: typeof import('marked-gfm-heading-id');
    DOMPurify: typeof import('dompurify');
    hljs: typeof import('highlight.js');
  }
}

export {};