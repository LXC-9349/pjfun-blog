<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  uploadImage?: (file: File) => Promise<string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save'): void
  (e: 'error', message: string): void
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
let disposed = false

onBeforeUnmount(() => {
  disposed = true
})

function update(value: string) {
  emit('update:modelValue', value)
}

function insert(before: string, after = '', placeholder = '') {
  const el = textarea.value
  if (!el) return
  const start = el.selectionStart ?? 0
  const end = el.selectionEnd ?? 0
  const selected = props.modelValue.slice(start, end) || placeholder
  const next = `${props.modelValue.slice(0, start)}${before}${selected}${after}${props.modelValue.slice(end)}`
  update(next)
  nextTick(() => {
    el.focus()
    const cursor = start + before.length + selected.length
    el.setSelectionRange(cursor, cursor)
  })
}

async function handleFile(file: File) {
  if (!props.uploadImage) return
  uploading.value = true
  try {
    const url = await props.uploadImage(file)
    if (disposed) return
    insert(`![图片](${url})`)
  } catch (error) {
    if (disposed) return
    emit('error', error instanceof Error ? error.message : '图片上传失败')
  } finally {
    if (!disposed) uploading.value = false
  }
}

function pickImage() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void handleFile(file)
}

function onPaste(event: ClipboardEvent) {
  if (!props.uploadImage) return
  const items = event.clipboardData?.items
  if (!items) return
  const imageItem = Array.from(items).find(item => item.type.startsWith('image/'))
  if (!imageItem) return
  const file = imageItem.getAsFile()
  if (!file) return
  event.preventDefault()
  void handleFile(file)
}

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    emit('save')
    return
  }
  if (event.key === 'Tab') {
    event.preventDefault()
    insert('  ')
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex flex-wrap items-center gap-1 border-b border-gray-200 px-2 py-1.5 dark:border-gray-700">
      <button type="button" class="toolbar-btn" title="二级标题" @click="insert('\n## ')">H2</button>
      <button type="button" class="toolbar-btn font-bold" title="加粗" @click="insert('**', '**', '加粗文本')">B</button>
      <button type="button" class="toolbar-btn" title="行内代码" @click="insert('`', '`', 'code')">`code`</button>
      <button type="button" class="toolbar-btn" title="代码块" @click="insert('\n```\n', '\n```\n', '代码')">
        代码块
      </button>
      <button type="button" class="toolbar-btn" title="表格" @click="insert('\n| 列 1 | 列 2 |\n| --- | --- |\n| ', ' |  |\n', '内容')">
        表格
      </button>
      <button type="button" class="toolbar-btn" title="链接" @click="insert('[', '](https://)')">链接</button>
      <button
        type="button"
        class="toolbar-btn ml-auto"
        :disabled="uploading"
        title="上传图片"
        @click="pickImage"
      >
        {{ uploading ? '上传中…' : '图片' }}
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
    </div>

    <textarea
      ref="textarea"
      :value="modelValue"
      :disabled="disabled"
      spellcheck="false"
      data-lenis-prevent
      placeholder="开始写正文，支持 Markdown 语法；粘贴截图会自动上传"
      class="toc-scrollbar min-h-0 w-full flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-6 outline-none placeholder:text-gray-400"
      @input="update(($event.target as HTMLTextAreaElement).value)"
      @paste="onPaste"
      @keydown="onKeydown"
    />
  </div>
</template>

<style scoped>
.toolbar-btn {
  padding: 0.15rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 11px;
  color: var(--studio-toolbar-text, #6b7280);
  transition: background-color 0.15s ease;
}
.toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}
.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
:global(.dark) .toolbar-btn {
  color: #9ca3af;
}
:global(.dark) .toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
