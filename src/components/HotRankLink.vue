<template>
  <a
    :href="SITE_CONFIG.hotRank"
    target="_blank"
    rel="noopener noreferrer"
    class="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm hover:opacity-90 transition-opacity"
    :title="t('hotRankNews')"
    :aria-label="t('hotRankNews')"
  >
    <IconCarbonFire class="w-3 h-3" />
    {{ t('hotRankNews') }}
  </a>
</template>

<script setup lang="ts">
import { SITE_CONFIG } from '@/constants'
import { t } from '@/utils/i18n'
</script>
