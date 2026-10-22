<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { isValidSlug, slugifyTitle } from '@/utils/slug'

const props = defineProps<{
  open: boolean
  folders: string[]
  defaultDraft?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: { dir: string; slug: string; title: string; draft: boolean }): void
}>()

const title = ref('')
const titleInput = ref<HTMLInputElement | null>(null)
const slug = ref('')
const dir = ref('')
const draft = ref(false)
const slugTouched = ref(false)
const error = ref('')

watch(
  () => props.open,
  open => {
    if (!open) return
    title.value = ''
    slug.value = ''
    dir.value = ''
    draft.value = Boolean(props.defaultDraft)
    slugTouched.value = false
    error.value = ''
    void nextTick(() => titleInput.value?.focus())
  }
)

watch(title, value => {
  if (!slugTouched.value) slug.value = slugifyTitle(value)
})

function onSlugInput(event: Event) {
  slugTouched.value = true
  slug.value = (event.target as HTMLInputElement).value
}

function submit() {
  if (!title.value.trim()) {
    error.value = '请填写标题'
    return
  }
  if (!isValidSlug(slug.value)) {
    error.value = 'slug 只能包含小写字母、数字与连字符（可点击“重新生成”）'
    return
  }
  emit('submit', {
    dir: dir.value.trim(),
    slug: slug.value,
    title: title.value.trim(),
    draft: draft.value
  })
}

function regenerateSlug() {
  slugTouched.value = false
  slug.value = slugifyTitle(title.value)
}

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
      <h2 class="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-100">新建文章</h2>

      <div class="space-y-3">
        <div>
          <label class="mb-1 block text-[11px] text-gray-500 dark:text-gray-400">标题</label>
          <input
            ref="titleInput"
            v-model="title"
            :class="inputClass"
            placeholder="比如：Vue 3 组合式 API 实战"
            @keydown.enter.prevent="submit"
          />
        </div>

        <div v-if="!draft">
          <label class="mb-1 block text-[11px] text-gray-500 dark:text-gray-400">保存到分类</label>
          <input v-model="dir" :class="inputClass" list="studio-new-dirs" placeholder="留空放在根目录，如 前端开发" />
          <datalist id="studio-new-dirs">
            <option v-for="folder in folders" :key="folder" :value="folder" />
          </datalist>
          <p class="mt-1 text-[10px] text-gray-400">可以输入新目录，会自动创建；一般写到二级即可</p>
        </div>

        <details class="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/60">
          <summary class="cursor-pointer text-[11px] text-gray-500 dark:text-gray-400">高级设置：文件名与网址</summary>
          <div class="mt-2">
            <div class="flex items-center justify-between">
              <label class="mb-1 block text-[11px] text-gray-400">slug</label>
              <button type="button" class="text-[10px] text-gray-400 hover:text-orange-500" @click="regenerateSlug">
                重新生成
              </button>
            </div>
            <input :value="slug" :class="inputClass" placeholder="vue3-composition-api" @input="onSlugInput" />
            <p class="mt-1 text-[10px] text-gray-400">文章网址：/分类/{{ slug || 'slug' }}，建议保持英文短横线</p>
          </div>
        </details>

        <label class="flex cursor-pointer items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <input v-model="draft" type="checkbox" class="accent-orange-600" />
          先存为草稿（不会出现在网站上）
        </label>

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
          开始写作
        </button>
      </div>
    </div>
  </div>
</template>
