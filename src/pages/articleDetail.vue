<template>
  <div class="article-detail-wrapper">
    <Transition name="fade" mode="out-in">
      <div v-if="showLightbox" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" @click="showLightbox = false">
        <img :src="lightboxImg" class="max-w-full max-h-screen object-contain rounded-sm shadow-2xl scale-in animate-zoom-in" :alt="t('lightboxImage')" @click.stop />
        <button class="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors" @click="showLightbox = false" :aria-label="t('closeLightbox')">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>

  <!-- 现代化水平进度条：位于顶部 -->
  <div
      v-if="!isOfficeFile"
      class="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999] transition-all duration-500 ease-out-expo pointer-events-none"
      :class="{ 'opacity-0': !showProgress, 'opacity-100': showProgress }"
  >
    <div
        class="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-200 ease-out"
        :style="{ width: progress + '%' }"
    >
    </div>
  </div>

  <!-- 将返回按钮和主题切换按钮放在一起 -->
  <div class="fixed lg:hidden top-4 left-4 z-[60] transition-all duration-300"
       :class="hideFloatingChrome ? '-translate-y-16 opacity-0 pointer-events-none' : 'opacity-100'">
    <router-link
        to="/"
        class="flex items-center gap-2 px-3 py-3 bg-black/20 dark:bg-white/20 backdrop-blur-md rounded-full hover:bg-black/30 dark:hover:bg-white/30 transition-colors border border-white/20 dark:border-white/30 text-white"
        :aria-label="t('backToHome')"
        :title="t('backToHome')"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </router-link>
  </div>

  <!-- 主题切换按钮 -->
  <div class="fixed top-4 right-4 z-[9999]">
    <ThemeToggle />
  </div>

  <article class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 lg:pb-0" style="padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <!-- 封面：只做横幅，不承载文字。标题放到正文区，任何主题下都清晰可读 -->
    <!-- GitHub 的 OG 图是 1200×630 的卡片，直接裁切会只剩半截标题，因此改为「模糊底 + 完整卡片」 -->
    <div v-if="cover && !coverBroken" class="relative overflow-hidden group bg-gray-100 dark:bg-gray-800"
         :class="isOgCover ? 'h-[168px] md:h-[210px]' : 'h-[26vh] md:h-[34vh] min-h-[150px] md:min-h-[210px] max-h-[340px]'">
      <template v-if="isOgCover">
        <img :src="cover" class="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70" alt="" aria-hidden="true" @error="coverBroken = true">
        <div class="absolute inset-0 flex items-center justify-center p-3 md:p-4">
          <img :src="cover" class="max-h-full max-w-full object-contain rounded-lg shadow-xl ring-1 ring-black/10" :alt="t('coverAlt')">
        </div>
      </template>
      <template v-else>
        <img :src="cover" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" :alt="t('coverAlt')" @error="coverBroken = true">
      </template>
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5"></div>
    </div>

    <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div class="flex flex-col lg:flex-row gap-5 relative">

        <div class="hidden lg:flex flex-col gap-4 sticky top-32 h-fit items-end w-16 shrink-0 order-first">
          <div class="flex flex-col gap-4 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="tooltip tooltip-right" :data-tip="t('backToHome')">
              <router-link
                  to="/"
                  class="icon-btn"
                  :aria-label="t('backToHome')"
                  :title="t('backToHome')"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </router-link>
            </div>
            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>
            <div class="tooltip tooltip-right" :data-tip="t('share')">
              <button @click="openShareModal" class="w-10 h-10 flex-center rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30 text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors" :aria-label="t('share')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>

            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>

            <div class="tooltip tooltip-right" :data-tip="t('print')">
              <button @click="handlePrint" class="icon-btn" :aria-label="t('print')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
            </div>

            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>

            <div class="tooltip tooltip-right" :data-tip="isFavorited ? t('removeFromFavorites') : t('addToFavorites')">
              <button 
                @click="toggleFavorite"
                class="w-10 h-10 flex-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors" 
                :aria-label="isFavorited ? t('removeFromFavorites') : t('addToFavorites')"
              >
                <svg 
                  class="w-5 h-5" 
                  :class="{ 'fill-current': isFavorited }"
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  fill="none"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>

            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>

            <div class="tooltip tooltip-right" :data-tip="fontSizeLabels[fontSizeLevel]">
              <button @click="fontSizeLevel = (fontSizeLevel + 1) % 3" class="icon-btn" :aria-label="t('adjustFontSize')">
                <span class="font-serif font-bold transition-all" :class="fontSizeClasses[fontSizeLevel]">T</span>
              </button>
            </div>
          </div>
        </div>

        <main 
            class="flex-1 w-full" 
            :class="currentFileExtension && ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(currentFileExtension) 
              ? 'max-w-full mx-auto' 
              : 'max-w-[45rem] mx-auto min-w-0'"
          >
          <!-- 文章头部：栏目 → 标题 → 元信息 → 标签，与正文同宽左对齐 -->
          <header v-if="!loading" :class="cover ? 'pt-10' : 'pt-14'" class="pb-7 mb-3 border-b border-gray-100 dark:border-gray-800">
            <div v-if="articleCategory" class="flex items-center gap-1.5 mb-4 text-xs font-medium tracking-wide text-orange-600 dark:text-orange-400 animate-slide-up" style="animation-fill-mode: both">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              <span>{{ articleCategory }}</span>
            </div>
            <h1 class="text-[1.85rem] md:text-[2.3rem] font-extrabold leading-[1.32] tracking-tight text-gray-900 dark:text-gray-50 mb-5 text-balance animate-slide-up" style="animation-delay: 0.05s; animation-fill-mode: both">
              {{ articleMeta.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 animate-slide-up" style="animation-delay: 0.12s; animation-fill-mode: both">
              <time class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-3 2v12a2 2 0 002 2z" />
                </svg>
                {{ articleMeta.date }}
              </time>
              <template v-if="articleMeta.chars > 0">
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span>{{ articleMeta.chars }} {{ t('wordCount') }}</span>
              </template>
              <template v-if="readingTime.length > 0">
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ readingTime }}
                </span>
              </template>
            </div>
            <div v-if="articleMeta.tags.length > 0" class="flex flex-wrap gap-2 mt-4 animate-slide-up" style="animation-delay: 0.18s; animation-fill-mode: both">
              <span v-for="tag in articleMeta.tags" :key="tag" class="px-2.5 py-0.5 rounded-md text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100/70 dark:bg-white/5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
                #{{ tag }}
              </span>
            </div>
          </header>
          <!-- 骨架屏：更贴近真实内容布局 -->
          <div v-if="loading" class="space-y-10 animate-pulse max-w-3xl mx-auto">
            <!-- 封面占位 -->
            <div class="h-56 md:h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <!-- 标题占位 -->
            <div class="space-y-3">
              <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="flex gap-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <!-- 标签占位 -->
            <div class="flex gap-2">
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
            </div>
            <!-- 正文占位 -->
            <div class="space-y-4">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
            <div class="space-y-4">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-11/12"></div>
            </div>
            <!-- 代码块占位 -->
            <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-3"></div>
              <div class="space-y-2">
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          </div>
          <div v-else-if="isOfficeFile" class="document-viewer w-full">
            <DocumentViewer 
              :url="documentUrl"
              :path="artPath"
              :extension="currentFileExtension" 
              :title="articleMeta.title"
            />
          </div>
          <div
              v-else
              class="prose dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-img:rounded-xl prose-a:text-orange-600 dark:prose-a:text-orange-400 hover:prose-a:underline prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 markdown-body animate-fade-in"
              :class="fontSizeClasses[fontSizeLevel]"
              @click="handleContentClick"
              v-html="renderedMarkdown"
          ></div>

          <hr class="my-16 border-gray-200 dark:border-gray-800" />

          <!-- Giscus 评论系统 -->
          <GiscusComment
            v-if="GISCUS_CONFIG.enabled"
            :repo="GISCUS_CONFIG.repo"
            :repo-id="GISCUS_CONFIG.repoId"
            :category="GISCUS_CONFIG.category"
            :category-id="GISCUS_CONFIG.categoryId"
            :mapping="GISCUS_CONFIG.mapping"
            :term="windowLocation"
            :strict="GISCUS_CONFIG.strict"
            :reactions-enabled="GISCUS_CONFIG.reactionsEnabled"
            :emit-metadata="GISCUS_CONFIG.emitMetadata"
            :input-position="GISCUS_CONFIG.inputPosition"
            :lang="GISCUS_CONFIG.lang"
          />

          <!-- 上一篇/下一篇导航 -->
          <div v-motion class="flex flex-col md:flex-row justify-between gap-4 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50" v-if="prevArticle || nextArticle"
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 200 } }">
            <router-link
              v-if="prevArticle"
              :to="prevArticle.path"
              class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 group"
              :aria-label="t('prevArticleAria', { title: prevArticle.title })"
              :title="prevArticle.title"
            >
              <svg class="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              <div class="min-w-0">
                <div class="text-xs text-gray-400">{{ t('prevArticle') }}</div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">{{ prevArticle.title }}</div>
              </div>
            </router-link>
            <div v-if="!prevArticle" class="invisible"></div>
            <router-link
              v-if="nextArticle"
              :to="nextArticle.path"
              class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 group justify-end"
              :aria-label="t('nextArticleAria', { title: nextArticle.title })"
              :title="nextArticle.title"
            >
              <div class="min-w-0 text-right">
                <div class="text-xs text-gray-400">{{ t('nextArticle') }}</div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">{{ nextArticle.title }}</div>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </router-link>
            <div v-if="!nextArticle" class="invisible"></div>
          </div>

          <div class="flex flex-col md:flex-row md:flex-wrap justify-between items-center gap-6 md:gap-8 bg-gray-100/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
            <div class="flex items-start gap-3 min-w-0 flex-wrap" v-if="articleMeta.tags.length>0">
              <span class="text-gray-500 font-medium whitespace-nowrap leading-7">{{ t('tags') }}:</span>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in articleMeta.tags" :key="tag" class="text-sm px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition">#{{ tag }}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-3 shrink-0">
              <button @click="handlePrint"
                  class="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors print:hidden whitespace-nowrap shrink-0" :aria-label="t('print')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {{ t('print') }}
              </button>
              <button 
                @click="toggleFavorite"
                class="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium whitespace-nowrap shrink-0" 
                :aria-label="isFavorited ? t('removeFromFavorites') : t('addToFavorites')"
                :class="{ 'bg-red-700': isFavorited }"
              >
                <svg 
                  class="w-5 h-5" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  fill="none"
                  :class="{ 'fill-current': isFavorited }"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
                {{ isFavorited ? t('favorited') : t('favorite') }}
              </button>
              <button @click="openShareModal" class="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors font-medium whitespace-nowrap shrink-0" :aria-label="t('share')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {{ t('share') }}
              </button>
            </div>
          </div>
        </main>

        <aside class="hidden xl:block w-72 shrink-0" v-if="headings.length > 0">
          <div class="sticky top-16 max-h-[calc(100vh-8rem)] overflow-y-auto toc-scrollbar pl-4 border-l border-gray-200 dark:border-gray-800 z-100" style="pointer-events: auto; overscroll-behavior: contain;" @wheel.stop>
            <h4 class="font-bold text-gray-800 dark:text-white mb-4 text-xs uppercase tracking-wider opacity-60">{{ t('articleDirectory') }}</h4>
            <div v-if="headings.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
              {{ t('noExcerpt') }}
            </div>
            <ul v-else class=" relative">
              <li v-for="h in headings" :key="h.id" v-show="isTocVisible(h)" class="relative">
                <div v-if="activeHeadingId === h.id" class="absolute -left-[21px] top-1 bottom-1 w-[3px] bg-orange-600 rounded-r-md transition-all"></div>
                <button
                    :data-toc-id="h.id"
                    @click="scrollToHeading(h.id)"
                    class="text-left text-[13px] py-1.5 transition-all duration-200 block w-full line-clamp-2 leading-[1.5]"
                    :class="[
                    activeHeadingId === h.id
                      ? 'text-orange-600 font-semibold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                    h.level === 2 ? 'mt-2.5 font-medium' : ''
                  ]"
                    :style="{ paddingLeft: (h.level - 1) * 0.75 + 'rem' }"
                    :aria-current="activeHeadingId === h.id ? 'true' : 'false'"
                >
                  {{ h.text }}
                </button>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </article>

  <div class="fixed bottom-10 right-1 flex flex-col gap-4 z-40 items-center transition-all duration-300"
       :class="hideFloatingChrome || scrollYValue < 200 ? 'translate-y-6 opacity-0 pointer-events-none' : 'opacity-100'">
    <button
        v-if="headings.length > 0"
        @click="showMobileToc = true"
        class="lg:hidden w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition active:scale-95"
        :aria-label="t('showDirectory')"
    >
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
      </svg>
    </button>

    <Transition name="slide-up-fade">
      <button
          v-if="showBackToTop"
          @click="handleBackToTop"
          class="scroll-top-btn"
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </Transition>
  </div>

  <Transition name="slide-fade">
    <div v-if="showMobileToc&&headings.length > 0" class="fixed inset-0 z-[60] lg:hidden">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showMobileToc = false"></div>
      <div class="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
        <div class="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('articleDirectory') }}</h3>
          <button @click="showMobileToc = false" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" :aria-label="t('close')">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="headings.length === 0" class="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('noExcerpt') }}
        </div>
        <div v-else class="flex-1 overflow-y-auto min-h-0 p-6 toc-scrollbar">
          <ul class="space-y-1">
          <li v-for="h in headings" :key="h.id">
              <button
                  @click="scrollToHeading(h.id)"
                  class="text-left w-full text-sm truncate py-2 border-l-2 pl-4 transition-colors"
                  :class="[
                  activeHeadingId === h.id
                  ? 'border-orange-600 text-orange-600 font-bold dark:bg-orange-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
                ]"
                  :aria-current="activeHeadingId === h.id ? 'true' : 'false'"
              >
                {{ h.text }}
              </button>
            </li>
            </ul>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 移动端文章操作浮动栏 -->
  <div class="fixed bottom-[60px] left-0 right-0 z-40 lg:hidden flex justify-center pointer-events-none transition-all duration-300"
       :class="hideFloatingChrome || scrollYValue < 200 ? 'translate-y-24 opacity-0' : 'opacity-100'"
       style="bottom: calc(60px + env(safe-area-inset-bottom, 0px));">
    <div class="flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-3 py-2 pointer-events-auto transform transition-all duration-300">
      <button @click="handleBackToTop" class="icon-btn-sm" :aria-label="t('backToTop')">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
      </button>
      <div class="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>
      <button v-if="headings.length > 0" @click="showMobileToc = true" class="icon-btn-sm" :aria-label="t('showDirectory')">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
      </button>
      <div class="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>
      <button @click="fontSizeLevel = (fontSizeLevel + 1) % 3" class="icon-btn-sm" :aria-label="t('adjustFontSize')">
        <span class="font-serif font-bold text-sm">{{ ['S','M','L'][fontSizeLevel] }}</span>
      </button>
      <div class="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>
      <button @click="openShareModal" class="w-9 h-9 flex-center rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30 text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-colors" :aria-label="t('share')">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
      </button>
    </div>
  </div>

  <!-- 分享模态框 -->
  <ShareModal 
    :is-open="showShareModal"
    :title="articleMeta.title"
    :url="windowLocation"
    @close="closeShareModal"
  />
  </div>
