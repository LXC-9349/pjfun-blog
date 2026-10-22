<script setup lang="ts">
import { SITE_CONFIG } from '@/constants'
</script>

<template>
  <div class="bg-gradient-to-r from-primary to-amber-500 text-white py-3 overflow-hidden">
    <vue3-marquee class="text-center font-medium text-lg">
      {{ SITE_CONFIG.title }} · {{ SITE_CONFIG.description }}
    </vue3-marquee>
  </div>
</template>
