<template>
  <div
      class="page-shell min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative isolate">
    <!-- 自定义背景层：双层交叉淡入淡出 -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
          v-for="(layer, index) in backgroundLayers"
          :key="index"
          class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-out"
          :class="[backgroundActive === index ? 'opacity-100 page-ken-burns' : 'opacity-0']"
          :style="{ backgroundImage: layer ? `url(${layer})` : 'none' }"
      ></div>
      <div
          v-if="backgroundUrl"
          class="absolute inset-0 transition-colors duration-300"
          :style="{ backgroundColor: backgroundOverlayColor }"
      ></div>
    </div>

    <!-- 页面特效：与屏保独立，实时飘落，层级可调 -->
    <PetalEffect
        v-if="appearance.effect.effectEnabled"
        :z-index="appearance.effect.petalZIndex"
    />

    <!-- Header -->
    <header
        :class="[
          'sticky-header h-12',
          headerScrolled ? 'shadow-lg' : ''
        ]"
    >
      <div class="max-w-7xl mx-auto h-full flex justify-between items-center gap-3">
        <!-- 品牌 -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex-center flex-shrink-0 shadow-sm">
            <span class="text-white font-bold text-sm">{{ SITE_CONFIG.icon }}</span>
          </div>
          <h1 class="text-base font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent truncate">
            {{ t('siteTitle') }}
          </h1>
        </div>

        <!-- 工具栏 -->
        <div class="flex items-center gap-0.5 flex-shrink-0">
          <!-- 桌面搜索 -->
          <div class="relative hidden md:block mr-1">
            <input
                type="text"
                :placeholder="t('searchPlaceholder')"
                class="w-52 xl:w-64 h-9 pl-3 pr-9 rounded-lg bg-gray-100/80 dark:bg-gray-800/70 border border-transparent focus:border-orange-300 dark:focus:border-orange-600 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-0 text-sm placeholder:text-gray-400 transition-colors duration-200 cursor-pointer"
                @click="openSearch"
                readonly
            >
            <IconCarbonSearch class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <!-- 移动端搜索按钮 -->
          <button @click="openSearch" class="md:hidden glass-nav-btn" :aria-label="t('search')">
            <IconCarbonSearch class="w-5 h-5" />
          </button>
          <button @click="toDev" class="hidden sm:flex glass-nav-btn" :aria-label="t('dataManager')">
            <IconCarbonLogoGithub class="w-5 h-5" />
          </button>
          <button @click="toggleLanguage" class="hidden sm:flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
            <IconCarbonLanguage class="w-4 h-4" />
            <span class="hidden xl:inline">{{ currentLang === 'zh' ? t('switchLanguageToEn') : t('switchLanguageToZh') }}</span>
          </button>
          <ThemeToggle />
          <!-- 本地创作台入口：仅开发环境显示，生产构建不渲染 -->
          <router-link
              v-if="isDev"
              to="/studio"
              class="glass-nav-btn text-orange-600 dark:text-orange-400"
              title="写文章"
              aria-label="写文章"
          >
            <IconCarbonPen class="w-5 h-5" />
          </router-link>
          <!-- 外观设置：背景 / 字体 / 主题色 / 特效 -->
          <button
              @click="openAppearance"
              class="hidden sm:flex glass-nav-btn"
              :title="t('appearanceTitle')"
              :aria-label="t('appearanceTitle')"
              aria-haspopup="dialog"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 21a9 9 0 1 1 9-9c0 1.66-1.34 3-3 3h-1.5a2 2 0 0 0-1.6 3.2l.4.53A1.5 1.5 0 0 1 14 21z" />
              <circle cx="7.5" cy="11.5" r="1" />
              <circle cx="12" cy="7.5" r="1" />
              <circle cx="16.5" cy="11.5" r="1" />
            </svg>
          </button>
          <router-link to="/archive" class="hidden sm:flex glass-nav-btn" :title="t('archive')" :aria-label="t('archive')">
            <IconCarbonArchive class="w-5 h-5" />
          </router-link>
          <router-link to="/favorites" class="hidden sm:flex glass-nav-btn" :title="t('favorites')" :aria-label="t('favorites')">
            <IconCarbonStar class="w-5 h-5" />
          </router-link>
          <button v-if="isLoggedIn" @click="handleLogout" class="hidden sm:flex w-9 h-9 flex-center rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer" :title="t('logout')" :aria-label="t('logout')">
            <IconCarbonLogout class="w-5 h-5" />
          </button>
          <button @click="toggleMobileMenu" class="lg:hidden glass-nav-btn" :aria-label="t('articleDirectory')">
            <IconCarbonMenu class="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>

    <!-- 主体布局：左侧目录 + 中间内容 + 右侧最新文章 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow min-w-0 w-full">
      <div class="flex flex-col lg:flex-row gap-8 min-w-0">
        <!-- 左侧目录树（移动端抽屉） -->
        <aside
            :class="[
          'lg:w-80 flex-shrink-0',
          'fixed top-12 bottom-0 left-0 z-40 w-4/5 bg-white dark:bg-gray-900 shadow-2xl lg:relative lg:top-auto lg:bottom-auto lg:z-auto lg:bg-transparent dark:lg:bg-transparent lg:shadow-none transform transition-transform duration-300 ease-out-back',
          'overflow-y-auto lg:overflow-visible',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
        >
          <div class="h-full flex flex-col">
            <!-- 移动端头部 -->
            <div class="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              <h2 class="text-lg font-bold flex items-center gap-2 dark:text-white">
                <IconCarbonBook class="w-5 h-5 text-orange-500" />
                {{ t('articleDirectory') }}
              </h2>
              <div class="flex items-center gap-1">
                <button @click="openAppearance" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" :title="t('appearanceTitle')" :aria-label="t('appearanceTitle')">
                  <svg class="w-5 h-5 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 21a9 9 0 1 1 9-9c0 1.66-1.34 3-3 3h-1.5a2 2 0 0 0-1.6 3.2l.4.53A1.5 1.5 0 0 1 14 21z" />
                    <circle cx="7.5" cy="11.5" r="1" />
                    <circle cx="12" cy="7.5" r="1" />
                    <circle cx="16.5" cy="11.5" r="1" />
                  </svg>
                </button>
                <button @click="toggleMobileMenu" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" :aria-label="t('close')" :title="t('close')">
                  <IconCarbonClose class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- 目录标题（PC） -->
            <div class="hidden lg:block px-4 pt-4 pb-2">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-bold flex items-center gap-2 dark:text-white">
                  <IconCarbonBook class="w-5 h-5 text-orange-500" />
                  {{ t('articleDirectory') }}
                </h2>
              </div>
            </div>

            <!-- 文章目录卡片：完整展开，不内部滚动 -->
            <div class="px-4">
              <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <NavTree :tree="tree" />
              </div>
            </div>

            <!-- 访客信息：与目录分开的独立卡片 -->
            <div class="px-4 pt-3">
              <Ping0VisitorCard />
            </div>

            <!-- 移动端最新文章（在抽屉底部） -->
            <div class="flex-shrink-0 lg:hidden p-4 pb-20 border-t border-gray-200 dark:border-gray-700">
              <h3 class="text-base font-bold mb-3 flex items-center gap-2 dark:text-white">
                <IconCarbonRecentlyViewed class="w-5 h-5 text-orange-500" />
                {{ t('latestPosts') }}
              </h3>
              <div class="space-y-1.5">
                <router-link
                    v-for="(post, i) in latestPosts"
                    :key="post.path"
                    :to="post.path"
                    @click="toggleMobileMenu"
                    class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
                >
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">{{ post.title }}</h4>
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

        <!-- 移动端遮罩层：位于 header 之下，不遮挡顶部导航 -->
        <div v-if="isMobileMenuOpen" class="fixed top-12 inset-x-0 bottom-0 bg-black/50 z-30 lg:hidden animate-fade-in" @click.self="toggleMobileMenu"></div>

        <!-- 主内容区（固定首屏高度，容器内滚动自动加载） -->
        <main
            id="article-list"
            ref="listEl"
            class="flex-none lg:flex-1 min-w-0 overflow-y-auto card-scroll pr-1 overscroll-contain h-[calc(100dvh-10rem)] min-h-[320px] lg:h-[calc(100dvh-6rem)]"
            data-lenis-prevent
            @scroll.passive="handleListScroll"
        >
          <!-- 标签筛选：随列表滚动，单行横向滑动；PC 端改为右侧栏卡片 -->
          <div class="flex items-center gap-2 mb-3 min-w-0 xl:hidden">
            <button
                v-if="selectedTag"
                @click="selectedTag = ''"
                class="flex-shrink-0 flex items-center gap-0.5 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
            >
              <IconCarbonClose class="w-3 h-3" />
              {{ t('clear') }}
            </button>
            <span v-else class="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">{{ t('filterByTag') }}</span>
            <HotTagList :tags="hotTags" :selected="selectedTag" @select="toggleTag">
              <HotRankLink />
            </HotTagList>
          </div>

          <!-- 骨架屏：与卡片同构的横向列表 -->
          <div v-if="loading" class="grid gap-4 sm:gap-5 auto-rows-fr">
            <div v-for="i in 6" :key="i" class="article-card pointer-events-none">
              <div class="flex flex-col sm:flex-row">
                <div class="w-full sm:w-48 lg:w-56 aspect-[16/9] sm:aspect-auto bg-gray-200 dark:bg-gray-700"></div>
                <div class="flex-1 p-4 sm:p-5 space-y-3">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div class="flex gap-2 pt-2">
                    <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
                    <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 文章卡片：移动端上图下文，sm 起左侧封面 + 右侧正文 -->
          <div v-else class="grid gap-4 sm:gap-5 auto-rows-fr">
            <article
                v-for="(post, i) in displayedPosts"
                :key="post.path"
                class="group article-card"
                v-motion
                :initial="motionPreset(i).initial"
                :enter="motionPreset(i).enter"
                @contextmenu.prevent="showContextMenu($event, post)"
            >
              <router-link :to="post.path" class="card-link flex flex-col sm:flex-row h-full">
                <!-- 封面 -->
                <div class="relative w-full sm:w-48 lg:w-56 sm:shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <!-- 置顶标记 -->
                  <div v-if="post.sticky"
                    class="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 shadow-sm"
                  >
                    <IconCarbonPinFilled class="w-3 h-3" />
                    {{ t('top') }}
                  </div>
                  <img
                      v-if="post.cover"
                      :src="post.cover"
                      :alt="post.title"
                      class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                  >
                  <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700">
                    <span class="text-white/85 text-xl font-bold tracking-wide">
                      {{ post.title?.substring(0, 2) || t('siteFallbackInitial') }}
                    </span>
                  </div>
                  <!-- 封面与正文的柔和衔接过渡 -->
                  <div class="hidden sm:block absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/85 to-transparent dark:from-gray-800/80"></div>
                </div>

                <!-- 正文区 -->
                <div class="flex flex-1 flex-col min-w-0 p-4 sm:p-5">
                  <!-- 标题/摘要包在普通块级容器里：flex item 会被 blockify，导致 -webkit-line-clamp 失效 -->
                  <div class="flex-1 min-w-0">
                    <h2 class="text-[15px] sm:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                      {{ post.title }}
                    </h2>

                    <p class="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {{ post.excerpt || t('noExcerpt') }}
                    </p>
                  </div>

                  <div v-if="(post.tags || []).length > 0" class="mt-3 flex flex-wrap items-center gap-1.5">
                    <span
                        v-for="(tag, tagIndex) in (post.tags || []).slice(0, 3)"
                        :key="`${tag}-${tagIndex}`"
                        class="article-tag"
                    >
                      {{ tag }}
                    </span>
                    <span v-if="(post.tags || []).length > 3" class="text-[11px] text-gray-400 dark:text-gray-500 self-center">
                      +{{ (post.tags || []).length - 3 }}
                    </span>
                  </div>

                  <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between gap-2">
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0 text-xs text-gray-400 dark:text-gray-500">
                      <time class="flex items-center gap-1 whitespace-nowrap">
                        <IconCarbonTime class="w-3.5 h-3.5" />
                        {{ formatDate(post.date) }}
                      </time>
                      <span v-if="post.excerpt" class="flex items-center gap-1 whitespace-nowrap">
                        <IconCarbonBook class="w-3.5 h-3.5" />
                        {{ Math.max(1, Math.ceil((post.excerpt?.length || 0) / 100)) }} {{ t('readingTimeUnit') }}
                      </span>
                    </div>
                    <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-500 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white group-hover:translate-x-0.5">
                      <IconCarbonArrowRight class="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </router-link>
            </article>

            <!-- 滚动自动加载状态 -->
            <div v-if="!loading && displayedPosts.length > 0" class="col-span-full text-center py-6 text-xs text-gray-400 dark:text-gray-500">
              {{ hasMorePosts ? t('scrollForMore') : t('allLoaded') }}
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
        <aside class="hidden xl:block w-72 flex-shrink-0 space-y-4">
          <!-- 热门标签卡片 -->
          <div class="card p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-bold flex items-center gap-1.5 dark:text-white">
                <IconCarbonTag class="w-4 h-4 text-orange-500" />
                {{ t('filterByTag') }}
              </h3>
              <button
                  v-if="selectedTag"
                  @click="selectedTag = ''"
                  class="text-xs text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {{ t('clear') }}
              </button>
            </div>
            <HotTagList :tags="hotTags" :selected="selectedTag" layout="wrap" @select="toggleTag">
              <HotRankLink />
            </HotTagList>
          </div>

          <RecentArticles />
          <div class="sticky top-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 class="text-base font-bold mb-3 flex items-center gap-2 dark:text-white">
              <IconCarbonRecentlyViewed class="w-5 h-5 text-orange-500" />
              {{ t('latestPosts') }}
            </h3>
            <div id="latest-posts-list" class="space-y-1 max-h-[34dvh] overflow-y-auto card-scroll pr-1" data-lenis-prevent>
              <router-link
                  v-for="(post, i) in latestPosts"
                  :key="post.path"
                  :to="post.path"
                  class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
              >
                <!-- 将原来的序号显示部分替换为以下代码 -->
                <div class="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  <span>{{ i + 1 }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4
                      class="font-medium dark:text-white text-sm line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors"
                      :title="post.title">
                    {{ post.title }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
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
            {{ t('openInNewTab') }}
          </button>
          <button @click="copyContextLink" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            {{ t('copyLink') }}
          </button>
          <div class="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          <button @click="toggleContextFavorite" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4" :class="contextMenu.isFavorited ? 'text-red-500 fill-current' : 'text-gray-500'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            {{ contextMenu.isFavorited ? t('unfavoriteArticle') : t('favoriteArticle') }}
          </button>
        </div>
      </div>
    </Teleport>
    <!-- 页脚 -->
    <Footer />

    <!-- 主题设置面板 -->
    <AppearancePanel v-model:open="isAppearanceOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavTree from '@/components/NavTree.vue'
import Footer from '@/components/Footer.vue'
import HotTagList from '@/components/HotTagList.vue'
import HotRankLink from '@/components/HotRankLink.vue'
import Ping0VisitorCard from '@/components/Ping0VisitorCard.vue'
import RecentArticles from '@/components/RecentArticles.vue'
import AppearancePanel from '@/components/ui/AppearancePanel.vue'
import PetalEffect from '@/components/ui/PetalEffect.vue'
import { t, getLanguage } from '@/utils/i18n'
import {HOT_TAGS, HOT_TAGS_LIMIT, HOME_CONFIG, SITE_CONFIG, STORAGE_KEYS, UI_CONFIG} from '@/constants'
import {fetchWithFallback, formatDate, getEnvVariable, showSuccess, toDev} from "@/utils/tool";
import { passwordApi } from '@/utils/password';
import {addFavorite, isFavorite, removeFavorite} from "@/utils/favorites";
import type {FavoriteItem} from "@/utils/favorites";
import {appearance, backgroundList, backgroundUrl, nextBackgroundId} from '@/utils/appearance';
import { lenis } from '@/main';

const router = useRouter()

const isLoggedIn = ref(false);
// 本地创作台入口仅在开发环境展示
const isDev = import.meta.env.DEV;
const checkLogin = () => {
  try {
    const pwd = localStorage.getItem(STORAGE_KEYS.accessPassword) || '';
    isLoggedIn.value = !!pwd && passwordApi.verifyPassword(pwd).success;
  } catch {
    isLoggedIn.value = false;
  }
};

const handleLogout = () => {
  passwordApi.logout();
};

// 卡片入场动画参数预生成：对象引用保持稳定，
// 避免「加载更多」重新渲染时旧卡片被 v-motion 重复处理
const CARD_MOTION_PRESETS = Array.from({ length: 9 }, (_, index) => ({
  initial: { opacity: 0, y: 24 },
  enter: { opacity: 1, y: 0, transition: { delay: index * 60, duration: 500 } }
}))
const motionPreset = (index: number) => CARD_MOTION_PRESETS[Math.min(index, CARD_MOTION_PRESETS.length - 1)]!

const allPosts = ref<any[]>([])
const latestPosts = ref<any[]>([])
const tree = ref<any>({})
const loading = ref(true)
const currentLang = ref(getLanguage())
const isMobileMenuOpen = ref(false)

// 主题设置面板
const isAppearanceOpen = ref(false)
const openAppearance = () => {
  isMobileMenuOpen.value = false
  isAppearanceOpen.value = true
}

// 背景层：双层交叉淡入淡出，避免切换时闪烁
const backgroundLayers = ref<[string, string]>(['', ''])
const backgroundActive = ref(0)
const isDark = ref(false)

const backgroundOverlayColor = computed(() => {
  const alpha = Math.min(90, Math.max(0, appearance.effect.overlay)) / 100
  return isDark.value ? `rgba(22, 18, 15, ${alpha})` : `rgba(250, 247, 242, ${alpha})`
})

const syncThemeFlag = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

watch(backgroundUrl, url => {
  if (!url) {
    backgroundLayers.value = ['', '']
    backgroundActive.value = 0
    return
  }
  // 预加载，减少切换时的空白
  const image = new Image()
  image.src = url
  const next = backgroundActive.value === 0 ? 1 : 0
  const layers = [...backgroundLayers.value] as [string, string]
  layers[next] = url
  backgroundLayers.value = layers
  backgroundActive.value = next
}, {immediate: true})

// 背景自动轮播
let rotateTimer: number | undefined
const stopBackgroundRotate = () => {
  if (rotateTimer) {
    window.clearInterval(rotateTimer)
    rotateTimer = undefined
  }
}
const startBackgroundRotate = () => {
  stopBackgroundRotate()
  if (!appearance.effect.autoRotate) return
  const seconds = Math.max(HOME_CONFIG.backgroundRotateMinInterval, appearance.effect.rotateInterval)
  rotateTimer = window.setInterval(() => {
    const nextId = appearance.backgroundId
        ? nextBackgroundId(appearance.backgroundId)
        : backgroundList.value[0]?.id
    if (nextId) appearance.backgroundId = nextId
  }, seconds * 1000)
}
watch(() => [appearance.effect.autoRotate, appearance.effect.rotateInterval], startBackgroundRotate)

// 分页 + 标签筛选
const pageSize = HOME_CONFIG.pageSize
const currentPage = ref(1)
const selectedTag = ref('')
const showBackTop = ref(false);
const headerScrolled = ref(false);
const listEl = ref<HTMLElement | null>(null)
// 无限滚动加载锁：冷却期内不再追加下一页
const loadingMore = ref(false)
let loadMoreTimer: number | undefined

// 页面与列表容器的滚动状态合并计算：桌面端主内容在 #article-list 内部滚动
const updateScrollState = () => {
  const top = Math.max(window.scrollY, listEl.value?.scrollTop || 0)
  showBackTop.value = top > HOME_CONFIG.scrollTopThreshold
  headerScrolled.value = top > HOME_CONFIG.headerScrollThreshold
}

const handleScroll = updateScrollState

const scrollToTop = () => {
  listEl.value?.scrollTo({ top: 0, behavior: 'smooth' })
  lenis.scrollTo(0, { duration: UI_CONFIG.scrollToTopDuration })
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
    window.open(router.resolve(contextMenu.value.post.path).href, '_blank');
    closeContextMenu();
  }
};

