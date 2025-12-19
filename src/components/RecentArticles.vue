<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
    <div class="flex justify-between items-center mb-5">
      <h3 class="text-lg font-bold flex items-center gap-2 dark:text-white">
        <IconCarbonRecentlyViewed class="w-5 h-5 text-blue-500" />
        {{ t('recentlyViewed') }}
      </h3>
      <button 
        v-if="recentArticles.length > 0"
        @click="clearRecent"
        class="text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
      >
        {{ t('clearRecent') }}
      </button>
    </div>
    
    <div v-if="recentArticles.length === 0" class="text-center py-8">
      <IconCarbonDocumentBlank class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" />
      <p class="mt-3 text-gray-500 dark:text-gray-400 text-sm">
        {{ t('noRecentArticles') }}
      </p>
    </div>
    
    <div v-else class="space-y-4">
      <router-link
        v-for="article in recentArticles"
        :key="article.path"
        :to="article.path"
        class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
      >
        <div v-if="article.cover" class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
          <img 
            :src="article.cover" 
            :alt="article.title"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors text-sm">
            {{ article.title }}
          </h4>
          <p v-if="article.excerpt" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {{ article.excerpt }}
          </p>
          <div class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="tag in (article.tags || []).slice(0, 2)"
              :key="tag"
              class="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-gray-800 dark:text-blue-300"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRecentArticles, clearRecentArticles } from '@/utils/reading-progress'
import { t } from '@/utils/i18n'

const recentArticles = ref<any[]>([])

const loadRecentArticles = () => {
  try {
    recentArticles.value = getRecentArticles()
  } catch (error) {
    console.error('Failed to load recent articles:', error)
    recentArticles.value = []
  }
}

const clearRecent = () => {
  clearRecentArticles()
  loadRecentArticles()
}

onMounted(() => {
  loadRecentArticles()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>