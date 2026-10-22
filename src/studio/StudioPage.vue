<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentTree from './components/ContentTree.vue'
import MarkdownEditor from './components/MarkdownEditor.vue'
import MarkdownPreview from './components/MarkdownPreview.vue'
import MetaPanel from './components/MetaPanel.vue'
import PublishPanel from './components/PublishPanel.vue'
import NewPostDialog from './components/NewPostDialog.vue'
import AttachmentDialog from './components/AttachmentDialog.vue'
import StudioSettings from './components/StudioSettings.vue'
import { getStudioToken, setStudioToken, studioApi, StudioApiError } from './api'
import type {
  AttachmentMeta,
  Frontmatter,
  GitStatus,
  Issue,
  StudioNode,
  TagCount
} from './types'
import { STORAGE_KEYS, STUDIO_CONFIG } from '@/constants'
import { clearFetchCache } from '@/utils/tool'
import { lenis } from '@/main'
import '@/github-markdown.css'

interface CacheEntry {
  content: string
  frontmatter: Frontmatter
  savedAt: number
}

const route = useRoute()
const router = useRouter()

// ==================== 状态 ====================

const tree = ref<StudioNode[]>([])
const drafts = ref<StudioNode[]>([])
const tagPool = ref<TagCount[]>([])
const covers = ref<string[]>([])
const git = ref<GitStatus | null>(null)

const activeFile = ref('')
const frontmatter = ref<Frontmatter>(emptyFrontmatter())
const content = ref('')
const issues = ref<Issue[]>([])
const dirty = ref(false)
const busy = ref(false)
const loading = ref(false)
const log = ref<string[]>([])
const commitMessage = ref('')
const errorMessage = ref('')
const viewMode = ref<'edit' | 'split' | 'preview'>('split')
const mode = ref<'write' | 'settings'>('write')

const showTree = ref(false)
const showMeta = ref(false)

const newPostOpen = ref(false)
const newPostDraft = ref(false)

const attachmentOpen = ref(false)
const attachmentMode = ref<'create' | 'edit'>('create')
const attachmentFile = ref('')
const attachmentMeta = ref<AttachmentMeta>(emptyAttachment())
const attachmentDir = ref('')
const pendingAttachmentFile = ref<File | null>(null)

const tokenOpen = ref(false)
const tokenDraft = ref('')
const cacheCandidate = ref<CacheEntry | null>(null)

const attachmentInput = ref<HTMLInputElement | null>(null)
let suppressDirty = false
let cacheTimer: ReturnType<typeof setTimeout> | null = null

// ==================== 派生状态 ====================

const isDraft = computed(() => activeFile.value.startsWith(`${STUDIO_CONFIG.draftDir}/`))
const fileSlug = computed(() => activeFile.value.split('/').pop()?.replace(/\.md$/i, '') || '')
const currentDir = computed(() => dirOf(activeFile.value))
const wordCount = computed(() => content.value.replace(/\s/g, '').length)
const folders = computed(() => collectFolders(tree.value))
const articleRoute = computed(() =>
  !activeFile.value || isDraft.value ? '' : `/${activeFile.value.replace(/\.md$/i, '')}`
)
const articleHref = computed(() => articleRoute.value ? router.resolve(articleRoute.value).href : '')
const viewModes = [
  { id: 'edit', label: '编辑' },
  { id: 'split', label: '分栏' },
  { id: 'preview', label: '预览' }
] as const

function emptyFrontmatter(): Frontmatter {
  return { title: '', date: today(), cover: '', desc: '', tags: [], sticky: false }
}

function emptyAttachment(): AttachmentMeta {
  return { title: '', date: today(), cover: '', tags: [], excerpt: '', sticky: false }
}

function today(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function dirOf(file: string): string {
  const index = file.lastIndexOf('/')
  return index === -1 ? '' : file.slice(0, index)
}

function collectFolders(nodes: StudioNode[], result: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type !== 'folder') continue
    if (node.dir && !node.dir.startsWith('_')) result.push(node.dir)
    if (node.children) collectFolders(node.children, result)
  }
  return [...new Set(result)].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function buildMessage(title: string): string {
  return STUDIO_CONFIG.commitMessageTemplate.replace('{title}', title || fileSlug.value || '未命名文章')
}

// ==================== 本地缓存 ====================

function cacheKey(file: string): string {
  return `${STORAGE_KEYS.studioDraft}:${file}`
}

function readCache(file: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(file))
    return raw ? (JSON.parse(raw) as CacheEntry) : null
  } catch {
    return null
  }
}

