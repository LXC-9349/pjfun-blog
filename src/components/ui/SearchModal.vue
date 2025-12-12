<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-start justify-center pt-16 bg-black/50 backdrop-blur-sm" @click="isOpen = false">
      <div @click.stop class="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden" v-motion :initial="{ y: -80, opacity: 0 }" :enter="{ y: 0, opacity: 1 }">
        <div class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <IconCarbonSearch class="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <input
              ref="searchInput"
              v-model="query"
              :placeholder="t('searchHint')"
              class="input input-ghost text-base flex-1 search-input bg-transparent py-1 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 border-none"
              aria-label="Search articles"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              @keydown="handleInputKeydown"
          />
          <kbd @click="isOpen=false" class="kbd kbd-xs hidden sm:block text-gray-500 dark:text-gray-400">Esc</kbd>
        </div>
        <div class="max-h-80 overflow-y-auto">
          <template v-if="results.length">
            <router-link
                v-for="(post, index) in results"
                :key="post.path"
                :to="post.path"
                @click="isOpen = false"
                class="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': index === selectedIndex }"
                @mouseenter="selectedIndex = index"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                {{ post.title[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate text-sm">{{ post.title }}</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ post.excerpt || t('excerpt') }}</p>
                <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-1 mt-1.5">
                  <div v-for="tag in post.tags.slice(0, 3)" :key="tag" class="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {{ tag }}
                  </div>
                  <div v-if="post.tags.length > 3" class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                    +{{ post.tags.length - 3 }}
                  </div>
                </div>
              </div>
            </router-link>
          </template>
          <div v-else-if="query" class="p-8 text-center text-gray-500 dark:text-gray-400">
            <IconCarbonSearch class="w-10 h-10 mx-auto mb-3" />
            <p class="text-base">{{ t('noResults') }}</p>
          </div>
          <div v-else class="p-8 text-center text-gray-500 dark:text-gray-400">
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
import { ref, watch, onMounted, onUnmounted,nextTick } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { t } from '@/utils/i18n'
import { useRouter } from 'vue-router'
import {getEnvVariable} from "@/utils/tool";

const router = useRouter()
const isOpen = ref(false)
const query = ref('')
const results = ref<any[]>([])
const selectedIndex = ref(-1)

const keys = useMagicKeys()
const ctrlK = keys['Ctrl+K'] || null
const enter = keys.enter || null
const arrowUp = keys.arrowup || null
const arrowDown = keys.arrowdown || null

// 在 script setup 中添加
const handleInputKeydown = (e: KeyboardEvent) => {
  // 防止在输入时意外触发浏览器快捷键
  if (e.key === 'Escape') {
    e.stopPropagation() // 添加实际的关闭逻辑
    isOpen.value = false
    query.value = ''
    results.value = []
    selectedIndex.value = -1

  }
}

if (ctrlK) {
  whenever(ctrlK, () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      setTimeout(() => {
        const input = document.querySelector('.search-input') as HTMLInputElement
        input?.focus()
      }, 100)
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
  isOpen.value = false
  query.value = ''
  results.value = []
  selectedIndex.value = -1
  // 使用 router 跳转
  router.push(path)
}

watch(query, async (q) => {
  if (!q.trim()) {
    results.value = []
    selectedIndex.value = -1
    return
  }
  try {
    const nvName=getEnvVariable('PJ_BLOG_NAV_NAME')
    const base=getEnvVariable('VITE_BASE')||'/'
    const res = await fetch(`${base}generated/${nvName}`)
    const all = await res.json()
    results.value = all
        .filter((p: any) =>
            p.title.toLowerCase().includes(q.toLowerCase()) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(q.toLowerCase())) ||
            (p.tags && p.tags.some((tag: string) => tag.toLowerCase().includes(q.toLowerCase())))
        )
        .slice(0, 10)
    selectedIndex.value = -1
  } catch (e) {
    console.error('搜索出错:', e)
    results.value = []
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  // 只有在搜索框打开时才处理 Esc 键
  if (isOpen.value && e.key === 'Escape') {
    isOpen.value = false
    query.value = ''
    results.value = []
    selectedIndex.value = -1
  }
}

const handleOpenSearchModal = () => {
  isOpen.value = true
  setTimeout(() => {
    const input = document.querySelector('.search-input') as HTMLInputElement
    input?.focus()
  }, 100)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  window.addEventListener('open-search-modal', handleOpenSearchModal)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('open-search-modal', handleOpenSearchModal)
})
// 添加模板引用
const searchInput = ref<HTMLInputElement | null>(null)

// 改进焦点处理函数
const focusSearchInput = () => {
  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// 在 Ctrl+K 处理中也使用改进的焦点处理
if (ctrlK) {
  whenever(ctrlK, () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      setTimeout(() => {
        focusSearchInput()
      }, 100)
    }
  })
}


</script>