</template>
<script setup lang="ts">
import {computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {ARTICLE_DETAIL_CONFIG, GISCUS_CONFIG, SITE_CONFIG, UI_CONFIG} from '@/constants'
import {t} from '@/utils/i18n'
import {parseMarkdown, sanitizeHtml} from '@/utils/markdown'
import '@/github-markdown.css'
import ShareModal from '@/components/ui/ShareModal.vue'
import GiscusComment from '@/components/GiscusComment.vue'
import type {FavoriteItem} from "@/utils/favorites"
import {addFavorite, isFavorite, removeFavorite} from "@/utils/favorites";
import {fetchWithFallback, formatDate, getEnvVariable} from "@/utils/tool";
import {addRecentArticle, getReadingProgress, saveReadingProgress} from '@/utils/reading-progress';
import {setupSEO, updateArticleSEO, updateArticleJsonLd} from '@/plugins/seo';
import {lenis} from '@/main';
import {ensureCdnLib} from '@/utils/cdn';

// 文档预览器只在 pdf/doc/xls 文章下使用，改为异步组件避免拖进普通文章的加载链路
const DocumentViewer = defineAsyncComponent(() => import('@/components/DocumentViewer.vue'))

const route = useRoute()
const router = useRouter()

// ==================== 状态定义 ====================
const html = ref('')
const title = ref(t('loading'))
const loading = ref(true)
const cover = ref('')
// 远程封面（GitHub OG 图 / picsum）可能超时或 404，失败时收起横幅，避免留下一块空白
const coverBroken = ref(false)
watch(cover, () => { coverBroken.value = false })
// GitHub 栏目用 opengraph 卡片当封面，比例 1200×630，需要整张展示而不是裁切
const isOgCover = computed(() => cover.value.includes('opengraph.githubassets.com'))
const readingTime = ref('')
const showBackToTop = ref(false)
// 移动端悬浮操作栏是否收起（向下滚动时收起）
const hideFloatingChrome = ref(false)
const scrollYValue = ref(0)
let lastScrollForChrome = 0

// 用于上一篇/下一篇导航
const allArticles = ref<any[]>([])

// 竞态条件修复：AbortController 用于取消过期的文章加载请求
let articleAbortController: AbortController | null = null

// 上一篇/下一篇计算
const prevArticle = computed(() => {
  if (allArticles.value.length === 0) return null
  const currentIdx = allArticles.value.findIndex(a => a.path === artPath.value)
  if (currentIdx <= 0) return null
  return allArticles.value[currentIdx - 1]
})
const nextArticle = computed(() => {
  if (allArticles.value.length === 0) return null
  const currentIdx = allArticles.value.findIndex(a => a.path === artPath.value)
  if (currentIdx < 0 || currentIdx >= allArticles.value.length - 1) return null
  return allArticles.value[currentIdx + 1]
})
const articleMeta = ref({
  title: '',
  date: '',
  desc: '',
  tags: [] as string[],
  excerpt: '',
  cover: '',
  chars: 0,
  extension: '' // 添加扩展字段
})
const documentUrl = ref('')
const currentFileExtension = ref('')

// 阅读进度自动保存定时器
let saveProgressTimer: number | null = null
let tocTimer: number | null = null
let restoreScrollTimer: number | null = null
// 当前文章的原始路由路径：组件在文章间复用，卸载时不能用可能已变化的新 route.path
const progressPath = ref('')

// 当前页面URL，供分享/Giscus 使用；依赖 route.fullPath，文章间切换时会重新计算
const windowLocation = computed(() => {
  void route.fullPath
  return window.location.href
})

const isOfficeFile = computed(() => !!currentFileExtension.value && ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(currentFileExtension.value))

// 收藏状态
const isFavorited = ref(false)

// 灯箱状态
const showLightbox = ref(false)
const lightboxImg = ref('')

// 移动端目录状态
const showMobileToc = ref(false)

// 字号控制
const fontSizeLevel = ref(1) // 0: 小, 1: 中, 2: 大
const fontSizeClasses = [
  '!text-sm',
  '!text-base',
  '!text-lg'
]
const fontSizeLabels = [t('fontSizeSmall'), t('fontSizeMedium'), t('fontSizeLarge')] // 用于提示

// 渲染后的Markdown内容
const renderedMarkdown = ref('')

// 文章切换/重新加载时清空上一篇文章的所有展示状态
function resetArticleView() {
  html.value = ''
  renderedMarkdown.value = ''
  cover.value = ''
  readingTime.value = ''
  title.value = t('loading')
  documentUrl.value = ''
  currentFileExtension.value = ''
  isFavorited.value = false
  showLightbox.value = false
  showMobileToc.value = false
  showShareModal.value = false
  showProgress.value = false
  progress.value = 0
  headings.value = []
  activeHeadingId.value = ''
  allArticles.value = []
  articleMeta.value = {
    title: '',
    date: '',
    desc: '',
    tags: [],
    excerpt: '',
    cover: '',
    chars: 0,
    extension: ''
  }
  if (tocTimer) {
    clearTimeout(tocTimer)
    tocTimer = null
  }
  if (restoreScrollTimer) {
    clearTimeout(restoreScrollTimer)
    restoreScrollTimer = null
  }
  if (progressTimer.value) {
    clearTimeout(progressTimer.value)
    progressTimer.value = null
  }
  if (copyToastTimer) {
    clearTimeout(copyToastTimer)
    copyToastTimer = null
  }
  progressPath.value = ''
  lastScrollY = 0
}

// ==================== 代码高亮 ====================
// highlight.js 在 CDN 构建中为按需库（首屏不再下载全量语言包），渲染前先确保已就绪
type HljsLike = {
  getLanguage: (name: string) => unknown
  highlight: (code: string, options: { language: string }) => { value: string }
  highlightAuto: (code: string) => { value: string }
}

let hljs: HljsLike | null = null

const ensureHljs = async () => {
  if (hljs) return
  try {
    await ensureCdnLib('highlight.js')
    const fromGlobal = (window as unknown as { hljs?: HljsLike }).hljs
    hljs = fromGlobal || ((await import('highlight.js')).default as unknown as HljsLike)
  } catch (error) {
    // 高亮失败不影响正文展示
    console.warn('代码高亮库加载失败:', error)
  }
}

const highlightCodeBlock = (block: Element) => {
  if (!hljs) return
  const pre = block.parentElement
  if (!pre) return
  // 获取代码内容
  const codeContent = block.textContent || ''
  // 获取语言类名
  const classes = Array.from(block.classList)
  const langClass = classes.find(cls => cls.startsWith('language-'))
  const language = langClass ? langClass.replace('language-', '') : 'plaintext'
  // 应用高亮
  try {
    if (hljs.getLanguage(language)) {
      const highlighted = hljs.highlight(codeContent, { language }).value
      block.innerHTML = highlighted
    } else {
      const highlighted = hljs.highlightAuto(codeContent).value
      block.innerHTML = highlighted
    }
  } catch (e) {
    console.warn('代码高亮失败:', e)
  }
}

const highlightAllCodeBlocks = () => {
  const codeBlocks = document.querySelectorAll('.markdown-body pre code')
  codeBlocks.forEach(highlightCodeBlock)
}

// 监听主题变化事件
// 主题切换只影响 CSS 变量，高亮产生的 class 不变，无需重新跑一遍代码高亮
const handleThemeChange = (event: CustomEvent) => {
  const theme = event.detail.theme;
  nextTick(() => {
    const markdownBody = document.querySelector('.markdown-body');
    if (markdownBody) {
      markdownBody.setAttribute('data-theme', theme);
    }
  })
}

// 渲染序号：丢弃过期的异步渲染结果，避免快速切换文章时旧内容覆盖新内容
let renderSeq = 0

async function renderFromHtml() {
  const seq = ++renderSeq
  const newHtml = html.value || ''
  if (!newHtml) {
    renderedMarkdown.value = ''
    return
  }

  try {
    await nextTick()
    if (seq !== renderSeq) return

    // 检查是否为 Markdown 内容
    const isMarkdownContent = !newHtml.startsWith('<') && !newHtml.startsWith('<!DOCTYPE html>');
    
    let dirty;
    if (isMarkdownContent) {
      // 处理 Markdown 内容（与 Studio 预览共用同一套解析配置）
      dirty = parseMarkdown(newHtml)
    } else {
      // 直接使用 HTML 内容（包括 txt 的 <pre> 包裹和 html 文件）
      dirty = newHtml
    }
// 处理相对路径的图片和视频资源
    const base = getEnvVariable('VITE_BASE') || '/'
    // 创建临时容器来解析 HTML
    if (base !== '/') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = dirty

      // 处理图片资源
      const images = tempDiv.querySelectorAll('img[src]')
      images.forEach(img => {
        const src = img.getAttribute('src')
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
          // 为相对路径添加 base 前缀
          const normalizedBase = base.endsWith('/') ? base : base + '/'
          const normalizedSrc = src.startsWith('/') ? src.substring(1) : src
          img.setAttribute('src', normalizedBase + normalizedSrc)
        }
      })

      // 处理视频资源
      const videos = tempDiv.querySelectorAll('video[src]')
      videos.forEach(video => {
        const src = video.getAttribute('src')
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
          // 为相对路径添加 base 前缀
          const normalizedBase = base.endsWith('/') ? base : base + '/'
          const normalizedSrc = src.startsWith('/') ? src.substring(1) : src
          video.setAttribute('src', normalizedBase + normalizedSrc)
        }
      })

      // 处理 source 标签（用于视频和音频）
      const sources = tempDiv.querySelectorAll('source[src]')
      sources.forEach(source => {
        const src = source.getAttribute('src')
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
          // 为相对路径添加 base 前缀
          const normalizedBase = base.endsWith('/') ? base : base + '/'
          const normalizedSrc = src.startsWith('/') ? src.substring(1) : src
          source.setAttribute('src', normalizedBase + normalizedSrc)
        }
      })

      // 更新 dirty 内容
      dirty = tempDiv.innerHTML
    }

    // 注意：移除了对 onclick 的允许，避免潜在 XSS
    // 使用 ADD_TAGS / ADD_ATTR 来允许 highlight 所需的 class/标签
    renderedMarkdown.value = sanitizeHtml(dirty)

    // 内容更新后 v-html 会自行替换 DOM，无需再通过 key 强制重建
    await nextTick()
    if (seq !== renderSeq) return
    // 等待 Vue 完成 DOM 更新后再处理代码高亮
    await new Promise(resolve => setTimeout(resolve, 0))
    if (seq !== renderSeq) return
    // 在渲染完成后统一处理代码高亮
    highlightAllCodeBlocks()

    generateTOC()
    setupScrollSpy()
    addCopyButtons()
    classifyBlockquotes()
  } catch (error) {
    if (seq !== renderSeq) return
    console.error('Content parsing error:', error)
    renderedMarkdown.value = `<p>${t('error')}</p>`
  }
}

