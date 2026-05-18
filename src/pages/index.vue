<template>
  <div
      class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:pb-0" style="padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));">
    <!-- Header -->
    <header
        :class="[
          'sticky-header',
          headerScrolled ? 'py-2 shadow-lg' : 'py-4'
        ]"
    >
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="badge">
            <span class="text-white font-bold text-lg">{{ SITE_CONFIG.icon }}</span>
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {{ t('siteTitle') }}
          </h1>
        </div>

        <!-- 搜索 + 功能按钮 -->
        <div class="flex items-center space-x-3">
          <div class="relative hidden md:block">
            <input
                type="text"
                :placeholder="t('searchPlaceholder')"
                class="w-64 xl:w-80 py-2 px-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-shadow duration-200"
                @click="openSearch"
                readonly
            >
            <IconCarbonSearch class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <!-- 移动端搜索按钮 -->
          <button @click="openSearch" class="md:hidden glass-nav-btn">
            <IconCarbonSearch class="w-5 h-5 dark:text-gray-300" />
          </button>
          <button @click="toDev" class="hidden sm:flex glass-nav-btn">
            <IconCarbonLogoGithub class="w-5 h-5 dark:text-gray-300" />
          </button>
          <button @click="toggleLanguage" class="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <IconCarbonLanguage class="w-4 h-4" />
            <span class="hidden xl:inline">{{ currentLang === 'zh' ? 'EN' : '中文' }}</span>
          </button>
          <ThemeToggle />
          <router-link to="/archive" class="hidden sm:flex glass-nav-btn" :title="t('archive')">
            <IconCarbonArchive class="w-5 h-5 dark:text-gray-300" />
          </router-link>
          <router-link to="/favorites" class="hidden sm:flex glass-nav-btn" :title="t('favorites')">
            <IconCarbonStar class="w-5 h-5 dark:text-gray-300" />
          </router-link>
          <button v-if="isLoggedIn" @click="handleLogout" class="hidden sm:flex items-center p-2 rounded-lg border border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer" :title="t('logout')">
            <IconCarbonLogout class="w-5 h-5 text-red-500 dark:text-red-400" />
          </button>
          <button @click="toggleMobileMenu" class="lg:hidden dark:text-gray-300 glass-nav-btn">
            <IconCarbonMenu class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端搜索栏 - sticky 定位确保滚动时可见 -->
    <div class="md:hidden px-4 pt-4 sticky top-[72px] z-30">
      <div class="relative">
        <input type="text" :placeholder="t('searchPlaceholder')" class="w-full py-3.5 px-5 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-shadow duration-200 cursor-pointer" @click="openSearch" readonly>
        <IconCarbonSearch class="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-300" />
      </div>
    </div>

    <!-- 热门标签快速筛选 -->
    <div class="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">{{ t('filterByTag') || '热门标签' }}:</span>
          <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1 flex-1" style="scrollbar-width: none; -ms-overflow-style: none;">
            <button
                v-for="tag in hotTags"
                :key="tag"
                @click="selectedTag = selectedTag === tag ? '' : tag"
                :class="[
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer',
                selectedTag === tag
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:text-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-blue-400'
              ]"
            >
              {{ tag }}
            </button>
          </div>
          <button @click="selectedTag = ''" v-if="selectedTag" class="flex-shrink-0 ml-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer">
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
          'lg:sticky lg:top-16 lg:self-start',
          'fixed inset-0 left-0 z-50 w-4/5 bg-white dark:bg-gray-900 shadow-2xl lg:relative lg:shadow-lg transform transition-transform duration-300 ease-out-back',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]">
          <div class="h-full flex flex-col">
            <!-- 移动端头部 -->
            <div class="flex-shrink-0 flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              <h2 class="text-lg font-bold flex items-center gap-2 dark:text-white">
                <IconCarbonBook class="w-5 h-5 text-blue-500" />
                {{ t('articleDirectory') }}
              </h2>
              <button @click="toggleMobileMenu" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <IconCarbonClose class="w-5 h-5" />
              </button>
            </div>

            <!-- 目录标题（PC） -->
            <div class="hidden lg:block p-6 pb-4">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-bold flex items-center gap-2 dark:text-white">
                  <IconCarbonBook class="w-5 h-5 text-blue-500" />
                  {{ t('articleDirectory') }}
                </h2>
              </div>
            </div>

            <!-- 目录树 -->
            <div class="flex-1 overflow-y-auto px-6 pb-4">
              <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <NavTree :tree="tree" />
              </div>
            </div>

            <!-- 移动端最新文章（在抽屉底部） -->
            <div class="flex-shrink-0 lg:hidden p-6 border-t border-gray-200 dark:border-gray-700 max-h-[40vh] overflow-y-auto">
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
                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
                >
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{{ post.title }}</h4>
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

        <!-- 移动端遮罩层：使用 .self 修饰符确保只点击遮罩层本身才关闭 -->
        <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in" @click.self="toggleMobileMenu"></div>

        <!-- 主内容区（卡片网格） -->
        <main class="flex-1 min-w-0">
          <!-- 骨架屏 -->
          <div v-if="loading" class="grid gap-8 sm:grid-cols-1 xl:grid-cols-2 auto-rows-fr">
            <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-100 dark:border-gray-700 flex flex-col">
              <div class="aspect-[16/9] bg-gray-200 dark:bg-gray-700 relative">
                <div class="absolute bottom-4 left-5 right-5">
                  <div class="h-6 bg-gray-300 dark:bg-gray-500 rounded w-3/4 mb-2"></div>
                  <div class="h-4 bg-gray-300 dark:bg-gray-500 rounded w-1/2"></div>
                </div>
              </div>
              <div class="p-6 space-y-3 flex-1 flex flex-col">
                <div class="space-y-2 flex-1">
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
                <div class="flex gap-2">
                  <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
                  <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
                <div class="flex justify-between items-center mt-2">
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 文章卡片 -->
          <div v-else class="grid gap-6 sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-2 auto-rows-fr">
            <article
                v-for="(post, i) in displayedPosts"
                :key="post.path"
                class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700/80 flex flex-col cursor-pointer"
                v-motion
                :initial="{ opacity: 0, y: 40 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: i * 60, duration: 600 } }"
                @contextmenu.prevent="showContextMenu($event, post)"
            >
              <router-link :to="post.path" class="flex flex-col h-full card-link">
                <!-- 封面图 -->
                <div class="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <!-- 置顶标记 -->
                  <div v-if="post.sticky"
                    class="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
                  >
                    <IconCarbonPinFilled class="w-3 h-3" />
                    {{t('top')}}
                  </div>
                  <img
                      v-if="post.cover"
                      :src="post.cover"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                  >
                  <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <div class="text-white/80 text-2xl font-bold">
                      {{ post.title?.substring(0, 2) || '博客' }}
                    </div>
                  </div>
                </div>

                <div class="p-5 flex flex-col flex-1">
                  <!-- 标题 -->
                  <h2 class="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {{ post.title }}
                  </h2>

                  <!-- 摘要 -->
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed line-clamp-2 flex-1">
                    {{ post.excerpt || t('noExcerpt') || '暂无摘要' }}
                  </p>

                  <!-- 标签 + 底部信息行 -->
                  <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <div class="flex items-center gap-3 min-w-0">
                      <!-- 标签 -->
                      <div class="flex gap-1.5 overflow-hidden" v-if="(post.tags || []).length > 0">
                        <span
                            v-for="tag in (post.tags || []).slice(0, 2)"
                            :key="tag"
                            class="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap"
                        >
                          {{ tag }}
                        </span>
                        <span v-if="(post.tags || []).length > 2" class="text-[11px] text-gray-400 dark:text-gray-500 self-center">
                          +{{ (post.tags || []).length - 2 }}
                        </span>
                      </div>
                      <!-- 日期 -->
                      <time class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex items-center gap-1">
                        <IconCarbonTime class="w-3.5 h-3.5" />
                        {{ formatDate(post.date) }}
                      </time>
                      <span v-if="post.excerpt" class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex items-center gap-1">
                        <IconCarbonBook class="w-3.5 h-3.5" />
                        {{ Math.max(1, Math.ceil((post.excerpt?.length || 0) / 100)) }}min
                      </span>
                    </div>
                    <!-- 阅读箭头 -->
                    <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:translate-x-0.5">
                      <IconCarbonArrowRight class="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </router-link>
            </article>

            <!-- 加载更多按钮（无限滚动触发器） -->
            <div v-if="hasManualPagination && !loading" ref="loadMoreTrigger" class="col-span-full text-center py-12">
              <button @click="loadMore" class="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition-colors duration-200 cursor-pointer">
                {{ t('loadMore') || '加载更多' }}
              </button>
            </div>

            <!-- 空状态 -->
            <div v-if="!loading && displayedPosts.length === 0" class="col-span-full text-center py-20 animate-fade-in">
              <IconCarbonFaceDizzy class="w-20 h-20 mx-auto text-gray-400" />
              <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">
                {{ selectedTag ? t('noArticlesWithTag', { tag: selectedTag }) : t('noArticles') }}
              </p>
            </div>
          </div>
        </main>

        <!-- 右侧最新文章侧栏（仅 ≥xl 显示） -->
        <aside class="hidden xl:block w-72 flex-shrink-0 space-y-6">
          <RecentArticles />
          <div class="sticky top-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-bold mb-5 flex items-center gap-2 dark:text-white">
              <IconCarbonRecentlyViewed class="w-5 h-5 text-blue-500" />
              {{ t('latestPosts') }}
            </h3>
            <div class="space-y-4">
              <router-link
                  v-for="(post, i) in latestPosts"
                  :key="post.path"
                  :to="post.path"
                  class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
              >
                <!-- 将原来的序号显示部分替换为以下代码 -->
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  <span>{{ i + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4
                      class="font-medium dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors"
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
          class="fixed bottom-20 lg:bottom-8 right-8 scroll-top-btn"
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </transition>
    <!-- 右键快捷菜单 -->
    <Teleport to="body">
      <div v-if="contextMenu.visible" class="fixed inset-0 z-[9999]" @click="closeContextMenu" @contextmenu.prevent="closeContextMenu">
        <div
            :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
            class="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 min-w-[180px] overflow-hidden animate-fade-in"
            @click.stop
        >
          <button @click="openInNewTab" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            新标签页打开
          </button>
          <button @click="copyContextLink" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            复制链接
          </button>
          <div class="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          <button @click="toggleContextFavorite" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4" :class="contextMenu.isFavorited ? 'text-red-500 fill-current' : 'text-gray-500'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            {{ contextMenu.isFavorited ? '取消收藏' : '收藏文章' }}
          </button>
        </div>
      </div>
    </Teleport>
    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import NavTree from '@/components/NavTree.vue'
import Footer from '@/components/Footer.vue'
import RecentArticles from '@/components/RecentArticles.vue'
import { t, getLanguage } from '@/utils/i18n'
import {HOT_TAGS, SITE_CONFIG} from '@/constants'
import {fetchWithFallback, formatDate, getEnvVariable, showSuccess, toDev} from "@/utils/tool";
import { passwordApi } from '@/utils/password';
import {addFavorite, isFavorite, removeFavorite} from "@/utils/favorites";
import type {FavoriteItem} from "@/utils/favorites";
import { lenis } from '@/main';

const isLoggedIn = ref(false);
const checkLogin = () => {
  try {
    const pwd = localStorage.getItem('blog-access-pwd') || '';
    isLoggedIn.value = !!pwd && passwordApi.verifyPassword(pwd).success;
  } catch {
    isLoggedIn.value = false;
  }
};

const handleLogout = () => {
  passwordApi.logout();
};

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
const headerScrolled = ref(false);

const handleScroll = () => {
  showBackTop.value = window.scrollY > 300;
  headerScrolled.value = window.scrollY > 20;
};

const scrollToTop = () => {
  lenis.scrollTo(0, { duration: 1 })
};

// 右键快捷菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  post: null as any,
  isFavorited: false
});

