<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-start justify-center pt-16 bg-black/50 backdrop-blur-sm" @click="isOpen = false" role="dialog" aria-modal="true" aria-label="搜索文章">
      <div @click.stop class="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out-expo"
           v-motion
           :initial="{ y: -80, opacity: 0, scale: 0.9 }"
           :enter="{ y: 0, opacity: 1, scale: 1, transition: { duration: 400 } }"
           :leave="{ y: -80, opacity: 0, scale: 0.9, transition: { duration: 300 } }">
        <div class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <IconCarbonSearch class="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" aria-hidden="true" />
          <input
              ref="searchInput"
              v-model="query"
              :placeholder="t('searchHint')"
              class="input input-ghost text-base flex-1 search-input bg-transparent py-1 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 border-none"
              aria-label="搜索文章"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              role="combobox"
              aria-expanded="true"
              aria-controls="search-results"
              aria-activedescendant="search-result-${selectedIndex}"
          />
          <kbd @click="closeModal" class="kbd kbd-xs hidden sm:block text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">Esc</kbd>
        </div>
        <div class="max-h-80 overflow-y-auto" role="listbox" id="search-results" aria-label="搜索结果">
          <template v-if="results.length">
            <router-link
                v-for="(post, index) in results"
                :key="post.path"
                :to="post.path"
                @click="isOpen = false"
                class="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transform transition-all duration-200"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20 scale-[1.02]': index === selectedIndex }"
                @mouseenter="selectedIndex = index"
                :id="`search-result-${index}`"
                role="option"
                :aria-selected="index === selectedIndex"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                {{ post.title[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 dark:text-white truncate text-sm transform transition-all duration-200 hover:text-blue-600">{{ post.title }}</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ post.excerpt || t('excerpt') }}</p>
                <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-1 mt-1.5">
                  <div v-for="tag in post.tags.slice(0, 3)" :key="tag" class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded transform transition-all hover:scale-110">
                    {{ tag }}
                  </div>
                  <div v-if="post.tags.length > 3" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                    +{{ post.tags.length - 3 }}
                  </div>
                </div>
              </div>
            </router-link>
          </template>
          <div v-else-if="query" class="p-8 text-center text-gray-600 dark:text-gray-400 animate-fade-in">
            <IconCarbonSearch class="w-10 h-10 mx-auto mb-3 animate-shake" />
            <p class="text-base">{{ t('noResults') }}</p>
          </div>
          <div v-else class="p-8 text-center text-gray-600 dark:text-gray-400 animate-fade-in">
            <IconCarbonSearch class="w-10 h-10 mx-auto mb-3" />
            <p class="text-base">{{ t('startSearching') }}</p>
          </div>
        </div>
        <div v-if="results.length > 0" class="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <span>{{ t('articlesFound', { count: results.length }) }}</span>
            <div class="flex gap-1.5 items-center">
              <kbd class="kbd kbd-xs hidden sm:block">↑</kbd>
              <kbd class="kbd kbd-xs hidden sm:block">↓</kbd>
              <span class="text-xs hidden sm:block">{{ t('navigation') }}</span>
              <kbd class="kbd kbd-xs hidden sm:block">Enter</kbd>
              <span class="text-xs hidden sm:block">{{ t('select') }}</span>
              <kbd class="kbd kbd-xs sm:hidden">...</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { t } from '@/utils/i18n'
import { useRouter } from 'vue-router'
import { fetchWithFallback, getEnvVariable } from "@/utils/tool";

const router = useRouter()
const isOpen = ref(false)
const query = ref('')
const results = ref<any[]>([])
const selectedIndex = ref(-1)
// 模板ref: 与模板中 ref="searchInput" 自动绑定
const searchInput = ref<HTMLInputElement | null>(null)

// ==================== 搜索缓存 ====================
const SEARCH_CACHE_KEY = 'pjfun_blog_search_cache'
const NAV_DATA_CACHE_KEY = 'pjfun_blog_nav_data_cache'
const CACHE_TTL = 5 * 60 * 1000 // 缓存有效期5分钟

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// 通用缓存读写
const getCache = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

const setCache = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (e) {
    console.warn('Cache write failed:', e)
  }
}

// 搜索结果缓存
const getSearchCache = (q: string): any[] | null => {
  const cache = getCache<Record<string, any[]>>(SEARCH_CACHE_KEY)
  if (!cache) return null
  return cache[q.toLowerCase()] || null
}

const setSearchCache = (q: string, results: any[]): void => {
  const cache = getCache<Record<string, any[]>>(SEARCH_CACHE_KEY) || {}
  cache[q.toLowerCase()] = results
  setCache(SEARCH_CACHE_KEY, cache)
}

// 导航数据缓存
const getNavCache = (): any[] | null => getCache<any[]>(NAV_DATA_CACHE_KEY)

const setNavCache = (data: any[]): void => setCache(NAV_DATA_CACHE_KEY, data)

const keys = useMagicKeys()
const ctrlK = keys['Ctrl+K'] || null
const enter = keys.enter || null
const arrowUp = keys.arrowup || null
const arrowDown = keys.arrowdown || null

// 统一的关闭弹窗函数
const closeModal = () => {
  isOpen.value = false
  query.value = ''
  results.value = []
  selectedIndex.value = -1
}

// Ctrl+K 快捷键切换搜索框
if (ctrlK) {
  whenever(ctrlK, () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      nextTick(() => {
        searchInput.value?.focus()
      })
    } else {
      closeModal()
    }
  })
}

