// 开发期内容总线：gen-nav 负责重建导航，studio 负责触发重建并静默自动刷新
// 两个插件通过同一模块单例通信，避免保存文章时整页刷新打断写作

type Regenerator = () => Promise<void>

let regenerator: Regenerator | null = null
let mutedUntil = 0

export const contentBus = {
  setRegenerator(fn: Regenerator | null) {
    regenerator = fn
  },

  async regenerate(): Promise<void> {
    if (regenerator) await regenerator()
  },

  /** 在指定时长内不再触发整页刷新（Studio 保存文章的窗口期） */
  muteReload(ms: number) {
    mutedUntil = Math.max(mutedUntil, Date.now() + ms)
  },

  isReloadMuted(): boolean {
    return Date.now() < mutedUntil
  }
}
