<!-- src/components/nav-tree.vue -->
<script setup lang="ts">
defineProps<{
  tree: any
  level?: number
}>()
</script>

<template>
  <nav class="nav-tree">
    <template v-for="item in tree.children" :key="item.path">
      <!-- 文件夹 -->
      <details v-if="item.type === 'folder'" class="nav-folder">
        <summary 
          class="nav-folder-summary"
          :title="item.title"
        >
          <IconCarbonChevronRight class="chevron-icon" />
          <IconCarbonFolder class="folder-icon closed" />
          <IconCarbonFolderOpen class="folder-icon open" />
          <span class="folder-title truncate">{{ item.title }}</span>
          <span class="folder-count">{{ item.children?.length || 0 }}</span>
        </summary>

        <!-- 子菜单缩进 -->
        <div class="folder-children">
          <NavTree :tree="item" :level="(level || 0) + 1" />
        </div>
      </details>

      <!-- 单篇文章 -->
      <router-link
          v-else
          :to="item.path"
          class="nav-item"
          active-class="nav-item-active"
          :title="item.title"
      >
        <IconCarbonDocument class="nav-item-icon" />
        <span class="nav-item-title truncate">{{ item.title }}</span>
      </router-link>
    </template>
  </nav>
</template>

<style scoped>
.nav-tree {
  @apply space-y-0.5;
}

.nav-folder {
  @apply rounded-sm overflow-hidden;
}

.nav-folder-summary {
  @apply flex items-center gap-2 py-1.5 px-2 rounded-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 list-none select-none;
}

.nav-folder-summary::-webkit-details-marker {
  display: none;
}

.nav-folder[open] > .nav-folder-summary {
  @apply bg-gray-100 dark:bg-gray-700;
}

.chevron-icon {
  @apply w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0;
}

.nav-folder[open] .chevron-icon {
  @apply rotate-90;
}

.folder-icon {
  @apply w-3.5 h-3.5 text-blue-500 flex-shrink-0;
}

.folder-icon.closed {
  @apply dark:text-blue-400;
}

.folder-icon.open {
  @apply dark:text-blue-400;
}

.closed {
  @apply block;
}

.open {
  @apply hidden;
}

.nav-folder[open] .closed {
  @apply hidden;
}

.nav-folder[open] .open {
  @apply block;
}

.folder-title {
  @apply flex-grow text-sm font-medium text-gray-800 dark:text-gray-200;
}

.folder-count {
  @apply flex-shrink-0 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full w-5 h-5 flex items-center justify-center;
}

.folder-children {
  @apply ml-3 pl-2 border-l border-gray-200 dark:border-gray-600 space-y-0.5 mt-0.5;
}

.nav-item {
  @apply flex items-center gap-2 py-1.5 px-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 text-sm;
}

.nav-item-active {
  @apply bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-medium;
}

.nav-item-icon {
  @apply w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0;
}

.nav-item-active .nav-item-icon {
  @apply text-blue-500;
}

.nav-item-title {
  @apply text-gray-700 dark:text-gray-300;
}

.nav-item-active .nav-item-title {
  @apply text-blue-600 dark:text-blue-300;
}

.truncate {
  @apply whitespace-nowrap overflow-hidden text-ellipsis;
}
</style>