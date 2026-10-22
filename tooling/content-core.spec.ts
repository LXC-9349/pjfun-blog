// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scanContent } from './content-core'

const roots: string[] = []

async function createRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'pjfun-content-'))
  roots.push(root)
  await mkdir(join(root, 'public', 'content', '2026'), { recursive: true })
  return root
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('scanContent', () => {
  it('把数字标签/标题归一化为字符串', async () => {
    const root = await createRoot()
    await writeFile(
      join(root, 'public', 'content', '2026', 'hello.md'),
      '---\ntitle: 2026\ndate: 2026-01-02\ntags: [2026, 技术趋势]\n---\n正文\n',
      'utf-8'
    )

    const { nav } = await scanContent(root)
    expect(nav).toHaveLength(1)
    expect(nav[0]?.title).toBe('2026')
    expect(nav[0]?.tags).toEqual(['2026', '技术趋势'])
    expect(nav[0]?.path).toBe('/2026/hello')
  })

  it('忽略下划线开头的草稿与资源', async () => {
    const root = await createRoot()
    await writeFile(
      join(root, 'public', 'content', '2026', '_draft.md'),
      '---\ntitle: 草稿\n---\n正文\n',
      'utf-8'
    )

    const { nav } = await scanContent(root)
    expect(nav).toHaveLength(0)
  })
})
