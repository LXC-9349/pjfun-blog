<template>
  <a
    v-if="!imageFailed"
    :href="SITE_STATS_CONFIG.ping0Link"
    target="_blank"
    rel="noopener noreferrer"
    class="block rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-gray-200/70 dark:ring-gray-700/60 transition-transform duration-300 hover:scale-[1.02]"
    :title="t('poweredByPing0')"
    :aria-label="t('visitorInfoAlt')"
  >
    <img
      :src="SITE_STATS_CONFIG.ping0ImageUrl"
      :alt="t('visitorInfoAlt')"
      class="w-full h-auto rounded-md"
      loading="lazy"
      decoding="async"
      referrerpolicy="no-referrer-when-downgrade"
      @error="imageFailed = true"
    />
  </a>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SITE_STATS_CONFIG } from '@/constants'
import { t } from '@/utils/i18n'

const imageFailed = ref(false)
</script>
