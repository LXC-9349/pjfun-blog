<template>
  <div class="relative w-full flex flex-col bg-gray-100 dark:bg-dark-900 overflow-auto font-sans" ref="containerRef">

    <div class="absolute top-0px left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-1 bg-white/85 dark:bg-dark-300/85 backdrop-blur-12px rounded-4 shadow-lg hover:shadow-xl border border-white/50 dark:border-dark-600/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-xl" v-if="!isLoading && !errorMessage">
      <div class="flex items-center gap-1">
        <button @click="prevPage" :disabled="pageNum <= 1" :title="t('prevPage')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-25 text-center font-mono select-none">{{ pageNum }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="pageNum >= totalPages" :title="t('nextPage')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <!-- 跳转页码输入框 -->
        <div class="flex items-center gap-1">
          <input 
            type="number" 
            v-model="jumpPageNumber" 
            :min="1" 
            :max="totalPages" 
            :placeholder="t('pageNumber')"
            @keyup.enter="jumpToPage"
            class="w-20 px-2 py-1 border border-gray-300 dark:border-dark-600 rounded-1.5 text-sm text-center bg-white dark:bg-dark-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(31,111,235,0.2)]"
          />
          <button @click="jumpToPage" :title="t('jumpToPage')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">{{ t('jump') }}</button>
        </div>
      </div>

      <div class="w-1px h-5 bg-gray-300 dark:bg-dark-500 mx-2"></div>

      <div class="flex items-center gap-1">
        <button @click="zoomOut" :title="t('zoomOut')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <span @click="resetZoom" :title="t('reset')" class="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-12.5 text-center cursor-pointer select-none hover:text-primary dark:hover:text-blue-400">{{ scalePercentage }}</span>
        <button @click="zoomIn" :title="t('zoomIn')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
      </div>

      <div class="w-1px h-5 bg-gray-300 dark:bg-dark-500 mx-2"></div>

      <div class="flex items-center gap-1">
        <button @click="copyPageText" :title="t('copy')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        </button>
        <button @click="rotateClockwise" :title="t('rotate')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>
        </button>
        <button @click="downloadPdf" :title="t('download')" class="flex items-center justify-center w-9 h-9 border-none bg-transparent text-gray-700 dark:text-gray-300 rounded-2 cursor-pointer transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto flex justify-center items-start p-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-600 scrollbar-track-transparent">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 gap-4">
        <div class="w-10 h-10 border-3 border-gray-200 dark:border-dark-600 border-t-primary dark:border-t-blue-400 rounded-1/2 animate-spin"></div>
        <p>{{ t('loadingDocument') }}</p>
      </div>

      <div v-if="errorMessage" class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 gap-4">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ef4444" stroke-width="1.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>{{ errorMessage }}</p>
      </div>

      <div class="shadow-lg transition-transform duration-200 line-height-0 relative" v-show="!isLoading && !errorMessage" ref="pageContainerRef">
        <canvas ref="canvasRef" class="pdf-canvas"></canvas>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { shallowRef,ref, onMounted, watch, onUnmounted, computed} from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { t } from '@/utils/i18n';
import {showSuccess} from "@/utils/tool";

// 定义 Props
interface Props {
  src: string;
  path: string;
  fileName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fileName: 'document.pdf',
});

const pdfDoc = shallowRef<PDFDocumentProxy | null>(null);
const pageNum = ref(1);
const jumpPageNumber = ref<number | null>(null);
const totalPages = ref(0);
const scale = ref(1.0); // 缩放比例
const rotation = ref(0); // 旋转角度
const isLoading = ref(true);
const errorMessage = ref('');
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
//@ts-ignore
const pageContainerRef = ref<HTMLElement | null>(null);
// 缓存页面文本内容
const pageTextCache = new Map<number, string>();

// 渲染任务控制（用于防止快速翻页时的冲突）
let renderTask: any = null;

