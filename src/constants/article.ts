// 文章详情页交互配置
export const ARTICLE_DETAIL_CONFIG = {
  /** 阅读进度保存节流（毫秒） */
  saveThrottleMs: 3_000,
  /** 左右滑动切换文章的触发距离（px） */
  swipeThreshold: 60,
  /** 显示「回到顶部」的滚动阈值（px） */
  backToTopThreshold: 300,
  /** 停止滚动后进度条隐藏延时（毫秒） */
  progressHideDelay: 1_500,
  /** 生成文章目录的延迟（毫秒） */
  tocGenerateDelay: 200
} as const
