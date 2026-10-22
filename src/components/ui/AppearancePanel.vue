<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="open" class="appearance-mask bg-black/30 sm:bg-black/10" @click.self="close">
        <section
          class="appearance-panel absolute top-[72px] right-3 sm:right-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          :aria-label="t('appearanceTitle')"
        >
          <!-- 头部 -->
          <header class="flex items-start justify-between gap-3 px-4 pt-4 pb-3 shrink-0">
            <div class="min-w-0">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <svg class="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 21a9 9 0 1 1 9-9c0 1.66-1.34 3-3 3h-1.5a2 2 0 0 0-1.6 3.2l.4.53A1.5 1.5 0 0 1 14 21z" />
                  <circle cx="7.5" cy="11.5" r="1" />
                  <circle cx="12" cy="7.5" r="1" />
                  <circle cx="16.5" cy="11.5" r="1" />
                </svg>
                {{ t('appearanceTitle') }}
              </h3>
              <p class="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">{{ t('appearanceSubtitle') }}</p>
            </div>
            <button class="icon-btn-sm -mt-1 -mr-1 shrink-0" :aria-label="t('close')" @click="close">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <!-- 分类标签 -->
          <div class="px-4 shrink-0">
            <div class="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-700/50">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="flex-1 px-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                :class="activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- 内容区 -->
          <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4">
            <!-- 背景图片 -->
            <div v-if="activeTab === 'background'" class="animate-fade-in">
              <div v-if="backgroundStatus === 'loading'" class="mb-2 text-[11px] text-gray-500 dark:text-gray-400">
                {{ t('appearanceBackgroundLoading') }}
              </div>
              <div v-else-if="backgroundStatus === 'error'" class="mb-2 flex items-center justify-between gap-2 text-[11px] text-red-500">
                <span>{{ t('appearanceBackgroundLoadFailed') }}</span>
                <button type="button" class="underline cursor-pointer shrink-0" @click="reloadBackgrounds">{{ t('retry') }}</button>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <!-- 无背景 -->
                <button
                  type="button"
                  class="group relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
                  :class="appearance.backgroundId === ''
                    ? 'border-orange-500 shadow-md'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'"
                  :aria-pressed="appearance.backgroundId === ''"
                  @click="selectBackground('')"
                >
                  <span class="w-full aspect-[4/3] flex-center bg-gray-100 dark:bg-gray-700/60 text-gray-400 dark:text-gray-500">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M5.5 5.5l13 13" />
                    </svg>
                  </span>
                  <span class="absolute inset-x-0 bottom-0 px-1.5 py-1 text-[10px] text-gray-600 dark:text-gray-200 text-left bg-white/85 dark:bg-gray-800/85">
                    {{ t('appearanceBackgroundNone') }}
                  </span>
                  <span v-if="appearance.backgroundId === ''" class="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white flex-center">
                    <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>

                <!-- 图片背景 -->
                <button
                  v-for="item in backgroundList"
                  :key="item.id"
                  type="button"
                  class="group relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer"
                  :class="appearance.backgroundId === item.id
                    ? 'border-orange-500 shadow-md'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'"
                  :aria-pressed="appearance.backgroundId === item.id"
                  @click="selectBackground(item.id)"
                >
                  <img
                    :src="item.url"
                    :alt="labelOf(item)"
                    class="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  >
                  <span class="absolute inset-x-0 bottom-0 px-1.5 py-1 text-[10px] text-white text-left bg-gradient-to-t from-black/70 to-transparent">
                    {{ labelOf(item) }}
                  </span>
                  <span v-if="appearance.backgroundId === item.id" class="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white flex-center">
                    <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>{{ t('appearanceOverlay') }}</span>
                  <span>{{ appearance.effect.overlay }}%</span>
                </div>
                <input
                  v-model.number="appearance.effect.overlay"
                  class="plain-range w-full mt-2"
                  type="range"
                  v-bind="APPEARANCE_LIMITS.overlay"
                  :style="{ accentColor: accentHex }"
                  :aria-label="t('appearanceOverlay')"
                >
                <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceOverlayDesc') }}</p>
              </div>

              <!-- 背景动效 -->
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p class="text-xs font-medium text-gray-700 dark:text-gray-200">{{ t('appearanceBackgroundEffect') }}</p>
                <div class="mt-2 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('appearanceAutoRotate') }}</p>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400">
                      {{ t('appearanceRotateInterval') }} · {{ t('appearanceSeconds', { value: appearance.effect.rotateInterval }) }}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="appearance.effect.autoRotate"
                    :aria-label="t('appearanceAutoRotate')"
                    class="switch"
                    :class="appearance.effect.autoRotate ? 'is-on' : 'is-off'"
                    @click="appearance.effect.autoRotate = !appearance.effect.autoRotate"
                  >
                    <span class="switch-dot"></span>
                  </button>
                </div>
                <input
                  v-if="appearance.effect.autoRotate"
                  v-model.number="appearance.effect.rotateInterval"
                  class="plain-range w-full mt-2"
                  type="range"
                  v-bind="APPEARANCE_LIMITS.autoRotateInterval"
                  :style="{ accentColor: accentHex }"
                  :aria-label="t('appearanceRotateInterval')"
                >
                <div class="mt-3 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('appearanceKenBurns') }}</p>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400">Ken Burns</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="appearance.effect.kenBurns"
                    :aria-label="t('appearanceKenBurns')"
                    class="switch"
                    :class="appearance.effect.kenBurns ? 'is-on' : 'is-off'"
                    @click="appearance.effect.kenBurns = !appearance.effect.kenBurns"
                  >
                    <span class="switch-dot"></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 字体：两列卡片，打开时自动预加载预览字体 -->
            <div v-else-if="activeTab === 'font'" class="animate-fade-in space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="font in fontList"
                  :key="font.id"
                  type="button"
                  class="relative min-w-0 flex flex-col gap-1 p-2.5 rounded-xl border text-left transition-colors cursor-pointer"
                  :class="appearance.fontId === font.id
                    ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
                  :title="labelOf(font)"
                  :aria-pressed="appearance.fontId === font.id"
                  @click="selectFont(font.id)"
                >
                  <div class="flex items-center gap-1 pr-5 min-w-0">
                    <span class="text-xs font-medium text-gray-900 dark:text-white truncate">{{ labelOf(font) }}</span>
                    <span v-if="fontStatus[font.id] === 'loading'" class="text-[10px] text-orange-500 shrink-0">…</span>
                    <span v-else-if="fontStatus[font.id] === 'error'" class="text-[10px] text-red-500 shrink-0">!</span>
                  </div>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate" :style="{ fontFamily: font.family }">
                    {{ t('appearanceFontSample') }}
                  </p>
                  <span v-if="appearance.fontId === font.id" class="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-orange-500 text-white flex-center">
                    <svg class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span v-else-if="switching === font.id" class="absolute top-1.5 right-1.5 w-3 h-3 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></span>
                </button>
              </div>
              <p class="pt-1 text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceFontHint') }}</p>
            </div>

            <!-- 主题色 -->
            <div v-else-if="activeTab === 'accent'" class="animate-fade-in">
              <p class="text-xs font-medium text-gray-700 dark:text-gray-200">{{ t('appearanceAccentPreset') }}</p>
              <div class="mt-2 grid grid-cols-6 gap-2">
                <button
                  v-for="preset in accentPresets"
                  :key="preset.id"
                  type="button"
                  class="group flex flex-col items-center gap-1 cursor-pointer"
                  :title="labelOf(preset)"
                  :aria-pressed="isPresetActive(preset)"
                  @click="applyPreset(preset)"
                >
                  <span
                    class="w-8 h-8 rounded-full border-2 transition-transform group-hover:scale-110"
                    :style="{
                      backgroundColor: presetColor(preset),
                      borderColor: isPresetActive(preset) ? 'rgb(var(--accent-500))' : 'transparent'
                    }"
                  ></span>
                  <span
                    class="text-[10px]"
                    :class="isPresetActive(preset) ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-500 dark:text-gray-400'"
                  >
                    {{ labelOf(preset) }}
                  </span>
                </button>
              </div>

              <div class="mt-4 space-y-3">
                <div>
                  <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>{{ t('appearanceHue') }}</span>
                    <span>{{ appearance.accent.h }}°</span>
                  </div>
                  <input
                    v-model.number="appearance.accent.h"
                    class="hue-range w-full mt-2"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    :aria-label="t('appearanceHue')"
                  >
                </div>
                <div>
                  <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>{{ t('appearanceSaturation') }}</span>
                    <span>{{ appearance.accent.s }}%</span>
                  </div>
                  <input
                    v-model.number="appearance.accent.s"
                    class="plain-range w-full mt-2"
                    type="range"
                    min="20"
                    max="100"
                    step="1"
                    :style="{ accentColor: accentHex }"
                    :aria-label="t('appearanceSaturation')"
                  >
                </div>
              </div>

              <div class="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2">
                <span class="px-3 py-1.5 rounded-lg text-white text-xs font-medium" :style="{ backgroundColor: accentHex }">
                  {{ t('appearanceApplied') }}
                </span>
                <span class="px-3 py-1.5 rounded-lg text-xs font-medium" :style="{ backgroundColor: `${accentHex}22`, color: accentHex }">
                  Primary
                </span>
                <span class="ml-auto w-8 h-8 rounded-lg" :style="{ backgroundColor: `${accentHex}33` }"></span>
              </div>
              <p class="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceAccentHint') }}</p>
            </div>

            <!-- 特效：实时作用于首页背景 -->
            <div v-else-if="activeTab === 'effect'" class="animate-fade-in space-y-4">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('appearanceEffect') }}</p>
                  <p class="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceEffectDesc') }}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="appearance.effect.effectEnabled"
                  :aria-label="t('appearanceEffect')"
                  class="switch"
                  :class="appearance.effect.effectEnabled ? 'is-on' : 'is-off'"
                  @click="appearance.effect.effectEnabled = !appearance.effect.effectEnabled"
                >
                  <span class="switch-dot"></span>
                </button>
              </div>

              <p class="text-[11px] text-gray-500 dark:text-gray-400">
                {{ t('appearanceEffectAutoHint') }} · {{ t(profileLabelKey) }}
              </p>

              <template v-if="appearance.effect.effectEnabled">
                <div>
                  <p class="text-xs font-medium text-gray-700 dark:text-gray-200">{{ t('appearancePetalType') }}</p>
                  <div class="mt-2 grid grid-cols-3 gap-2">
                    <button
                      v-for="petal in petals"
                      :key="petal.id"
                      type="button"
                      class="flex items-center justify-center gap-1.5 px-1 py-2 rounded-lg border text-[11px] transition-colors cursor-pointer"
                      :class="isPetalSelected(petal.id)
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'"
                      :aria-pressed="isPetalSelected(petal.id)"
                      @click="togglePetal(petal.id)"
                    >
                      <PetalIcon :type="petal.id" :size="20" />
                      <span>{{ labelOf(petal) }}</span>
                    </button>
                  </div>
                </div>

                <div class="space-y-3">
                  <div>
                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{{ t('appearancePetalCount') }}</span>
                      <span>{{ appearance.effect.petalCount }}</span>
                    </div>
                    <input
                      v-model.number="appearance.effect.petalCount"
                      class="plain-range w-full mt-2"
                      type="range"
                      v-bind="APPEARANCE_LIMITS.petalCount"
                      :style="{ accentColor: accentHex }"
                      :aria-label="t('appearancePetalCount')"
                    >
                  </div>
                  <div>
                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{{ t('appearanceRotationSpeed') }}</span>
                      <span>{{ appearance.effect.rotationSpeed.toFixed(1) }}</span>
                    </div>
                    <input
                      v-model.number="appearance.effect.rotationSpeed"
                      class="plain-range w-full mt-2"
                      type="range"
                      v-bind="APPEARANCE_LIMITS.rotationSpeed"
                      :style="{ accentColor: accentHex }"
                      :aria-label="t('appearanceRotationSpeed')"
                    >
                  </div>
                  <div>
                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{{ t('appearanceHorizontalSpeed') }}</span>
                      <span>{{ appearance.effect.horizontalSpeed.toFixed(1) }}</span>
                    </div>
                    <input
                      v-model.number="appearance.effect.horizontalSpeed"
                      class="plain-range w-full mt-2"
                      type="range"
                      v-bind="APPEARANCE_LIMITS.horizontalSpeed"
                      :style="{ accentColor: accentHex }"
                      :aria-label="t('appearanceHorizontalSpeed')"
                    >
                  </div>
                  <div>
                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{{ t('appearanceVerticalSpeed') }}</span>
                      <span>{{ appearance.effect.verticalSpeed.toFixed(1) }}</span>
                    </div>
                    <input
                      v-model.number="appearance.effect.verticalSpeed"
                      class="plain-range w-full mt-2"
                      type="range"
                      v-bind="APPEARANCE_LIMITS.verticalSpeed"
                      :style="{ accentColor: accentHex }"
                      :aria-label="t('appearanceVerticalSpeed')"
                    >
                  </div>
                  <div>
                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{{ t('appearancePetalSwing') }}</span>
                      <span>{{ appearance.effect.petalSwing }}px</span>
                    </div>
                    <input
                      v-model.number="appearance.effect.petalSwing"
                      class="plain-range w-full mt-2"
                      type="range"
                      v-bind="APPEARANCE_LIMITS.petalSwing"
                      :style="{ accentColor: accentHex }"
                      :aria-label="t('appearancePetalSwing')"
                    >
                  </div>
                  <div>
                    <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{{ t('appearancePetalZIndex') }}</span>
                      <span>{{ appearance.effect.petalZIndex }}</span>
                    </div>
                    <input
                      v-model.number="appearance.effect.petalZIndex"
                      class="plain-range w-full mt-2"
                      type="range"
                      v-bind="APPEARANCE_LIMITS.petalZIndex"
                      :style="{ accentColor: accentHex }"
                      :aria-label="t('appearancePetalZIndex')"
                    >
                  </div>
                </div>

                <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearancePetalClickHint') }}</p>
              </template>
            </div>

            <!-- 鼠标样式 -->
            <div v-else-if="activeTab === 'cursor'" class="animate-fade-in space-y-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('appearanceTabCursor') }}</p>
                <p class="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceCursorDesc') }}</p>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="option in cursorOptions"
                  :key="option.id"
                  type="button"
                  class="flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-lg border text-[11px] transition-colors"
                  :class="appearance.cursor === option.id
                    ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'"
                  :style="{ cursor: cursorCssValue(option.id) }"
                  :aria-pressed="appearance.cursor === option.id"
                  @click="appearance.cursor = option.id"
                >
                  <span class="w-7 h-7 flex-center rounded-md border border-gray-200 dark:border-gray-600" :style="{ cursor: cursorCssValue(option.id) }">
                    <img :src="cursorPreviewSource(option.id)" class="w-5 h-5" alt="" draggable="false">
                  </span>
                  <span>{{ labelOf(option) }}</span>
                </button>
              </div>

              <p class="text-[11px] text-gray-500 dark:text-gray-400">
                {{ t('appearanceStoredLocally') }} · {{ t('appearanceCursorDesc') }}
              </p>
            </div>

            <!-- 屏保：参数统一在 src/constants/screensaver.ts 配置，这里只保留启动入口 -->
            <div v-else class="animate-fade-in space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('appearanceScreensaver') }}</p>
                <p class="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceScreensaverDesc') }}</p>
              </div>
              <button
                type="button"
                class="w-full flex-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-colors cursor-pointer"
                @click="openScreensaver"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {{ t('appearanceScreensaver') }}
              </button>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceScreensaverConfigHint') }}</p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ t('appearanceScreensaverEffectHint') }}</p>
            </div>
          </div>

          <!-- 底部 -->
          <footer class="shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
            <span class="text-[10px] text-gray-400 dark:text-gray-500 truncate">{{ t('appearanceStoredLocally') }}</span>
            <button
              type="button"
              class="text-xs text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer shrink-0"
              @click="handleReset"
            >
              {{ t('appearanceReset') }}
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>

  <!-- 全屏屏保特效 -->
  <ScreensaverOverlay v-model:visible="screensaverVisible" />
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { t, getLanguage } from '@/utils/i18n'
import { showError, showSuccess } from '@/utils/tool'
import {
  accentHex,
  accentPresets,
  appearance,
  backgroundList,
  backgroundStatus,
  cursorCssValue,
  cursorPreviewSource,
  deviceProfile,
  fontList,
  fontStatus,
  loadBackgrounds,
  preloadFontStyles,
  resetAppearance,
  setFont
} from '@/utils/appearance'
import { APPEARANCE_LIMITS, CURSOR_OPTIONS, SCREENSAVER_PETALS } from '@/constants'
import type { AppearanceAccentPreset, ScreensaverPetalType } from '@/constants'
import PetalIcon from '@/components/ui/PetalIcon.vue'
import ScreensaverOverlay from '@/components/ui/ScreensaverOverlay.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

