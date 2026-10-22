import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import sharp from 'sharp'

export interface BackgroundItem {
  id: string
  label: string
  labelEn: string
  url: string
}

const IMAGE_RE = /\.(webp|jpe?g|png|avif)$/i
// 需要在构建期转 WebP 的格式
const COMPRESSIBLE_RE = /\.(jpe?g|png)$/i
/** 背景图最大宽度：覆盖 2K 屏，避免 4K 原图直接下发 */
const MAX_WIDTH = 1920
const WEBP_QUALITY = 82

const toWebpName = (name: string) => name.replace(COMPRESSIBLE_RE, '.webp')

/**
 * 自动扫描 public/bg 下的图片，生成背景清单：
 * - dev：以中间件实时返回 bg/backgrounds.json，增删图片无需重启
 * - build：随产物生成 dist/bg/backgrounds.json，并把 jpg/png 转成 WebP 后再引用
 * 不再需要手动维护 backgrounds.json
 */
export function genBackgroundsPlugin(options: { dir?: string; output?: string } = {}): Plugin {
  const dir = options.dir ?? 'bg'
  const output = options.output ?? 'bg/backgrounds.json'
  let root = process.cwd()
  let isBuild = false
  let outDir = 'dist'

  const scan = (): BackgroundItem[] => {
    const absDir = path.join(root, 'public', dir)
    if (!fs.existsSync(absDir)) return []

    const files: string[] = []
    const walk = (folder: string) => {
      const entries = fs.readdirSync(folder, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      for (const entry of entries) {
        const full = path.join(folder, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (IMAGE_RE.test(entry.name)) files.push(full)
      }
    }
    walk(absDir)

    return files
      .map(file => {
        const relFromPublic = path.relative(path.join(root, 'public'), file).split(path.sep).join('/')
        const relFromBg = path.relative(absDir, file).split(path.sep).join('-')
        const name = path.basename(file, path.extname(file))
        return {
          // 去掉扩展名：根目录图片 id 即文件名（兼容旧配置），子目录带目录前缀
          id: relFromBg.replace(/\.[^.]+$/, ''),
          label: name,
          labelEn: name,
          url: relFromPublic
        }
      })
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  }

  return {
    name: 'pjfun:gen-backgrounds',
    configResolved(config) {
      root = config.root
      isBuild = config.command === 'build'
      outDir = path.resolve(root, config.build.outDir || 'dist')
    },
    configureServer(server) {
      const base = server.config.base || '/'
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url || '').split('?')[0]
        if (pathname !== `${base}${output}`) return next()
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(JSON.stringify(scan(), null, 2))
      })
    },
    async generateBundle() {
      const items = scan()

      if (!isBuild) {
        this.emitFile({
          type: 'asset',
          fileName: output,
          source: JSON.stringify(items, null, 2)
        })
        return
      }

      // 构建期把背景原图转成 WebP：单张背景图动辄 1-3MB，转换后通常降到 200-500KB
      const optimized: BackgroundItem[] = []
      for (const item of items) {
        if (!COMPRESSIBLE_RE.test(item.url)) {
          optimized.push(item)
          continue
        }

        const absolute = path.join(root, 'public', item.url)
        try {
          const buffer = await sharp(absolute)
            .rotate()
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer()

          const webpUrl = toWebpName(item.url)
          this.emitFile({ type: 'asset', fileName: webpUrl, source: buffer })
          optimized.push({ ...item, url: webpUrl })
        } catch (error) {
          // 转换失败时保留原图，不影响构建
          this.warn(`背景图转换失败，保留原图：${item.url} (${(error as Error).message})`)
          optimized.push(item)
        }
      }

      this.emitFile({
        type: 'asset',
        fileName: output,
        source: JSON.stringify(optimized, null, 2)
      })
    },
    closeBundle() {
      if (!isBuild) return
      // 清理已被 WebP 替代的原图，避免产物里同时存在两份
      const bgOut = path.join(outDir, dir)
      if (!fs.existsSync(bgOut)) return

      for (const name of fs.readdirSync(bgOut)) {
        if (!COMPRESSIBLE_RE.test(name)) continue
        if (fs.existsSync(path.join(bgOut, toWebpName(name)))) {
          fs.unlinkSync(path.join(bgOut, name))
        }
      }
    }
  }
}
