// 创作台「站点参数」可编辑项
// 只允许编辑以下白名单中的环境变量；保存写入本地 .env，重启 dev server 后生效
export type StudioSettingType = 'text' | 'number' | 'boolean' | 'select' | 'password'

export interface StudioSettingField {
  key: string
  label: string
  type: StudioSettingType
  placeholder?: string
  help?: string
  options?: Array<{ label: string; value: string }>
  min?: number
  max?: number
  /** 是否允许导出到部署平台；默认 true，仅本地使用的参数设为 false */
  exportable?: boolean
}

export interface StudioSettingGroup {
  id: string
  title: string
  description?: string
  fields: StudioSettingField[]
}

const FONT_OPTIONS = [
  { label: '系统默认', value: 'system' },
  { label: '系统宋体', value: 'system-serif' },
  { label: '系统楷体', value: 'system-kai' },
  { label: 'Noto Sans', value: 'noto-sans' },
  { label: 'Noto Serif', value: 'noto-serif' },
  { label: 'MiSans', value: 'misans' },
  { label: 'HarmonyOS Sans', value: 'harmony' },
  { label: '霞鹜文楷', value: 'wenkai' },
  { label: 'Smiley Sans', value: 'smiley' },
  { label: '站酷快乐体', value: 'zcool-kuaile' },
  { label: '站酷小薇体', value: 'zcool-xiaowei' },
  { label: '马善政毛笔体', value: 'ma-shan-zheng' },
  { label: '龙藏体', value: 'long-cang' }
]

const CURSOR_OPTIONS = [
  { label: '系统默认', value: 'default' },
  { label: '精致箭头', value: 'arrow' },
  { label: '主题圆点', value: 'dot' },
  { label: '主题光环', value: 'ring' },
  { label: '主题准星', value: 'target' },
  { label: '系统十字', value: 'crosshair' }
]