function writeCache(file: string, entry: CacheEntry) {
  try {
    localStorage.setItem(cacheKey(file), JSON.stringify(entry))
  } catch {
    // 忽略容量不足
  }
}

function clearCache(file: string) {
  try {
    localStorage.removeItem(cacheKey(file))
  } catch {
    // 忽略
  }
}

// ==================== 加载 ====================

async function refreshAll() {
  const data = await studioApi.tree()
  tree.value = data.tree
  drafts.value = data.drafts
  tagPool.value = data.tags
  await refreshGit()
}

async function refreshGit() {
  try {
    git.value = await studioApi.gitStatus()
  } catch (error) {
    handleError(error)
  }
}

async function refreshCovers() {
  try {
    covers.value = await studioApi.covers()
  } catch (error) {
    handleError(error)
  }
}

async function openFileByPath(file: string) {
  if (!file) return
  if (dirty.value && !window.confirm('当前文章有未保存修改，确定切换？')) return
  // 切换前先把旧文章的编辑落到本地缓存，避免快速切换时丢失
  flushAutosave()
  loading.value = true
  try {
    const post = await studioApi.readPost(file)
    applyPost(post.file, post.frontmatter, post.content)
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

/** 立即落盘当前的本地缓存并取消防抖定时器 */
function flushAutosave() {
  if (cacheTimer) {
    clearTimeout(cacheTimer)
    cacheTimer = null
  }
  if (!activeFile.value || !dirty.value) return
  writeCache(activeFile.value, {
    content: content.value,
    frontmatter: frontmatter.value,
    savedAt: Date.now()
  })
}

function applyPost(file: string, meta: Frontmatter, body: string) {
  if (cacheTimer) {
    clearTimeout(cacheTimer)
    cacheTimer = null
  }
  suppressDirty = true
  activeFile.value = file
  frontmatter.value = { ...emptyFrontmatter(), ...meta }
  content.value = body
  issues.value = []
  dirty.value = false
  commitMessage.value = buildMessage(meta.title)
  attachmentOpen.value = false

  const cached = readCache(file)
  const differs =
    cached && (cached.content !== body || JSON.stringify(cached.frontmatter) !== JSON.stringify(meta))
  cacheCandidate.value = differs ? cached : null

  void nextTick(() => {
    suppressDirty = false
  })
}

function openNode(node: StudioNode) {
  if (node.type !== 'post' || !node.file) return
  if (node.extension === 'md') void openFileByPath(node.file)
  else void openAttachment(node.file, node.name)
}

async function openAttachment(file: string, name: string) {
  try {
    const data = await studioApi.readAttachment(file)
    attachmentMode.value = 'edit'
    attachmentFile.value = file
    attachmentMeta.value = data.meta || {
      ...emptyAttachment(),
      title: name,
      date: today()
    }
    attachmentDir.value = dirOf(file)
    attachmentOpen.value = true
  } catch (error) {
    handleError(error)
  }
}

// ==================== 编辑与保存 ====================

watch(
  [content, frontmatter],
  () => {
    if (suppressDirty) return
    dirty.value = true
    // 用户继续编辑后，上一次保存返回的校验错误不再阻塞操作
    if (issues.value.length) issues.value = []
    if (!activeFile.value) return
    if (cacheTimer) clearTimeout(cacheTimer)
    cacheTimer = setTimeout(() => {
      writeCache(activeFile.value, {
        content: content.value,
        frontmatter: frontmatter.value,
        savedAt: Date.now()
      })
    }, STUDIO_CONFIG.autosaveDraftMs)
  },
  { deep: true }
)

function restoreCache() {
  if (!cacheCandidate.value) return
  content.value = cacheCandidate.value.content
  frontmatter.value = { ...cacheCandidate.value.frontmatter }
  dirty.value = true
  cacheCandidate.value = null
}

function discardCache() {
  if (activeFile.value) clearCache(activeFile.value)
  cacheCandidate.value = null
}

async function save() {
  if (!activeFile.value) return
  busy.value = true
  try {
    const result = await studioApi.save({
      file: activeFile.value,
      frontmatter: frontmatter.value,
      content: content.value
    })
    issues.value = result.issues
    dirty.value = false
    cacheCandidate.value = null
    clearCache(activeFile.value)
    clearFetchCache()
    commitMessage.value = buildMessage(frontmatter.value.title)
    log.value = [`已保存：${activeFile.value}`]
    await refreshAll()
  } catch (error) {
    if (error instanceof StudioApiError && error.status === 422) {
      const data = error.data as { issues?: Issue[] } | undefined
      issues.value = data?.issues || []
      errorMessage.value = '校验未通过，请先修复标记为“阻止发布”的问题'
    } else {
      handleError(error)
    }
  } finally {
    busy.value = false
  }
}

// ==================== 新建 / 草稿发布 ====================

async function createPost(payload: { dir: string; slug: string; title: string; draft: boolean }) {
  busy.value = true
  try {
    const created = await studioApi.create(payload)
    newPostOpen.value = false
    clearFetchCache()
    await refreshAll()
    applyPost(created.file, created.frontmatter, created.content)
    log.value = [`已创建：${created.file}`]
  } catch (error) {
    handleError(error)
  } finally {
    busy.value = false
  }
}

async function publishDraft(targetDir: string) {
  if (!isDraft.value) return
  if (!window.confirm(`确认把草稿发布到「${targetDir}」？`)) return
  busy.value = true
  try {
    // 先把未落盘的编辑写入草稿，避免发布时丢失最新内容
    if (dirty.value) {
      const saved = await studioApi.save({
        file: activeFile.value,
        frontmatter: frontmatter.value,
        content: content.value
      })
      issues.value = saved.issues
      dirty.value = false
      clearCache(activeFile.value)
    }
    const result = await studioApi.publish({ file: activeFile.value, targetDir })
    clearFetchCache()
    clearCache(activeFile.value)
    await refreshAll()
    await openFileByPath(result.file)
    log.value = [`已发布：${result.file}（记得提交并推送）`]
  } catch (error) {
    handleError(error)
  } finally {
    busy.value = false
  }
}

// ==================== 图片上传 ====================

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

async function uploadImage(file: File): Promise<string> {
  if (!activeFile.value) throw new Error('请先打开一篇文章')
  const base64 = await fileToBase64(file)
  const uploaded = await studioApi.upload({
    dir: currentDir.value,
    slug: fileSlug.value || 'post',
    filename: file.name || `image-${Date.now()}.png`,
    base64,
    kind: 'image'
  })
  clearFetchCache()
  return uploaded.url
}

/** 封面统一上传到 public/img/covers，并加入候选列表 */
async function uploadCover(file: File): Promise<string> {
  const base64 = await fileToBase64(file)
  const uploaded = await studioApi.uploadCover({
    filename: file.name || `cover-${Date.now()}.png`,
    base64
  })
  if (!covers.value.includes(uploaded.url)) {
    covers.value = [...covers.value, uploaded.url].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  }
  return uploaded.url
}

// ==================== 附件 ====================

function pickAttachment() {
  attachmentInput.value?.click()
}

function onAttachmentPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  pendingAttachmentFile.value = file
  attachmentMode.value = 'create'
  attachmentFile.value = ''
  attachmentMeta.value = {
    ...emptyAttachment(),
    title: file.name.replace(/\.[^.]+$/, '')
  }
  attachmentDir.value = isDraft.value ? '' : currentDir.value
  attachmentOpen.value = true
}

async function submitAttachment(payload: { dir: string; meta: AttachmentMeta }) {
  busy.value = true
  try {
    if (attachmentMode.value === 'create') {
      const pending = pendingAttachmentFile.value
      if (!pending) throw new Error('未选择文件')
      const base64 = await fileToBase64(pending)
      const uploaded = await studioApi.upload({
        dir: payload.dir,
        slug: '',
        filename: pending.name,
        base64,
        kind: 'attachment'
      })
      await studioApi.saveAttachmentMeta(uploaded.file, payload.meta)
      log.value = [`已上传附件：${uploaded.file}`]
      pendingAttachmentFile.value = null
    } else {
      await studioApi.saveAttachmentMeta(attachmentFile.value, payload.meta)
      log.value = [`已更新附件元数据：${attachmentFile.value}.desc.json`]
    }
    attachmentOpen.value = false
    clearFetchCache()
    await refreshAll()
  } catch (error) {
    handleError(error)
  } finally {
    busy.value = false
  }
}

// ==================== Git ====================

async function commitChanges() {
  if (!commitMessage.value.trim()) {
    errorMessage.value = '请填写提交信息'
    return
  }
  busy.value = true
  try {
    const result = await studioApi.gitCommit(commitMessage.value.trim())
    log.value = result.log.length ? result.log : ['已提交']
    await refreshGit()
  } catch (error) {
    handleError(error)
  } finally {
    busy.value = false
  }
}

async function pushChanges() {
  const branch = git.value?.branch || '当前分支'
  // 推送属于不可逆的远端操作，必须由用户确认
  if (!window.confirm(`确认把 ${branch} 推送到远端？推送后会触发自动部署。`)) return
  busy.value = true
  try {
    const result = await studioApi.gitPush()
    log.value = result.log.length ? result.log : ['推送成功']
    await refreshGit()
  } catch (error) {
    handleError(error)
  } finally {
    busy.value = false
  }
}

// ==================== 错误与口令 ====================

function handleError(error: unknown) {
  if (error instanceof StudioApiError) {
    errorMessage.value = error.message
    if (error.status === 401 || error.status === 403) {
      tokenDraft.value = getStudioToken()
      tokenOpen.value = true
    }
    return
  }
  errorMessage.value = error instanceof Error ? error.message : '发生未知错误'
}

function saveToken() {
  setStudioToken(tokenDraft.value.trim())
  tokenOpen.value = false
  errorMessage.value = ''
  void refreshAll().catch(handleError)
}

// ==================== 生命周期 ====================

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(async () => {
  window.addEventListener('beforeunload', onBeforeUnload)
  // 创作台是全屏独立工作台，暂停页面级平滑滚动，避免拦截内部滚轮
  lenis.stop()
  // 小屏幕默认只看编辑区，避免分栏把正文挤成两半
  if (window.matchMedia('(max-width: 1279px)').matches) viewMode.value = 'edit'
  try {
    await refreshAll()
    await refreshCovers()
  } catch (error) {
    handleError(error)
  }
  const queryFile = typeof route.query.file === 'string' ? route.query.file : ''
  if (queryFile) void openFileByPath(queryFile)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  flushAutosave()
  lenis.start()
})
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-50 text-gray-800 dark:bg-dark-900 dark:text-gray-200">
    <header class="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
      <RouterLink
        to="/"
        class="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        返回首页
      </RouterLink>
      <div class="flex min-w-0 items-center gap-2">
        <span class="text-sm font-semibold">创作台</span>
        <span class="hidden truncate text-[11px] text-gray-400 lg:inline">
          {{ mode === 'write' ? '保存后首页、归档和搜索自动更新' : '参数写入本地 .env，重启后生效' }}
        </span>
      </div>
      <div class="flex shrink-0 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
        <button
          type="button"
          class="rounded-md px-2 py-0.5 text-[11px] transition-colors"
          :class="
            mode === 'write'
              ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-300'
              : 'text-gray-500 dark:text-gray-400'
          "
          @click="mode = 'write'"
        >
          写作
        </button>
        <button
          type="button"
          class="rounded-md px-2 py-0.5 text-[11px] transition-colors"
          :class="
            mode === 'settings'
              ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-300'
              : 'text-gray-500 dark:text-gray-400'
          "
          @click="mode = 'settings'"
        >
          站点参数
        </button>
      </div>
      <a
        v-if="mode === 'write' && articleRoute"
        :href="articleHref"
        target="_blank"
        rel="noopener"
        class="hidden shrink-0 rounded-lg border border-gray-200 px-2 py-1 text-[11px] text-gray-600 transition-colors hover:border-orange-300 hover:text-orange-600 sm:inline dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-700"
      >
        查看文章
      </a>

      <div v-if="mode === 'write'" class="ml-auto flex shrink-0 items-center gap-1.5">
        <span
          class="hidden rounded-full px-2 py-0.5 text-[10px] sm:inline"
          :class="
            dirty
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
          "
        >
          {{ dirty ? '有未保存修改' : '已保存' }}
        </span>
        <button
          type="button"
          class="rounded-lg bg-orange-600 px-2.5 py-1 text-[11px] text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          :disabled="!activeFile || busy"
          @click="save"
        >
          保存
        </button>
      </div>
    </header>

    <div v-show="mode === 'settings'" class="min-h-0 flex-1 bg-gray-50 dark:bg-dark-900">
      <StudioSettings />
    </div>

    <div v-show="mode === 'write'" class="flex min-h-0 flex-1">
      <aside class="hidden w-64 shrink-0 border-r border-gray-200 bg-white md:block dark:border-gray-700 dark:bg-gray-900">
        <ContentTree
          :tree="tree"
          :drafts="drafts"
          :active-file="activeFile"
          @open="openNode"
          @new-post="draft => { newPostDraft = draft; newPostOpen = true }"
          @upload-attachment="pickAttachment"
          @refresh="refreshAll"
        />
      </aside>

      <main class="flex min-w-0 flex-1 flex-col">
        <div
          v-if="errorMessage"
          class="flex items-center gap-2 border-b border-red-200 bg-red-50 px-3 py-1.5 text-[11px] text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
        >
          <span class="truncate">{{ errorMessage }}</span>
          <button type="button" class="ml-auto shrink-0" @click="errorMessage = ''">关闭</button>
        </div>

        <div
          v-if="cacheCandidate"
          class="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200"
        >
          <span>检测到本地未保存的编辑内容（{{ new Date(cacheCandidate.savedAt).toLocaleString() }}）</span>
          <button type="button" class="ml-auto underline" @click="restoreCache">恢复</button>
          <button type="button" class="underline" @click="discardCache">丢弃</button>
        </div>

        <div v-if="!activeFile" class="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 py-8 text-center">
          <div>
            <p class="text-base font-semibold text-gray-700 dark:text-gray-200">开始写一篇文章</p>
            <p class="mt-1 text-xs text-gray-400">
              {{ loading ? '正在加载…' : '保存后网站首页会立即出现这篇新文章' }}
            </p>
          </div>

          <div class="grid w-full max-w-2xl gap-2 sm:grid-cols-3">
            <div class="rounded-xl border border-gray-200 bg-white p-3 text-left dark:border-gray-700 dark:bg-gray-900">
              <span class="text-[10px] font-semibold text-orange-500">第 1 步</span>
              <p class="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">新建或选择文章</p>
              <p class="mt-1 text-[11px] leading-relaxed text-gray-400">左侧点「新建文章」，也可以先存成草稿</p>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-3 text-left dark:border-gray-700 dark:bg-gray-900">
              <span class="text-[10px] font-semibold text-orange-500">第 2 步</span>
              <p class="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">写正文和封面</p>
              <p class="mt-1 text-[11px] leading-relaxed text-gray-400">右边预览实时同步，封面支持粘贴和上传</p>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-3 text-left dark:border-gray-700 dark:bg-gray-900">
              <span class="text-[10px] font-semibold text-orange-500">第 3 步</span>
              <p class="mt-1 text-xs font-medium text-gray-700 dark:text-gray-200">保存并发布</p>
              <p class="mt-1 text-[11px] leading-relaxed text-gray-400">先保存，再看右侧「发布到线上」</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg bg-orange-600 px-4 py-2 text-xs text-white hover:bg-orange-700"
              @click="newPostDraft = false; newPostOpen = true"
            >
              新建文章
            </button>
            <button
              type="button"
              class="rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-600 md:hidden dark:bg-gray-800 dark:text-gray-300"
              @click="showTree = true"
            >
              打开目录
            </button>
          </div>
        </div>

        <template v-else>
          <div class="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-[11px] text-gray-500 md:hidden"
              @click="showTree = true"
            >
              目录
            </button>

            <input
              :value="frontmatter.title"
              class="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
              placeholder="文章标题"
              @input="frontmatter = { ...frontmatter, title: ($event.target as HTMLInputElement).value }"
            />

            <span class="hidden text-[10px] text-gray-400 sm:inline">{{ wordCount }} 字</span>

            <div class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
              <button
                v-for="mode in viewModes"
                :key="mode.id"
                type="button"
                class="rounded-md px-2 py-0.5 text-[11px] transition-colors"
                :class="
                  viewMode === mode.id
                    ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-300'
                    : 'text-gray-500 dark:text-gray-400'
                "
                @click="viewMode = mode.id"
              >
                {{ mode.label }}
              </button>
            </div>

            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-[11px] text-gray-500 lg:hidden"
              @click="showMeta = true"
            >
              设置
            </button>
          </div>

          <div
            class="grid min-h-0 flex-1 grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700 md:divide-y-0"
            :class="viewMode === 'split' ? 'md:grid-cols-2 md:divide-x' : ''"
          >
            <MarkdownEditor
              v-if="viewMode !== 'preview'"
              :key="activeFile"
              v-model="content"
              :upload-image="uploadImage"
              :disabled="loading"
              @save="save"
              @error="errorMessage = $event"
            />
            <MarkdownPreview
              v-if="viewMode !== 'edit'"
              :key="activeFile"
              :content="content"
              :class="viewMode === 'split' ? 'hidden md:block' : ''"
            />
          </div>
        </template>
      </main>

      <aside class="hidden w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-3 lg:block dark:border-gray-700 dark:bg-gray-900" data-lenis-prevent>
        <template v-if="activeFile">
          <h2 class="mb-2 text-[11px] font-semibold tracking-wide text-gray-400">文章设置</h2>
          <MetaPanel
            :key="activeFile"
            v-model="frontmatter"
            :file="activeFile"
            :covers="covers"
            :tag-pool="tagPool"
            :issues="issues"
            :upload-cover="uploadCover"
          />
          <div class="my-3 border-t border-gray-200 dark:border-gray-700" />
          <PublishPanel
            :key="activeFile"
            v-model:message="commitMessage"
            :is-draft="isDraft"
            :folders="folders"
            :issues="issues"
            :git="git"
            :dirty="dirty"
            :busy="busy"
            :log="log"
            @save="save"
            @publish="publishDraft"
            @commit="commitChanges"
            @push="pushChanges"
            @refresh-git="refreshGit"
          />
        </template>
        <p v-else class="p-4 text-center text-[11px] text-gray-400">选择文章后可编辑元数据</p>
      </aside>
    </div>

    <!-- 移动端抽屉 -->
    <div v-if="showTree" class="fixed inset-0 z-50 flex md:hidden">
      <div class="absolute inset-0 bg-black/40" @click="showTree = false" />
      <aside class="relative z-10 h-full w-72 overflow-y-auto bg-white dark:bg-gray-900" data-lenis-prevent>
        <ContentTree
          :tree="tree"
          :drafts="drafts"
          :active-file="activeFile"
          @open="node => { showTree = false; openNode(node) }"
          @new-post="draft => { showTree = false; newPostDraft = draft; newPostOpen = true }"
          @upload-attachment="showTree = false; pickAttachment()"
          @refresh="refreshAll"
        />
      </aside>
    </div>

    <div v-if="showMeta" class="fixed inset-0 z-50 flex justify-end lg:hidden">
      <div class="absolute inset-0 bg-black/40" @click="showMeta = false" />
      <aside class="relative z-10 h-full w-80 overflow-y-auto bg-white p-3 dark:bg-gray-900" data-lenis-prevent>
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-[11px] font-semibold tracking-wide text-gray-400">文章设置</h2>
          <button
            type="button"
            class="rounded px-2 py-0.5 text-[11px] text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            @click="showMeta = false"
          >
            关闭
          </button>
        </div>
        <template v-if="activeFile">
          <MetaPanel
            :key="activeFile"
            v-model="frontmatter"
            :file="activeFile"
            :covers="covers"
            :tag-pool="tagPool"
            :issues="issues"
            :upload-cover="uploadCover"
          />
          <div class="my-3 border-t border-gray-200 dark:border-gray-700" />
          <PublishPanel
            :key="activeFile"
            v-model:message="commitMessage"
            :is-draft="isDraft"
            :folders="folders"
            :issues="issues"
            :git="git"
            :dirty="dirty"
            :busy="busy"
            :log="log"
            @save="save"
            @publish="publishDraft"
            @commit="commitChanges"
            @push="pushChanges"
            @refresh-git="refreshGit"
          />
        </template>
      </aside>
    </div>

    <input
      ref="attachmentInput"
      type="file"
      accept=".pdf,.docx,.xlsx"
      class="hidden"
      @change="onAttachmentPicked"
    />

    <NewPostDialog
      :open="newPostOpen"
      :folders="folders"
      :default-draft="newPostDraft"
      @close="newPostOpen = false"
      @submit="createPost"
    />

    <AttachmentDialog
      :open="attachmentOpen"
      :mode="attachmentMode"
      :file="attachmentFile"
      :initial-meta="attachmentMeta"
      :folders="folders"
      :default-dir="attachmentDir"
      :tag-pool="tagPool"
      @close="attachmentOpen = false"
      @submit="submitAttachment"
    />

    <div v-if="tokenOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-gray-900">
        <h2 class="mb-2 text-sm font-semibold">需要访问口令</h2>
        <p class="mb-3 text-[11px] text-gray-400">
          局域网访问创作台需要在 .env 中配置 STUDIO_TOKEN，并在此处填写相同口令。
        </p>
        <input
          v-model="tokenDraft"
          type="password"
          class="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange-400 dark:border-gray-700 dark:bg-gray-800"
          placeholder="STUDIO_TOKEN"
          @keydown.enter="saveToken"
        />
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs dark:bg-gray-800" @click="tokenOpen = false">
            取消
          </button>
          <button type="button" class="rounded-lg bg-orange-600 px-3 py-1.5 text-xs text-white" @click="saveToken">
            保存口令
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
