<template>
  <div class="page-shell min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header
        :class="[
          'sticky-header',
          headerScrolled ? 'py-2 shadow-lg' : 'py-1 sm:py-2'
        ]"
    >
      <div class="max-w-7xl mx-auto flex justify-between items-center gap-2">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <button @click="goBack" class="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" :aria-label="t('back')" :title="t('back')">
            <IconCarbonArrowLeft class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 class="text-base sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent truncate">
            {{ t('favoritesTitle') }}
          </h1>
        </div>

        <div class="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <!-- 移动端语言切换 -->
          <button @click="toggleLanguage" class="flex sm:hidden items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" :aria-label="currentLang === 'zh' ? t('switchLanguageToEn') : t('switchLanguageToZh')" :title="currentLang === 'zh' ? t('switchLanguageToEn') : t('switchLanguageToZh')">
            {{ currentLang === 'zh' ? 'EN' : '中' }}
          </button>
          <button @click="toggleLanguage" class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <IconCarbonLanguage class="w-4 h-4" />
            {{ currentLang === 'zh' ? t('switchLanguageToEn') : t('switchLanguageToZh') }}
          </button>
          <ThemeToggle />
          <button @click="toggleMobileMenu" class="lg:hidden glass-nav-btn" :aria-label="t('navigation')" :title="t('navigation')" :aria-expanded="isMobileMenuOpen">
            <IconCarbonMenu class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- 移动端抽屉：层级高于底部导航，内部独立滚动 -->
      <aside :class="[
        'fixed inset-y-0 left-0 z-[60] w-4/5 max-w-xs bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out-back lg:hidden',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]" data-lenis-prevent :aria-hidden="!isMobileMenuOpen">
        <div class="min-h-full flex flex-col p-4 sm:p-6 pb-24">
          <div class="flex-shrink-0 flex justify-between items-center mb-6">
            <h2 class="text-lg font-bold dark:text-white">{{ t('navigation') }}</h2>
            <button @click="toggleMobileMenu" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" :aria-label="t('close')" :title="t('close')">
              <IconCarbonClose class="w-5 h-5" />
            </button>
          </div>
          <nav class="flex-1 space-y-2">
            <router-link to="/" @click="toggleMobileMenu" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-white">
              <IconCarbonHome class="w-5 h-5 text-orange-500" />
              {{ t('home') }}
            </router-link>
            <router-link to="/archive" @click="toggleMobileMenu" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-white">
              <IconCarbonArchive class="w-5 h-5 text-orange-500" />
              {{ t('archive') }}
            </router-link>
            <router-link to="/favorites" @click="toggleMobileMenu" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-white">
              <IconCarbonStar class="w-5 h-5 text-orange-500" />
              {{ t('favorites') }}
            </router-link>
          </nav>
        </div>
      </aside>
      <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black/50 z-[55] lg:hidden animate-fade-in" @click="toggleMobileMenu"></div>
      <!-- 主内容 -->
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-8">
        <h2 class="text-lg sm:text-2xl font-bold dark:text-white">
          {{ t('yourFavorites') }}
          <span class="text-orange-600">({{ favorites.length }})</span>
        </h2>
        <button
          v-if="favorites.length > 0"
          @click="clearAllFavorites"
          class="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
        >
          {{ t('clearAll') }}
        </button>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div class="h-36 sm:h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div class="p-4 sm:p-6 space-y-4">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收藏列表 -->
      <div v-else-if="favorites.length > 0" class="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(fav, i) in favorites"
          :key="fav.path"
          class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: Math.min(i, 6) * 60, duration: 600 } }"
        >
          <!-- 取消收藏按钮独立于链接，避免 a 内嵌 button 在触屏上误触发跳转 -->
          <button
            @click="removeFavorite(fav.path)"
            class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-black/30 hover:bg-black/50 backdrop-blur rounded-full text-white transition-colors cursor-pointer"
            :aria-label="t('removeFromFavorites')"
            :title="t('removeFromFavorites')"
          >
            <IconCarbonClose class="w-4 h-4" />
          </button>

          <router-link :to="fav.path" class="flex flex-col h-full">
            <div class="fav-cover relative overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                v-if="fav.cover"
                :src="fav.cover"
                :alt="fav.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              >
              <div v-else class="w-full h-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <div class="text-white/80 text-xl sm:text-3xl font-bold">
                  {{ fav.title?.substring(0, 2) || t('siteFallbackInitial') }}
                </div>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <h2 class="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5 text-base sm:text-xl font-bold text-white line-clamp-2">
                {{ fav.title }}
              </h2>
            </div>

            <div class="p-4 sm:p-6 flex flex-col flex-1">
              <!-- 摘要包在普通块级容器里，避免作为 flex item 时多行截断失效 -->
              <div class="flex-1 min-w-0">
                <p class="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {{ fav.excerpt || t('noExcerpt') }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2 mt-3 sm:mt-4">
                <span
                  v-for="tag in (fav.tags || []).slice(0, 3)"
                  :key="tag"
                  class="px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs rounded-full bg-orange-100 dark:bg-orange-900/40 text-gray-800 dark:text-orange-300"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="flex justify-between items-center gap-2 mt-4 sm:mt-6 text-xs text-gray-500 dark:text-gray-400">
                <time class="flex items-center">
                  <IconCarbonTime class="w-4 h-4 mr-1" />
                  {{ formatDate(fav.date) }}
                </time>
                <span class="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-800 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 rounded-full group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors whitespace-nowrap">
                  {{ t('readMore') }}
                  <IconCarbonArrowRight class="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200" />
                </span>
              </div>
            </div>
          </router-link>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12 sm:py-20 px-2">
        <IconCarbonStar class="w-14 h-14 sm:w-20 sm:h-20 mx-auto text-gray-400" />
        <h3 class="mt-4 text-lg sm:text-xl font-medium dark:text-white">{{ t('noFavorites') }}</h3>
        <p class="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">{{ t('noFavoritesDesc') }}</p>
        <router-link
          to="/"
          class="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl hover:from-orange-700 hover:to-amber-600 transition-all shadow-sm"
        >
          <IconCarbonHome class="w-5 h-5 mr-2" />
          {{ t('browseArticles') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { getFavorites, removeFavorite as removeFavoriteUtil } from '@/utils/favorites'
import { t, getLanguage } from '@/utils/i18n'
import { SITE_CONFIG, STORAGE_KEYS } from '@/constants'
import {confirmDialog, formatDate} from "@/utils/tool";
import { lenis } from '@/main';
import {useRouter} from "vue-router";

const favorites = ref<any[]>([])
const loading = ref(true)
const currentLang = ref(getLanguage())
const headerScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const router = useRouter()

const goBack = () => {
  if (window.history.length > 1 && window.history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}

const handleScroll = () => {
  headerScrolled.value = window.scrollY > 20
}

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
  loadFavorites()
}

const clearAllFavorites = () => {
  confirmDialog('',t('confirmClearAll')).then(b=>{
    if (b) {
      localStorage.removeItem(STORAGE_KEYS.favorites)
      loadFavorites()
    }
  });
}

const toggleLanguage = () => {
  const newLang = currentLang.value === 'zh' ? 'en' : 'zh'
  currentLang.value = newLang
  localStorage.setItem(STORAGE_KEYS.language, newLang)
  location.reload()
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 抽屉打开时锁住背景滚动（Lenis 负责滚轮，html overflow 负责触摸滚动）
const lockBodyScroll = (locked: boolean) => {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (locked) lenis.stop()
  else lenis.start()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) isMobileMenuOpen.value = false
}

watch(isMobileMenuOpen, lockBodyScroll)

onMounted(() => {
  loadFavorites()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  // 防止带打开的抽屉离开页面后全站无法滚动
  if (isMobileMenuOpen.value) lockBodyScroll(false)
})
</script>

<style scoped>
/* 移动端为底部导航栏 + 刘海安全区留白，桌面端还原 */
.page-shell {
  padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));
}
@media (min-width: 1024px) {
  .page-shell { padding-bottom: 0; }
}

/* 移动端封面固定矮一些，一屏能看完整张卡片；桌面恢复 16:9 */
.fav-cover { height: 9rem; }
@media (min-width: 640px) {
  .fav-cover { height: auto; aspect-ratio: 16 / 9; }
}
</style>