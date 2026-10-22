<script setup lang="ts">
import { ref } from 'vue'
import type { StudioNode } from '@/studio/types'

const props = withDefaults(
  defineProps<{
    node: StudioNode
    activeFile?: string
    depth?: number
    searching?: boolean
  }>(),
  { depth: 0, searching: false }
)

const emit = defineEmits<{ (e: 'open', node: StudioNode): void }>()

const expanded = ref(props.depth < 2)
const indent = () => `${props.depth * 12 + 8}px`
</script>

<template>
  <div>
    <button
      v-if="node.type === 'folder'"
      type="button"
      class="flex w-full items-center gap-1 rounded-md py-1 pr-2 text-left text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      :style="{ paddingLeft: indent() }"
      @click="expanded = !expanded"
    >
      <span class="w-3 shrink-0 text-[10px] text-gray-400">{{ expanded || searching ? '▾' : '▸' }}</span>
      <span class="truncate font-medium">{{ node.name }}</span>
      <span class="ml-auto text-[10px] text-gray-400">{{ node.children?.length || 0 }}</span>
    </button>

    <template v-else>
      <button
        type="button"
        class="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-xs transition-colors"
        :class="
          activeFile === node.file
            ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        "
        :style="{ paddingLeft: indent() }"
        @click="emit('open', node)"
      >
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
        <span class="truncate">{{ node.name }}</span>
        <span
          v-if="node.extension && node.extension !== 'md'"
          class="ml-auto shrink-0 rounded bg-gray-100 dark:bg-gray-700 px-1 text-[10px] uppercase text-gray-500 dark:text-gray-300"
        >
          {{ node.extension }}
        </span>
      </button>
    </template>

    <div v-if="node.type === 'folder' && (expanded || searching) && node.children?.length">
      <ContentNode
        v-for="child in node.children"
        :key="child.file || child.dir || child.name"
        :node="child"
        :active-file="activeFile"
        :depth="depth + 1"
        :searching="searching"
        @open="emit('open', $event)"
      />
    </div>
  </div>
</template>
