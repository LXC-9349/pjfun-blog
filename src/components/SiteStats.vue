<template>
  <!-- 不蒜子站点统计 -->
  <div
    v-if="siteStats.loaded && !siteStats.failed"
    class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400"
    role="group"
    :aria-label="t('siteStats')"
  >
    <span class="flex items-center gap-1.5">
      <IconCarbonUserMultiple class="w-3.5 h-3.5 text-orange-500" />
      {{ t('siteVisitors') }}
      <span class="font-semibold text-orange-600 dark:text-orange-400">{{ formatNumber(siteStats.siteUV) }}</span>
    </span>
    <span class="flex items-center gap-1.5">
      <IconCarbonView class="w-3.5 h-3.5 text-orange-500" />
      {{ t('siteViews') }}
      <span class="font-semibold text-orange-600 dark:text-orange-400">{{ formatNumber(siteStats.sitePV) }}</span>
    </span>
    <span class="flex items-center gap-1.5">
      <IconCarbonDocument class="w-3.5 h-3.5 text-orange-500" />
      {{ t('pageViews') }}
      <span class="font-semibold text-orange-600 dark:text-orange-400">{{ formatNumber(siteStats.pagePV) }}</span>
    </span>
  </div>
  <p v-else-if="siteStats.failed" class="text-xs text-gray-400 dark:text-gray-500">
    {{ t('statsUnavailable') }}
  </p>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { t } from '@/utils/i18n'
import { loadBusuanzi, siteStats } from '@/utils/site-stats'

const formatNumber = (value: number) => (Number(value) || 0).toLocaleString()

onMounted(() => {
  loadBusuanzi()
})
</script>
