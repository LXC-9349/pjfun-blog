<template>
  <div class="article-detail-wrapper">
    <Transition name="fade" mode="out-in">
      <div v-if="showLightbox" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" @click="showLightbox = false">
        <img :src="lightboxImg" class="max-w-full max-h-screen object-contain rounded-sm shadow-2xl scale-in animate-zoom-in" :alt="t('lightboxImage')" @click.stop />
        <button class="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors" @click="showLightbox = false" aria-label="Close Lightbox">
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
        class="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-200 ease-out"
        :style="{ width: progress + '%' }"
    >
    </div>
  </div>

  <!-- 将返回按钮和主题切换按钮放在一起 -->
  <div class="fixed lg:hidden top-4 left-4 z-[60]">
    <router-link
        to="/"
        class="flex items-center gap-2 px-3 py-3 bg-black/20 dark:bg-white/20 backdrop-blur-md rounded-full hover:bg-black/30 dark:hover:bg-white/30 transition-colors border border-white/20 dark:border-white/30 text-white"
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

  <article class="min-h-screen dark:bg-[#0d1117] transition-colors duration-300 lg:pb-0" style="padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px));"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
  >
    <!-- 封面部分 -->
    <div v-if="cover" class="relative h-[60vh] min-h-[400px] overflow-hidden group">
      <img :src="cover" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-90" alt="封面">
      <div class="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-black/60"></div>

      <!-- 封面中的标题信息 -->
      <div class="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white z-10 max-w-7xl mx-auto">
        <div class="flex flex-wrap gap-3 mb-6 opacity-0 animate-slide-up" style="animation-delay: 0.1s">
          <span v-for="tag in articleMeta.tags" :key="tag" class="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer">
            #{{ tag }}
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold leading-tight mb-8 opacity-0 animate-slide-up tracking-tight" style="animation-delay: 0.2s">
          {{ articleMeta.title }}
        </h1>
        <div class="flex items-center gap-6 text-sm md:text-base font-medium opacity-0 animate-slide-up text-gray-300" style="animation-delay: 0.3s">
          <time class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-3 2v12a2 2 0 002 2z" />
            </svg>
            {{ articleMeta.date }}
          </time>
          <span v-if="readingTime.length>0" class="w-1 h-1 bg-gray-500 rounded-full"></span>
          <span v-if="readingTime.length>0" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ readingTime }}
          </span>
        </div>
      </div>
    </div>

    <!-- 无封面时显示的标题 -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
      <h1 class="text-3xl md:text-3xl font-extrabold leading-tight mb-8 tracking-tight text-gray-800 dark:text-white animate-fade-in-down">
        {{ articleMeta.title }}
      </h1>
      <div class="flex dark:text-white dark:text-warmGray flex-wrap justify-center gap-3 mb-2 opacity-0 animate-slide-up" style="animation-delay: 0.1s">
        <span v-for="tag in articleMeta.tags" :key="tag" class="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer">
          #{{ tag }}
        </span>
      </div>
      <div class="flex items-center justify-center gap-6 text-base font-medium text-gray-500 dark:text-gray-400">
        <time class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-3 2v12a2 2 0 002 2z" />
          </svg>
          {{ articleMeta.date }}
        </time>
        <span v-if="readingTime.length>0" class="w-1 h-1 bg-gray-500 rounded-full"></span>
        <span v-if="readingTime.length>0" class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ readingTime }}
        </span>
      </div>
    </div>

    <div class="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div class="flex flex-col lg:flex-row gap-5 relative">

        <div class="hidden lg:flex flex-col gap-4 sticky top-32 h-fit items-end w-16 shrink-0 order-first">
          <div class="flex flex-col gap-4 p-2 bg-white/80 dark:bg-[#161b22]/80 backdrop-blur rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="tooltip tooltip-right" :data-tip="t('backToHome')">
              <router-link
                  to="/"
                  class="icon-btn"
                  :aria-label="t('backToHome')"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </router-link>
            </div>
            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>
            <div class="tooltip tooltip-right" :data-tip="t('share')">
              <button @click="openShareModal" class="w-10 h-10 flex-center rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors" :aria-label="t('share')">
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
              : 'max-w-4xl mx-auto min-w-0'"
          >
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
              :key="componentKey"
              class="prose dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-img:rounded-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 markdown-body animate-fade-in"
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
              class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
              :aria-label="'上一篇: ' + prevArticle.title"
            >
              <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              <div class="min-w-0">
                <div class="text-xs text-gray-400">{{ t('prevArticle') }}</div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ prevArticle.title }}</div>
              </div>
            </router-link>
            <div v-if="!prevArticle" class="invisible"></div>
            <router-link
              v-if="nextArticle"
              :to="nextArticle.path"
              class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group justify-end"
              :aria-label="'下一篇: ' + nextArticle.title"
            >
              <div class="min-w-0 text-right">
                <div class="text-xs text-gray-400">{{ t('nextArticle') }}</div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ nextArticle.title }}</div>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </router-link>
            <div v-if="!nextArticle" class="invisible"></div>
          </div>

          <div class="flex flex-col md:flex-row justify-between items-center gap-8 bg-gray-100/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
            <div class="flex items-center gap-3" v-if="articleMeta.tags.length>0">
              <span class="text-gray-500 font-medium">{{ t('tags') }}:</span>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in articleMeta.tags" :key="tag" class="text-sm px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition">#{{ tag }}</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="handlePrint"
                  class="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors print:hidden" :aria-label="t('print')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {{ t('print') }}
              </button>
              <button 
                @click="toggleFavorite"
                class="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium" 
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
              <button @click="openShareModal" class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium" :aria-label="t('share')">
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
              <li v-for="h in headings" :key="h.id" class="relative">
                <div v-if="activeHeadingId === h.id" class="absolute -left-[21px] top-1 bottom-1 w-[3px] bg-blue-600 rounded-r-md transition-all"></div>
                <button
                    @click="scrollToHeading(h.id)"
                    class="text-left text-sm py-1.5 transition-all duration-200 block w-full truncate leading-relaxed"
                    :class="[
                    activeHeadingId === h.id
                      ? 'text-blue-600 font-semibold pl-1'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  ]"
                    :style="{ paddingLeft: (h.level - 1) * 1 + 'rem' }"
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

  <div class="fixed bottom-10 right-1 flex flex-col gap-4 z-40 items-center">
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
      <div class="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white dark:bg-[#161b22] shadow-2xl flex flex-col">
        <div class="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('articleDirectory') }}</h3>
          <button @click="showMobileToc = false" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" :aria-label="t('close')">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="headings.length === 0" class="flex-1 flex items-center justify-center text-[#000000ff]">
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
                  ? 'border-blue-600 text-blue-600 font-bold dark:bg-blue-900/20'
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
  <div class="fixed bottom-[60px] left-0 right-0 z-40 lg:hidden flex justify-center pointer-events-none" style="bottom: calc(60px + env(safe-area-inset-bottom, 0px));">
    <div class="flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-3 py-2 pointer-events-auto transform transition-all duration-300">
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
      <button @click="openShareModal" class="w-9 h-9 flex-center rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors" :aria-label="t('share')">
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
import {computed, nextTick, onActivated, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {GISCUS_CONFIG, SITE_CONFIG} from '@/constants'
import {t} from '@/utils/i18n'
import {marked, Renderer} from 'marked'
import {gfmHeadingId} from 'marked-gfm-heading-id';
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import '@/github-markdown.css'
import ShareModal from '@/components/ui/ShareModal.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import GiscusComment from '@/components/GiscusComment.vue'
import type {FavoriteItem} from "@/utils/favorites"
import {addFavorite, isFavorite, removeFavorite} from "@/utils/favorites";
import {fetchWithFallback, formatDate, getEnvVariable} from "@/utils/tool";
import {addRecentArticle, getReadingProgress, saveReadingProgress} from '@/utils/reading-progress';
import {setupSEO, updateArticleSEO, updateArticleJsonLd} from '@/plugins/seo';
import {lenis} from '@/main';

// 创建 marked 实例并配置一次
const renderer = new Renderer()
renderer.link = function (options: { href?: string | null; title?: string | null; text?: string }) {
  const {href, title, text} = options;
  // 构造原始的链接HTML
  const defaultHtml = `<a href="${href || ''}"${title ? ` title="${title}"` : ''}>${text || ''}</a>`;
  // 添加target和rel属性
  return defaultHtml.replace(/^<a /, '<a target="_blank" rel="nofollow noopener noreferrer" ');
}

// 添加 marked 配置
marked.setOptions({
  breaks: false,
  gfm: true,
  pedantic: false,
  silent: false,
});
const componentKey = ref(0);
marked.use(
    {renderer},
    gfmHeadingId({prefix: 'h-'})
);

const route = useRoute()
const router = useRouter()

// ==================== 状态定义 ====================
const html = ref('')
const title = ref(t('loading'))
const loading = ref(true)
const cover = ref('')
const readingTime = ref('')
const showBackToTop = ref(false)

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
  extension: '' // 添加扩展字段
})
const documentUrl = ref('')
const currentFileExtension = ref('')

