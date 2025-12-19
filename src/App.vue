<template>
  <router-view />
  <SearchModal />
  <transition name="slide-up">
    <div v-if="showUpdate" class="update-notification">
      <div class="update-content">
        <div class="update-icon animate-bounce">
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

startVersionCheck(() => {
  showUpdate.value = true
}, 245_000)

</script>

<style>
button{
  background: transparent;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
<style scoped>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  transform: translateZ(0); /* 触发硬件加速 */
  transition: all 0.3s ease;
}

.update-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
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
  transition: all 0.2s ease;
  transform: translateZ(0); /* 触发硬件加速 */
}

.btn-update {
  background: white;
  color: #667eea;
}

.btn-update:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-later {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-later:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
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
  transform: rotate(90deg);
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

/* 暗色主题适配 */
.dark .update-content {
  background: linear-gradient(135deg, #2c3e50 0%, #4a235a 100%);
}
</style>
