<template>
  <div class="relative w-full flex flex-col bg-gray-100 dark:bg-dark-900 overflow-auto font-sans" ref="containerRef">

    <div class="absolute top-0px left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-1 bg-white/85 dark:bg-dark-300/85 backdrop-blur-12px rounded-4 shadow-lg hover:shadow-xl border border-white/50 dark:border-dark-600/50 transition-all duration-300 hover:shadow-xl dark:hover:shadow-xl" v-if="!isLoading && !errorMessage">
      <div class="flex items-center gap-1">
        <button @click="prevPage" :disabled="pageNum <= 1" :title="t('prevPage')" class="pdf-toolbar-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-25 text-center font-mono select-none">{{ pageNum }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="pageNum >= totalPages" :title="t('nextPage')" class="pdf-toolbar-btn">
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
            class="w-20 px-2 py-1 border border-gray-300 dark:border-dark-600 rounded-1.5 text-sm text-center bg-white dark:bg-dark-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] dark:focus:shadow-[0_0_0_3px_rgba(249,115,22,0.25)]"
          />
          <button @click="jumpToPage" :title="t('jumpToPage')" class="pdf-toolbar-btn">{{ t('jump') }}</button>
        </div>
      </div>

      <div class="w-1px h-5 bg-gray-300 dark:bg-dark-500 mx-2"></div>

      <div class="flex items-center gap-1">
        <button @click="zoomOut" :title="t('zoomOut')" class="pdf-toolbar-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
        <span @click="resetZoom" :title="t('reset')" class="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-12.5 text-center cursor-pointer select-none hover:text-primary dark:hover:text-orange-400">{{ scalePercentage }}</span>
        <button @click="zoomIn" :title="t('zoomIn')" class="pdf-toolbar-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
        </button>
      </div>

      <div class="w-1px h-5 bg-gray-300 dark:bg-dark-500 mx-2"></div>

      <div class="flex items-center gap-1">
        <button @click="copyPageText" :title="t('copy')" class="pdf-toolbar-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        </button>
        <button @click="rotateClockwise" :title="t('rotate')" class="pdf-toolbar-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/></svg>
        </button>
        <button @click="downloadPdf" :title="t('download')" class="pdf-toolbar-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto flex justify-center items-start p-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-dark-600 scrollbar-track-transparent">
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 gap-4">
        <div class="w-10 h-10 border-3 border-gray-200 dark:border-dark-600 border-t-primary dark:border-t-orange-400 rounded-1/2 animate-spin"></div>
        <p>{{ t('loadingDocument') }}</p>
      </div>

      <div v-if="errorMessage" class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 gap-4">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ef4444" stroke-width="1.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>{{ errorMessage }}</p>
      </div>

      <div class="shadow-lg transition-transform duration-200 line-height-0 relative" v-show="!isLoading && !errorMessage">
        <canvas ref="canvasRef" class="pdf-canvas"></canvas>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { shallowRef,ref, onMounted, watch, onUnmounted, computed} from 'vue';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { t } from '@/utils/i18n';
import { getPdfWorkerSources } from '@/constants';
import { ensureCdnLib } from '@/utils/cdn';
import {showSuccess} from "@/utils/tool";

type PdfjsLib = typeof import('pdfjs-dist')

// pdfjs 在生产构建中被外置为按需库（见 build_cdn.ts）：
// 不能在模块顶层读取全局变量，否则 external 模块初始化时拿到的是 undefined。
let pdfjsLib: PdfjsLib | null = null

async function loadPdfjs(): Promise<PdfjsLib> {
  if (pdfjsLib) return pdfjsLib
  await ensureCdnLib('pdfjs-dist')
  const fromGlobal = (window as unknown as { pdfjsLib?: PdfjsLib }).pdfjsLib
  // 开发模式未外置，走本地打包的动态导入
  pdfjsLib = fromGlobal || (await import('pdfjs-dist'))
  return pdfjsLib
}

/**
 * 加载 PDF Worker 脚本，支持多源回退
 */
async function loadPdfWorker(sources: string[]): Promise<string> {
  // 尝试每个源直到成功
  for (const src of sources) {
    try {
      // HEAD 请求在 no-cors 模式下总是返回 opaque response（状态0）
      // 所以我们直接尝试加载脚本
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
        // 清理已加载的脚本
        setTimeout(() => {
          if (script.parentNode) script.parentNode.removeChild(script);
        }, 100);
      });
      return src;
    } catch {
      continue;
    }
  }
  throw new Error('All PDF Worker sources failed to load');
}

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
// 缓存页面文本内容
const pageTextCache = new Map<number, string>();

