<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
    <!-- Header -->
    <header class="py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span class="text-white font-bold text-lg">{{ SITE_CONFIG.icon }}</span>
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {{ t('siteTitle') }}
          </h1>
        </div>

        <!-- 搜索 + 功能按钮 -->
        <div class="flex items-center space-x-4">
          <div class="relative hidden md:block">
            <input
                type="text"
                :placeholder="t('searchPlaceholder')"
                class="w-80 py-2.5 px-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                @click="openSearch"
                readonly
            >
            <IconCarbonSearch class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <button @click="toggleLanguage" class="hidden dark:text-gray-300 sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <IconCarbonLanguage class="w-4 h-4" />
            {{ currentLang === 'zh' ? 'EN' : '中文' }}
          </button>
          <ThemeToggle />
          <router-link to="/archive" class="flex items-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
            <IconCarbonArchive class="w-6 h-6 dark:text-gray-300" />
          </router-link>
          <router-link to="/favorites" class="flex items-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
            <IconCarbonStar class="w-6 h-6 dark:text-gray-300" />
          </router-link>
          <button @click="toggleMobileMenu" class="lg:hidden  dark:text-gray-300 p-2 rounded-lg border border-gray-300 dark:border-gray-600">
            <IconCarbonMenu class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端搜索栏 -->
    <div class="md:hidden px-4 pt-4">
      <div class="relative">
        <input type="text" :placeholder="t('searchPlaceholder')" class="w-full py-3.5 px-5 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" @click="openSearch" readonly>
        <IconCarbonSearch class="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-300" />
      </div>
    </div>

    <!-- 热门标签快速筛选 -->
    <div class="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ t('filterByTag') || '热门标签' }}:</span>
          <button
              v-for="tag in hotTags"
              :key="tag"
              @click="selectedTag = selectedTag === tag ? '' : tag"
              :class="[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              selectedTag === tag
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-400'
            ]"
          >
            {{ tag }}
          </button>
          <button @click="selectedTag = ''" v-if="selectedTag" class="ml-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {{ t('clear') || '清除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 主体布局：左侧目录 + 中间内容 + 右侧最新文章 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧目录树（移动端抽屉） -->
        <aside :class="[
          'lg:w-80 flex-shrink-0',
          'lg:sticky lg:top-6 lg:self-start',
          'fixed inset-y-0 left-0 z-50 w-4/5 bg-white dark:bg-gray-900 shadow-2xl lg:relative lg:shadow-lg transform transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]">
          <div class="h-full flex flex-col lg:h-auto">
            <!-- 移动端头部 -->
            <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              <h2 class="text-lg font-bold flex items-center gap-2 dark:text-white">
                <IconCarbonBook class="w-5 h-5 text-blue-500" />
                {{ t('articleDirectory') }}
              </h2>
              <button @click="toggleMobileMenu" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <IconCarbonClose class="w-5 h-5" />
              </button>
            </div>

            <!-- 目录标题（PC） -->
            <div class="hidden lg:block p-6 pb-4">
              <h2 class="text-lg font-bold flex items-center gap-2 dark:text-white">
                <IconCarbonBook class="w-5 h-5 text-blue-500" />
                {{ t('articleDirectory') }}
              </h2>
            </div>

            <!-- 目录树 -->
            <div class="pb-4 flex-1 overflow-y-auto px-6 lg:max-h-[calc(100vh-4rem)]"> <!-- 限制最大高度，但允许滚动 -->
              <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <NavTree :tree="tree" />
              </div>
            </div>

            <!-- 移动端最新文章（在抽屉底部） -->
            <div class="lg:hidden p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                <IconCarbonRecentlyViewed class="w-5 h-5 text-blue-500" />
                {{ t('latestPosts') }}
              </h3>
              <div class="space-y-3">
                <router-link
                    v-for="(post, i) in latestPosts"
                    :key="post.path"
                    :to="post.path"
                    @click="toggleMobileMenu"
                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ post.title }}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <IconCarbonTime class="w-3 h-3 mr-1" />
                      {{ formatDate(post.date) }}
                    </p>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </aside>

        <!-- 移动端遮罩层 -->
        <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="toggleMobileMenu"></div>

        <!-- 主内容区（卡片网格） -->
        <main class="flex-1 min-w-0">
          <!-- 骨架屏 -->
          <div v-if="loading" class="grid gap-8 sm:grid-cols-1 xl:grid-cols-1">
            <div v-for="i in 9" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
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

          <!-- 文章卡片 -->
          <div v-else class="grid gap-8 sm:grid-cols-1 xl:grid-cols-1 auto-rows-fr">
            <article
                v-for="(post, i) in displayedPosts"
                :key="post.path"
                class="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
                v-motion
                :initial="{ opacity: 0, y: 40 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: i * 60, duration: 600 } }"
            >
              <router-link :to="post.path" class="flex flex-col h-full">
                <div class="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <!-- 置顶标记 -->
                  <div v-if="post.sticky" class="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                    <IconCarbonPinFilled class="w-3 h-3 mr-1" />
                    置顶
                  </div>
                  <img
                      v-if="post.cover"
                      :src="post.cover"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                  >
                  <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center">
                    <div class="text-white/90 text-3xl font-bold">
                      {{ post.title?.substring(0, 2) || '博客' }}
                    </div>
                  </div>
