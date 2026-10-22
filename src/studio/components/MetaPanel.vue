<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import TagInput from './TagInput.vue'
import type { Frontmatter, Issue, TagCount } from '@/studio/types'

const model = defineModel<Frontmatter>({ required: true })

const props = defineProps<{
  file: string
  covers: string[]
  tagPool: TagCount[]
  issues: Issue[]
  uploadCover?: (file: File) => Promise<string>
}>()

const coverInput = ref<HTMLInputElement | null>(null)
const coverZone = ref<HTMLElement | null>(null)
const coverError = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const showCoverUrl = ref(false)
let coverUploadToken = 0

// 切换文章时作废在途上传，避免把封面写进下一篇
watch(
  () => props.file,
  () => {
    coverUploadToken++
    uploading.value = false
    uploadError.value = ''
    coverError.value = false
    showCoverUrl.value = false
  }
)

onBeforeUnmount(() => {
  coverUploadToken++
})

// 封面地址变化后重新允许展示预览图
watch(
  () => model.value.cover,
  () => {
    coverError.value = false
    uploadError.value = ''
  }
)

function patch<K extends keyof Frontmatter>(key: K, value: Frontmatter[K]) {
  model.value = { ...model.value, [key]: value }
}

function pickCover() {
  coverInput.value?.click()
}

async function applyCover(file: File) {
  if (!props.uploadCover) return
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(file.name)
  if (!isImage) {
    uploadError.value = '请选择图片文件'
    return
  }
  const token = ++coverUploadToken
  uploading.value = true
  uploadError.value = ''
  try {
    const url = await props.uploadCover(file)
    if (token !== coverUploadToken) return
    patch('cover', url)
    showCoverUrl.value = false
  } catch (error) {
    if (token !== coverUploadToken) return
    uploadError.value = error instanceof Error ? error.message : '封面上传失败'
  } finally {
    if (token === coverUploadToken) uploading.value = false
  }
}

function onCoverChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void applyCover(file)
}

function onCoverPaste(event: ClipboardEvent) {
  const item = Array.from(event.clipboardData?.items || []).find(item => item.type.startsWith('image/'))
  const file = item?.getAsFile()
  if (!file) return
  event.preventDefault()
  void applyCover(file)
}

function onCoverDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (file) void applyCover(file)
}

/** 读取系统剪贴板中的图片；不支持时引导用户点击封面后按 Ctrl+V */
async function pasteCover() {
  uploadError.value = ''
  if (!navigator.clipboard?.read) {
    coverZone.value?.focus()
    uploadError.value = '当前浏览器不支持读取剪贴板，封面区域已聚焦，请直接按 Ctrl+V 粘贴'
    return
  }
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      const type = item.types.find(type => type.startsWith('image/'))
      if (!type) continue
      const blob = await item.getType(type)
      const rawExtension = type.split('/')[1] || 'png'
      const extension = rawExtension === 'svg+xml' ? 'svg' : rawExtension
      const file = new File([blob], `cover-${Date.now()}.${extension}`, { type })
      await applyCover(file)
      return
    }
    uploadError.value = '剪贴板中没有图片'
  } catch {
    coverZone.value?.focus()
    uploadError.value = '读取剪贴板被拒绝，封面区域已聚焦，请直接按 Ctrl+V 粘贴'
  }
}

const labelClass = 'mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400'
const hintClass = 'mt-1 text-[10px] text-gray-400'
const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange-400 dark:border-gray-700 dark:bg-gray-900'
</script>

<template>
  <div class="space-y-4">
    <div>
      <label :class="labelClass">标题</label>
      <input
        :value="model.title"
        :class="inputClass"
        placeholder="文章标题"
        @input="patch('title', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div>
        <label :class="labelClass">发布日期</label>
        <input
          :value="model.date"
          type="date"
          :class="inputClass"
          @input="patch('date', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="flex items-end pb-1.5">
        <label class="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            :checked="model.sticky"
            class="accent-orange-600"
            @change="patch('sticky', ($event.target as HTMLInputElement).checked)"
          />
          置顶到首页
        </label>
      </div>
    </div>

    <div>
      <label :class="labelClass">封面图</label>
      <div
        ref="coverZone"
        tabindex="0"
        class="group relative aspect-16/10 w-full cursor-pointer overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-orange-900/40"
        @click="pickCover"
        @paste.prevent="onCoverPaste"
        @dragover.prevent
        @drop.prevent="onCoverDrop"
      >
        <img
          v-if="model.cover && !coverError"
          :src="model.cover"
          alt="封面预览"
          class="h-full w-full object-cover"
          @error="coverError = true"
        />
        <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-300">点击上传封面</span>
          <span class="text-[10px] text-gray-400">也可以拖入图片，或点下方「粘贴图片」</span>
        </div>
        <div
          v-if="model.cover && !coverError"
          class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          点击更换封面
        </div>
        <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">
          上传中…
        </div>
      </div>
      <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="onCoverChange" />

      <div class="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
        <button
          type="button"
          class="rounded-md bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="uploading"
          @click="pasteCover"
        >
          粘贴图片
        </button>
        <button
          type="button"
          class="rounded-md bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="uploading"
          @click="pickCover"
        >
          选择文件
        </button>
        <button
          v-if="model.cover"
          type="button"
          class="text-gray-400 hover:text-red-500"
          @click="patch('cover', '')"
        >
          移除
        </button>
        <button
          type="button"
          class="ml-auto text-gray-400 hover:text-orange-500"
          @click="showCoverUrl = !showCoverUrl"
        >
          {{ showCoverUrl ? '收起地址' : '填写图片地址' }}
        </button>
      </div>

      <input
        v-if="showCoverUrl"
        :value="model.cover"
        :class="[inputClass, 'mt-1.5']"
        list="studio-cover-list"
        placeholder="/img/d1.webp 或 https://"
        @input="patch('cover', ($event.target as HTMLInputElement).value)"
      />
      <datalist id="studio-cover-list">
        <option v-for="cover in covers" :key="cover" :value="cover" />
      </datalist>

      <p :class="hintClass">图片会上传到 public/img/covers，并随文章一起提交</p>
      <p v-if="uploadError" class="text-[11px] text-red-500">{{ uploadError }}</p>
    </div>

    <div>
      <div class="flex items-center justify-between">
        <label :class="labelClass">摘要</label>
        <span class="text-[10px]" :class="model.desc.length > 120 ? 'text-amber-500' : 'text-gray-400'">
          {{ model.desc.length }}/120
        </span>
      </div>
      <textarea
        :value="model.desc"
        rows="3"
        :class="[inputClass, 'resize-none']"
        placeholder="显示在首页卡片，留空则自动取正文首行"
        @input="patch('desc', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <div>
      <label :class="labelClass">标签</label>
      <TagInput :model-value="model.tags" :pool="tagPool" @update:model-value="patch('tags', $event)" />
      <p :class="hintClass">回车添加，点击推荐标签可快速复用</p>
    </div>

    <div v-if="issues.length" class="space-y-1 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/60">
      <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">检查结果</p>
      <p
        v-for="issue in issues"
        :key="issue.code + issue.message"
        class="text-[11px]"
        :class="issue.level === 'error' ? 'text-red-500' : 'text-amber-500'"
      >
        {{ issue.level === 'error' ? '需处理' : '提示' }}：{{ issue.message }}
      </p>
    </div>

    <p class="border-t border-gray-200 pt-2 text-[10px] text-gray-400 dark:border-gray-700">
      保存位置：public/content/{{ file }}
    </p>
  </div>
</template>
