import { pinyin } from 'pinyin-pro'

// 标题转 slug：中文转无声调拼音，英文数字保留，其余字符折叠为连字符
const MAX_SLUG_LENGTH = 80
const SEPARATOR_RE = /[^a-z0-9]+/g
const EDGE_DASH_RE = /^-+|-+$/g

export function slugifyTitle(title: string): string {
  const text = title.trim()
  if (!text) return ''
  // nonZh: 'consecutive' 会把连续的非中文字符（英文 / 数字 / 空格）原样保留
  const latin = pinyin(text, { toneType: 'none', type: 'array', nonZh: 'consecutive' }).join(' ')
  return normalizeSlug(latin).slice(0, MAX_SLUG_LENGTH).replace(EDGE_DASH_RE, '')
}

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(SEPARATOR_RE, '-')
    .replace(/-{2,}/g, '-')
    .replace(EDGE_DASH_RE, '')
}

export function isValidSlug(input: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input)
}