const showContextMenu = (event: MouseEvent, post: any) => {
  const fav = isFavorite(post.path);
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    post,
    isFavorited: fav
  };
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

const openInNewTab = () => {
  if (contextMenu.value.post) {
    window.open(contextMenu.value.post.path, '_blank');
    closeContextMenu();
  }
};

const copyContextLink = () => {
  if (contextMenu.value.post) {
    const url = window.location.origin + contextMenu.value.post.path;
    navigator.clipboard.writeText(url).then(() => {
      showSuccess('链接已复制');
    });
    closeContextMenu();
  }
};

const toggleContextFavorite = () => {
  if (contextMenu.value.post) {
    const post = contextMenu.value.post;
    if (contextMenu.value.isFavorited) {
      removeFavorite(post.path);
      contextMenu.value.isFavorited = false;
      showSuccess('已取消收藏');
    } else {
      const item: FavoriteItem = {
        path: post.path,
        title: post.title,
        date: post.date,
        cover: post.cover,
        tags: post.tags,
        excerpt: post.excerpt
      };
      addFavorite(item);
      contextMenu.value.isFavorited = true;
      showSuccess('已收藏');
    }
  }
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
  scrollToTop()
})
onMounted(async () => {
  checkLogin();
  try {
    window.addEventListener('scroll', handleScroll);
    const navName=getEnvVariable('PJ_BLOG_NAV_NAME')
    const treeName=getEnvVariable('PJ_BLOG_TREE_NAME')
    const base=getEnvVariable('VITE_BASE')||'/'
    const [navRes, treeRes] = await Promise.all([
      fetchWithFallback([`${base}generated/${navName}`,`${base}generated/nav.json`],'导航数据'),
      fetchWithFallback([`${base}generated/${treeName}`,`${base}generated/tree.json`],'树级数据')
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

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (observer) observer.disconnect()
})
</script>

<style scoped>
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