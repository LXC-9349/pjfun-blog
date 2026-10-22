<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { STUDIO_SETTING_GROUPS } from '@/constants/studio-settings'
import { studioApi } from '@/studio/api'
import type { EnvConfigPayload } from '@/studio/types'

const values = ref<Record<string, string>>({})
const defaults = ref<Record<string, string>>({})
const original = ref('')
const exists = ref(false)
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')

const exportOpen = ref(false)
const exportOnlyChanged = ref(false)
const exportFormat = ref<'env' | 'yaml' | 'json'>('env')
const copied = ref(false)

const formatOptions = [
  { id: 'env', label: '.env' },
  { id: 'yaml', label: 'GitHub YAML' },
  { id: 'json', label: 'JSON' }
] as const

const dirty = computed(() => Object.keys(values.value).length > 0 && JSON.stringify(values.value) !== original.value)

const labelClass = 'mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-300'
const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-orange-400 dark:border-gray-700 dark:bg-gray-900'

function applyPayload(payload: EnvConfigPayload) {
  values.value = { ...payload.values }
  defaults.value = { ...payload.defaults }
  original.value = JSON.stringify(payload.values)
  exists.value = payload.exists
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    applyPayload(await studioApi.getConfig())
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '读取参数失败'
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    const payload = await studioApi.saveConfig(values.value)
    applyPayload(payload)
    message.value = payload.restarting
      ? '已保存到 .env，开发服务器正在重启，页面稍后会自动刷新'
      : '已保存到 .env'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存参数失败'
  } finally {
    saving.value = false
  }
}

function setValue(key: string, value: string) {
  values.value = { ...values.value, [key]: value }
}

function onInput(key: string, event: Event) {
  setValue(key, (event.target as HTMLInputElement).value)
}

function onSelect(key: string, event: Event) {
  setValue(key, (event.target as HTMLSelectElement).value)
}

function isTrue(key: string): boolean {
  return values.value[key] === 'true'
}

function toggleBoolean(key: string, event: Event) {
  setValue(key, (event.target as HTMLInputElement).checked ? 'true' : 'false')
}

const exportFields = computed(() =>
  STUDIO_SETTING_GROUPS.flatMap(group => group.fields).filter(field => field.exportable !== false)
)

const exportEntries = computed(() => {
  const entries: Array<[string, string]> = []
  for (const field of exportFields.value) {
    const value = values.value[field.key] || ''
    if (!value) continue
    if (exportOnlyChanged.value && value === (defaults.value[field.key] || '')) continue
    entries.push([field.key, value])
  }
  return entries
})

