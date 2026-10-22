// 鼠标指针 SVG 生成：统一 32px 尺寸，颜色跟随主题色
export type SvgCursorKind = 'arrow' | 'dot' | 'ring' | 'target'

interface CursorAsset {
  svg: string
  hotspot: [number, number]
}

/** 生成原始 SVG（未编码），面板预览与光标共用同一套图形 */
function buildSvg(kind: SvgCursorKind, color: string): CursorAsset {
  if (kind === 'arrow') {
    const path = 'M7 3 7 26 13.4 20.2 17.4 29 21.4 27.1 17.4 18.4 25.5 17.5 Z'
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="${path}" fill="#ffffff" stroke="#1f2937" stroke-width="2" stroke-linejoin="round"/>
  <path d="${path}" fill="none" stroke="${color}" stroke-width="0.9" stroke-linejoin="round" opacity="0.9"/>
</svg>`,
      hotspot: [7, 3]
    }
  }

  if (kind === 'dot') {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12.5" fill="none" stroke="rgba(17,24,39,0.35)" stroke-width="1.5"/>
  <circle cx="16" cy="16" r="7" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="1.8" fill="#ffffff" opacity="0.9"/>
</svg>`,
      hotspot: [16, 16]
    }
  }

  if (kind === 'ring') {
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(17,24,39,0.35)" stroke-width="1.5"/>
  <circle cx="16" cy="16" r="8" fill="none" stroke="${color}" stroke-width="3"/>
  <circle cx="16" cy="16" r="2.4" fill="${color}" stroke="#ffffff" stroke-width="1"/>
</svg>`,
      hotspot: [16, 16]
    }
  }

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M16 3v8M16 21v8M3 16h8M21 16h8" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M16 3v8M16 21v8M3 16h8M21 16h8" stroke="#111827" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/>
  <circle cx="16" cy="16" r="6.5" fill="none" stroke="${color}" stroke-width="2.5"/>
  <circle cx="16" cy="16" r="1.8" fill="${color}"/>
</svg>`,
    hotspot: [16, 16]
  }
}

/** CSS cursor 值：url(data-uri) 热点, 兜底 */
export function buildSvgCursor(kind: SvgCursorKind, color: string): string {
  const { svg, hotspot } = buildSvg(kind, color)
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") ${hotspot[0]} ${hotspot[1]}, auto`
}

/** 纯 data URI，供 <img> 预览使用 */
export function cursorDataUri(kind: SvgCursorKind, color: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(buildSvg(kind, color).svg)}`
}