export const STUDIO_SETTING_GROUPS: StudioSettingGroup[] = [
  {
    id: 'site',
    title: '站点信息',
    description: '浏览器标题、SEO 描述与页脚信息',
    fields: [
      { key: 'VITE_SITE_ICON', label: '站点图标', type: 'text', help: '1-2 个字符，显示在 Logo 方块中' },
      { key: 'VITE_SITE_TITLE', label: '站点标题', type: 'text' },
      { key: 'VITE_SITE_DESCRIPTION', label: '站点描述', type: 'text', help: '用于 SEO 与 PWA 描述' },
      { key: 'VITE_SITE_AUTHOR', label: '作者', type: 'text' },
      { key: 'VITE_SITE_KEYWORDS', label: '关键词', type: 'text', help: '英文逗号分隔' },
      { key: 'VITE_SITE_EMAIL', label: '联系邮箱', type: 'text' },
      { key: 'VITE_SITE_URL', label: '站点域名', type: 'text', help: 'RSS / sitemap 使用，结尾不要带斜杠' }
    ]
  },
  {
    id: 'social',
    title: '社交与链接',
    description: '页脚与首页的对外入口',
    fields: [
      { key: 'VITE_SOCIAL_GITHUB', label: 'GitHub', type: 'text' },
      { key: 'VITE_SOCIAL_TELEGRAM', label: 'Telegram', type: 'text' },
      { key: 'VITE_FOOT_GITHUB', label: '页脚 GitHub', type: 'text' },
      { key: 'VITE_HOT_RANK_URL', label: '热榜新闻地址', type: 'text' }
    ]
  },
  {
    id: 'content',
    title: '内容展示',
    description: '首页热门标签的行为',
    fields: [
      { key: 'VITE_HOT_TAGS', label: '热门标签', type: 'text', help: '英文逗号分隔；留空按文章标签频次自动生成' },
      { key: 'VITE_HOT_TAGS_LIMIT', label: '热门标签数量', type: 'number', min: 1, max: 50 }
    ]
  },
  {
    id: 'appearance',
    title: '外观默认值',
    description: '访客首次打开站点时的主题效果，用户仍可在「主题设置」中覆盖',
    fields: [
      { key: 'VITE_DEFAULT_BACKGROUND', label: '默认背景', type: 'text', help: 'public/bg 中的文件 id，留空为无背景' },
      { key: 'VITE_DEFAULT_FONT', label: '默认字体', type: 'select', options: FONT_OPTIONS },
      { key: 'VITE_DEFAULT_CURSOR', label: '鼠标样式', type: 'select', options: CURSOR_OPTIONS },
      { key: 'VITE_DEFAULT_ACCENT_H', label: '主题色相', type: 'number', min: 0, max: 360, help: '0-360' },
      { key: 'VITE_DEFAULT_ACCENT_S', label: '主题饱和度', type: 'number', min: 0, max: 100, help: '0-100' },
      { key: 'VITE_DEFAULT_ACCENT_L', label: '主题明度', type: 'number', min: 0, max: 100, help: '0-100' },
      { key: 'VITE_DEFAULT_OVERLAY', label: '背景遮罩', type: 'number', min: 0, max: 90, help: '0-90，数值越大文字越清晰' },
      { key: 'VITE_DEFAULT_AUTO_ROTATE', label: '背景自动轮播', type: 'boolean' },
      { key: 'VITE_DEFAULT_ROTATE_INTERVAL', label: '轮播间隔（秒）', type: 'number', min: 3, max: 60 },
      { key: 'VITE_DEFAULT_KEN_BURNS', label: '背景缓慢缩放', type: 'boolean' },
      { key: 'VITE_DEFAULT_EFFECT_ENABLED', label: '飘落特效', type: 'boolean' },
      { key: 'VITE_DEFAULT_PETAL_TYPES', label: '特效类型', type: 'text', help: '英文逗号分隔：yinxing / yinghua1 / fengye / meihua / yumao / xingxing' },
      { key: 'VITE_DEFAULT_PETAL_COUNT', label: '粒子数量', type: 'number', min: 0, max: 150 },
      { key: 'VITE_DEFAULT_PETAL_Z_INDEX', label: '特效层级', type: 'number', min: -10, max: 999, help: '负值表示位于内容下方' }
    ]
  },
  {
    id: 'giscus',
    title: '评论（Giscus）',
    description: '配置从 giscus.app 获取',
    fields: [
      { key: 'VITE_GISCUS_ENABLED', label: '启用评论', type: 'boolean' },
      { key: 'VITE_GISCUS_REPO', label: '仓库', type: 'text', placeholder: 'owner/repo' },
      { key: 'VITE_GISCUS_REPO_ID', label: '仓库 ID', type: 'text' },
      { key: 'VITE_GISCUS_CATEGORY', label: '分类名称', type: 'text' },
      { key: 'VITE_GISCUS_CATEGORY_ID', label: '分类 ID', type: 'text' },
      {
        key: 'VITE_GISCUS_MAPPING',
        label: '文章映射方式',
        type: 'select',
        options: [
          { label: 'pathname', value: 'pathname' },
          { label: 'url', value: 'url' },
          { label: 'title', value: 'title' },
          { label: 'og:title', value: 'og:title' },
          { label: 'specific', value: 'specific' }
        ]
      },
      {
        key: 'VITE_GISCUS_LANG',
        label: '评论语言',
        type: 'select',
        options: [
          { label: '中文', value: 'zh-CN' },
          { label: 'English', value: 'en' }
        ]
      }
    ]
  },
  {
    id: 'deploy',
    title: '构建与部署',
    description: '修改部署路径后需要重新启动或重新构建',
    fields: [
      { key: 'VITE_BASE', label: '部署基础路径', type: 'text', help: '根目录用 /；GitHub Pages 子路径用 /仓库名/' },
      { key: 'VITE_APP_VERSION', label: '页脚版本号', type: 'text', help: '留空时显示构建日期' }
    ]
  },
  {
    id: 'security',
    title: '安全',
    description: '修改后 dev server 重启生效；口令只保存在本地 .env',
    fields: [
      { key: 'BLOG_PASSWORD', label: '博客访问密码', type: 'password', help: '留空关闭密码保护；不使用 VITE_ 前缀，避免明文被打进前端产物' },
      { key: 'STUDIO_TOKEN', label: '创作台口令', type: 'password', exportable: false, help: '仅用于本创作台，不会导出到部署平台' }
    ]
  }
]

export const STUDIO_SETTING_KEYS: ReadonlySet<string> = new Set(
  STUDIO_SETTING_GROUPS.flatMap(group => group.fields.map(field => field.key))
)
