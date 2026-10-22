/**
 * 将 Word 文档转换为 HTML
 *
 * mammoth 在生产构建中被外置为按需库（见 build_cdn.ts），
 * 因此这里不能在模块顶层静态引用，改为运行时从全局取或动态导入。
 */

type MammothModule = {
  convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>
}

let mammothPromise: Promise<MammothModule> | null = null

async function getMammoth(): Promise<MammothModule> {
  const fromGlobal = (window as unknown as { mammoth?: MammothModule }).mammoth
  if (fromGlobal) return fromGlobal

  if (!mammothPromise) {
    // CDN 构建下由调用方先 ensureCdnLib('mammoth')，全局已就绪；
    // 开发模式走本地打包的动态导入
    mammothPromise = import('mammoth').then(mod => {
      const resolved = (mod as unknown as { default?: MammothModule }).default || (mod as unknown as MammothModule)
      return resolved
    })
  }
  return mammothPromise
}

/**
 * 将 Word 文档转换为 HTML
 * @param arrayBuffer Word 文件的 ArrayBuffer
 * @returns Promise<string> 转换后的 HTML 字符串
 */
export async function convertWordToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const mammoth = await getMammoth()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('Word to HTML conversion error:', error)
    const converted = new Error(`Failed to convert Word to HTML: ${(error as Error).message}`)
    ;(converted as Error & { cause?: unknown }).cause = error
    throw converted
  }
}
