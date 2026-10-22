// 本地创作台（Studio）配置
// 仅在 `pnpm dev` 下生效，不参与生产构建；服务端与前端共用同一份参数
export const STUDIO_CONFIG = {
  /** REST API 前缀（拼在 dev server base 之后） */
  apiPrefix: '__studio/api',
  /** public/content 变更后重建导航数据的防抖时间（毫秒） */
  navRebuildDebounceMs: 300,
  /** Studio 保存后静默浏览器整页刷新的时长（毫秒），避免打断写作 */
  reloadMuteMs: 2_500,
  /** 编辑内容写入 localStorage 的防抖时间（毫秒） */
  autosaveDraftMs: 1_500,
  /** 单个上传文件大小上限（字节） */
  uploadMaxBytes: 10 * 1024 * 1024,
  /** 允许粘贴 / 上传的图片扩展名 */
  imageExtensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg'],
  /** 允许上传的附件扩展名（自动生成同名 .desc.json） */
  attachmentExtensions: ['pdf', 'docx', 'xlsx'],
  /** 草稿目录：以 _ 开头，构建扫描时会被忽略 */
  draftDir: '_drafts',
  /** 封面上传目录（相对 public），随站点一起部署 */
  coverDir: 'img/covers',
  /** 发布提交信息模板，{title} 会替换为文章标题 */
  commitMessageTemplate: 'docs(content): {title}',
  /** 分类树最大展示层级（与 README 的目录组织约定一致） */
  maxTreeDepth: 4
} as const
