import { STORAGE_KEYS, STUDIO_CONFIG } from '@/constants'
import type {
  AttachmentMeta,
  EnvConfigPayload,
  GitCommitResult,
  GitPushResult,
  GitStatus,
  ParsedPost,
  SaveResult,
  TreePayload
} from './types'

const API_BASE = `${import.meta.env.BASE_URL}${STUDIO_CONFIG.apiPrefix}`.replace(/\/{2,}/g, '/')

export class StudioApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'StudioApiError'
    this.status = status
    this.data = data
  }
}

export function getStudioToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.studioToken) || ''
  } catch {
    return ''
  }
}

export function setStudioToken(token: string) {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.studioToken, token)
    else localStorage.removeItem(STORAGE_KEYS.studioToken)
  } catch {
    // localStorage 不可用时忽略
  }
}

async function request<T>(route: string, init?: RequestInit): Promise<T> {
  const token = getStudioToken()
  const response = await fetch(`${API_BASE}/${route}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-studio-token': token } : {}),
      ...(init?.headers || {})
    }
  })

  const payload = (await response.json().catch(() => null)) as
    | { ok: boolean; data?: T; message?: string }
    | null

  if (!response.ok || !payload?.ok) {
    throw new StudioApiError(payload?.message || `HTTP ${response.status}`, response.status, payload?.data)
  }
  return payload.data as T
}

const post = (route: string, body: unknown) =>
  request<unknown>(route, { method: 'POST', body: JSON.stringify(body) })

export const studioApi = {
  tree: () => request<TreePayload>('tree'),

  readPost: (file: string) => request<ParsedPost>(`post?file=${encodeURIComponent(file)}`),

  readAttachment: (file: string) =>
    request<{ meta: AttachmentMeta | null }>(`attachment?file=${encodeURIComponent(file)}`),

  covers: () => request<string[]>('covers'),

  create: (input: { dir: string; slug: string; title: string; draft: boolean }) =>
    post('create', input) as Promise<{ file: string; frontmatter: ParsedPost['frontmatter']; content: string }>,

  save: (input: { file: string; frontmatter: ParsedPost['frontmatter']; content: string }) =>
    request<SaveResult>('save', { method: 'POST', body: JSON.stringify(input) }),

  publish: (input: { file: string; targetDir: string }) =>
    post('publish', input) as Promise<{ file: string }>,

  upload: (input: {
    dir: string
    slug: string
    filename: string
    base64: string
    kind: 'image' | 'attachment'
  }) => post('upload', input) as Promise<{ file: string; url: string }>,

  uploadCover: (input: { filename: string; base64: string }) =>
    post('upload-cover', input) as Promise<{ file: string; url: string }>,

  saveAttachmentMeta: (file: string, meta: AttachmentMeta) =>
    post('attachment-meta', { file, meta }) as Promise<AttachmentMeta>,

  gitStatus: () => request<GitStatus>('git/status'),

  gitCommit: (message: string) => post('git/commit', { message }) as Promise<GitCommitResult>,

  gitPush: () => post('git/push', { confirm: true }) as Promise<GitPushResult>,

  getConfig: () => request<EnvConfigPayload>('config'),

  saveConfig: (values: Record<string, string>) =>
    request<EnvConfigPayload>('config', { method: 'POST', body: JSON.stringify({ values }) })
}