// --- 初始化与加载 ---
onMounted(async () => {
  // 配置 Worker (严格按照你的要求)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.pjfun.top/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  await loadPdf();

  // 添加窗口大小改变监听
  window.addEventListener('resize', handleResize);

  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  saveState();
});

// 监听源文件变化
watch(() => props.src, () => {
  loadPdf();
});

// 监听页码和配置变化，自动保存状态
watch([pageNum, scale, rotation], () => {
  saveState();
});

const handleResize = () => {
  // 可选：窗口大小改变时自适应宽度
  // fitToWidth();
  autoFit()
};

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 防止在输入框中使用快捷键
  if ((event.target as HTMLElement).tagName === 'INPUT' ||
      (event.target as HTMLElement).tagName === 'TEXTAREA') {
    return;
  }

  switch (event.key) {
    case 'ArrowLeft':
      prevPage();
      break;
    case 'ArrowRight':
      nextPage();
      break;
    case 'ArrowUp':
      zoomIn();
      break;
    case 'ArrowDown':
      zoomOut();
      break;
    case '0':
      resetZoom();
      break;
    case 'r':
      rotateClockwise();
      break;
    case 'c':
      // 添加键盘快捷键 Ctrl+C 来复制页面文本
      if (event.ctrlKey) {
        copyPageText();
      }
      break;
  }
};

// 从本地存储加载状态
const loadState = () => {
  try {
    const key = `pdf_state_${props.path}`;
    const savedState = localStorage.getItem(key);

    if (savedState) {
      const state = JSON.parse(savedState);
      pageNum.value = state.pageNum || 1;
      scale.value = state.scale !== undefined ? state.scale : 1.0;
      rotation.value = state.rotation || 0;
    }
  } catch (e) {
    console.warn('Failed to load PDF state from localStorage:', e);
  }
};

// 保存状态到本地存储
const saveState = () => {
  try {
    const key = `pdf_state_${props.path}`;
    const state = {
      pageNum: pageNum.value,
      scale: scale.value,
      rotation: rotation.value,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save PDF state to localStorage:', e);
  }
};

// 加载 PDF 文档
const loadPdf = async () => {
  if (!props.src) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 先加载状态
    loadState();

    const loadingTask = pdfjsLib.getDocument(props.src);
    pdfDoc.value = await loadingTask.promise;
    totalPages.value = pdfDoc.value.numPages;

    // 如果保存的页码超出范围，则设置为第一页
    if (pageNum.value > totalPages.value) {
      pageNum.value = 1;
    }

    await renderPage(pageNum.value);
  } catch (error: any) {
    console.error('PDF加载失败:', error);
    errorMessage.value = t('documentLoadError') + ': ' + error.message;
  } finally {
    isLoading.value = false;
  }
};

// --- 核心渲染逻辑 ---
const renderPage = async (num: number) => {
  if (!pdfDoc.value || !canvasRef.value) return;

  // 如果有正在进行的渲染任务，取消它
  if (renderTask) {
    renderTask.cancel();
  }

  try {
    const page: PDFPageProxy = await pdfDoc.value.getPage(num);

    // 计算视口
    const viewport = page.getViewport({ scale: scale.value, rotation: rotation.value });
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const outputScale = window.devicePixelRatio || 1;

    // 设置 Canvas 的内部尺寸（实际像素）
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);

    // 设置 Canvas 的 CSS 尺寸（显示尺寸）
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : undefined;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      transform: transform, // 传入变换矩阵以适配高清屏
    };
    //@ts-ignore
    renderTask = page.render(renderContext);
    await renderTask.promise;

  } catch (error: any) {
    if (error.name !== 'RenderingCancelledException') {
      console.error('渲染页面失败:', error);
    }
  }
};

// 复制当前页面文本到剪贴板
const copyPageText = async () => {
  if (!pdfDoc.value) return;
  
  try {
    // 检查是否有缓存的文本
    let pageText = pageTextCache.get(pageNum.value);
    
    // 如果没有缓存，则从PDF页面获取文本
    if (!pageText) {
      const page = await pdfDoc.value.getPage(pageNum.value);
      const textContent = await page.getTextContent();
      pageText = textContent.items.map((item: any) => item.str).join('');
    }
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(pageText);
    showSuccess(t('copied'))
  } catch (error) {
    console.error('复制页面文本失败:', error);
    // 可以添加错误提示
  }
};