const copyContextLink = () => {
  if (contextMenu.value.post) {
    const url = new URL(router.resolve(contextMenu.value.post.path).href, window.location.origin).href;
    navigator.clipboard.writeText(url).then(() => {
      showSuccess(t('linkCopied'));
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
      showSuccess(t('articleUnfavorited'));
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
      showSuccess(t('articleFavorited'));
    }
  }
};

// 热门标签：优先使用配置且确实有内容的标签，否则按文章标签频次自动生成
const matchesTag = (post: any, tag: string) =>
    (post.tags || []).some((t: unknown) => String(t) === tag)

const hotTags = computed(() => {
  const counts = new Map<string, number>()
  allPosts.value.forEach(post => {
    (post.tags || []).forEach((tag: unknown) => {
      const name = String(tag).trim()
      if (!name) return
      counts.set(name, (counts.get(name) || 0) + 1)
    })
  })

  // 配置了热门标签时只保留文章里真实存在的标签
  const configured = HOT_TAGS.filter(tag => counts.has(tag))
  if (configured.length > 0) return configured

  return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, HOT_TAGS_LIMIT)
      .map(([tag]) => tag)
})

// 筛选 + 排序后的完整文章列表
const sortedPosts = computed(() => {
  const list = selectedTag.value
      ? allPosts.value.filter(p => matchesTag(p, selectedTag.value))
      : allPosts.value

  return [...list].sort((a, b) => {
    // 如果其中一个是置顶文章，优先显示
    if (a.sticky && !b.sticky) return -1
    if (!a.sticky && b.sticky) return 1

    // 如果两个都是或都不是置顶文章，则按日期排序
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
})

// 固定高度容器内逐页追加，避免首页无限拉长把页脚推得过远
const displayedPosts = computed(() => sortedPosts.value.slice(0, currentPage.value * pageSize))

const hasMorePosts = computed(() => currentPage.value * pageSize < sortedPosts.value.length)

// 列表容器固定为首屏高度，滚动到接近底部时自动加载下一页。
// 高度由 CSS 的 dvh 控制（见模板），data-lenis-prevent 避免内部滚动被 Lenis 接管

// 标签条：PC 端由右侧栏卡片展示，小屏在列表顶部横滑
const toggleTag = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}


const handleListScroll = () => {
  updateScrollState()
  const el = listEl.value
  if (!el || !hasMorePosts.value || loadingMore.value) return
  // 距离底部 240px 内自动加载下一页
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 240) {
    loadingMore.value = true
    currentPage.value++
    // 加锁 + 冷却：避免一次滚动每帧都追加一页，导致瞬间渲染大量卡片
    window.clearTimeout(loadMoreTimer)
    loadMoreTimer = window.setTimeout(() => {
      loadingMore.value = false
    }, HOME_CONFIG.loadMoreCooldown)
  }
}