// 阅读进度自动保存定时器
let saveProgressTimer: number | null = null

// 当前页面URL，供分享使用
const windowLocation = computed(() => window.location.href)

const isOfficeFile = computed(() => currentFileExtension.value && ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(currentFileExtension.value))

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

// ==================== 代码高亮 ====================\n
// 提取公共的代码高亮逻辑，避免3处重复\n
const highlightCodeBlock = (block: Element) => {
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
const handleThemeChange = (event: CustomEvent) => {
  const theme = event.detail.theme;
  // 设置 markdown-body 的 data-theme 属性
  nextTick(() => {
    const markdownBody = document.querySelector('.markdown-body');
    if (markdownBody) {
      markdownBody.setAttribute('data-theme', theme);
    }
    highlightAllCodeBlocks()
    addCopyButtons()
  })
}

async function renderFromHtml() {
  const newHtml = html.value || ''
  if (!newHtml) {
    renderedMarkdown.value = ''
    return
  }

  try {
    await nextTick()
    
    // 检查是否为 Markdown 内容
    const isMarkdownContent = !newHtml.startsWith('<') && !newHtml.startsWith('<!DOCTYPE html>');
    
    let dirty;
    if (isMarkdownContent) {
      // 处理 Markdown 内容
      dirty = await marked.parse(newHtml)
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
    //@ts-ignore
    renderedMarkdown.value = DOMPurify.sanitize(dirty, {
      ADD_TAGS: ['span', 'div', 'pre', 'code', 'button'],
      ADD_ATTR: ['class', 'style', 'title', 'aria-label', 'target', 'rel', 'href', 'src', 'alt', 'onclick'],
      FORBID_ATTR: [],
      ALLOW_DATA_ATTR: false,
      FORCE_BODY: true
    })

    // 可选：强制重新生成 key，确保在极端缓存场景下重新建 DOM
    componentKey.value++

    await nextTick()
    // 等待 Vue 完成 DOM 更新后再处理代码高亮
    await new Promise(resolve => setTimeout(resolve, 0))
    // 在渲染完成后统一处理代码高亮
    highlightAllCodeBlocks()

    generateTOC()
    setupScrollSpy()
    addCopyButtons()
  } catch (error) {
    console.error('Content parsing error:', error)
    renderedMarkdown.value = `<p>${t('error')}</p>`
  }
}

// 监听html的变化，使用watch代替computed以更好控制渲染时机
watch(html, async () => {
  await renderFromHtml()
}, {immediate: true})

// 修改 onActivated 钩子，确保组件激活时重新处理代码高亮
onActivated(() => {
  // 强制重新渲染，避免二次转义问题
  if (html.value) {
    nextTick(() => {
      // 清理已存在的复制按钮
      document.querySelectorAll('.markdown-body pre > .copy-button').forEach(button => {
        button.remove();
      });

      // 使用公共高亮函数
      highlightAllCodeBlocks()

      // 重新添加复制按钮
      addCopyButtons()
    })
  }
})

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

    // 添加语言标签
    if (language) {
      const langLabel = document.createElement('span');
      langLabel.className =
          'lang-label absolute top-0 left-3 h-[2.0rem] text-[9px] font-mono font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none z-10';
      langLabel.textContent = language;
      pre.appendChild(langLabel);
    }

    const button = document.createElement('button');
    button.className = 'copy-button absolute top-0 right-2 h-[2.5rem] flex items-center justify-center p-1.5 rounded-md hover:bg-white/30 dark:hover:bg-gray-600/50 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10';
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
const SAVE_THROTTLE_MS = 3000

const saveProgressThrottled = () => {
  const now = Date.now()
  if (now - lastSaveTime < SAVE_THROTTLE_MS) return
  lastSaveTime = now
  saveReadingProgress({
    path: route.path,
    title: articleMeta.value.title,
    scrollTop: window.scrollY,
    timestamp: now
  })
}

// 使用 rAF 节流滚动事件
let rafId: number | null = null

const updateProgress = () => {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    progress.value = height > 0 ? (winScroll / height) * 100 : 0
    showBackToTop.value = winScroll > 300

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
    }, 1500)
  })
}

