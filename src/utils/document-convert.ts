import * as mammoth from 'mammoth'

/**
 * 将 Word 文档转换为 HTML
 * @param arrayBuffer Word 文件的 ArrayBuffer
 * @returns Promise<string> 转换后的 HTML 字符串
 */
export async function convertWordToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer })
    return result.value
  } catch (error) {
    console.error('Word to HTML conversion error:', error)
    //@ts-ignore
    throw new Error(`Failed to convert Word to HTML: ${error.message}`)
  }
}
