import { Marked, Renderer } from 'marked'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import DOMPurify, { type Config } from 'dompurify'

// 全站唯一的 Markdown 解析管线：文章详情页与 Studio 预览共用
// 使用独立 Marked 实例，避免与其它全局 marked 配置互相污染
const renderer = new Renderer()
renderer.link = function (options: { href?: string | null; title?: string | null; text?: string }) {
  const { href, title, text } = options
  const defaultHtml = `<a href="${href || ''}"${title ? ` title="${title}"` : ''}>${text || ''}</a>`
  return defaultHtml.replace(/^<a /, '<a target="_blank" rel="nofollow noopener noreferrer" ')
}

const markdown = new Marked({
  breaks: false,
  gfm: true,
  pedantic: false,
  silent: false
})

markdown.use({ renderer }, gfmHeadingId({ prefix: 'h-' }))

/** Markdown → 原始 HTML（未净化） */
export function parseMarkdown(raw: string): string {
  return markdown.parse(raw) as string
}

const SANITIZE_OPTIONS: Config = {
  ADD_TAGS: ['span', 'div', 'pre', 'code', 'button'],
  ADD_ATTR: ['class', 'style', 'title', 'aria-label', 'target', 'rel', 'href', 'src', 'alt'],
  FORBID_ATTR: [],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true
}

/** HTML 净化：与文章详情页保持同一套白名单 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS)
}

/** Markdown → 可安全渲染的 HTML */
export function renderMarkdown(raw: string): string {
  return sanitizeHtml(parseMarkdown(raw))
}
