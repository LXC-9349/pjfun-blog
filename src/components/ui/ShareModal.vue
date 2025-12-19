<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-start justify-center pt-16 bg-black/50" @click="closeModal">
      <div 
        @click.stop 
        class="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        v-motion 
        :initial="{ y: -80, opacity: 0 }" 
        :enter="{ y: 0, opacity: 1 }"
      >
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ t('share') }}</h2>
          <button @click="closeModal" class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" :aria-label="t('close')">
            <IconCarbonClose class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ t('shareTo') }}</label>
            <div class="grid grid-cols-4 gap-3">
              <button 
                v-for="platform in platforms" 
                :key="platform.name"
                @click="shareTo(platform)"
                class="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                :aria-label="platform.label"
              >
                <div class="w-12 h-12 rounded-full flex items-center justify-center mb-2" :class="platform.bgColor">
                  <icon-carbon-logo-wechat v-if="platform.name === 'wechat'" class="w-6 h-6 text-white" />
                  <IconComponent name="weibo" v-else-if="platform.name === 'weibo'" class="w-6 h-6 text-white" />
                  <IconComponent name="qq" v-else-if="platform.name === 'qq'" class="w-6 h-6 text-white" />
                  <IconComponent name="x" v-else-if="platform.name === 'x'" class="w-6 h-6 text-white" />
                  <IconCarbonLogoFacebook v-else-if="platform.name === 'facebook'" class="w-6 h-6 text-white" />
                  <IconCarbonLogoLinkedin v-else-if="platform.name === 'linkedin'" class="w-6 h-6 text-white" />
                  <IconComponent name="telegram" v-else-if="platform.name === 'telegram'" class="w-6 h-6 text-white" />
                  <IconCarbonEmail v-else-if="platform.name === 'email'" class="w-6 h-6 text-white" />
                </div>
                <span class="text-xs text-gray-700 dark:text-gray-300">{{ platform.label }}</span>
              </button>
            </div>
          </div>
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ t('copyLink') }}</label>
            <div class="flex">
              <input 
                ref="urlInput"
                :value="url" 
                readonly
                class="flex-1 px-4 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button 
                @click="copyLink"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg font-medium text-sm transition-colors flex items-center gap-1"
              >
                <IconCarbonCopy class="w-4 h-4" />
                {{ copied ? t('copied') : t('copy') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { t } from '@/utils/i18n'
import {showSuccess} from "@/utils/tool";

const props = defineProps<{
  isOpen: boolean
  title: string
  url: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)
const urlInput = ref<HTMLInputElement | null>(null)

const platforms = [
  {
    name: 'wechat',
    label: t('wechat'),
    bgColor: 'bg-green-500',
    //@ts-ignore
    shareUrl: (url: string, title: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  },
  {
    name: 'weibo',
    label: t('weibo'),
    bgColor: 'bg-red-500',
    shareUrl: (url: string, title: string) => `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'qq',
    label: t('qq'),
    bgColor: 'bg-blue-500',
    shareUrl: (url: string, title: string) => `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'x',
    label: t('twitter'),
    bgColor: 'bg-sky-500',
    shareUrl: (url: string, title: string) => `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    name: 'facebook',
    label: t('facebook'),
    bgColor: 'bg-blue-600',
    //@ts-ignore
    shareUrl: (url: string, title: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    name: 'linkedin',
    label: t('linkedin'),
    bgColor: 'bg-blue-700',
    shareUrl: (url: string, title: string) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'telegram',
    label: t('telegram'),
    bgColor: 'bg-sky-400',
    shareUrl: (url: string, title: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    name: 'email',
    label: t('email'),
    bgColor: 'bg-gray-500',
    shareUrl: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
  }
]

const closeModal = () => {
  emit('close')
}

const shareTo = (platform: typeof platforms[number]) => {
  const shareUrl = platform.shareUrl(props.url, props.title)
  if (platform.name === 'wechat') {
    // 微信需要特殊处理，打开二维码
    window.open(shareUrl, '_blank')
  } else if (platform.name === 'email') {
    window.location.href = shareUrl
  } else {
    window.open(shareUrl, '_blank')
  }
}

const copyLink = () => {
  if (urlInput.value) {
    urlInput.value.select()
    document.execCommand('copy')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
    showSuccess(t('linkCopied'))
  }
}
</script>