<template>
  <div class="w-full flex flex-col">
    <div v-if="loading" class="flex flex-col items-center justify-center h-full p-8 text-center">
      <div class="w-12 h-12 border-4 border-gray-200 border-l-blue-500 rounded-full animate-spin mb-4"></div>
      <p>{{ t('loadingDocument') }}</p>
    </div>
    
    <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-8 text-center">
      <p>{{ t('documentLoadError') }}</p>
      <button @click="retryLoad" class="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow">{{ t('retry') }}</button>
    </div>
    <pdf-to-html v-else-if="isPdf" :src="props.url" :path="props.path" :fileName="props.title"/>
    <excel :src="props.url" :fileName="props.title" v-else-if="isExcel"/>
    <div v-else class="document-content">
      <div v-if="convertedHtml" class="html-viewer p-4 overflow-auto h-full" v-html="sanitizedHtml"></div>
      
      <div v-else class="flex items-center justify-center h-full p-8 text-center">
        <p>{{ t('documentConversionNotSupported') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { t } from '@/utils/i18n'
import sanitizeHtml from 'dompurify'
import Excel from "@/components/preview/Excel.vue";

const props = defineProps<{
  url: string
  path: string
  extension: string
  title: string
}>()

const loading = ref(true)
const error = ref(false)
const convertedHtml = ref('')

const sanitizedHtml = computed(() => {
  return sanitizeHtml.sanitize(convertedHtml.value)
})

const isPdf = computed(() => props.extension === 'pdf')
const isWord = computed(() => props.extension === 'doc' || props.extension === 'docx')
const isExcel = computed(() => props.extension === 'xls' || props.extension === 'xlsx')
const isSupportedFormat = computed(() => isPdf.value || isWord.value || isExcel.value)

const retryLoad = () => {
  loading.value = true
  error.value = false
  if(!isPdf.value){
    loadDocument()
  }else{
    loading.value = false
  }
}

const loadDocument = async () => {
  try {
    if (!isSupportedFormat.value) {
      throw new Error('Unsupported document format')
    }

    // 获取文件内容
    const response = await fetch(props.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    
    if (isWord.value) {
      const { convertWordToHtml } = await import('@/utils/document-convert')
      convertedHtml.value = await convertWordToHtml(arrayBuffer)
    } else if (isExcel.value) {
    }
    
    loading.value = false
    
  } catch (err) {
    console.error('Document loading/conversion error:', err)
    error.value = true
    loading.value = false
  }
}

onMounted(() => {
  loadDocument()
})

watch(() => props.url, () => {
  loading.value = true
  error.value = false
  convertedHtml.value = ''
  loadDocument()
})

</script>

<style>
.html-viewer :deep(.pdf-document) {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.html-viewer :deep(.pdf-page) {
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
}

.html-viewer :deep(.excel-container) {
  overflow-x: auto;
}

.html-viewer :deep(.excel-sheet) {
  margin-bottom: 2rem;
}

.html-viewer :deep(.excel-table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.html-viewer :deep(.excel-table th),
.html-viewer :deep(.excel-table td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.html-viewer :deep(.excel-table th) {
  background-color: #f8f9fa;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
}

.html-viewer :deep(.excel-table tr:nth-child(even)) {
  background-color: #f8f9fa;
}

.html-viewer :deep(.excel-table tr:hover) {
  background-color: #e9ecef;
}

/* Word文档转换后内容的样式适配 */
.html-viewer {
  color: #1a202c;
}

.dark .html-viewer {
  color: #e2e8f0;
}

.html-viewer :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.html-viewer :deep(h1),
.html-viewer :deep(h2),
.html-viewer :deep(h3),
.html-viewer :deep(h4),
.html-viewer :deep(h5),
.html-viewer :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.html-viewer :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.dark .html-viewer :deep(h1) {
  border-bottom: 1px solid #4a5568;
}

.html-viewer :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.dark .html-viewer :deep(h2) {
  border-bottom: 1px solid #4a5568;
}

.html-viewer :deep(img) {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
}

.dark .html-viewer :deep(img) {
  background-color: #1a202c;
  filter: brightness(0.8) contrast(1.2);
}

.html-viewer :deep(pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.dark .html-viewer :deep(pre) {
  background-color: #2d3748;
}

.html-viewer :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 6px;
}

.dark .html-viewer :deep(code) {
  background-color: rgba(218, 224, 231, 0.1);
}

.html-viewer :deep(pre code) {
  padding: 0;
  margin: 0;
  font-size: 100%;
  background-color: transparent;
}

.html-viewer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
  background-color: #fff;
}

.dark .html-viewer :deep(table) {
  background-color: #1a202c;
}

.html-viewer :deep(table th),
.html-viewer :deep(table td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.dark .html-viewer :deep(table th),
.dark .html-viewer :deep(table td) {
  border: 1px solid #4a5568;
}

.html-viewer :deep(table th) {
  background-color: #f2f2f2;
}

.dark .html-viewer :deep(table th) {
  background-color: #2d3748;
}

.html-viewer :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.dark .html-viewer :deep(table tr:nth-child(2n)) {
  background-color: #2d3748;
}

.html-viewer :deep(strong) {
  font-weight: 600;
}

.html-viewer :deep(em) {
  font-style: italic;
}

.html-viewer :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.dark .html-viewer :deep(a) {
  color: #6cb6ff;
}

.html-viewer :deep(a:hover) {
  text-decoration: underline;
}

.html-viewer :deep(ul),
.html-viewer :deep(ol) {
  padding-left: 2rem;
  margin-bottom: 1rem;
}

.html-viewer :deep(li) {
  margin-bottom: 0.25rem;
}

.html-viewer :deep(blockquote) {
  margin: 0 0 1rem;
  padding: 0 1rem;
  border-left: 0.25rem solid #dfe2e5;
}

.dark .html-viewer :deep(blockquote) {
  border-left: 0.25rem solid #4a5568;
}
</style>