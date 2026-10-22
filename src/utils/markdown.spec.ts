// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { parseMarkdown, renderMarkdown } from './markdown'

describe('markdown rendering', () => {
  it('移除脚本与事件处理器', () => {
    const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">')
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
  })

  it('阻止 javascript: 链接', () => {
    const html = renderMarkdown('[click](javascript:alert(1))')
    expect(html.toLowerCase()).not.toContain('javascript:')
  })

  it('外链自动加 target/rel', () => {
    const html = parseMarkdown('[example](https://example.com)')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="nofollow noopener noreferrer"')
  })
})
