<template>
  <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span class="text-white font-bold text-lg">{{ SITE_CONFIG.icon }}</span>
            </div>
            <span class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {{ t('siteTitle') }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('footerDescription') }}
          </p>
          <button @click="toDev"
              class="dark:text-gray-400 flex items-center p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 hover:-rotate-3"
              :aria-label="t('dataManager')">
            <IconCarbonLogoGithub class="w-6 h-6 dark:text-gray-300" />
            {{ t('dataManager') }}
          </button>
        </div>

        <div class="flex flex-col items-center md:items-end">
          <div class="flex space-x-6 mb-4">
            <a target="_blank" :href="SITE_CONFIG.socialLinks.github" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <IconCarbonLogoGithub class="w-5 h-5" />
            </a>
            <a target="_blank" :href="SITE_CONFIG.socialLinks.Telegram" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <IconComponent name="telegram" class="w-5 h-5" />
            </a>
            <a target="_blank" :href="'mailto:'+SITE_CONFIG.email" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <IconCarbonEmail class="w-5 h-5" />
            </a>
          </div>
          <div v-if="showStats" class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>{{ t('siteVisitors') }}: {{ siteUV }} | {{ t('siteViews') }}: {{ sitePV }} | {{ t('pageViews') }}: {{ pagePV }}</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            &copy; {{ new Date().getFullYear() }} {{ t('siteTitle') }}. {{ t('allRightsReserved') }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {t} from '@/utils/i18n'
import {SITE_CONFIG} from "@/constants";
import {ref, onMounted} from 'vue'
import {toDev} from "@/utils/tool";

const showStats = ref(false)
const sitePV = ref(0)
const pagePV = ref(0)
const siteUV = ref(0)

// 加载不蒜子统计
const loadBusuanzi = () => {
  // 创建唯一回调函数名
  const callbackName = 'BusuanziCallback_' +
      Math.floor(1099511627776 * Math.random())

  // 创建 script 标签
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.referrerPolicy = 'no-referrer-when-downgrade'

  // 设置请求 URL（使用 JSONP 回调）
  script.src = '//busuanzi.ibruce.info/busuanzi?jsonpCallback=' + callbackName

  // 定义全局回调函数
  // @ts-ignore
  window[callbackName] = function (data: any) {
    // 挂载数据到组件
    sitePV.value = data.site_pv || 0
    pagePV.value = data.page_pv || 0
    siteUV.value = data.site_uv || 0
    showStats.value = true

    // 清理：删除 script 标签和全局回调
    // @ts-ignore
    delete window[callbackName]
    if (script && script.parentNode) {
      script.parentNode.removeChild(script)
    }
  }

  // 错误处理
  script.onerror = function () {
    sitePV.value = 0
    pagePV.value = 0
    siteUV.value = 0
    showStats.value = true

    // @ts-ignore
    delete window[callbackName]
    if (script && script.parentNode) {
      script.parentNode.removeChild(script)
    }
  }

  // 插入到页面
  document.head.appendChild(script)
}

onMounted(() => {
  loadBusuanzi()
})
</script>