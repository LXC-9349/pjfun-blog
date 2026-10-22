<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GitStatus, Issue } from '@/studio/types'

const props = defineProps<{
  isDraft: boolean
  folders: string[]
  issues: Issue[]
  git: GitStatus | null
  dirty: boolean
  busy: boolean
  log: string[]
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'publish', targetDir: string): void
  (e: 'commit'): void
  (e: 'push'): void
  (e: 'refresh-git'): void
}>()

const message = defineModel<string>('message', { required: true })
const targetDir = ref('')

const hasBlocking = computed(() => props.issues.some(issue => issue.level === 'error'))
const contentCount = computed(() => props.git?.contentChanges.length || 0)
const otherCount = computed(() => props.git?.otherChanges.length || 0)

const labelClass = 'mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400'
const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange-400 dark:border-gray-700 dark:bg-gray-900'
</script>

<template>
  <div class="space-y-3">
    <div>
      <button
        type="button"
        class="w-full rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="busy"
        @click="emit('save')"
      >
        {{ busy ? '处理中…' : '保存文章' }}
      </button>
      <p class="mt-1 text-center text-[10px] text-gray-400">
        {{ dirty ? '有未保存的修改（Ctrl + S 可保存）' : '内容已保存到磁盘' }}
      </p>
    </div>

    <div
      v-if="isDraft"
      class="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 dark:border-amber-900/40 dark:bg-amber-900/10"
    >
      <p class="mb-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">这篇还是草稿</p>
      <p class="mb-1.5 text-[10px] text-amber-600/80 dark:text-amber-200/70">发布后会移入正式目录，并出现在网站上</p>
      <input v-model="targetDir" :class="inputClass" list="studio-target-dirs" placeholder="选择分类，如 前端开发" />
      <datalist id="studio-target-dirs">
        <option v-for="folder in folders" :key="folder" :value="folder" />
      </datalist>
      <button
        type="button"
        class="mt-1.5 w-full rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="busy || !targetDir.trim() || hasBlocking"
        @click="emit('publish', targetDir.trim())"
      >
        发布到该分类
      </button>
    </div>

    <div class="rounded-lg border border-gray-200 p-2.5 dark:border-gray-700">
      <div class="mb-1 flex items-center justify-between">
        <span class="text-[11px] font-semibold text-gray-600 dark:text-gray-300">发布到线上</span>
        <button type="button" class="text-[10px] text-gray-400 hover:text-orange-500" @click="emit('refresh-git')">
          刷新
        </button>
      </div>
      <p class="text-[10px] leading-relaxed text-gray-400">保存 → 提交 → 推送，推送后约 1-3 分钟自动更新网站</p>

      <p class="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
        内容与封面变更 {{ contentCount }} 项<span v-if="otherCount" class="text-amber-500">，其他文件 {{ otherCount }} 项不会提交</span>
      </p>
      <details v-if="contentCount" class="mt-1">
        <summary class="cursor-pointer text-[10px] text-gray-400">查看将要提交的文件</summary>
        <ul class="mt-1 max-h-24 overflow-auto text-[10px] text-gray-500 dark:text-gray-400">
          <li v-for="line in git?.contentChanges" :key="line" class="truncate font-mono">{{ line }}</li>
        </ul>
      </details>

      <label :class="[labelClass, 'mt-2']">提交信息</label>
      <textarea
        v-model="message"
        rows="2"
        :class="[inputClass, 'resize-none']"
        placeholder="docs(content): 文章标题"
      />

      <div class="mt-1.5 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          class="rounded-lg bg-gray-100 px-2 py-1.5 text-[11px] text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          :disabled="busy || !contentCount"
          @click="emit('commit')"
        >
          保存版本
        </button>
        <button
          type="button"
          class="rounded-lg bg-gray-900 px-2 py-1.5 text-[11px] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
          :disabled="busy"
          @click="emit('push')"
        >
          发布到线上
        </button>
      </div>
      <p class="mt-1 text-[10px] text-gray-400">推送是唯一会同步到网站的步骤，点击后会再次确认</p>

      <details class="mt-2">
        <summary class="cursor-pointer text-[10px] text-gray-400">技术信息</summary>
        <p class="mt-1 truncate text-[10px] text-gray-500 dark:text-gray-400">
          {{ git ? `${git.branch || '未知分支'} · ${git.remote || '未配置远端'}` : '正在读取 Git 状态…' }}
        </p>
      </details>
    </div>

    <pre
      v-if="log.length"
      data-lenis-prevent
      class="max-h-40 overflow-auto rounded-lg bg-gray-950 p-2 text-[10px] leading-4 text-gray-300"
    >{{ log.join('\n') }}</pre>
  </div>
</template>
