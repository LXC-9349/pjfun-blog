<template>
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>

  <!-- 移动端底部导航栏 -->
  <div class="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700" style="padding-bottom: env(safe-area-inset-bottom, 0px);">
    <div class="flex items-center justify-around py-2 px-2">
      <router-link to="/" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
        :class="$route.path === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span class="text-[10px] font-medium">首页</span>
      </router-link>
      <router-link to="/archive" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
        :class="$route.path === '/archive' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
        <span class="text-[10px] font-medium">归档</span>
      </router-link>
      <router-link to="/favorites" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
        :class="$route.path === '/favorites' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
        <span class="text-[10px] font-medium">收藏</span>
      </router-link>
      <button @click="openSearch" class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <span class="text-[10px] font-medium">搜索</span>
      </button>
    </div>
  </div>
  <SearchModal />
  <transition name="slide-up">
    <div v-if="showUpdate" class="update-notification">
      <div class="update-content">
        <div class="update-icon">
          <IconComponent name="update" :size="24" />
        </div>
        <div class="update-text">
          <h4>发现新版本</h4>
          <p>为了获得最佳体验，请更新至最新版本</p>
        </div>
        <div class="update-actions">
          <button @click="showUpdate = false" class="btn-later">稍后提醒</button>
          <button @click="refreshNow" class="btn-update">立即更新</button>
        </div>
        <button @click="showUpdate = false" class="btn-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SearchModal from '@/components/ui/SearchModal.vue'
import IconComponent from '@/components/ui/IconComponent.vue'
import 'vue3-toastify/dist/index.css'
import { startVersionCheck, refreshNow } from '@/utils/version-check'
const showUpdate = ref(false)

const openSearch = () => {
  window.dispatchEvent(new CustomEvent('open-search-modal'))
}

startVersionCheck(() => {
  showUpdate.value = true
}, 245_000)

</script>

<style>
button{
  background: transparent;
}

/* 页面过渡动画 */
.update-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  animation: fadeInUp 0.3s ease-out;
}

.update-content {
  display: flex;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.update-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.update-text {
  flex: 1;
  margin-right: 12px;
}

.update-text h4 {
  margin: 0 0 4px 0;
  font-weight: 600;
  font-size: 16px;
}

.update-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.update-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-update,
.btn-later {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-update {
  background: white;
  color: #667eea;
}

.btn-update:hover {
  opacity: 0.9;
}

.btn-later {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-later:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* 暗色主题适配 */
.dark .update-content {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
}
</style>