type TabId = 'background' | 'font' | 'accent' | 'effect' | 'cursor' | 'screensaver'

const lang = getLanguage()
const activeTab = ref<TabId>('background')
const screensaverVisible = ref(false)
const switching = ref('')
const petals = SCREENSAVER_PETALS
const cursorOptions = CURSOR_OPTIONS

const PROFILE_LABEL_KEYS = {
  low: 'appearanceProfileLow',
  medium: 'appearanceProfileMedium',
  high: 'appearanceProfileHigh'
} as const
const profileLabelKey = computed(() => PROFILE_LABEL_KEYS[deviceProfile.level])

const tabs = computed<Array<{ id: TabId; label: string }>>(() => [
  { id: 'background', label: t('appearanceTabBackground') },
  { id: 'font', label: t('appearanceTabFont') },
  { id: 'accent', label: t('appearanceTabAccent') },
  { id: 'effect', label: t('appearanceTabEffect') },
  { id: 'cursor', label: t('appearanceTabCursor') },
  { id: 'screensaver', label: t('appearanceTabScreensaver') }
])

const reloadBackgrounds = () => {
  void loadBackgrounds()
}

const isPetalSelected = (id: ScreensaverPetalType) => appearance.effect.petalTypes.includes(id)

/** 多选特效类型，至少保留一种 */
function togglePetal(id: ScreensaverPetalType) {
  const types = appearance.effect.petalTypes
  const index = types.indexOf(id)
  if (index >= 0) {
    if (types.length <= 1) return
    types.splice(index, 1)
  } else {
    types.push(id)
  }
}