// 自适应宽度
//@ts-ignore
const fitToWidth = () => {
  if (!pdfDoc.value || !containerRef.value) return;
  
  const containerWidth = containerRef.value.clientWidth - 40; // 减去padding
  const currentPage = pageNum.value;
  
  pdfDoc.value.getPage(currentPage).then((page: PDFPageProxy) => {
    const viewport = page.getViewport({ scale: 1 });
    const scaleFit = containerWidth / viewport.width;
    scale.value = parseFloat(scaleFit.toFixed(2));
    renderPage(currentPage);
  });
};

// 页面大小优化：自动适应容器
const autoFit = () => {
  if (!pdfDoc.value || !containerRef.value) return;
  
  const containerWidth = containerRef.value.clientWidth - 40; // 减去padding
  const containerHeight = containerRef.value.clientHeight - 40; // 减去padding
  
  const currentPage = pageNum.value;
  
  pdfDoc.value.getPage(currentPage).then((page: PDFPageProxy) => {
    const viewport = page.getViewport({ scale: 1 });
    
    // 计算适合宽度和高度的比例
    const scaleFitWidth = containerWidth / viewport.width;
    const scaleFitHeight = containerHeight / viewport.height;
    
    // 选择较小的比例以确保整个页面可见
    const newScale = Math.min(scaleFitWidth, scaleFitHeight);
    
    scale.value = parseFloat(newScale.toFixed(2));
    renderPage(currentPage);
  });
};


// 翻页
const prevPage = () => {
  if (pageNum.value <= 1) return;
  pageNum.value--;
  renderPage(pageNum.value);
};

const nextPage = () => {
  if (pageNum.value >= totalPages.value) return;
  pageNum.value++;
  renderPage(pageNum.value);
};

// 跳转到指定页码
const jumpToPage = () => {
  if (!jumpPageNumber.value || jumpPageNumber.value < 1 || jumpPageNumber.value > totalPages.value) {
    // 如果输入无效，则重置输入框
    jumpPageNumber.value = null;
    return;
  }
  
  pageNum.value = jumpPageNumber.value;
  renderPage(pageNum.value);
  // 跳转后清空输入框
  jumpPageNumber.value = null;
};

// 缩放
const zoomIn = () => {
  scale.value = parseFloat((scale.value + 0.1).toFixed(1));
  renderPage(pageNum.value);
};

const zoomOut = () => {
  if (scale.value <= 0.2) return;
  scale.value = parseFloat((scale.value - 0.1).toFixed(1));
  renderPage(pageNum.value);
};

const resetZoom = () => {
  scale.value = 1.0;
  rotation.value = 0;
  renderPage(pageNum.value);
};

// 旋转
const rotateClockwise = () => {
  rotation.value = (rotation.value + 90) % 360;
  renderPage(pageNum.value);
};

// 下载
const downloadPdf = () => {
  const link = document.createElement('a');
  link.href = props.src;
  link.download = props.fileName;
  link.click();
};

// 格式化百分比显示
const scalePercentage = computed(() => `${Math.round(scale.value * 100)}%`);

// 国际化翻译函数

</script>
<style scoped>
/* 按钮样式 */
button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.dark button {
  color: #d1d9e0;
}

button:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
  color: #111827;
}

.dark button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f0f6fc;
}

button:active:not(:disabled) {
  transform: scale(0.95);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pdf-canvas {
  filter: none;
}

.dark .pdf-canvas {
  filter: invert(90%) hue-rotate(180deg);
}

@media print {
  .textLayer {
    opacity: 1;
  }
  
  .textLayer span {
    color: inherit;
  }
  
  .pdf-canvas {
    filter: none !important;
  }
}
</style>