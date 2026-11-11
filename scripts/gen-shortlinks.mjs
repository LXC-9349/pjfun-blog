#!/usr/bin/env node
/**
 * 生成短链清单：dist/generated/shortlinks.json -> 可读的 markdown / txt
 *
 * 用法：
 *   node scripts/gen-shortlinks.mjs            # 输出 public/shortlinks.md
 *   node scripts/gen-shortlinks.mjs --json     # 输出 JSON（含短链全文）
 *
 * 为什么单独出清单：
 *   短码是构建期从文章路径派生的一次性结果，平时不需要关心；
 *   但分享时需要「短链 + 标题」对照，翻 JSON 不方便，这里生成一份可读索引。
 */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const site = process.env.VITE_SITE_URL || 'https://blog.pjfun.top'

const candidates = [
  path.join(root, 'public', 'generated', 'shortlinks.json'),
  path.join(root, 'dist', 'generated', 'shortlinks.json')
]
const mapFile = candidates.find(f => fs.existsSync(f))
if (!mapFile) {
  console.error('未找到 shortlinks.json，请先执行 pnpm build 或启动 dev server 生成导航')
  process.exit(1)
}

const map = JSON.parse(fs.readFileSync(mapFile, 'utf-8'))
const navFile = path.join(path.dirname(mapFile), 'nav.json')
const nav = fs.existsSync(navFile) ? JSON.parse(fs.readFileSync(navFile, 'utf-8')) : []
const titleOf = new Map(nav.map(item => [item.path, item.title || item.path]))
const dateOf = new Map(nav.map(item => [item.path, item.date || '']))

const rows = Object.entries(map)
  .map(([code, target]) => ({
    code,
    target,
    url: `${site.replace(/\/+$/, '')}/s/${code}`,
    title: titleOf.get(target) || target,
    date: String(dateOf.get(target) || '').slice(0, 10)
  }))
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

if (process.argv.includes('--json')) {
  const out = path.join(root, 'public', 'shortlinks.json')
  fs.writeFileSync(out, JSON.stringify(rows, null, 2), 'utf-8')
  console.log(`[shortlinks] ${rows.length} 条 -> ${out}`)
} else {
  const lines = [
    '# 短链清单',
    '',
    `> 共 ${rows.length} 条。短码由文章路径派生，重新构建不会改变。`,
    '',
    '| 日期 | 标题 | 短链 |',
    '| --- | --- | --- |'
  ]
  for (const r of rows) {
    const title = r.title.replace(/\|/g, '\\|')
    lines.push(`| ${r.date || '-'} | ${title} | ${r.url} |`)
  }
  const out = path.join(root, 'public', 'shortlinks.md')
  fs.writeFileSync(out, lines.join('\n') + '\n', 'utf-8')
  console.log(`[shortlinks] ${rows.length} 条 -> ${out}`)
}
