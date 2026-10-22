import { describe, expect, it } from 'vitest'
import { matchesPostQuery } from './post-search'

describe('matchesPostQuery', () => {
  it('匹配标题、摘要和标签（大小写不敏感）', () => {
    const post = { title: 'Vue 3 Tips', excerpt: 'Composition API', tags: ['Frontend'] }
    expect(matchesPostQuery(post, 'vue')).toBe(true)
    expect(matchesPostQuery(post, 'composition')).toBe(true)
    expect(matchesPostQuery(post, 'frontend')).toBe(true)
    expect(matchesPostQuery(post, 'backend')).toBe(false)
  })

  it('兼容 YAML 解析出的数字标签', () => {
    const post = { title: '年度回顾', tags: ['技术趋势', 2026] }
    expect(matchesPostQuery(post, '2026')).toBe(true)
  })

  it('兼容非字符串标题/摘要，空查询返回 true', () => {
    const post = { title: 2026, excerpt: null, tags: undefined }
    expect(matchesPostQuery(post, '2026')).toBe(true)
    expect(matchesPostQuery(post, '')).toBe(true)
    expect(matchesPostQuery(null, 'x')).toBe(false)
  })
})
