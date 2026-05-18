<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pb-0" style="padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));">
    <!-- Header -->
    <header
        :class="[
          'sticky-header',
          headerScrolled ? 'py-2 shadow-lg' : 'py-4'
        ]"
    >
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <button @click="$router.back()" class="mr-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <IconCarbonArrowLeft class="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div class="badge">
            <span class="text-white font-bold text-lg">{{ SITE_CONFIG.icon }}</span>
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {{ t('archiveTitle') }}
          </h1>
        </div>

        <div class="flex items-center space-x-4">
          <button @click="toggleLanguage" class="hidden dark:text-gray-300 sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <IconCarbonLanguage class="w-4 h-4" />
            {{ currentLang === 'zh' ? 'EN' : '中文' }}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 class="text-2xl font-bold dark:text-white">{{ t('archiveTitle') }}</h2>
          
          <!-- 搜索框 -->
          <div class="relative w-full md:w-64">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('searchPlaceholder')"
              class="w-full py-2 px-4 pr-10 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <IconCarbonSearch class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex flex-wrap items-center gap-4">
          <div class="flex items-center text-sm">
            <IconCarbonDocument class="w-5 h-5 text-blue-500 mr-2" />
            <span class="dark:text-gray-300">{{ t('totalArticles') }}: <span class="font-bold">{{ filteredPosts.length }}</span></span>
          </div>
          <div class="flex items-center text-sm">
            <IconCarbonCalendar class="w-5 h-5 text-blue-500 mr-2" />
            <span class="dark:text-gray-300">{{ t('timeRange') }}: <span class="font-bold">{{ oldestYear }} - {{ newestYear }}</span></span>
          </div>
        </div>

        <!-- 年份快速跳转 -->
        <div v-if="Object.keys(groupedPosts).length > 0" class="mb-6 overflow-x-auto">
          <div class="flex space-x-2 pb-2">
            <button 
              v-for="year in Object.keys(groupedPosts)" 
              :key="year"
              @click="scrollToYear(year)"
              class="px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              {{ year }} ({{ groupedPosts[year].count }})
            </button>
          </div>
        </div>

        <!-- 归档列表 - 时间线风格 -->
        <div v-if="Object.keys(filteredGroupedPosts).length > 0" class="space-y-10">
          <div 
            v-for="(yearGroup, year) in filteredGroupedPosts" 
            :key="year" 
            class="year-section relative" 
            :id="`year-${year}`"
          >
            <!-- 年份标题 -->
            <div class="flex items-center gap-4 mb-6">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {{ year.slice(-2) }}
              </div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ year }}
                <span class="text-base font-normal text-gray-400 dark:text-gray-500 ml-2">({{ yearGroup.count }})</span>
              </h3>
            </div>
            
            <!-- 时间线 -->
            <div class="relative pl-8 border-l-2 border-blue-200 dark:border-blue-900/50 ml-5 space-y-0">
              <div v-for="(monthGroup, month) in yearGroup.months" :key="month" class="relative mb-6">
                <!-- 月份圆点 -->
                <div class="absolute -left-[calc(2rem+5px)] top-1 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-gray-800 shadow-sm"></div>
                <h4 class="text-base font-semibold text-gray-600 dark:text-gray-400 mb-3 ml-2">
                  {{ formatMonth(month) }}
                  <span class="text-xs text-gray-500 dark:text-gray-500 ml-1">({{ monthGroup.count }})</span>
                </h4>
                
                <!-- 文章列表 -->
                <div class="space-y-2 ml-2">
                  <div v-for="post in monthGroup.posts" :key="post.path" class="group">
                    <router-link 
                      :to="post.path" 
                      class="block py-3 px-4 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md"
                    >
                      <div class="flex justify-between items-start gap-4">
                        <div class="flex-1 min-w-0">
                          <h5 class="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            <span v-if="post.sticky" class="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold flex-shrink-0">置顶</span>
                            {{ post.title }}
                          </h5>
                          <p v-if="post.excerpt" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {{ post.excerpt }}
                          </p>
                          <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-1.5 mt-2">
                            <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              #{{ tag }}
                            </span>
                          </div>
                        </div>
                        <span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0 mt-1 font-mono">
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
        <div v-else class="text-center py-12">
          <IconCarbonDocumentBlank class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
          <p class="mt-4 text-gray-500 dark:text-gray-400">
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
import { t, getLanguage } from '@/utils/i18n'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { SITE_CONFIG } from '@/constants'
import {fetchWithFallback, formatDate, getEnvVariable} from '@/utils/tool'

const allPosts = ref<any[]>([])
const currentLang = ref(getLanguage())
const searchQuery = ref('')
const showBackTop = ref(false)
const headerScrolled = ref(false)

