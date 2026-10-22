// 分享渠道地址模板
export const SHARE_ENDPOINTS = {
  qrcode: (url: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
  weibo: (url: string, title: string) =>
    `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  qq: (url: string, title: string) =>
    `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  x: (url: string, title: string) =>
    `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  linkedin: (url: string, title: string) =>
    `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  telegram: (url: string, title: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  email: (url: string, title: string) =>
    `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
} as const