// 切换标签后回到第一页并回到列表顶部
watch(selectedTag, () => {
  currentPage.value = 1
  listEl.value?.scrollTo({ top: 0 })
})

const toggleLanguage = () => {
  const newLang = currentLang.value === 'zh' ? 'en' : 'zh'
  currentLang.value = newLang
  localStorage.setItem(STORAGE_KEYS.language, newLang)
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
  syncThemeFlag()
  window.addEventListener('theme-change', syncThemeFlag)
  startBackgroundRotate()
})
onMounted(async () => {
  checkLogin();
  try {
    window.addEventListener('scroll', handleScroll, { passive: true });
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
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('theme-change', syncThemeFlag)
  stopBackgroundRotate()
  if (loadMoreTimer) window.clearTimeout(loadMoreTimer)
})
</script>

<style scoped>
/* 移动端为底部导航预留空间；桌面端去掉，避免页脚下方出现空白 */
.page-shell {
  padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 1024px) {
  .page-shell {
    padding-bottom: 0;
  }
}

/* 标签筛选条：隐藏横向滚动条，保持低调紧凑 */
.tag-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tag-scroll::-webkit-scrollbar {
  display: none;
}

/* 背景缓慢缩放（Ken Burns），随激活图层切换重新开始 */
@keyframes page-ken-burns {
  from {
    transform: scale(1) translate3d(0, 0, 0);
  }
  to {
    transform: scale(1.12) translate3d(1.5%, -1.5%, 0);
  }
}

.page-ken-burns {
  animation: page-ken-burns 26s ease-out forwards;
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