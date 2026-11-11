import fs from 'node:fs'
import path from 'node:path'
import type {Plugin} from 'vite'

/**
 * 为短链生成静态兜底页 `dist/s/<code>/index.html`。
 *
 * 为什么需要：
 *   本站线上（GitHub Pages / nginx）对未知路径都会回落到 index.html，
 *   前端路由能直接接管 `/s/<code>`，这一步本来就是可用的。
 *   但换到不支持 SPA 回退的托管（例如某些对象存储、Netlify 未配置 rewrite），
 *   `/s/xxx` 会直接 404。预先落下真实文件后，任何静态托管都能命中。
 *
 * 页面内容极简：优先跳到真实文章路径，同时把短码写进 location.hash，
 * 由前端 `matchShortLink` 兼容处理，避免短链功能依赖某一种托管行为。
 */
export function shortLinkPagesPlugin(): Plugin {
  let outDir = 'dist'
  let base = '/'

  return {
    name: 'pjfun:shortlink-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir || 'dist')
      base = config.base || '/'
    },
    async closeBundle() {
      const mapFile = path.resolve(outDir, 'generated', 'shortlinks.json')
      if (!fs.existsSync(mapFile)) {
        console.warn('[shortlink] 未找到 shortlinks.json，跳过静态兜底页生成')
        return
      }

      let map: Record<string, string>
      try {
        map = JSON.parse(fs.readFileSync(mapFile, 'utf-8'))
      } catch (error) {
        console.warn('[shortlink] shortlinks.json 解析失败：', error)
        return
      }

      const entries = Object.entries(map)
      if (!entries.length) {
        console.warn('[shortlink] 码表为空，跳过')
        return
      }

      const normalizedBase = base.endsWith('/') ? base : `${base}/`
      let written = 0

      for (const [code, target] of entries) {
        const dir = path.resolve(outDir, 's', code)
        // 防路径穿越：短码只允许字母数字
        if (!/^[0-9a-z]{4,16}$/i.test(code)) continue
        fs.mkdirSync(dir, {recursive: true})

        // 目标路径里可能有中文，写进 JS 字符串前做 JSON 转义
        const jsTarget = JSON.stringify(target)
        const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>跳转中…</title>
<script>
// 短链中转：优先用前端路由跳转（保留 SPA 体验），失败再整页 replace
(function () {
  var target = ${jsTarget};
  var base = ${JSON.stringify(normalizedBase)};
  try {
    var url = base.replace(/\\/+$/, '') + target;
    location.replace(url);
    return;
  } catch (e) {}
  location.replace(base);
})();
</script>
<style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;font:14px/1.6 system-ui,sans-serif;color:#666;background:#fff}</style>
</head>
<body>正在跳转到文章…</body>
</html>
`
        fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8')
        written++
      }

      // 构建日志用 warn（项目 ESLint 只放行 warn/error），语义仍是普通提示
      console.warn(`[shortlink] 生成 ${written} 个静态短链兜底页`)
    }
  }
}
