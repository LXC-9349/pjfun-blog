<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TagCount } from '@/studio/types'

const props = defineProps<{
  modelValue: string[]
  pool?: TagCount[]
  placeholder?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const input = ref('')

const suggestions = computed(() =>
  (props.pool || [])
    .filter(tag => !props.modelValue.includes(tag.name))
    .slice(0, 8)
)

function addTag(raw?: string) {
  const value = (raw ?? input.value).trim()
  input.value = ''
  if (!value || props.modelValue.includes(value)) return
  emit('update:modelValue', [...props.modelValue, value])
}

function onEnter(event: KeyboardEvent) {
  // 输入法组合期间的回车用于确认候选词，不能当作新增标签
  if (event.isComposing || event.keyCode === 229) return
  event.preventDefault()
  addTag()
}

function removeTag(tag: string) {
  emit('update:modelValue', props.modelValue.filter(item => item !== tag))
}
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-1.5 mb-1.5">
      <span
        v-for="tag in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 text-[11px] text-orange-700 dark:text-orange-200"
      >
        {{ tag }}
        <button type="button" class="text-orange-400 hover:text-orange-600" @click="removeTag(tag)">×</button>
      </span>
    </div>

    <input
      v-model="input"
      type="text"
      :placeholder="placeholder || '输入标签后回车'"
      class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-xs outline-none focus:border-orange-400"
      @keydown.enter="onEnter"
    />

    <div v-if="suggestions.length" class="mt-1.5 flex flex-wrap gap-1">
      <button
        v-for="tag in suggestions"
        :key="tag.name"
        type="button"
        class="rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-[11px] text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-600"
        @click="addTag(tag.name)"
      >
        {{ tag.name }} · {{ tag.count }}
      </button>
    </div>
  </div>
</template>
