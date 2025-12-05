<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <RouterView />
    <SearchModal />
  </div>
</template>

<script setup lang="ts">
import SearchModal from '@/components/ui/SearchModal.vue'
import 'vue3-toastify/dist/index.css'
</script>