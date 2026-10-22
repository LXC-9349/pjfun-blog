// 文档预览（Excel / PDF）相关的第三方资源与 CDN 配置
const PRIMARY_CDN = 'https://unpkg.pjfun.top'

export const PREVIEW_CONFIG = {
  /** luckysheet 版本 */
  luckysheetVersion: '2.1.13',
  /** luckyexcel 版本 */
  luckyexcelVersion: '1.0.1',
  /** jQuery 版本 */
  jqueryVersion: '3.7.1',
  /** PDF worker 多源列表（按优先级） */
  pdfWorkerMirrors: [
    PRIMARY_CDN,
    'https://unpkg.com',
    'https://cdn.jsdelivr.net/npm',
    'https://esm.sh'
  ]
} as const

export const LUCKYSHEET_CDN_BASE = `${PRIMARY_CDN}/luckysheet@${PREVIEW_CONFIG.luckysheetVersion}/dist`
export const JQUERY_CDN_URL = `${PRIMARY_CDN}/jquery@${PREVIEW_CONFIG.jqueryVersion}/dist/jquery.min.js`
export const LUCKY_EXCEL_CDN_URL = `${PRIMARY_CDN}/luckyexcel@${PREVIEW_CONFIG.luckyexcelVersion}/dist/luckyexcel.umd.js`

/** 根据 pdfjs 版本生成 worker 多源地址 */
export function getPdfWorkerSources(version: string): string[] {
  return PREVIEW_CONFIG.pdfWorkerMirrors.map(
    base => `${base}/pdfjs-dist@${version}/build/pdf.worker.min.mjs`
  )
}
