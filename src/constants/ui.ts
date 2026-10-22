// 通用 UI 行为配置
export const UI_CONFIG = {
  /** 自定义对话框层级 */
  dialogZIndex: 10_000,
  /** 对话框关闭动画时长（毫秒） */
  dialogCloseAnimationMs: 200,
  /** 成功/信息提示自动关闭时长（毫秒） */
  toastAutoCloseMs: 3_000,
  /** 错误提示自动关闭时长（毫秒） */
  toastErrorAutoCloseMs: 5_000,
  /** 警告提示自动关闭时长（毫秒） */
  toastWarnAutoCloseMs: 4_000,
  /** 滚动条自动隐藏延时（毫秒） */
  scrollbarHideDelay: 900,
  /** 回到顶部滚动时长（秒） */
  scrollToTopDuration: 1
} as const
