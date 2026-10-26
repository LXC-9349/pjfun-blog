// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { isAcceptableContentName, scanContent, type NavTreeNode } from './content-core'

const roots: string[] = []

async function createRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'pjfun-content-'))
  roots.push(root)
  await mkdir(join(root, 'public', 'content', '2026'), { recursive: true })
  return root
}

async function createBareRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'pjfun-content-'))
  roots.push(root)
  await mkdir(join(root, 'public', 'content'), { recursive: true })
  return root
}

async function writePost(root: string, relFile: string, title: string, date: string) {
  const abs = join(root, 'public', 'content', ...relFile.split('/'))
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, `---\ntitle: ${title}\ndate: ${date}\n---\n正文\n`, 'utf-8')
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

  it('目录树：文件夹优先，双方按最新文章日期倒序', async () => {
    const root = await createBareRoot()
    await writePost(root, 'older/a.md', 'A', '2026-01-01')
    await writePost(root, 'newer/nested/b.md', 'B', '2026-03-01')
    await writePost(root, 'root-post.md', 'C', '2026-02-01')

    const { tree } = await scanContent(root)
    const children = (tree as Extract<NavTreeNode, { type: 'folder' }>).children
    expect(children.map(node => `${node.type}:${node.title}`)).toEqual([
      'folder:newer',
      'folder:older',
      'post:C'
    ])

    // 子目录的最新日期向上聚合：newer 自身没有文章，靠 nested 里的 B
    const newer = children[0] as Extract<NavTreeNode, { type: 'folder' }>
    expect(newer.children.map(node => `${node.type}:${node.title}`)).toEqual(['folder:nested'])
  })

  it('nav 按发布日期倒序，同日期按标题稳定排序', async () => {
    const root = await createBareRoot()
    await writePost(root, '2026/beta.md', 'Beta', '2026-02-01')
    await writePost(root, '2026/alpha.md', 'Alpha', '2026-02-01')
    await writePost(root, '2026/gamma.md', 'Gamma', '2026-03-01')

    const { nav } = await scanContent(root)
    expect(nav.map(post => post.title)).toEqual(['Gamma', 'Alpha', 'Beta'])
  })
})

describe('isAcceptableContentName', () => {
  it('放行中文文件名与拼音 slug，拦截空格与特殊字符', () => {
    expect(isAcceptableContentName('2026-10-26-新闻轴')).toBe(true)
    expect(isAcceptableContentName('瀑布流相册')).toBe(true)
    expect(isAcceptableContentName('数据压缩Web性能')).toBe(true)
    expect(isAcceptableContentName('hello-world-2')).toBe(true)
    expect(isAcceptableContentName('has space')).toBe(false)
    expect(isAcceptableContentName('bad!name')).toBe(false)
  })
})
