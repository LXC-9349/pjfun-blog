/**
 * 卡片滚动条自动隐藏：
 * 滚动时给 .card-scroll 元素加上 is-scrolling 类，停止滚动后延迟移除，
 * 配合 global.css 中的透明滑块规则实现"滚动时出现、静止后消失"。
 */
import { UI_CONFIG } from '@/constants'

const HIDE_DELAY = UI_CONFIG.scrollbarHideDelay

const timers = new WeakMap<HTMLElement, number>()

export function initAutoHideScrollbar(): void {
  if (typeof document === 'undefined') return

  // scroll 事件不冒泡，使用捕获阶段覆盖所有滚动容器
  document.addEventListener('scroll', (event) => {
    const target = event.target
    if (!(target instanceof HTMLElement) || !target.classList.contains('card-scroll')) return

    target.classList.add('is-scrolling')

    const existing = timers.get(target)
    if (existing) window.clearTimeout(existing)

    timers.set(target, window.setTimeout(() => {
      target.classList.remove('is-scrolling')
      timers.delete(target)
    }, HIDE_DELAY))
  }, true)
}