// 监听html的变化，使用watch代替computed以更好控制渲染时机
watch(html, async () => {
  await renderFromHtml()
}, {immediate: true})

const addCopyButtons = () => {
  // 清理已存在的复制按钮，防止重复添加
  document.querySelectorAll('.markdown-body pre > .copy-button').forEach(button => {
    button.remove();
  });
  // 清理已存在的语言标签
  document.querySelectorAll('.markdown-body pre > .lang-label').forEach(label => {
    label.remove();
  });

  document.querySelectorAll('.markdown-body pre').forEach((pre) => {
    const codeBlock = pre.querySelector('code');
    if (!codeBlock || pre.querySelector('.copy-button')) return;

    // 获取语言
    const classes = Array.from(codeBlock.classList);
    const langClass = classes.find(cls => cls.startsWith('language-'));
    const language = langClass ? langClass.replace('language-', '') : '';

    // 语言标签
    if (language) {
      const langLabel = document.createElement('span');
      langLabel.className =
          'lang-label absolute top-0 left-[68px] h-[2.5rem] text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500 select-none z-10';
      langLabel.textContent = language;
      pre.appendChild(langLabel);
    }

    // 横向溢出时给右侧加渐隐，提示还能继续横向滚动
    if (pre.scrollWidth - pre.clientWidth > 4) {
      pre.classList.add('is-scrollable');
    }

    const button = document.createElement('button');
    button.className = 'copy-button absolute top-0 right-2 h-[2.5rem] flex items-center justify-center p-1.5 rounded-md hover:bg-white/50 dark:hover:bg-gray-600/50 transition-all duration-200 opacity-40 group-hover:opacity-100 z-10';
    button.innerHTML = `<svg class="w-4 h-4 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    button.title = t('copyCode');
    button.onclick = () => copyCodeToClipboard(codeBlock.textContent || '', button);

    // 添加 group 让 hover 生效
    pre.classList.add('group', 'relative');
    (pre as HTMLElement).style.position = 'relative';
    pre.appendChild(button);
  });
};

let copyToastTimer: ReturnType<typeof setTimeout> | null = null;

// 区分两类引用块：来源引用（md-source）与金句（md-quote），分别排版
const classifyBlockquotes = () => {
  document.querySelectorAll('.markdown-body blockquote').forEach((bq) => {
    const text = (bq.textContent || '').trim()
    bq.classList.remove('md-source', 'md-quote')
    bq.classList.add(/^来源/.test(text) ? 'md-source' : 'md-quote')
  })
}
const copyCodeToClipboard = async (text: string, button: HTMLElement) => {
  const original = button.innerHTML;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // 回退方案：使用 textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    button.innerHTML = `<svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    // 清除之前的 toast 避免堆叠
    if (copyToastTimer) {
      clearTimeout(copyToastTimer);
      copyToastTimer = null;
    }
  } catch {
    button.innerHTML = `<svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 8l4 4 4-4"/></svg>`;
    // showError(t('copyFailed'));
  } finally {
    copyToastTimer = setTimeout(() => {
      button.innerHTML = original;
      copyToastTimer = null;
    }, 2500);
  }
};

// ==================== 阅读进度条 ====================
const progress = ref(0)
const showProgress = ref(false)
const progressTimer = ref<number | null>(null)

// 节流保存：限制 localStorage 写入频率
let lastSaveTime = 0
// 最近一次真实滚动位置：卸载时窗口可能已切换，不能依赖 window.scrollY
let lastScrollY = 0
const SAVE_THROTTLE_MS = ARTICLE_DETAIL_CONFIG.saveThrottleMs

const saveProgressThrottled = () => {
  const now = Date.now()
  if (now - lastSaveTime < SAVE_THROTTLE_MS) return
  lastSaveTime = now
  if (!progressPath.value) return
  saveReadingProgress({
    path: progressPath.value,
    title: articleMeta.value.title,
    scrollTop: lastScrollY,
    timestamp: now
  })
}

/** 切换文章/离开页面前落盘当前阅读进度 */
const persistCurrentProgress = () => {
  if (!progressPath.value) return
  saveReadingProgress({
    path: progressPath.value,
    title: articleMeta.value.title,
    scrollTop: lastScrollY,
    timestamp: Date.now()
  })
}

// 使用 rAF 节流滚动事件
let rafId: number | null = null

const updateProgress = () => {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop
    lastScrollY = winScroll
    scrollYValue.value = winScroll
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    progress.value = height > 0 ? (winScroll / height) * 100 : 0
    showBackToTop.value = winScroll > ARTICLE_DETAIL_CONFIG.backToTopThreshold

    // 向下阅读时收起悬浮操作栏，避免遮挡正文；向上滚动或回到顶部时重新出现
    const delta = winScroll - lastScrollForChrome
    if (winScroll < 160) {
      hideFloatingChrome.value = false
    } else if (delta > 8) {
      hideFloatingChrome.value = true
    } else if (delta < -8) {
      hideFloatingChrome.value = false
    }
    lastScrollForChrome = winScroll

    // 显示进度条
    showProgress.value = true

    // 节流保存阅读进度
    saveProgressThrottled()

    // 清除之前的计时器
    if (progressTimer.value) {
      clearTimeout(progressTimer.value)
    }

    // 设置新的计时器，在停止滚动后隐藏进度条
    progressTimer.value = setTimeout(() => {
      showProgress.value = false
    }, ARTICLE_DETAIL_CONFIG.progressHideDelay)
  })
}