const exportText = computed(() => {
  const entries = exportEntries.value
  if (!entries.length) return ''
  if (exportFormat.value === 'yaml') {
    return ['env:', ...entries.map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`)].join('\n')
  }
  if (exportFormat.value === 'json') {
    return JSON.stringify(Object.fromEntries(entries), null, 2)
  }
  return entries.map(([key, value]) => `${key}=${value}`).join('\n')
})

const containsSecret = computed(() => exportEntries.value.some(([key]) => key === 'BLOG_PASSWORD'))

function openExport() {
  exportOpen.value = true
  copied.value = false
}

async function copyExport() {
  if (!exportText.value) return
  try {
    await navigator.clipboard.writeText(exportText.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    errorMessage.value = '复制失败，请手动选择文本复制'
  }
}

function downloadExport() {
  if (!exportText.value) return
  const extension = exportFormat.value === 'yaml' ? 'yml' : exportFormat.value === 'json' ? 'json' : 'env'
  const blob = new Blob([`${exportText.value}\n`], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pjfun-deploy.${extension}`
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(load)
</script>

<template>
  <div class="h-full overflow-y-auto" data-lenis-prevent>
    <div class="mx-auto max-w-5xl px-4 py-5 lg:px-6">
      <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-gray-800 dark:text-gray-100">站点参数</h2>
          <p class="mt-1 text-[11px] leading-relaxed text-gray-400">
            修改后写入本地 .env，保存后开发服务器会自动重启；这些配置不会提交到 Git。
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="dirty"
            class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
          >
            有未保存修改
          </span>
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="loading || saving"
            @click="load"
          >
            重新读取
          </button>
          <button
            type="button"
            class="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="loading"
            @click="openExport"
          >
            导出部署配置
          </button>
          <button
            type="button"
            class="rounded-lg bg-orange-600 px-3 py-1.5 text-[11px] text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            :disabled="loading || saving || !dirty"
            @click="save"
          >
            {{ saving ? '保存中…' : '保存参数' }}
          </button>
        </div>
      </div>

      <p
        v-if="message"
        class="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
      >
        {{ message }}
      </p>
      <p
        v-if="errorMessage"
        class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
      >
        {{ errorMessage }}
      </p>
      <p
        v-if="!exists && !loading"
        class="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-200"
      >
        当前没有 .env，下面显示的是 .env.example 的示例值；首次保存会自动创建 .env。
      </p>

      <div v-if="loading" class="py-16 text-center text-xs text-gray-400">正在读取参数…</div>

      <div v-else class="space-y-4">
        <section
          v-for="group in STUDIO_SETTING_GROUPS"
          :key="group.id"
          class="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        >
          <header class="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <h3 class="text-xs font-semibold text-gray-700 dark:text-gray-200">{{ group.title }}</h3>
            <p v-if="group.description" class="mt-0.5 text-[10px] text-gray-400">{{ group.description }}</p>
          </header>

          <div class="grid gap-4 p-4 sm:grid-cols-2">
            <div v-for="field in group.fields" :key="field.key">
              <label :class="labelClass">{{ field.label }}</label>

              <template v-if="field.type === 'boolean'">
                <label class="flex cursor-pointer items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <input
                    type="checkbox"
                    class="accent-orange-600"
                    :checked="isTrue(field.key)"
                    @change="toggleBoolean(field.key, $event)"
                  />
                  {{ isTrue(field.key) ? '已开启' : '已关闭' }}
                </label>
              </template>

              <template v-else-if="field.type === 'select'">
                <select :class="inputClass" :value="values[field.key] || ''" @change="onSelect(field.key, $event)">
                  <option v-for="option in field.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </template>

              <template v-else>
                <input
                  :class="inputClass"
                  :type="field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'"
                  :value="values[field.key] || ''"
                  :placeholder="field.placeholder"
                  :min="field.min"
                  :max="field.max"
                  autocomplete="off"
                  @input="onInput(field.key, $event)"
                />
              </template>

              <p class="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                <span class="font-mono">{{ field.key }}</span>
                <span v-if="field.help">· {{ field.help }}</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <p class="mt-4 text-[10px] leading-relaxed text-gray-400">
        .env 已被 .gitignore 忽略。部署到 Vercel / EdgeOne / GitHub Pages 等平台时，点击「导出部署配置」生成对应格式，或参考下方提示手动配置。
      </p>
    </div>
  </div>

  <div
    v-if="exportOpen"
    class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4"
    @click.self="exportOpen = false"
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900"
      data-lenis-prevent
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">导出部署配置</h2>
          <p class="mt-1 text-[11px] leading-relaxed text-gray-400">
            本地 .env 不会提交到 Git；把下面的内容同步到托管平台的环境变量即可。
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          @click="exportOpen = false"
        >
          关闭
        </button>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-3">
        <label class="flex cursor-pointer items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <input v-model="exportOnlyChanged" type="checkbox" class="accent-orange-600" />
          仅导出与默认值不同的项
        </label>
        <div class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
          <button
            v-for="option in formatOptions"
            :key="option.id"
            type="button"
            class="rounded-md px-2 py-0.5 text-[11px] transition-colors"
            :class="
              exportFormat === option.id
                ? 'bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-orange-300'
                : 'text-gray-500 dark:text-gray-400'
            "
            @click="exportFormat = option.id"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <pre
        v-if="exportText"
        class="mt-3 max-h-64 overflow-auto rounded-lg bg-gray-950 p-3 text-[11px] leading-5 text-gray-200"
        data-lenis-prevent
      >{{ exportText }}</pre>
      <p v-else class="mt-3 rounded-lg bg-gray-50 px-3 py-6 text-center text-[11px] text-gray-400 dark:bg-gray-800/60">
        没有需要导出的参数{{ exportOnlyChanged ? '（可以取消勾选，导出全部非空项）' : '' }}
      </p>

      <p v-if="containsSecret" class="mt-2 text-[11px] text-amber-500">
        包含博客访问密码：请只通过平台的加密变量 / Secrets 保存，不要提交到公开仓库。
      </p>

      <div class="mt-3 space-y-1 rounded-lg bg-gray-50 p-3 text-[10px] leading-relaxed text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
        <p>Vercel / EdgeOne / Netlify：Project Settings → Environment Variables，逐条粘贴 KEY 与 VALUE。</p>
        <p>GitHub Actions：写入 Repository Variables / Secrets，并在 workflow 的 env 中引用；VITE_BASE 按仓库名设置（如 /pjfun-blog/）。</p>
        <p>Docker：下载后重命名为 .env，使用 docker run --env-file .env 启动。</p>
        <p>STUDIO_TOKEN 仅供本地创作台使用，不会导出。</p>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
          :disabled="!exportText"
          @click="copyExport"
        >
          {{ copied ? '已复制' : '复制' }}
        </button>
        <button
          type="button"
          class="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
          :disabled="!exportText"
          @click="downloadExport"
        >
          下载文件
        </button>
        <button
          type="button"
          class="rounded-lg bg-orange-600 px-3 py-1.5 text-[11px] text-white hover:bg-orange-700"
          @click="exportOpen = false"
        >
          完成
        </button>
      </div>
    </div>
  </div>
</template>