<!--                  <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>-->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <h2 class="absolute bottom-4 left-5 right-5 text-xl font-bold text-white line-clamp-2">
                    {{ post.title }}
                  </h2>
                </div>

                <div class="p-6 flex flex-col flex-1">
                  <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 flex-1">
                    {{ post.excerpt || t('noExcerpt') || '暂无摘要' }}
                  </p>

                  <div class="flex flex-wrap gap-2 mt-4">
                    <span
                        v-for="tag in (post.tags || []).slice(0, 3)"
                        :key="tag"
                        class="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/40 text-gray-800 dark:text-blue-300"
                    >
                      {{ tag }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center mt-6 text-xs text-gray-500 dark:text-gray-400">
                    <time class="flex items-center">
                      <IconCarbonTime class="w-4 h-4 mr-1" />
                      {{ formatDate(post.date) }}
                    </time>
                    <span class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-all duration-300">
                      {{ t('readMore') }}
                      <IconCarbonArrowRight class="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </router-link>
            </article>

            <!-- 加载更多按钮（无限滚动触发器） -->
            <div v-if="hasManualPagination && !loading" ref="loadMoreTrigger" class="col-span-full text-center py-12">
              <button @click="loadMore" class="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg transition">
                {{ t('loadMore') || '加载更多' }}
              </button>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && displayedPosts.length === 0" class="col-span-full text-center py-20">
              <IconCarbonFaceDizzy class="w-20 h-20 mx-auto text-gray-400" />
              <p class="mt-4 text-xl text-gray-500 dark:text-gray-400">
                {{ selectedTag ? t('noArticlesWithTag', { tag: selectedTag }) : t('noArticles') }}
              </p>
            </div>
          </div>
        </main>

        <!-- 右侧最新文章侧栏（仅 ≥xl 显示） -->
        <aside class="hidden xl:block w-72 flex-shrink-0">
          <div class="sticky top-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 class="text-lg font-bold mb-5 flex items-center gap-2 dark:text-white">
              <IconCarbonRecentlyViewed class="w-5 h-5 text-blue-500" />
              {{ t('latestPosts') }}
            </h3>
            <div class="space-y-4">
              <router-link
                  v-for="(post, i) in latestPosts"
                  :key="post.path"
                  :to="post.path"
                  class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <!-- 将原来的序号显示部分替换为以下代码 -->
                <div class="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                  <span class="transform transition-transform group-hover:scale-110">
                    {{ i + 1 }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight"
                      :title="post.title">
                    {{ post.title }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                    <IconCarbonTime class="w-3.5 h-3.5 mr-1" />
                    {{ formatDate(post.date) }}
                  </p>
                </div>
              </router-link>
            </div>
          </div>
        </aside>
      </div>
    </div>
    <Transition name="slide-up-fade">
      <button
          v-if="showBackTop"
          @click="scrollToTop"
          class="bottom-8 right-8 p-3 fixed items-center justify-center dark:bg-[#1b2f73ff] bg-[#3b2f73ff] text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </transition>
    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import NavTree from '@/components/NavTree.vue'
import Footer from '@/components/Footer.vue'
import { t, getLanguage } from '@/utils/i18n'
import {HOT_TAGS, SITE_CONFIG} from '@/constants'
import {getEnvVariable} from "@/utils/tool";

const allPosts = ref<any[]>([])
const latestPosts = ref<any[]>([])
const tree = ref<any>({})
const loading = ref(true)
const currentLang = ref(getLanguage())
const isMobileMenuOpen = ref(false)

// 无限滚动 + 标签筛选
const pageSize = 12
const currentPage = ref(1)
const selectedTag = ref('')
const showBackTop = ref(false);

const handleScroll = () => {
  showBackTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 热门标签（从常量中导入）
const hotTags = ref(HOT_TAGS)

const displayedPosts = computed(() => {
  let list = selectedTag.value
      ? allPosts.value.filter(p => p.tags?.includes(selectedTag.value))
      : allPosts.value

  // 按置顶属性和日期排序，置顶的文章排在前面
  const sorted = [...list].sort((a, b) => {
    // 如果其中一个是置顶文章，优先显示
    if (a.sticky && !b.sticky) return -1
    if (!a.sticky && b.sticky) return 1
    
    // 如果两个都是或都不是置顶文章，则按日期排序
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return sorted.slice(0, currentPage.value * pageSize);
})
const maxAutoLoadPages = 5;
const hasMore = computed(() => {
  const total = selectedTag.value
      ? allPosts.value.filter(p => p.tags?.includes(selectedTag.value)).length
      : allPosts.value.length;

  const loadedCount = currentPage.value * pageSize;
  return loadedCount < Math.min(total, maxAutoLoadPages * pageSize);
})
const hasManualPagination = computed(() => {
  const total = selectedTag.value
      ? allPosts.value.filter(p => p.tags?.includes(selectedTag.value)).length
      : allPosts.value.length;
  return currentPage.value * pageSize < total;
});

// 无限滚动
let observer: IntersectionObserver | null = null
const loadMoreTrigger = ref<HTMLElement | null>(null)

const loadMore = async () => {
  if (!hasMore.value) return
  currentPage.value++
  await nextTick()
  setupObserver()
}

const setupObserver = () => {
  if (observer) observer.disconnect()
  nextTick(() => {
    if (loadMoreTrigger.value && hasMore.value) {
      observer = new IntersectionObserver(entries => {
        if (entries[0] && entries[0].isIntersecting) loadMore()
      }, { rootMargin: '400px' })
      observer.observe(loadMoreTrigger.value!)
    }
  })
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return t('unknownDate') || '未知日期'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return currentLang.value === 'zh'
        ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

const toggleLanguage = () => {
  const newLang = currentLang.value === 'zh' ? 'en' : 'zh'
  currentLang.value = newLang
  localStorage.setItem('language', newLang)
  location.reload()
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const openSearch = () => {
  window.dispatchEvent(new CustomEvent('open-search-modal'))
}

onMounted(() => {
  window.removeEventListener('scroll', handleScroll);
})
onMounted(async () => {
  try {
    window.addEventListener('scroll', handleScroll);
    const nvName=getEnvVariable('PJ_BLOG_NAV_NAME')
    const treeName=getEnvVariable('PJ_BLOG_TREE_NAME')
    const [navRes, treeRes] = await Promise.all([
      fetch(`/generated/${nvName}`),
      fetch(`/generated/${treeName}`)
    ])

    const posts = await navRes.json()
    
    // 按置顶属性和日期排序，置顶的文章排在前面
    const sorted = [...posts].sort((a: any, b: any) => {
      // 如果其中一个是置顶文章，优先显示
      if (a.sticky && !b.sticky) return -1
      if (!a.sticky && b.sticky) return 1
      
      // 如果两个都是或都不是置顶文章，则按日期排序
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    allPosts.value = sorted
    latestPosts.value = sorted.slice(0, 10)
    tree.value = await treeRes.json()
  } catch (err) {
    console.error('加载失败:', err)
  } finally {
    loading.value = false
    await nextTick()
    setupObserver()
  }
})
</script>