const handleBackToTop = () => {
  lenis.scrollTo(0, { duration: UI_CONFIG.scrollToTopDuration })
}

// 移动端触摸滑动切换文章
let touchStartX = 0
let touchStartY = 0
const SWIPE_THRESHOLD = ARTICLE_DETAIL_CONFIG.swipeThreshold

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0]?.clientX ?? 0
  touchStartY = e.touches[0]?.clientY ?? 0
}

const handleTouchEnd = (e: TouchEvent) => {
  const endX = e.changedTouches[0]?.clientX ?? 0
  const endY = e.changedTouches[0]?.clientY ?? 0
  const diffX = endX - touchStartX
  const diffY = Math.abs(endY - touchStartY)

  // 只处理水平滑动，忽略垂直滚动
  if (Math.abs(diffX) < SWIPE_THRESHOLD || diffY > Math.abs(diffX) * 0.5) return

  if (diffX > 0 && prevArticle.value) {
    // 右滑 → 上一篇
    router.push(prevArticle.value.path)
  } else if (diffX < 0 && nextArticle.value) {
    // 左滑 → 下一篇
    router.push(nextArticle.value.path)
  }
}

// 优化: Lightbox 和 MobileToc 的键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (showLightbox.value) {
      showLightbox.value = false
    } else if (showMobileToc.value) {
      showMobileToc.value = false
    }
  }
  // ← → 切换文章
  if (!showLightbox.value && !showMobileToc.value && !showShareModal.value) {
    if (e.key === 'ArrowLeft' && prevArticle.value) {
      router.push(prevArticle.value.path)
    } else if (e.key === 'ArrowRight' && nextArticle.value) {
      router.push(nextArticle.value.path)
    }
  }
}