const handleBackToTop = () => {
  lenis.scrollTo(0, { duration: 1 })
}

// 移动端触摸滑动切换文章
let touchStartX = 0
let touchStartY = 0
const SWIPE_THRESHOLD = 60

const handleTouchStart = (e: TouchEvent) => {
  //@ts-ignore
  touchStartX = e.touches[0].clientX
  //@ts-ignore
  touchStartY = e.touches[0].clientY
}

const handleTouchEnd = (e: TouchEvent) => {
  //@ts-ignore
  const endX = e.changedTouches[0].clientX
  //@ts-ignore
  const endY = e.changedTouches[0].clientY
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
const headings = ref<Array<{ text: string; level: number; id: string }>>([])
const activeHeadingId = ref('')
let observer: IntersectionObserver | null = null // 优化: 声明 observer 实例用于清理

const generateTOC = () => {
  // 优化: 使用 nextTick 确保 DOM 完全更新
  setTimeout(() => {
    const container = document.querySelector('.markdown-body')
    if (!container) return

    const elements = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.value = Array.from(elements)
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
  }, 200)
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
// ==================== 加载文章逻辑 ====================
const loadArticle = async (filePath: string) => {
  // 竞态条件修复：取消之前的请求
  if (articleAbortController) {
    articleAbortController.abort()
  }
  articleAbortController = new AbortController()

  window.scrollTo(0, 0)
  activeHeadingId.value = ''
  if (observer) observer.disconnect() // 在加载新文章前断开旧 observer
  artPath.value = decodeURIComponent(filePath);
  if (!artPath.value) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    
    // 先获取导航数据，避免多次网络请求尝试不同扩展名
    const navName = getEnvVariable('PJ_BLOG_NAV_NAME')
    const base=getEnvVariable('VITE_BASE')||'/'
    const navRes = await fetchWithFallback([`${base}generated/${navName}`,`${base}generated/nav.json`],'导航数据');
    const navData = await navRes.json();

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

      // 设置标题和其他元信息
      document.title = `${articleInfo.title} - ${SITE_CONFIG.title}`
      
      // 更新SEO标签
      updateArticleSEO({
        title: `${articleInfo.title} - ${SITE_CONFIG.title}`,
        description: articleInfo.excerpt || SITE_CONFIG.description,
        path: route.path
      })
      
      // 更新 JSON-LD 结构化数据
      updateArticleJsonLd({
        title: articleInfo.title,
        description: articleInfo.excerpt || SITE_CONFIG.description,
        date: articleInfo.date,
        cover: articleInfo.cover,
        path: route.path
      })
      
      loading.value = false;
      // await loadDocument(filePathWithTimestamp,fileExtension)
      return;
    }

    const res = await fetch(filePathWithTimestamp, { signal: articleAbortController.signal });

    if (!res.ok) throw new Error('Not Found');

    const contentText = await res.text();
    let content = contentText;
    let isMarkdown = actualFilePath.endsWith('.md');
    // 使用导航数据中的信息填充 articleMeta
    articleMeta.value.title = articleInfo.title || t('noArticles');
    articleMeta.value.date = formatDate(articleInfo.date|| '') ;
    articleMeta.value.cover = articleInfo.cover || '';
    articleMeta.value.tags = articleInfo.tags || [];
    articleMeta.value.excerpt = articleInfo.excerpt || ''
    const words = content.trim().split(/\s+/).length
    readingTime.value = Math.ceil(words / 200) + ' ' + t('readingTime')

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
      const words = contentText.trim().split(/\s+/).length;
      readingTime.value = Math.ceil(words / 200) + ' ' + t('readingTime');
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

    html.value = content
    title.value = articleMeta.value.title
    cover.value = articleMeta.value.cover
    
    // 检查是否已收藏
    isFavorited.value = isFavorite(route.path);

    // 等待DOM更新后再生成目录和设置滚动监听
    await nextTick()
    generateTOC()
    setupScrollSpy()
    document.title = `${articleMeta.value.title} - ${SITE_CONFIG.title}`
    
    // 更新SEO标签
    updateArticleSEO({
      title: `${articleMeta.value.title} - ${SITE_CONFIG.title}`,
      description: articleMeta.value.excerpt || SITE_CONFIG.description,
      path: route.path
    })
    
    // 更新 JSON-LD 结构化数据
    updateArticleJsonLd({
      title: articleMeta.value.title,
      description: articleMeta.value.excerpt || SITE_CONFIG.description,
      date: articleMeta.value.date,
      cover: articleMeta.value.cover,
      path: route.path
    })
    
    // 页面加载完成后恢复阅读进度
    setTimeout(() => {
      const progress = getReadingProgress(route.path);
      if (progress) {
        window.scrollTo(0, progress.scrollTop);
      }
    },300);
  } catch (err) {
    // 竞态条件修复：忽略被取消的请求
    if (err instanceof DOMException && err.name === 'AbortError') {
      return
    }
    console.error(err)
    html.value = `# 😕 ${t('articleLoadError')}\n\n${t('articleLoadErrorDesc')}\n\n\`\`\`\n${err instanceof Error ? err.message : String(err)}\n\`\`\``
    isFavorited.value = false;
  } finally {
    loading.value = false
    componentKey.value++;
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
  
  // 清除定时保存阅读进度的定时器
  if (saveProgressTimer) {
    clearInterval(saveProgressTimer);
    saveProgressTimer = null;
  }
  
  // 取消正在进行的文章加载请求
  if (articleAbortController) {
    articleAbortController.abort()
    articleAbortController = null
  }
  
  // 恢复默认SEO标签
  setupSEO()
  
  // 保存阅读进度（页面卸载时最后一次保存）
  saveReadingProgress({
    path: route.path,
    title: articleMeta.value.title,
    scrollTop: window.scrollY,
    timestamp: Date.now()
  });
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
  background: #d1d5db;
  border-radius: 4px;
}

.toc-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #9ca3af;
}

.dark .toc-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .toc-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #6b7280;
}

/* Mac 风格代码块顶部装饰 */
.markdown-body pre {
  padding-top: 2.5rem !important;
}

.markdown-body pre::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2.5rem;
  background-color: rgb(243 244 246);
  border-bottom: 1px solid rgb(209 213 219);
  border-radius: 12px 12px 0 0;
}

.dark .markdown-body pre::before {
  background-color: rgb(31 41 55);
  border-bottom-color: rgb(55 65 81);
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