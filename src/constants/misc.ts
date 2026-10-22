// 杂项配置：热门标签与版本检查
import { getEnvVar } from './env'

// 热门标签 - 支持环境变量配置（逗号分隔）；留空时由首页按文章标签频次自动生成
const hotTagsStr = getEnvVar('VITE_HOT_TAGS', '') || ''
export const HOT_TAGS = hotTagsStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

// 自动生成热门标签时的最大数量
const hotTagsLimit = Number(getEnvVar('VITE_HOT_TAGS_LIMIT', '12'))
export const HOT_TAGS_LIMIT = Number.isFinite(hotTagsLimit) && hotTagsLimit > 0 ? Math.floor(hotTagsLimit) : 12

// 版本更新检查配置
export const VERSION_CHECK = {
  // 轮询间隔（毫秒）
  interval: 245_000,
  // “稍后提醒”静默时长（分钟）
  snoozeMinutes: 30
} as const
