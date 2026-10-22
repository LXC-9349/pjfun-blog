// 搜索相关配置
export const SEARCH_CONFIG = {
  /** 搜索/导航数据缓存有效期（毫秒） */
  cacheTtl: 5 * 60 * 1000,
  /** 搜索结果最大条数 */
  maxResults: 10,
  /** 输入防抖时间（ms），避免每个字符都全量过滤并写缓存 */
  debounceMs: 180,
  /** 搜索词缓存条数上限 */
  cacheEntries: 30
} as const
