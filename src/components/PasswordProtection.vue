<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <IconCarbonLocked class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ t('passwordProtected') }}</h1>
          <p class="text-gray-600 dark:text-gray-300">{{ t('enterPasswordToAccess') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('password') }}
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              :placeholder="t('enterPassword')"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div v-if="error" class="text-red-500 text-sm text-center py-2">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
          >
            <span v-if="!loading">{{ t('access') }}</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('checking') }}
            </span>
          </button>
        </form>

        <div class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{{ t('contactForAccess') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '@/utils/i18n'
import { passwordApi } from '@/utils/password'

const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  if (!password.value.trim()) {
    error.value = t('passwordRequired') || '请输入密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 检查密码是否正确
    const result = passwordApi.verifyPassword(password.value)

    if (result.success) {
      // 密码正确，保存到 localStorage 并重定向到主页
      localStorage.setItem('blog-access-pwd', password.value)
      // 跳转到之前尝试访问的页面或者首页
      const redirectPath = sessionStorage.getItem('redirect-after-login') || '/'
      sessionStorage.removeItem('redirect-after-login')
      router.push(redirectPath)
    } else {
      error.value = result.message || (t('incorrectPassword') || '密码错误')
    }
  } catch (err) {
    error.value = t('loginError') || '登录时发生错误，请稍后重试'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>