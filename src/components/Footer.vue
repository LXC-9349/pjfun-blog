<template>
  <footer class="mt-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- 主行：品牌信息 + 社交与操作入口 -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center justify-center gap-2.5 min-w-0 sm:justify-start">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex-center shrink-0">
            <span class="text-white font-bold text-sm leading-none">{{ SITE_CONFIG.icon }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold leading-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              {{ t('siteTitle') }}
            </p>
            <p class="text-xs leading-tight text-gray-500 dark:text-gray-400 truncate">
              {{ t('footerDescription') }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-center gap-1 sm:justify-end">
          <a target="_blank" rel="noopener noreferrer" href="https://www.goofish.com/personal?userId=863031346"
             class="w-7 h-7 flex items-center justify-center rounded-lg text-[#0c8383ff] transition-colors hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-800"
             :aria-label="t('footerMarket')"
             :title="t('footerMarket')">
            <IconComponent name="xy" class="w-6 h-6" />
          </a>
          <a target="_blank" rel="noopener noreferrer" :href="SITE_CONFIG.foot.github"
             class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-800"
             :aria-label="t('footerGitHub')"
             :title="t('footerGitHub')">
            <IconCarbonLogoGithub class="w-6 h-6" />
          </a>
          <a target="_blank" rel="noopener noreferrer" :href="SITE_CONFIG.socialLinks.Telegram"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-800"
              :aria-label="t('footerTelegram')"
              :title="t('footerTelegram')">
            <IconComponent name="telegram" class="w-6 h-6" />
          </a>
          <a target="_blank" rel="noopener noreferrer" :href="'mailto:' + SITE_CONFIG.email"
             class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-orange-600 hover:bg-orange-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-800"
             :aria-label="t('footerEmail')"
             :title="t('footerEmail')">
            <IconCarbonEmail class="w-6 h-6" />
          </a>
          <span class="mx-1.5 h-3.5 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
          <button @click="toDev"
                  class="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:-rotate-3 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-orange-400"
                  :aria-label="t('dataManager')">
            <IconCarbonLogoGithub class="w-3.5 h-3.5" />
            {{ t('dataManager') }}
          </button>
        </div>
      </div>

      <!-- 底部行：版权、域名、版本与站点统计 -->
      <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:justify-between sm:gap-4">
        <div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
          <span>&copy; {{ currentYear }} {{ t('siteTitle') }}. {{ t('allRightsReserved') }}</span>
          <span class="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
          <a :href="SITE_CONFIG.url" target="_blank" rel="noopener noreferrer"
             class="transition-colors hover:text-orange-600 dark:hover:text-orange-400">
            {{ siteDomain }}
          </a>
          <template v-if="versionLabel">
            <span class="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
            <span
                class="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 font-medium tracking-wide dark:border-gray-700"
                :title="buildTime ? t('buildAt', { time: buildTime }) : versionLabel">
              {{ versionLabel }}
            </span>
          </template>
        </div>
        <SiteStats />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {t} from '@/utils/i18n'
import {SITE_CONFIG} from "@/constants";
import {toDev} from "@/utils/tool";
import SiteStats from '@/components/SiteStats.vue'

const currentYear = new Date().getFullYear()
const siteDomain = SITE_CONFIG.url.replace(/^https?:\/\//, '')

// 构建版本号由 Vite 在编译期注入（毫秒时间戳）
const rawBuildVersion = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : ''
const buildDate = Number(rawBuildVersion) ? new Date(Number(rawBuildVersion)) : null

const pad = (value: number) => String(value).padStart(2, '0')

// 优先展示 .env 中配置的语义化版本，未配置时回退到构建日期
const versionLabel = computed(() => {
  const custom = String(import.meta.env.VITE_APP_VERSION || '').trim()
  if (custom) return custom
  if (!buildDate) return ''
  return `v${buildDate.getFullYear()}.${pad(buildDate.getMonth() + 1)}.${pad(buildDate.getDate())}`
})

// 鼠标悬停时展示完整的构建时间，便于排查线上版本
const buildTime = computed(() => {
  if (!buildDate) return ''
  return `${buildDate.getFullYear()}-${pad(buildDate.getMonth() + 1)}-${pad(buildDate.getDate())} ${pad(buildDate.getHours())}:${pad(buildDate.getMinutes())}`
})
</script>
