<script setup lang="ts">
import { ref, watch } from 'vue'
import TagInput from './TagInput.vue'
import type { AttachmentMeta, TagCount } from '@/studio/types'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  file?: string
  initialMeta: AttachmentMeta
  folders: string[]
  defaultDir?: string
  tagPool?: TagCount[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { dir: string; meta: AttachmentMeta }): void
}>()

const meta = ref<AttachmentMeta>({ ...props.initialMeta })
const dir = ref('')
const error = ref('')

watch(
  () => props.open,
  open => {
    if (!open) return
    meta.value = { ...props.initialMeta }
    dir.value = props.defaultDir || ''
    error.value = ''
  }
)

function patch<K extends keyof AttachmentMeta>(key: K, value: AttachmentMeta[K]) {
  meta.value = { ...meta.value, [key]: value }
}

function submit() {
  if (!meta.value.title.trim()) {
    error.value = '请填写标题'
    return
  }
  emit('submit', { dir: dir.value.trim(), meta: { ...meta.value } })
}

const labelClass = 'mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400'
const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange-400 dark:border-gray-700 dark:bg-gray-900'
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
    @click.self="emit('close')"
  >
    <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900" data-lenis-prevent>
      <h2 class="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
        {{ mode === 'create' ? '上传附件' : '编辑附件信息' }}
      </h2>
      <p v-if="file" class="mb-3 truncate font-mono text-[10px] text-gray-400">{{ file }} + .desc.json</p>

      <div class="space-y-3">
        <div v-if="mode === 'create'">
          <label :class="labelClass">目标分类</label>
          <input v-model="dir" :class="inputClass" list="studio-attachment-dirs" placeholder="留空放在根目录，如 2025/pdf" />
          <datalist id="studio-attachment-dirs">
            <option v-for="folder in folders" :key="folder" :value="folder" />
          </datalist>
        </div>

        <div>
          <label :class="labelClass">标题</label>
          <input
            :value="meta.title"
            :class="inputClass"
            placeholder="文档标题"
            @input="patch('title', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label :class="labelClass">日期</label>
            <input
              :value="meta.date"
              type="date"
              :class="inputClass"
              @input="patch('date', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="flex items-end pb-1.5">
            <label class="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <input
                type="checkbox"
                :checked="meta.sticky"
                class="accent-orange-600"
                @change="patch('sticky', ($event.target as HTMLInputElement).checked)"
              />
              置顶
            </label>
          </div>
        </div>

        <div>
          <label :class="labelClass">摘要</label>
          <textarea
            :value="meta.excerpt"
            rows="2"
            :class="[inputClass, 'resize-none']"
            placeholder="显示在首页卡片"
            @input="patch('excerpt', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <div>
          <label :class="labelClass">封面</label>
          <input
            :value="meta.cover"
            :class="inputClass"
            placeholder="/img/d5.webp"
            @input="patch('cover', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div>
          <label :class="labelClass">标签</label>
          <TagInput :model-value="meta.tags" :pool="tagPool" @update:model-value="patch('tags', $event)" />
        </div>

        <p v-if="error" class="text-[11px] text-red-500">{{ error }}</p>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          type="button"
          class="rounded-lg bg-orange-600 px-3 py-1.5 text-xs text-white hover:bg-orange-700"
          @click="submit"
        >
          {{ mode === 'create' ? '上传并保存' : '保存元数据' }}
        </button>
      </div>
    </div>
  </div>
</template>