// 获取年份范围
const oldestYear = computed(() => {
  if (allPosts.value.length === 0) return ''
  const years = allPosts.value
    .filter(post => post.date)
    .map(post => new Date(post.date).getFullYear())
  return years.length ? Math.min(...years) : ''
})

const newestYear = computed(() => {
  if (allPosts.value.length === 0) return ''
  const years = allPosts.value
    .filter(post => post.date)
    .map(post => new Date(post.date).getFullYear())
  return years.length ? Math.max(...years) : ''
})

// 过滤后的文章
const filteredPosts = computed(() => {
  if (!searchQuery.value) return allPosts.value
  
  const query = searchQuery.value.toLowerCase()
  return allPosts.value.filter(post => 
    post.title.toLowerCase().includes(query) || 
    (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
    (post.tags && post.tags.some((tag: string) => tag.toLowerCase().includes(query)))
  )
})

// 按年月分组文章
const groupedPosts = computed(() => {
  const groups: Record<string, any> = {}
  
  allPosts.value.forEach(post => {
    if (!post.date) return
    
    try {
      const date = new Date(post.date)
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      
      if (!groups[year]) {
        groups[year] = {
          count: 0,
          months: {}
        }
      }
      
      if (!groups[year].months[month]) {
        groups[year].months[month] = {
          count: 0,
          posts: []
        }
      }
      
      groups[year].count++
      groups[year].months[month].count++
      groups[year].months[month].posts.push(post)
    } catch (e) {
      console.warn('Invalid date for post:', post.title, post.date)
    }
  })
  
  // 按年份降序排列
  const sortedGroups: Record<string, any> = {}
  Object.keys(groups)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .forEach(year => {
      const yearGroup = groups[year]
      
      // 按月份降序排列
      const sortedMonths: Record<string, any> = {}
      Object.keys(yearGroup.months)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .forEach(month => {
          sortedMonths[month] = yearGroup.months[month]
        })
      
      sortedGroups[year] = {
        ...yearGroup,
        months: sortedMonths
      }
    })
  
  return sortedGroups
})

// 过滤后的分组文章
const filteredGroupedPosts = computed(() => {
  if (!searchQuery.value) return groupedPosts.value
  
  const groups: Record<string, any> = {}
  const filtered = filteredPosts.value
  
  filtered.forEach(post => {
    if (!post.date) return
    
    try {
      const date = new Date(post.date)
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      
      if (!groups[year]) {
        groups[year] = {
          count: 0,
          months: {}
        }
      }
      
      if (!groups[year].months[month]) {
        groups[year].months[month] = {
          count: 0,
          posts: []
        }
      }
      
      groups[year].count++
      groups[year].months[month].count++
      groups[year].months[month].posts.push(post)
    } catch (e) {
      console.warn('Invalid date for post:', post.title, post.date)
    }
  })
  
  // 按年份降序排列
  const sortedGroups: Record<string, any> = {}
  Object.keys(groups)
    .sort((a, b) => parseInt(b) - parseInt(a))
    .forEach(year => {
      const yearGroup = groups[year]
      
      // 按月份降序排列
      const sortedMonths: Record<string, any> = {}
      Object.keys(yearGroup.months)
        .sort((a, b) => parseInt(b) - parseInt(a))
        .forEach(month => {
          sortedMonths[month] = yearGroup.months[month]
        })
      
      sortedGroups[year] = {
        ...yearGroup,
        months: sortedMonths
      }
    })
  
  return sortedGroups
})

const formatMonth = (month: string | number) => {
  const monthNames = currentLang.value === 'zh' 
    ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const monthIndex = (typeof month==='string'?parseInt(month): month) - 1
  return monthNames[monthIndex] || month
}

const toggleLanguage = () => {
  const newLang = currentLang.value === 'zh' ? 'en' : 'zh'
  currentLang.value = newLang
  localStorage.setItem('language', newLang)
  location.reload()
}

// 滚动到指定年份
const scrollToYear = (year: string) => {
  const element = document.getElementById(`year-${year}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 处理滚动事件
const handleScroll = () => {
  showBackTop.value = window.scrollY > 300
  headerScrolled.value = window.scrollY > 20
}

onMounted(async () => {
  try {
    const navName = getEnvVariable('PJ_BLOG_NAV_NAME')
    const base=getEnvVariable('VITE_BASE')||'/'
    const res = await fetchWithFallback([`${base}generated/${navName}`,`${base}generated/nav.json`],'导航数据')
    const posts = await res.json()
    
    // 按日期排序
    allPosts.value = [...posts].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    // 添加滚动事件监听
    window.addEventListener('scroll', handleScroll)
  } catch (err) {
    console.error('加载归档失败:', err)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
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