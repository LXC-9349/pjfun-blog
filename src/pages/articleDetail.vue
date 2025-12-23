<template>
  <Transition name="fade" mode="out-in">
    <div v-if="showLightbox" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out" @click="showLightbox = false">
      <img :src="lightboxImg" class="max-w-full max-h-screen object-contain rounded-sm shadow-2xl scale-in animate-zoom-in" :alt="t('lightboxImage')" @click.stop />
      <button class="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors transform hover:scale-110 hover:rotate-90" @click="showLightbox = false" aria-label="Close Lightbox">
        <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>

  <!-- 现代化水平进度条：位于底部 -->
  <div
      v-if="!isOfficeFile"
      class="fixed bottom-0 left-0 w-full h-1 bg-transparent z-50 transition-all duration-500 ease-out-expo"
      :class="{ 'opacity-0': !showProgress, 'opacity-100': showProgress }"
  >
    <div
        class="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-r-full shadow-lg transition-all duration-300 ease-out"
        :style="{ width: progress + '%' }"
    >
    </div>
  </div>

  <!-- 将返回按钮和主题切换按钮放在一起 -->
  <div class="fixed lg:hidden top-4 left-4 z-[60]">
    <router-link
        to="/"
        class="flex items-center gap-2 px-3 py-3 bg-black/20 dark:bg-white/20 backdrop-blur-md rounded-full hover:bg-black/30 dark:hover:bg-white/30 transition-all duration-300 border border-white/20 dark:border-white/30 group text-white transform hover:scale-110"
    >
      <svg class="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </router-link>
  </div>

  <!-- 主题切换按钮 -->
  <div class="fixed top-4 right-4 z-[9999] transform hover:scale-110 transition-all duration-300 hover:rotate-12">
    <ThemeToggle />
  </div>

  <article class="min-h-screen bg-gray-50 dark:bg-[#0d1117] transition-colors duration-300">
    <!-- 封面部分 -->
    <div v-if="cover" class="relative h-[60vh] min-h-[400px] overflow-hidden group">
      <img :src="cover" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-90" alt="封面">
      <div class="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-black/60"></div>

      <!-- 封面中的标题信息 -->
      <div class="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white z-10 max-w-7xl mx-auto">
        <div class="flex flex-wrap gap-3 mb-6 opacity-0 animate-slide-up" style="animation-delay: 0.1s">
          <span v-for="tag in articleMeta.tags" :key="tag" class="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-110">
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
      <h1 class="text-3xl md:text-3xl font-extrabold leading-tight mb-8 tracking-tight text-gray-900 dark:text-white animate-fade-in-down">
        {{ articleMeta.title }}
      </h1>
      <div class="flex dark:text-white dark:text-warmGray flex-wrap justify-center gap-3 mb-2 opacity-0 animate-slide-up" style="animation-delay: 0.1s">
        <span v-for="tag in articleMeta.tags" :key="tag" class="px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-110">
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
          <div class="flex flex-col gap-4 p-2 bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-lg rounded-full border border-gray-200 dark:border-gray-700 shadow-xl">
            <div class="tooltip tooltip-right" :data-tip="t('backToHome')">
              <router-link
                  to="/"
                  class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300 transform hover:scale-110"
                  :aria-label="t('backToHome')"
              >
                <svg class="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </router-link>
            </div>
            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>
            <div class="tooltip tooltip-right" :data-tip="t('share')">
              <button @click="openShareModal" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all duration-300 group" :aria-label="t('share')">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>

            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>

            <div class="tooltip tooltip-right" :data-tip="t('print')">
              <button @click="handlePrint" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300 group transform hover:scale-110" :aria-label="t('print')">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
            </div>

            <div class="h-px w-6 bg-gray-200 dark:bg-gray-700 mx-auto"></div>

            <div class="tooltip tooltip-right" :data-tip="isFavorited ? t('removeFromFavorites') : t('addToFavorites')">
              <button 
                @click="toggleFavorite"
                class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-all duration-300 group" 
                :aria-label="isFavorited ? t('removeFromFavorites') : t('addToFavorites')"
              >
                <svg 
                  class="w-5 h-5 group-hover:scale-110 transition-transform" 
                  :class="{ 'fill-current animate-heartbeat': isFavorited }"
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
              <button @click="fontSizeLevel = (fontSizeLevel + 1) % 3" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300 transform hover:scale-110 hover:rotate-12" :aria-label="t('adjustFontSize')">
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
          <div v-if="loading" class="space-y-12 animate-pulse max-w-3xl mx-auto">
            <div v-for="i in 3" :key="i">
              <div class="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-6"></div>
              <div class="space-y-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
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

          <div class="flex flex-col md:flex-row justify-between items-center gap-8 bg-gray-100/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50">
            <div class="flex items-center gap-3" v-if="articleMeta.tags.length>0">
              <span class="text-gray-500 font-medium">{{ t('tags') }}:</span>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in articleMeta.tags" :key="tag" class="text-sm px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition">#{{ tag }}</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="handlePrint" class="flex items-center gap-2 px-6 py-2.5 bg-gray-600 text-white rounded-full hover:bg-gray-700 shadow-lg shadow-gray-600/20 hover:shadow-gray-600/30 hover:-translate-y-0.5 transition-all duration-300 font-medium print:hidden" :aria-label="t('print')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {{ t('print') }}
              </button>
              <button 
                @click="toggleFavorite"
                class="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 hover:-translate-y-0.5 transition-all duration-300 font-medium" 
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
              <button @click="openShareModal" class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300 font-medium" :aria-label="t('share')">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {{ t('share') }}
              </button>
            </div>
          </div>
        </main>

        <aside class="hidden xl:block w-72 shrink-0" v-if="headings.length > 0">
          <div class="sticky top-16 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pl-4 border-l border-gray-200 dark:border-gray-800 z-100" style="pointer-events: auto; overscroll-behavior: contain;" @wheel.stop>
            <h4 class="font-bold text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-wider opacity-60">{{ t('articleDirectory') }}</h4>
            <div v-if="headings.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
              {{ t('noExcerpt') }}
            </div>
            <ul v-else class="space-y-1 relative">
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
          class="w-12 h-12 flex items-center justify-center dark:bg-[#1b2f73ff] bg-[#3b2f73ff] text-white rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
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
      <div class="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white dark:bg-[#161b22] shadow-2xl p-6 overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('articleDirectory') }}</h3>
          <button @click="showMobileToc = false" class="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white" :aria-label="t('close')">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="headings.length === 0" class="text-gray-500 dark:text-gray-400 text-sm py-4">
          {{ t('noExcerpt') }}
        </div>
        <div v-else class="space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          <ul>
          <li v-for="h in headings" :key="h.id">
              <button
                  @click="scrollToHeading(h.id)"
                  class="text-left w-full text-sm truncate py-1 border-l-2 pl-4 transition-colors"
                  :class="[
                  activeHeadingId === h.id
                  ? 'border-blue-600 text-blue-600 font-bold  dark:bg-blue-900/20'
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

  <!-- 分享模态框 -->
  <ShareModal 
    :is-open="showShareModal"
    :title="articleMeta.title"
    :url="windowLocation"
    @close="closeShareModal"
  />