// 处理键盘导航
if (arrowDown) {
  whenever(arrowDown, () => {
    if (!isOpen.value) return
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
  })
}

if (arrowUp) {
  whenever(arrowUp, () => {
    if (!isOpen.value) return
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  })
}

if (enter) {
  whenever(enter, () => {
    if (!isOpen.value || selectedIndex.value === -1) return
    const selectedPost = results.value[selectedIndex.value]
    if (selectedPost) {
      navigateToPost(selectedPost.path)
    }
  })
}

const navigateToPost = (path: string) => {
  closeModal()
  router.push(path)
}

watch(query, async (q) => {
  if (!q.trim()) {
    results.value = []
    selectedIndex.value = -1
    return
  }

  // 优先检查搜索结果缓存
  const cached = getSearchCache(q.trim())
  if (cached) {
    results.value = cached
    selectedIndex.value = -1
    return
  }

  try {
    const navName = getEnvVariable('PJ_BLOG_NAV_NAME')
    const base = getEnvVariable('VITE_BASE') || '/'

    // 优先使用导航数据缓存
    let all = getNavCache()
    if (!all) {
      const res = await fetchWithFallback([`${base}generated/${navName}`, `${base}generated/nav.json`], '导航数据')
      const navData = await res.json()
      all = navData
      if (navData) {
        setNavCache(navData)
      }
    }

    if (!all) {
      results.value = []
      return
    }

    results.value = all
      .filter((p: any) =>
        (p.title && String(p.title).toLowerCase().includes(q.toLowerCase())) ||
        (p.excerpt && String(p.excerpt).toLowerCase().includes(q.toLowerCase())) ||
        (p.tags && Array.isArray(p.tags) && p.tags.some((tag: unknown) => typeof tag === 'string' && tag.toLowerCase().includes(q.toLowerCase())))
      )
      .slice(0, 10)

    // 写入搜索缓存
    if (results.value.length > 0) {
      setSearchCache(q.trim(), results.value)
    }
    selectedIndex.value = -1
  } catch (e) {
    console.error('搜索出错:', e)
    results.value = []
  }
})

const handleOpenSearchModal = () => {
  isOpen.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// a11y: 焦点陷阱 - 防止 Tab 键跳出模态框
const handleFocusTrap = (e: KeyboardEvent) => {
  if (!isOpen.value || e.key !== 'Tab') return
  
  const focusableElements = document.querySelectorAll(
    '[role="dialog"] button, [role="dialog"] [href], [role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea, [role="dialog"] [tabindex]:not([tabindex="-1"])'
  )
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault()
    lastElement.focus()
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault()
    firstElement.focus()
  }
}

onMounted(() => {
  window.addEventListener('open-search-modal', handleOpenSearchModal)
  window.addEventListener('keydown', handleFocusTrap)
})

onUnmounted(() => {
  window.removeEventListener('open-search-modal', handleOpenSearchModal)
  window.removeEventListener('keydown', handleFocusTrap)
})


</script>

<style scoped>
.ease-out-expo {
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
