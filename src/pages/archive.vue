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
            {{ t('archiveTitle') }}
          </h1>
        </div>

        <div class="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <!-- 移动端语言切换：图标按钮，避免挤出 header -->
          <button @click="toggleLanguage" class="flex sm:hidden items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" :aria-label="currentLang === 'zh' ? t('switchLanguageToEn') : t('switchLanguageToZh')" :title="currentLang === 'zh' ? t('switchLanguageToEn') : t('switchLanguageToZh')">
            {{ currentLang === 'zh' ? 'EN' : '中' }}
          </button>
          <button @click="toggleLanguage" class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <IconCarbonLanguage class="w-4 h-4" />
            {{ currentLang === 'zh' ? t('switchLanguageToEn') : t('switchLanguageToZh') }}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <h2 class="text-lg sm:text-2xl font-bold dark:text-white">{{ t('archiveTitle') }}</h2>

          <!-- 搜索框：移动端字号 >=16px，避免 iOS 聚焦时自动放大页面 -->
          <div class="relative w-full md:w-64">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('searchPlaceholder')"
              class="w-full py-2 px-3 sm:px-4 pr-10 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base sm:text-sm dark:text-gray-100"
            />
            <IconCarbonSearch class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 pointer-events-none" />
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex flex-wrap items-center gap-x-4 gap-y-2">
          <div class="flex items-center text-xs sm:text-sm">
            <IconCarbonDocument class="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span class="dark:text-gray-300">{{ t('totalArticles') }}: <span class="font-bold">{{ filteredPosts.length }}</span></span>
          </div>
          <div class="flex items-center text-xs sm:text-sm">
            <IconCarbonCalendar class="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-1.5 sm:mr-2 flex-shrink-0" />
            <span class="dark:text-gray-300">{{ t('timeRange') }}: <span class="font-bold">{{ yearRange }}</span></span>
          </div>
        </div>

        <!-- 年份快速跳转：跟随搜索结果，横向滚动不显示滚动条 -->
        <div v-if="filteredGroupedPosts.length > 0" class="mb-4 sm:mb-6 overflow-x-auto scrollbar-hide" data-lenis-prevent>
          <div class="flex space-x-2 pb-2 w-max">
            <button
              v-for="yearGroup in filteredGroupedPosts"
              :key="yearGroup.year"
              @click="scrollToYear(yearGroup.year)"
              class="px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              {{ yearGroup.year }} ({{ yearGroup.count }})
            </button>
          </div>
        </div>

        <!-- 加载骨架：弱网下不先闪一次"暂无文章" -->
        <div v-if="loading" class="space-y-5" aria-busy="true">
          <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div class="space-y-2 pl-4 ml-2 border-l-2 border-orange-100 dark:border-orange-900/40">
              <div class="h-14 bg-gray-100 dark:bg-gray-700/60 rounded-xl"></div>
              <div class="h-14 bg-gray-100 dark:bg-gray-700/60 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- 归档列表 - 时间线风格 -->
        <div v-else-if="filteredGroupedPosts.length > 0" class="space-y-8 sm:space-y-10">
          <div
            v-for="yearGroup in filteredGroupedPosts"
            :key="yearGroup.year"
            class="year-section relative"
            :id="`year-${yearGroup.year}`"
          >
            <!-- 年份标题 -->
            <div class="flex items-center gap-2.5 sm:gap-4 mb-4 sm:mb-6">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                {{ yearGroup.year.slice(-2) }}
              </div>
              <h3 class="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {{ yearGroup.year }}
                <span class="text-sm sm:text-base font-normal text-gray-400 dark:text-gray-500 ml-1 sm:ml-2">({{ yearGroup.count }})</span>
              </h3>
            </div>

            <!-- 时间线：移动端收窄缩进，避免把标题挤成竖排 -->
            <div class="timeline relative pl-4 sm:pl-8 border-l-2 border-orange-200 dark:border-orange-900/50 ml-2 sm:ml-5">
              <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="relative mb-4 sm:mb-6">
                <!-- 月份圆点 -->
                <div class="month-dot absolute top-1 w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-400 border-2 border-white dark:border-gray-800 shadow-sm"></div>
                <h4 class="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                  {{ formatMonth(monthGroup.month) }}
                  <span class="text-xs text-gray-500 dark:text-gray-500 ml-1">({{ monthGroup.count }})</span>
                </h4>

                <!-- 文章列表 -->
                <div class="space-y-1.5 sm:space-y-2">
                  <div v-for="post in monthGroup.posts" :key="post.path" class="group">
                    <router-link
                      :to="post.path"
                      class="block py-2.5 px-2 sm:py-3 sm:px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
                    >
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                        <div class="flex-1 min-w-0">
                          <h5 class="font-medium text-sm sm:text-base text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors break-words">
                            <span v-if="post.sticky" class="inline-block align-middle text-[10px] px-1.5 py-0.5 mr-1.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold">{{ t('top') }}</span>{{ post.title }}
                          </h5>
                          <p v-if="post.excerpt" class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {{ post.excerpt }}
                          </p>
                          <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-1.5 mt-1.5 sm:mt-2">
                            <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              #{{ tag }}
                            </span>
                          </div>
                          <!-- 移动端：日期移到内容下方，不再与标题抢宽度 -->
                          <span class="block sm:hidden text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 font-mono">
                            {{ formatDate(post.date) }}
                          </span>
                        </div>
                        <span class="hidden sm:block text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0 mt-1 font-mono">
                          {{ formatDate(post.date) }}
                        </span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-10 sm:py-12">
          <IconCarbonDocumentBlank class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 dark:text-gray-500" />
          <p class="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {{ t('noArchivedArticles') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <Transition name="slide-up-fade">
      <button
        v-if="showBackTop"
        @click="scrollToTop"
        class="scroll-top-btn"
        :aria-label="t('backToTop')"
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { t, getLanguage } from '@/utils/i18n'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { SITE_CONFIG, MONTH_NAMES, STORAGE_KEYS } from '@/constants'
import {fetchWithFallback, formatDate, getEnvVariable} from '@/utils/tool'
import { matchesPostQuery } from '@/utils/post-search'
import { lenis } from '@/main'