// ==================== 目录生成与高亮 ====================
const headings = ref<Array<{ text: string; level: number; id: string; section: number }>>([])
const activeHeadingId = ref('')

// 目录过长时（长文 / 新闻合集）只展开当前板块下的条目，避免右侧变成一堵墙
const activeSection = computed(() => {
  const current = headings.value.find((h) => h.id === activeHeadingId.value)
  return current ? current.section : -1
})
const tocCollapsed = computed(() => headings.value.length > 14)

// 当前高亮项超出目录可视区时，把它滚进来（只滚目录容器，不动页面）
watch(activeHeadingId, (id) => {
  if (!id) return
  const container = document.querySelector('.toc-scrollbar') as HTMLElement | null
  const item = container?.querySelector(`[data-toc-id="${id}"]`) as HTMLElement | null
  if (!container || !item) return
  const cRect = container.getBoundingClientRect()
  const iRect = item.getBoundingClientRect()
  if (iRect.top < cRect.top + 8) {
    container.scrollTop -= cRect.top - iRect.top + 12
  } else if (iRect.bottom > cRect.bottom - 8) {
    container.scrollTop += iRect.bottom - cRect.bottom + 12
  }
})
const isTocVisible = (h: { level: number; section: number }) =>
  !tocCollapsed.value || h.level <= 2 || h.section === activeSection.value