</template>
<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, watch, onActivated, computed} from 'vue'
import {useRoute} from 'vue-router'
import {SITE_CONFIG} from '@/constants'
import {t} from '@/utils/i18n'
import {marked, Renderer} from 'marked'
import {gfmHeadingId} from 'marked-gfm-heading-id';
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import '@/github-markdown.css'
import ShareModal from '@/components/ui/ShareModal.vue'
import DocumentViewer from '@/components/DocumentViewer.vue'
import GiscusComment from '@/components/GiscusComment.vue'
import { GISCUS_CONFIG } from '@/constants'
import {addFavorite, isFavorite, removeFavorite} from "@/utils/favorites";
import type {FavoriteItem} from "@/utils/favorites"
import {formatDate, getEnvVariable} from "@/utils/tool";
import { addRecentArticle, getReadingProgress, saveReadingProgress } from '@/utils/reading-progress';

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

// ==================== 状态定义 ====================
const html = ref('')
const title = ref(t('loading'))
const loading = ref(true)
const cover = ref('')
const readingTime = ref('')
const showBackToTop = ref(false)
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

// 监听主题变化事件
const handleThemeChange = (event: CustomEvent) => {
  const theme = event.detail.theme;
  // 设置 markdown-body 的 data-theme 属性
  nextTick(() => {
    const markdownBody = document.querySelector('.markdown-body');
    if (markdownBody) {
      markdownBody.setAttribute('data-theme', theme);
    }

    // 重新处理代码高亮
    const codeBlocks = document.querySelectorAll('.markdown-body pre code')
    codeBlocks.forEach((block) => {
      const pre = block.parentElement
      if (pre) {
        // 获取代码内容
        const codeContent = block.textContent || ''
        // 获取语言类名
        const classes = Array.from(block.classList)
        const langClass = classes.find(cls => cls.startsWith('language-'))
        const language = langClass ? langClass.replace('language-', '') : 'plaintext'

        // 应用高亮
        try {
          if (hljs.getLanguage(language)) {
            const highlighted = hljs.highlight(codeContent, {language}).value
            block.innerHTML = highlighted
          } else {
            const highlighted = hljs.highlightAuto(codeContent).value
            block.innerHTML = highlighted
          }
        } catch (e) {
          console.warn('代码高亮失败:', e)
        }
      }
    })

    // 重新添加复制按钮
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
    const isMarkdownContent = !newHtml.startsWith('<') || newHtml.startsWith('<pre class="text-content">') || newHtml.startsWith('<!DOCTYPE html>');
    
    let dirty;
    if (isMarkdownContent && !newHtml.startsWith('<!DOCTYPE html>')) {
      // 处理 Markdown 内容
      dirty = await marked.parse(newHtml)
    } else {
      // 直接使用 HTML 内容
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
    // 在渲染完成后手动处理代码高亮
    const codeBlocks = document.querySelectorAll('.markdown-body pre code')
    codeBlocks.forEach((block) => {
      const pre = block.parentElement
      if (pre) {
        // 获取代码内容
        const codeContent = block.textContent || ''
        // 获取语言类名
        const classes = Array.from(block.classList)
        const langClass = classes.find(cls => cls.startsWith('language-'))
        const language = langClass ? langClass.replace('language-', '') : 'plaintext'

        // 应用高亮
        try {
          if (hljs.getLanguage(language)) {
            const highlighted = hljs.highlight(codeContent, {language}).value
            block.innerHTML = highlighted
          } else {
            const highlighted = hljs.highlightAuto(codeContent).value
            block.innerHTML = highlighted
          }
        } catch (e) {
          console.warn('代码高亮失败:', e)
        }
      }
    })

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

      // 手动处理代码高亮
      const codeBlocks = document.querySelectorAll('.markdown-body pre code')
      codeBlocks.forEach((block) => {
        const pre = block.parentElement
        if (pre) {
          // 获取代码内容
          const codeContent = block.textContent || ''
          // 获取语言类名
          const classes = Array.from(block.classList)
          const langClass = classes.find(cls => cls.startsWith('language-'))
          const language = langClass ? langClass.replace('language-', '') : 'plaintext'

          // 应用高亮
          try {
            if (hljs.getLanguage(language)) {
              const highlighted = hljs.highlight(codeContent, {language}).value
              block.innerHTML = highlighted
            } else {
              const highlighted = hljs.highlightAuto(codeContent).value
              block.innerHTML = highlighted
            }
          } catch (e) {
            console.warn('代码高亮失败:', e)
          }
        }
      });

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

  document.querySelectorAll('.markdown-body pre').forEach((pre) => {
    const codeBlock = pre.querySelector('code');
    if (!codeBlock || pre.querySelector('.copy-button')) return;

    const button = document.createElement('button');
    button.className = 'copy-button absolute top-3 right-3 p-1.5 rounded-md bg-white/10 dark:bg-gray-700/50 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-600/50 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center';
    button.innerHTML = `<svg class="w-4 h-4 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    button.title = t('copyCode');
    button.onclick = () => copyCodeToClipboard(codeBlock.textContent || '', button);

    // 添加 group 让 hover 生效
    pre.classList.add('group', 'relative');
    (pre as HTMLElement).style.position = 'relative';
    pre.appendChild(button);
  });
};

const copyCodeToClipboard = (text: string, button: HTMLElement) => {
  navigator.clipboard.writeText(text).then(() => {
    const original = button.innerHTML;
    button.innerHTML = `<svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    setTimeout(() => button.innerHTML = original, 2000);
  });
};

// ==================== 阅读进度条 ====================
const progress = ref(0)
const showProgress = ref(false)
const progressTimer = ref<number | null>(null)

const updateProgress = () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
  progress.value = height > 0 ? (winScroll / height) * 100 : 0
  showBackToTop.value = winScroll > 300
  
  // 显示进度条
  showProgress.value = true
  
  // 清除之前的计时器
  if (progressTimer.value) {
    clearTimeout(progressTimer.value)
  }
  
  // 设置新的计时器，在停止滚动后隐藏进度条
  progressTimer.value = setTimeout(() => {
    showProgress.value = false
  }, 1500)
}

const handleBackToTop = () => {
  window.scrollTo({top: 0, behavior: 'smooth'})
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
      // 优化: 顶部 margin 设为 -80px，匹配 scrollToHeading 的偏移量
      rootMargin: '-80px 0px -66% 0px'
    })

    container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      observer!.observe(h)
    })
  })
}