const router = useRouter()
const allPosts = ref<any[]>([])
const currentLang = ref(getLanguage())
const searchQuery = ref('')
const showBackTop = ref(false)
const headerScrolled = ref(false)
const loading = ref(true)

// 过滤后的文章
const filteredPosts = computed(() => {
  if (!searchQuery.value) return allPosts.value
  return allPosts.value.filter(post => matchesPostQuery(post, searchQuery.value))
})

// 年份范围跟随当前搜索结果，避免"总数 1 篇、范围 2025 - 2026"这类矛盾展示
const yearRange = computed(() => {
  const years = filteredPosts.value
    .filter(post => post.date)
    .map(post => new Date(post.date).getFullYear())
    .filter(year => !Number.isNaN(year))
  if (years.length === 0) return '—'
  const min = Math.min(...years)
  const max = Math.max(...years)
  return min === max ? String(min) : `${min} - ${max}`
})

interface TimelineMonth {
  month: string
  count: number
  posts: any[]
}

interface TimelineYear {
  year: string
  count: number
  months: TimelineMonth[]
}

// 按年月分组，统一按时间倒序：新年份 → 新月份 → 新文章
// 必须用数组 / Map 保存顺序：普通对象里 "2025"、"12" 这类纯数字键属于
// integer-index keys，JS 会强制按数值升序枚举，显式 sort 根本不生效
const buildTimeline = (posts: any[]): TimelineYear[] => {
  const byYear = new Map<string, Map<string, any[]>>()

  posts.forEach(post => {
    if (!post.date) return
    const date = new Date(post.date)
    if (Number.isNaN(date.getTime())) {
      console.warn('Invalid date for post:', post.title, post.date)
      return
    }
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    if (!byYear.has(year)) byYear.set(year, new Map())
    const months = byYear.get(year)!
    if (!months.has(month)) months.set(month, [])
    months.get(month)!.push(post)
  })

  return [...byYear.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, months]) => {
      const monthList: TimelineMonth[] = [...months.entries()]
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([month, list]) => ({
          month,
          count: list.length,
          posts: [...list].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        }))
      return {
        year,
        count: monthList.reduce((sum, m) => sum + m.count, 0),
        months: monthList
      }
    })
}

// 分组基于当前搜索结果，年份跳转也只列出结果里真实存在的年份
const filteredGroupedPosts = computed(() => buildTimeline(filteredPosts.value))

const formatMonth = (month: string | number) => {
  const monthNames = currentLang.value === 'zh' ? MONTH_NAMES.zh : MONTH_NAMES.en

  const monthIndex = (typeof month==='string'?parseInt(month): month) - 1
  return monthNames[monthIndex] || month
}

const toggleLanguage = () => {
  const newLang = currentLang.value === 'zh' ? 'en' : 'zh'
  currentLang.value = newLang
  localStorage.setItem(STORAGE_KEYS.language, newLang)
  location.reload()
}

// 移动端常从底部导航直接进入归档页，此时没有上一页历史，返回需回首页
const goBack = () => {
  if (window.history.length > 1 && window.history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}

// 统一走 Lenis，避免与全局平滑滚动打架；offset 留出 sticky header 的高度
const scrollToYear = (year: string) => {
  const element = document.getElementById(`year-${year}`)
  if (element) {
    lenis.scrollTo(element, { offset: -72, duration: 1.2 })
  }
}

const scrollToTop = () => {
  lenis.scrollTo(0, { duration: 1.2 })
}

// 处理滚动事件
const handleScroll = () => {
  showBackTop.value = window.scrollY > 300
  headerScrolled.value = window.scrollY > 20
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  try {
    const navName = getEnvVariable('PJ_BLOG_NAV_NAME')
    const base=getEnvVariable('VITE_BASE')||'/'
    const res = await fetchWithFallback([`${base}generated/${navName}`,`${base}generated/nav.json`],'导航数据')
    const posts = await res.json()

    // 按日期排序
    allPosts.value = [...posts].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  } catch (err) {
    console.error('加载归档失败:', err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 移动端为底部导航栏 + 刘海安全区留白，桌面端还原（避免内联样式覆盖 lg:pb-0） */
.page-shell {
  padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px));
}
@media (min-width: 1024px) {
  .page-shell { padding-bottom: 0; }
}

/* 月份圆点对齐时间线竖线：移动端 pl-4(16px) / 桌面 pl-8(32px) */
.month-dot { left: -23px; }
@media (min-width: 640px) {
  .month-dot { left: -37px; }
}

/* 年份锚点不被 sticky header 遮住 */
.year-section { scroll-margin-top: 4.5rem; }

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-up-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
