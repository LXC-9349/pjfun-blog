<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Header -->
    <header class="py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <router-link 
            to="/" 
            class="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <span class="text-white font-bold text-lg">{{ SITE_CONFIG.icon }}</span>
          </router-link>
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {{ t('favoritesTitle') }}
          </h1>
        </div>

        <div class="flex items-center space-x-4">
          <button @click="toggleLanguage" class="hidden bg-white dark:text-gray-300 sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <IconCarbonLanguage class="w-4 h-4" />
            {{ currentLang === 'zh' ? 'EN' : '中文' }}
          </button>
          <ThemeToggle />
          <button @click="toggleMobileMenu" class="lg:hidden dark:text-gray-300 p-2 rounded-lg border border-gray-300 dark:border-gray-600">
            <IconCarbonMenu class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('yourFavorites') }}
          <span class="text-blue-600">({{ favorites.length }})</span>
        </h2>
        <button 
          v-if="favorites.length > 0" 
          @click="clearAllFavorites"
          class="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          {{ t('clearAll') }}
        </button>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div class="p-6 space-y-4">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收藏列表 -->
      <div v-else-if="favorites.length > 0" class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(fav, i) in favorites"
          :key="fav.path"
          class="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: i * 60, duration: 600 } }"
        >
          <router-link :to="fav.path" class="flex flex-col h-full">
            <div class="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                v-if="fav.cover"
                :src="fav.cover"
                :alt="fav.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              >
              <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                <div class="text-white/90 text-3xl font-bold">
                  {{ fav.title?.substring(0, 2) || '博客' }}
                </div>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <h2 class="absolute bottom-4 left-5 right-5 text-xl font-bold text-white line-clamp-2">
                {{ fav.title }}
              </h2>
              
              <!-- 取消收藏按钮 -->
              <button 
                @click.prevent="removeFavorite(fav.path)"
                class="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur rounded-full text-white transition-colors"
                :aria-label="t('removeFromFavorites')"
              >
                <IconCarbonClose class="w-4 h-4" />
              </button>
            </div>

            <div class="p-6 flex flex-col flex-1">
              <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 flex-1">
                {{ fav.excerpt || t('noExcerpt') }}
              </p>

              <div class="flex flex-wrap gap-2 mt-4">
                <span
                  v-for="tag in (fav.tags || []).slice(0, 3)"
                  :key="tag"
                  class="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-gray-800 dark:text-blue-300"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="flex justify-between items-center mt-6 text-xs text-gray-500 dark:text-gray-400">
                <time class="flex items-center">
                  <IconCarbonTime class="w-4 h-4 mr-1" />
                  {{ formatDate(fav.date) }}
                </time>
                <span class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-all duration-300">
                  {{ t('readMore') }}
                  <IconCarbonArrowRight class="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </router-link>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-20">
        <IconCarbonStar class="w-20 h-20 mx-auto text-gray-400" />
        <h3 class="mt-4 text-xl font-medium text-gray-900 dark:text-white">{{ t('noFavorites') }}</h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ t('noFavoritesDesc') }}</p>
        <router-link 
          to="/" 
          class="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <IconCarbonArrowLeft class="w-5 h-5 mr-2" />
          {{ t('browseArticles') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFavorites, removeFavorite as removeFavoriteUtil } from '@/utils/favorites'
import { t, getLanguage } from '@/utils/i18n'
import { SITE_CONFIG } from '@/constants'
import {confirmDialog, formatDate} from "@/utils/tool";

const favorites = ref<any[]>([])
const loading = ref(true)
const currentLang = ref(getLanguage())

const loadFavorites = () => {
  try {
    favorites.value = getFavorites()
  } catch (error) {
    console.error('Failed to load favorites:', error)
    favorites.value = []
  } finally {
    loading.value = false
  }
}

const removeFavorite = (path: string) => {
  removeFavoriteUtil(path)
  loadFavorites() // 重新加载收藏列表
}

const clearAllFavorites = () => {
  confirmDialog('',t('confirmClearAll')).then(b=>{
    if (b) {
      localStorage.removeItem('pjfun_blog_favorites')
      loadFavorites()
    }
  });
}

const toggleLanguage = () => {
  const newLang = currentLang.value === 'zh' ? 'en' : 'zh'
  currentLang.value = newLang
  localStorage.setItem('language', newLang)
  location.reload()
}

const toggleMobileMenu = () => {
  // 这里可以添加移动菜单逻辑，如果需要的话
}

onMounted(() => {
  loadFavorites()
})
</script>