// ==================== 图片查看器 ====================
const handleContentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG' && target.closest('.markdown-body')&& !target.closest('a')) {
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
    const navRes = await fetch(`${base}generated/${navName}`);
    const navData = await navRes.json();
    
    // 根据路径查找文章信息
    const articleInfo = navData.find((item: any) => item.path === artPath.value || item.path === artPath.value.slice(0, -3));
    console.log('articleInfo',articleInfo)
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
    
    const actualFilePath=decodeURIComponent(articleInfo.url)
    console.log('actualFilePath',actualFilePath)
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
      loading.value = false;
      // await loadDocument(filePathWithTimestamp,fileExtension)
      return;
    }

    const res = await fetch(filePathWithTimestamp);

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
      const fmMatch = contentText.trim().match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/m)
      if (fmMatch) {
        content = contentText.replace(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/m, '')
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
    // 页面加载完成后恢复阅读进度
    setTimeout(() => {
      const progress = getReadingProgress(route.path);
      if (progress) {
        window.scrollTo(0, progress.scrollTop);
      }
    },300);
  } catch (err) {
    console.error(err)
    html.value = `# 404\n${t('error')}`
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
  
  // 设置定时保存阅读进度（每5秒保存一次）
  saveProgressTimer = window.setInterval(() => {
    saveReadingProgress({
      path: route.path,
      title: articleMeta.value.title,
      scrollTop: window.scrollY,
      timestamp: Date.now()
    });
  }, 5000);
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
  // 优化: 移除键盘事件监听
  window.removeEventListener('keydown', handleKeydown)
  // 优化: 清理 Intersection Observer
  if (observer) observer.disconnect()
  // 移除主题变化事件监听
  window.removeEventListener('theme-change', handleThemeChange as EventListener)
  
  // 清除定时保存阅读进度的定时器
  if (saveProgressTimer) {
    clearInterval(saveProgressTimer);
    saveProgressTimer = null;
  }
  
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
    // 滚动到标题，并留出 80px 的顶部偏移量（固定导航栏）
    const offset = 80
    const bodyRect = document.body.getBoundingClientRect().top
    const elementRect = el.getBoundingClientRect().top
    const elementPosition = elementRect - bodyRect
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    showMobileToc.value = false
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

.scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.2);
  border-radius: 20px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
}

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

