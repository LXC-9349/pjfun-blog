<script setup lang="ts">
import { onMounted } from 'vue'
import { t } from '@/utils/i18n'

const toggleDark = () => {
  const html = document.documentElement
  html.classList.toggle('dark')
  
  // 获取当前主题状态
  const isDark = html.classList.contains('dark')

  if(isDark){
    html.classList.remove('light')
  }else{
    html.classList.add('light')
  }
  // 同步 data-theme 属性和 localStorage
  html.setAttribute('data-theme', isDark ? 'dark' : 'light')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  
  // 触发自定义事件，通知其他组件主题已更改
  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: isDark ? 'dark' : 'light' } }))

  // 更新所有 markdown-body 元素的 data-theme 属性
  document.querySelectorAll('.markdown-body').forEach(el => {
    el.setAttribute('data-theme', isDark ? 'dark' : 'light');
  });
}

// 监听系统主题变化
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  const html = document.documentElement
  const isDark = e.matches

  html.classList.toggle('dark', isDark)
  html.setAttribute('data-theme', isDark ? 'dark' : 'light')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')

  // 触发自定义事件，通知其他组件主题已更改
  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: isDark ? 'dark' : 'light' } }))

  // 更新所有 markdown-body 元素的 data-theme 属性
  document.querySelectorAll('.markdown-body').forEach(el => {
    el.setAttribute('data-theme', isDark ? 'dark' : 'light');
  });
}

onMounted(() => {
  // 页面加载时从 localStorage 恢复主题设置
  const savedTheme = localStorage.getItem('theme')
  const html = document.documentElement
  
  if (savedTheme === 'dark') {
    html.classList.add('dark')
    html.classList.remove('light')
    html.setAttribute('data-theme', 'dark')
  } else if (savedTheme === 'light') {
    html.classList.add('light')
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // 如果没有保存的主题设置，则根据系统偏好设置
    html.classList.add('dark')
    html.classList.remove('light')
    html.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    // 默认使用浅色主题
    html.classList.add('light')
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
    localStorage.setItem('theme', 'light')
  }
  
  // 设置初始 markdown-body 的 data-theme 属性
  document.querySelectorAll('.markdown-body').forEach(el => {
    el.setAttribute('data-theme', savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  });
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange)
})
</script>

<template>
  <button 
    @click="toggleDark"
    class="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    :aria-label="t('toggleTheme')"
  >
    <IconCarbonSun class="w-6 h-6 dark:hidden" />
    <IconCarbonMoon class="w-6 h-6 hidden dark:block" />
  </button>
</template>