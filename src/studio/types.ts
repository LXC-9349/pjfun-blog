// Studio 前端类型：与 tooling/content-core.ts 的数据结构保持一致
export interface StudioNode {
  type: 'folder' | 'post'
  name: string
  file?: string
  dir?: string
  extension?: string
  children?: StudioNode[]
}

export interface TagCount {
  name: string
  count: number
}

export interface Frontmatter {
  title: string
  date: string
  cover: string
  desc: string
  tags: string[]
  sticky: boolean
}

export type IssueLevel = 'error' | 'warn'

export interface Issue {
  level: IssueLevel
  code: string
  message: string
}

export interface ParsedPost {
  file: string
  frontmatter: Frontmatter
  content: string
}

export interface AttachmentMeta {
  title: string
  date: string
  cover: string
  tags: string[]
  excerpt: string
  sticky: boolean
}

export interface TreePayload {
  tree: StudioNode[]
  drafts: StudioNode[]
  tags: TagCount[]
}

export interface GitStatus {
  branch: string
  remote: string
  contentChanges: string[]
  otherChanges: string[]
}

export interface GitCommitResult {
  committed: boolean
  hash?: string
  log: string[]
}

export interface GitPushResult {
  log: string[]
}

export interface SaveResult {
  file: string
  savedAt: number
  issues: Issue[]
}

export interface EnvConfigPayload {
  values: Record<string, string>
  /** .env.example 中的默认值，用于「仅导出修改项」 */
  defaults: Record<string, string>
  /** .env 是否已存在；false 时展示 .env.example 的值 */
  exists: boolean
  path: string
  restarting?: boolean
}