let observer: IntersectionObserver | null = null // 优化: 声明 observer 实例用于清理

const generateTOC = () => {
  // 优化: 使用 nextTick 确保 DOM 完全更新
  if (tocTimer) clearTimeout(tocTimer)
  tocTimer = window.setTimeout(() => {
    tocTimer = null
    const container = document.querySelector('.markdown-body')
    if (!container) return

    const elements = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const raw = Array.from(elements)
        .filter(el => el.textContent && el.id)
        .map(el => {
          const element = el as HTMLHeadingElement
          return {
            text: element.textContent!.trim(),
            level: parseInt(element.tagName.charAt(1)),
            id: element.id
          }
        })
        .filter(item => item.text.length > 0)

    // 给每个标题标上所属板块序号（最近的上级 h2），目录过长时按板块折叠 h3
    let sectionIndex = -1
    headings.value = raw.map((item) => {
      if (item.level <= 2) sectionIndex += 1
      return { ...item, section: sectionIndex }
    })
  }, ARTICLE_DETAIL_CONFIG.tocGenerateDelay)
}

const setupScrollSpy = () => {
  // 清理旧的 observer
  if (observer) observer.disconnect()

  nextTick(() => {
    const container = document.querySelector('.markdown-body')
    if (!container) return

    // rootMargin: 顶部 -80px (留出导航栏空间), 底部 -66% (确保标题进入上半屏时被激活)
    observer = new IntersectionObserver((entries) => {
      const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target as HTMLElement)
          // 按照 DOM 顺序排序，优先激活文章中更靠前的标题
          .sort((a, b) => a.offsetTop - b.offsetTop);

      if (visibleHeadings.length > 0) {
        // 激活第一个进入阅读区域的标题
        activeHeadingId.value = visibleHeadings[0]?.id ?? '';
      }
    }, {
      // 优化: 顶部 margin 设为 -100px（考虑固定导航栏+工具栏），底部 -50% 确保标题进入上半屏即激活
      rootMargin: '-100px 0px -50% 0px'
    })

    container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      observer!.observe(h)
    })
  })
}

// ==================== 图片查看器 ====================
const handleContentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // 只处理图片点击，不要阻止其他元素的默认行为（如 router-link）
  if (target.tagName === 'IMG' && target.closest('.markdown-body') && !target.closest('a')) {
    e.preventDefault()
    lightboxImg.value = (target as HTMLImageElement).src
    showLightbox.value = true
  }
}

// ==================== 分享功能 ====================
const showShareModal = ref(false)

const openShareModal = () => {
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
}

// ==================== 收藏功能 ====================
const toggleFavorite = () => {
  const currentPath = route.path;
  
  if (isFavorited.value) {
    // 取消收藏
    removeFavorite(currentPath);
    isFavorited.value = false;
  } else {
    // 添加收藏
    const favoriteItem: FavoriteItem = {
      path: currentPath,
      title: articleMeta.value.title,
      date: articleMeta.value.date,
      cover: articleMeta.value.cover,
      tags: articleMeta.value.tags,
      excerpt: articleMeta.value.excerpt
    };
    
    addFavorite(favoriteItem);
    isFavorited.value = true;
  }
}

