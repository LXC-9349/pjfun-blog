// 首页行为配置
export const HOME_CONFIG = {
  /** 每次加载的文章数量 */
  pageSize: 12,
  /** 显示「回到顶部」的滚动阈值（px） */
  scrollTopThreshold: 300,
  /** Header 进入紧凑模式的滚动阈值（px） */
  headerScrollThreshold: 20,
  /** 背景自动轮播的最小间隔（秒） */
  backgroundRotateMinInterval: 5,
  /** 无限滚动追加下一页后的冷却时间（ms），避免一次滚动连续追加多页 */
  loadMoreCooldown: 240
} as const