const labelOf = (item: { label: string; labelEn: string }) => (lang === 'zh' ? item.label : item.labelEn)

const presetColor = (preset: AppearanceAccentPreset) => `hsl(${preset.h} ${preset.s}% ${preset.l}%)`

const isPresetActive = (preset: AppearanceAccentPreset) =>
  appearance.accent.h === preset.h && appearance.accent.s === preset.s && appearance.accent.l === preset.l

function applyPreset(preset: AppearanceAccentPreset) {
  appearance.accent.h = preset.h
  appearance.accent.s = preset.s
  appearance.accent.l = preset.l
}

function selectBackground(id: string) {
  appearance.backgroundId = id
}

async function selectFont(id: string) {
  if (appearance.fontId === id || switching.value) return
  switching.value = id
  const ok = await setFont(id)
  switching.value = ''

  if (!ok) {
    showError(t('appearanceFontFailed'))
    // 加载失败时回退到系统字体，保证页面可读
    await setFont('system')
  }
}

function handleReset() {
  resetAppearance()
  showSuccess(t('appearanceResetDone'))
}

function openScreensaver() {
  emit('update:open', false)
  screensaverVisible.value = true
}

function close() {
  emit('update:open', false)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !screensaverVisible.value) close()
}

// 打开字体页时预加载所有字体样式与预览字形，确保预览可见
watch(
  () => [props.open, activeTab.value] as const,
  ([open, tab]) => {
    if (open && tab === 'font') void preloadFontStyles(fontList)
  },
  { immediate: true }
)