/* Mac 风格代码块容器 - 通过包裹 pre 来实现 */
.markdown-body pre {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  margin: 1.5rem 0;
  background-color: #ffffff;
  border: 1px solid rgb(209 213 219);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.dark .markdown-body pre {
  background-color: rgb(17 24 39);
  border: 1px solid rgb(55 65 81);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
}

.markdown-body pre::before {
  content: "";
  display: block;
  height: 2rem;
  background-color: rgb(243 244 246);
  border-bottom: 1px solid rgb(209 213 219);
}

.dark .markdown-body pre::before {
  background-color: rgb(31 41 55);
  border-bottom: 1px solid rgb(55 65 81);
}

.markdown-body pre::after {
  content: "";
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: rgb(239 68 68);
  box-shadow: 1.25rem 0 0 rgb(245 158 11), 2.5rem 0 0 rgb(34 197 94);
}

.markdown-body pre > code {
  display: block;
  padding: 1rem;
  padding-top: 0.5rem; /* 调整以避开头栏 */
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5rem;
  overflow-x: auto;
  tab-size: 2;
  color: rgb(55 65 81);
}

.dark .markdown-body pre > code {
  color: rgb(209 213 219);
  background-color: rgb(17 24 39);
}

.markdown-body :not(pre) > code {
  background-color: rgb(243 244 246);
  color: rgb(31 41 55);
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.dark .markdown-body :not(pre) > code {
  background-color: rgb(55 65 81);
  color: rgb(229 231 235);
}

.max-h-\[calc\(100vh-120px\)\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[calc\(100vh-120px\)\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[calc\(100vh-120px\)\]::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.max-h-\[calc\(100vh-120px\)\]::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* 打印样式 */
@media print {
  /* 隐藏不需要打印的元素 */
  .fixed, .sticky, .print\:hidden {
    display: none !important;
  }
  
  /* 主体内容样式 */
  body {
    background: white !important;
    color: black !important;
  }
  
  /* 文章容器样式 */
  article {
    background: white !important;
  }
  
  /* 标题样式 */
  h1, h2, h3, h4, h5, h6 {
    color: black !important;
    break-after: avoid;
  }
  
  /* 段落样式 */
  p {
    color: black !important;
  }
  
  /* 代码块样式 */
  .markdown-body pre {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  .dark .markdown-body pre,
  .markdown-body pre {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    box-shadow: none !important;
  }
  
  .dark .markdown-body pre::before {
    background: #eee !important;
    border-bottom: 1px solid #ddd !important;
  }
  
  .dark .markdown-body pre::before {
    background: #eee !important;
    border-bottom: 1px solid #ddd !important;
  }
  
  .dark .markdown-body pre > code {
    color: #333 !important;
  }
  
  .dark .markdown-body pre > code {
    color: #333 !important;
    background: #f5f5f5 !important;
  }
  
  .dark .markdown-body :not(pre) > code {
    background: #eee !important;
    color: #333 !important;
  }
  
  .dark .markdown-body :not(pre) > code {
    background: #eee !important;
    color: #333 !important;
  }
  
  /* 表格样式 */
  table {
    border-collapse: collapse !important;
  }
  
  th, td {
    border: 1px solid #ddd !important;
    padding: 8px !important;
  }
  
  th {
    background: #f5f5f5 !important;
  }
  
  /* 链接样式 */
  a {
    color: #0066cc !important;
    text-decoration: underline !important;
  }
  
  /* 图片样式 */
  img {
    max-width: 100% !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* 列表样式 */
  ul, ol {
    color: black !important;
  }
  
  li {
    color: black !important;
  }
  
  /* 引用样式 */
  blockquote {
    border-left: 4px solid #ccc !important;
    color: #555 !important;
  }
}
</style>