// 渲染任务控制（用于防止快速翻页时的冲突）
let renderTask: any = null;
let disposed = false;
let loadSeq = 0;

const destroyPdfDocument = () => {
  if (renderTask) {
    renderTask.cancel();
    renderTask = null;
  }
  const doc = pdfDoc.value;
  pdfDoc.value = null;
  if (doc) void doc.destroy().catch(() => undefined);
  pageTextCache.clear();
};

// --- 初始化与加载 ---
onMounted(async () => {
  let lib: PdfjsLib
  try {
    lib = await loadPdfjs()
  } catch (error) {
    console.error('PDF 引擎加载失败:', error)
    errorMessage.value = t('documentLoadError')
    isLoading.value = false
    return
  }
  if (disposed) return

  // 配置 Worker (支持多源回退，版本与当前 pdfjs 保持一致)
  const workerSources = getPdfWorkerSources(lib.version)
  try {
    const workerSrc = await loadPdfWorker(workerSources)
    lib.GlobalWorkerOptions.workerSrc = workerSrc
  } catch (e) {
    // 如果 Worker CDN 都失败，使用内置的 worker 构建（如果可用）
    console.warn('PDF Worker CDN fallback failed, trying inline:', e);
    try {
      // 最后手段：尝试从 pdfjs-dist 包中加载
      lib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      // 如果所有方法都失败，PDF 将无法渲染但不会导致页面崩溃
      errorMessage.value = t('documentLoadError') + ': PDF Worker not available';
      isLoading.value = false;
      return;
    }
  }
  if (disposed) return

  await loadPdf();
  if (disposed) return

  // 添加窗口大小改变监听
  window.addEventListener('resize', handleResize);

  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  disposed = true
  loadSeq++
  destroyPdfDocument()
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  saveState();
});

// 监听源文件变化
watch(() => props.src, () => {
  destroyPdfDocument()
  void loadPdf();
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

  const seq = ++loadSeq
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 切换文档时恢复默认视图，避免沿用上一份文档的页码/缩放/旋转
    pageNum.value = 1;
    scale.value = 1.0;
    rotation.value = 0;
    pageTextCache.clear();
    // 先加载状态
    loadState();

    const loadingTask = pdfjsLib!.getDocument(props.src);
    const doc = await loadingTask.promise;
    if (seq !== loadSeq || disposed) {
      void doc.destroy().catch(() => undefined);
      return;
    }

    const previous = pdfDoc.value;
    pdfDoc.value = doc;
    if (previous) void previous.destroy().catch(() => undefined);
    totalPages.value = doc.numPages;

    // 如果保存的页码超出范围，则设置为第一页
    if (pageNum.value > totalPages.value) {
      pageNum.value = 1;
    }

    await renderPage(pageNum.value);
  } catch (error: any) {
    if (seq !== loadSeq) return;
    console.error('PDF加载失败:', error);
    errorMessage.value = t('documentLoadError') + ': ' + error.message;
  } finally {
    if (seq === loadSeq) isLoading.value = false;
  }
};

// --- 核心渲染逻辑 ---
const renderPage = async (num: number) => {
  if (!pdfDoc.value || !canvasRef.value) return;

  const seq = loadSeq

  // 如果有正在进行的渲染任务，取消它
  if (renderTask) {
    renderTask.cancel();
  }

  try {
    const page: PDFPageProxy = await pdfDoc.value.getPage(num);
    if (seq !== loadSeq || disposed) return

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
    // @ts-expect-error pdfjs 的 RenderParameters 类型对 transform 的元组约束比运行时更严格
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
      pageTextCache.set(pageNum.value, pageText);
    }
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(pageText);
    showSuccess(t('copied'))
  } catch (error) {
    console.error('复制页面文本失败:', error);
    // 可以添加错误提示
  }
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
.pdf-canvas {
  filter: none;
  background-color: #ffffff;
}

/* 暗色模式：使用深色背景 + 降低亮度来模拟暗色阅读体验，避免色彩失真 */
.dark .pdf-canvas {
  filter: invert(80%) hue-rotate(180deg) brightness(0.9) contrast(1.05);
  background-color: #1a1a2e;
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