// ==================== 打印功能 ====================
const handlePrint = () => {
  window.print()
}

const artPath=ref<string>('')

// 文章所属栏目：取路由路径去掉最后一段（/新闻轴/2026-10-26-新闻轴 → 新闻轴）
const articleCategory = computed(() =>
  artPath.value.split('/').filter(Boolean).slice(0, -1).join(' / ')
)

// 中文阅读统计：汉字按 400 字/分钟、英文按 200 词/分钟，代码块与链接不计入
function computeReadingStats(text: string) {
  const plain = text
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, ' ')
  const cjk = (plain.match(/[\u4e00-\u9fa5]/g) || []).length
  const latin = (plain.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length
  return {
    chars: cjk,
    minutes: Math.max(1, Math.ceil(cjk / 400 + latin / 200)),
  }
}

let loadSeq = 0
// ==================== 加载文章逻辑 ====================
const loadArticle = async (filePath: string) => {
  // 组件在文章间复用，卸载钩子不会触发；切换前先把上一篇的进度落盘
  persistCurrentProgress()

  const seq = ++loadSeq
  // 竞态条件修复：取消之前的请求
  if (articleAbortController) {
    articleAbortController.abort()
  }
  articleAbortController = new AbortController()

  window.scrollTo(0, 0)
  if (observer) observer.disconnect() // 在加载新文章前断开旧 observer
  resetArticleView()
  loading.value = true

  let decodedPath: string
  try {
    decodedPath = decodeURIComponent(filePath)
  } catch {
    if (seq === loadSeq) {
      html.value = `# 😕 ${t('articleLoadError')}\n\n${t('articleLoadErrorDesc')}`
      loading.value = false
    }
    return
  }

  artPath.value = decodedPath
  progressPath.value = filePath
  if (!artPath.value) {
    loading.value = false
    return
  }

  try {
    // 代码高亮库为按需加载：与正文请求并行，避免串行等待拉长文章打开时间
    const hljsTask = ensureHljs()

    // 先获取导航数据，避免多次网络请求尝试不同扩展名
    const navName = getEnvVariable('PJ_BLOG_NAV_NAME')
    const base=getEnvVariable('VITE_BASE')||'/'
    const navRes = await fetchWithFallback([`${base}generated/${navName}`,`${base}generated/nav.json`],'导航数据');
    const navData = await navRes.json();
    if (seq !== loadSeq) return

    // 存储所有文章用于上一篇/下一篇导航（仅非文档类型）
    const articleList = navData.filter((item: any) => {
      const ext = item.url?.split('.').pop()?.toLowerCase() || '';
      return !['pdf','doc','docx','xls','xlsx'].includes(ext);
    });
    allArticles.value = articleList;

    // 根据路径查找文章信息
    // 移除console调试语句
    const articleInfo = navData.find((item: any) => item.path === artPath.value || item.path === artPath.value.slice(0, -3));
    if (!articleInfo) {
      throw new Error('Not Found');
    }
    
    // 添加到最近浏览的文章
    addRecentArticle({
      path: articleInfo.path,
      title: articleInfo.title,
      date: articleInfo.date,
      cover: articleInfo.cover,
      tags: articleInfo.tags,
      excerpt: articleInfo.excerpt
    });
    
    const actualFilePath=decodeURIComponent(articleInfo.url)||''
    // 添加时间戳避免缓存
    const fiveMinuteTimestamp = Math.floor(Date.now() / (5 * 60 * 1000))
    const baseUrl=getEnvVariable('VITE_BASE')||''
    
    // 修复URL编码问题 - 确保中文路径被正确处理
    // 从 nav.json 中可以看到 URL 已经是正确编码的，所以我们直接使用
    const filePathWithTimestamp = `${baseUrl}${actualFilePath}?t=${fiveMinuteTimestamp}`.replace('//','/');

    // 处理其他文档类型 (Word, Excel)
    const docExtensions = ['pdf','doc', 'docx', 'xls', 'xlsx'];
    const fileExtension = articleInfo.extension || actualFilePath.split('.').pop()?.toLowerCase() || '';
    if (docExtensions.includes(fileExtension)) {
      articleMeta.value.title = articleInfo.title || t('noArticles');
      articleMeta.value.date = formatDate(articleInfo.date || '');
      articleMeta.value.cover = articleInfo.cover || '';
      articleMeta.value.tags = articleInfo.tags || [];
      articleMeta.value.excerpt = articleInfo.excerpt || '';
      articleMeta.value.extension = fileExtension;

      // 设置文档 URL - 直接使用已经编码好的URL
      documentUrl.value = filePathWithTimestamp;
      currentFileExtension.value = fileExtension;
      cover.value = articleInfo.cover || '';
      readingTime.value = '';
      isFavorited.value = isFavorite(filePath);

      // 设置标题和其他元信息
      document.title = `${articleInfo.title} - ${SITE_CONFIG.title}`
      
      // 更新SEO标签
      updateArticleSEO({
        title: `${articleInfo.title} - ${SITE_CONFIG.title}`,
        description: articleInfo.excerpt || SITE_CONFIG.description,
        path: filePath
      })
      
      // 更新 JSON-LD 结构化数据
      updateArticleJsonLd({
        title: articleInfo.title,
        description: articleInfo.excerpt || SITE_CONFIG.description,
        date: articleInfo.date,
        cover: articleInfo.cover,
        path: filePath
      })
      
      loading.value = false;
      // await loadDocument(filePathWithTimestamp,fileExtension)
      return;
    }

    const res = await fetch(filePathWithTimestamp, { signal: articleAbortController.signal });

    if (!res.ok) throw new Error('Not Found');

    const contentText = await res.text();
    if (seq !== loadSeq) return
    let content = contentText;
    let isMarkdown = actualFilePath.endsWith('.md');
    // 使用导航数据中的信息填充 articleMeta
    articleMeta.value.title = articleInfo.title || t('noArticles');
    articleMeta.value.date = formatDate(articleInfo.date|| '') ;
    articleMeta.value.cover = articleInfo.cover || '';
    articleMeta.value.tags = articleInfo.tags || [];
    articleMeta.value.excerpt = articleInfo.excerpt || ''
    const stats = computeReadingStats(content)
    articleMeta.value.chars = stats.chars
    readingTime.value = stats.minutes + ' ' + t('readingTime')

    if (!isMarkdown) {
      if (actualFilePath.endsWith('.html')) {
        // 对于 HTML 文件，直接使用内容
        content = contentText;
        isMarkdown = false;
      } else if (actualFilePath.endsWith('.txt')) {
        // 对于 TXT 文件，转换为基本的 HTML 格式
        content = `<pre class="text-content">${contentText}</pre>`;
        isMarkdown = false;
      }

      // 计算 TXT 和 HTML 文件的阅读时间
      const stats = computeReadingStats(contentText);
      articleMeta.value.chars = stats.chars
      readingTime.value = stats.minutes + ' ' + t('readingTime');
    }else{
      // 移除 BOM 字符和开头空白后匹配 frontmatter
      const trimmedContent = contentText.replace(/^\uFEFF/, '').trimStart()
      const fmMatch = trimmedContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
      if (fmMatch) {
        content = trimmedContent.slice(fmMatch[0].length)
      } else {
        content = trimmedContent
      }
    }

    // 等待高亮库就绪后再交给渲染流程（与网络请求已并行）
    await hljsTask
    if (seq !== loadSeq) return

    html.value = content
    title.value = articleMeta.value.title
    cover.value = articleMeta.value.cover
    
    // 检查是否已收藏
    isFavorited.value = isFavorite(filePath);

    // 目录与滚动监听由 renderFromHtml 在正文渲染完成后统一处理，这里不再重复调用
    document.title = `${articleMeta.value.title} - ${SITE_CONFIG.title}`
    
    // 更新SEO标签
    updateArticleSEO({
      title: `${articleMeta.value.title} - ${SITE_CONFIG.title}`,
      description: articleMeta.value.excerpt || SITE_CONFIG.description,
      path: filePath
    })
    
    // 更新 JSON-LD 结构化数据
    updateArticleJsonLd({
      title: articleMeta.value.title,
      description: articleMeta.value.excerpt || SITE_CONFIG.description,
      date: articleMeta.value.date,
      cover: articleMeta.value.cover,
      path: filePath
    })
    
    // 页面加载完成后恢复阅读进度
    if (restoreScrollTimer) clearTimeout(restoreScrollTimer)
    restoreScrollTimer = window.setTimeout(() => {
      restoreScrollTimer = null
      if (seq !== loadSeq) return
      const progress = getReadingProgress(filePath);
      if (progress) {
        window.scrollTo(0, progress.scrollTop);
      }
    },300);
  } catch (err) {
    // 竞态条件修复：忽略被取消的请求和过期请求
    if (seq !== loadSeq) return
    if (err instanceof DOMException && err.name === 'AbortError') {
      return
    }
    console.error(err)
    html.value = `# 😕 ${t('articleLoadError')}\n\n${t('articleLoadErrorDesc')}\n\n\`\`\`\n${err instanceof Error ? err.message : String(err)}\n\`\`\``
    isFavorited.value = false;
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

watch(() => route.path, (path) => {
  if (path && path !== '/') {
    loadArticle(`${path}`)
  }
}, {immediate: true})

onMounted(() => {
  window.addEventListener('scroll', updateProgress)
  // 优化: 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown)
  // 监听主题变化事件
  window.addEventListener('theme-change', handleThemeChange as EventListener)
  
  // 阅读进度由滚动事件中的 rAF + 节流函数自动保存
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  // 优化: 移除键盘事件监听
  window.removeEventListener('keydown', handleKeydown)
  // 优化: 清理 Intersection Observer
  if (observer) observer.disconnect()
  // 移除主题变化事件监听
  window.removeEventListener('theme-change', handleThemeChange as EventListener)
  
  // 清理 rAF（防止内存泄漏）
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  
  // 清除进度条隐藏定时器
  if (progressTimer.value) {
    clearTimeout(progressTimer.value)
    progressTimer.value = null
  }

  if (tocTimer) {
    clearTimeout(tocTimer)
    tocTimer = null
  }
  if (restoreScrollTimer) {
    clearTimeout(restoreScrollTimer)
    restoreScrollTimer = null
  }
  if (copyToastTimer) {
    clearTimeout(copyToastTimer)
    copyToastTimer = null
  }
  
  // 清除定时保存阅读进度的定时器
  if (saveProgressTimer) {
    clearInterval(saveProgressTimer);
    saveProgressTimer = null;
  }
  
  // 取消正在进行的文章加载请求，并让过期响应失效
  loadSeq++
  if (articleAbortController) {
    articleAbortController.abort()
    articleAbortController = null
  }
  
  // 恢复默认SEO标签
  setupSEO()
  
  // 保存阅读进度（页面卸载时最后一次保存）
  persistCurrentProgress()
  progressPath.value = ''
})

const scrollToHeading = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    showMobileToc.value = false
    lenis.scrollTo(el, {
      offset: -80,
      duration: 1.2
    })
  }
}

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide-up-fade-enter-active, .slide-up-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-fade-enter-from, .slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 动画 */
.scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}

.animate-zoom-in {
  animation: zoomIn 0.3s ease-out;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 滚动条美化 */
.toc-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.toc-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.toc-scrollbar::-webkit-scrollbar-thumb {
  background: #d8c8b6;
  border-radius: 4px;
}

.toc-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #b3a08b;
}

.dark .toc-scrollbar::-webkit-scrollbar-thumb {
  background: #3d352e;
}

.dark .toc-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #4a4038;
}

/* 工具提示 */
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip:before {
  content: attr(data-tip);
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #333;
  color: #fff;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.tooltip:hover:before {
  opacity: 1;
}

/* 打印样式 */
@media print {
  .markdown-body :not(pre) > code {
    background: #eee !important;
    color: #333 !important;
  }
  table { border-collapse: collapse !important; }
  th, td { border: 1px solid #ddd !important; padding: 8px !important; }
  th { background: #f5f5f5 !important; }
  a { color: #0066cc !important; text-decoration: underline !important; }
  img { max-width: 100% !important; break-inside: avoid; page-break-inside: avoid; }
  ul, ol, li { color: black !important; }
  blockquote { border-left: 4px solid #ccc !important; color: #555 !important; }
}

.animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>