// 面板打开时监听 ESC，支持键盘快速关闭
watch(
  () => props.open,
  open => {
    if (open) document.addEventListener('keydown', handleKeydown)
    else document.removeEventListener('keydown', handleKeydown)
  },
  { immediate: true }
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.appearance-mask {
  position: fixed;
  inset: 0;
  z-index: 85;
}

.appearance-panel {
  width: min(92vw, 23rem);
  max-height: calc(100dvh - 88px);
  overscroll-behavior: contain;
}

/* 普通滑杆 */
.plain-range {
  height: 6px;
  border-radius: 9999px;
  -webkit-appearance: none;
  appearance: none;
  background-color: #e9dfd2;
  cursor: pointer;
}

.dark .plain-range {
  background-color: #4a4038;
}

.plain-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background-color: #fff;
  border: 3px solid rgb(var(--accent-500));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.plain-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background-color: #fff;
  border: 3px solid rgb(var(--accent-500));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

/* 色相滑杆：轨道直接展示色相环 */
.hue-range {
  height: 10px;
  border-radius: 9999px;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  background: linear-gradient(
    90deg,
    hsl(0 85% 55%),
    hsl(60 85% 55%),
    hsl(120 70% 42%),
    hsl(180 80% 42%),
    hsl(240 80% 58%),
    hsl(300 75% 55%),
    hsl(360 85% 55%)
  );
}

.hue-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background-color: #fff;
  border: 3px solid rgb(var(--accent-500));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.hue-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background-color: #fff;
  border: 3px solid rgb(var(--accent-500));
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

/* 开关 */
.switch {
  width: 44px;
  height: 24px;
  padding: 2px;
  border: none;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.switch.is-on {
  background-color: rgb(var(--accent-500));
}

.switch.is-off {
  background-color: #d8c8b6;
}

.dark .switch.is-off {
  background-color: #4a4038;
}

.switch-dot {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
}

.switch.is-on .switch-dot {
  transform: translateX(20px);
}

/* 面板动效 */
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
