<script setup lang="ts">
import { computed, ref } from 'vue'
import ContentNode from './ContentNode.vue'
import type { StudioNode } from '@/studio/types'

const props = defineProps<{
  tree: StudioNode[]
  drafts: StudioNode[]
  activeFile?: string
}>()

const emit = defineEmits<{
  (e: 'open', node: StudioNode): void
  (e: 'new-post', draft: boolean): void
  (e: 'upload-attachment'): void
  (e: 'refresh'): void
}>()

const keyword = ref('')

function filterNodes(nodes: StudioNode[], kw: string): StudioNode[] {
  if (!kw) return nodes
  const result: StudioNode[] = []
  for (const node of nodes) {
    const matched = node.name.toLowerCase().includes(kw) || (node.file || '').toLowerCase().includes(kw)
    if (node.type === 'folder') {
      const children = filterNodes(node.children || [], kw)
      if (matched) result.push(node)
      else if (children.length) result.push({ ...node, children })
    } else if (matched) {
      result.push(node)
    }
  }
  return result
}

function countPosts(nodes: StudioNode[]): number {
  let total = 0
  for (const node of nodes) {
    if (node.type === 'folder') total += countPosts(node.children || [])
    else total++
  }
  return total
}

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
const filteredTree = computed(() => filterNodes(props.tree, normalizedKeyword.value))
const filteredDrafts = computed(() => filterNodes(props.drafts, normalizedKeyword.value))
const totalPosts = computed(() => countPosts(props.tree))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="space-y-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-gray-700 dark:text-gray-200">我的文章</span>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-gray-400">{{ totalPosts }} 篇</span>
          <button
            type="button"
            class="rounded px-1.5 py-0.5 text-[11px] text-gray-500 hover:bg-gray-100 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-800"
            @click="emit('refresh')"
          >
            刷新
          </button>
        </div>
      </div>
      <div class="relative">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索文章名"
          class="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-6 text-[11px] outline-none focus:border-orange-400 dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          v-if="keyword"
          type="button"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
          @click="keyword = ''"
        >
          ×
        </button>
      </div>
    </div>

    <div class="toc-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2" data-lenis-prevent>
      <ContentNode
        v-for="node in filteredTree"
        :key="node.file || node.dir || node.name"
        :node="node"
        :active-file="activeFile"
        :searching="!!normalizedKeyword"
        @open="emit('open', $event)"
      />
      <p v-if="normalizedKeyword && !filteredTree.length" class="px-2 py-3 text-center text-[11px] text-gray-400">
        没有匹配的文章
      </p>

      <div class="mt-3 border-t border-dashed border-gray-200 pt-2 dark:border-gray-700">
        <div class="mb-1 flex items-center justify-between px-2">
          <span class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">草稿箱</span>
          <span class="text-[10px] text-gray-400">{{ filteredDrafts.length }}</span>
        </div>
        <p class="mb-1 px-2 text-[10px] text-gray-400">草稿不会出现在网站上</p>
        <ContentNode
          v-for="node in filteredDrafts"
          :key="node.file || node.dir || node.name"
          :node="node"
          :active-file="activeFile"
          :searching="!!normalizedKeyword"
          @open="emit('open', $event)"
        />
        <p v-if="!filteredDrafts.length" class="px-2 py-1 text-[11px] text-gray-400">
          {{ normalizedKeyword ? '没有匹配的草稿' : '暂无草稿' }}
        </p>
      </div>
    </div>

    <div class="space-y-1.5 border-t border-gray-200 p-2 dark:border-gray-700">
      <button
        type="button"
        class="w-full rounded-lg bg-orange-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-orange-700"
        @click="emit('new-post', false)"
      >
        写新文章
      </button>
      <div class="flex gap-1.5">
        <button
          type="button"
          class="flex-1 rounded-lg bg-gray-100 px-2 py-1.5 text-[11px] text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="emit('new-post', true)"
        >
          存草稿
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg bg-gray-100 px-2 py-1.5 text-[11px] text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="emit('upload-attachment')"
        >
          传附件
        </button>
      </div>
    </div>
  </div>
</template>
