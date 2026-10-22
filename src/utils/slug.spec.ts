import { describe, expect, it } from 'vitest'
import { isValidSlug, normalizeSlug, slugifyTitle } from './slug'

describe('slug utils', () => {
  it('中文标题转换为无声调拼音 slug', () => {
    expect(slugifyTitle('你好，Vue 3')).toBe('ni-hao-vue-3')
  })

  it('规范化多余的分隔符和大小写', () => {
    expect(normalizeSlug('  Hello__World!! ')).toBe('hello-world')
  })

  it('只接受小写字母、数字与连字符', () => {
    expect(isValidSlug('hello-world-2026')).toBe(true)
    expect(isValidSlug('Hello World')).toBe(false)
    expect(isValidSlug('-hello')).toBe(false)
    expect(isValidSlug('')).toBe(false)
  })

  it('超长标题会截断到 80 字符以内', () => {
    const slug = slugifyTitle('a'.repeat(200))
    expect(slug.length).toBeLessThanOrEqual(80)
  })
})
