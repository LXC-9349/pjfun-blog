<template>
  <div class="h-screen w-full flex flex-col overflow-hidden font-sans text-gray-800 bg-gray-50 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">

    <div class="h-14 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between px-4 text-white shadow-lg z-50 shrink-0">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xl shadow-md flex-shrink-0">X</div>
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold truncate max-w-[150px] md:max-w-[200px]">{{ currentFileName }}</span>
          <div class="flex gap-3 text-[11px] opacity-90 tracking-wide flex-wrap">
            <span @click="handleMenuClick('file')" class="cursor-pointer hover:underline hover:opacity-100 transition-opacity whitespace-nowrap">{{ t('file') }}</span>
            <span @click="handleMenuClick('saveAs')" class="cursor-pointer hover:underline hover:opacity-100 transition-opacity whitespace-nowrap">{{ t('saveAs') }}</span>
            <span @click="handleMenuClick('print')" class="cursor-pointer hover:underline hover:opacity-100 transition-opacity whitespace-nowrap">{{ t('print') }}</span>
            <span @click="handleMenuClick('fullscreen')" class="cursor-pointer hover:underline hover:opacity-100 transition-opacity whitespace-nowrap">{{ t('fullscreen') }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="handleFile">
        <button
            @click="triggerUpload"
            class="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg transition-all duration-300 text-xs md:text-sm font-medium cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <span class="i-mdi-folder-open text-lg"></span>
          <span class="hidden sm:inline">{{ t('openFile') }}</span>
        </button>

        <!-- 添加全屏按钮 -->
        <button
            @click="toggleFullscreen"
            class="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg transition-all duration-300 text-xs md:text-sm font-medium cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-md whitespace-nowrap"
            :title="t('fullscreen')"
        >{{ t('fullscreen') }}</button>

        <div class="w-[1px] h-5 bg-white/40"></div>

        <button class="i-mdi-account-circle text-2xl hover:opacity-80 cursor-pointer transition-opacity"></button>
      </div>
    </div>

    <div v-if="isLoading" class="absolute inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
      <div class="i-mdi-file-excel-outline animate-pulse text-5xl mb-4"></div>
      <div class="text-lg font-medium">{{ loadingText }}</div>
      <div class="mt-2 text-sm opacity-75">{{ t('pleaseWait') }}</div>
    </div>

    <div class="flex-1 relative w-full">
      <div
          :id="CONTAINER_ID"
          class="absolute inset-0 top-0 left-0 w-full h-full"
          data-lenis-prevent
      ></div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { t } from '@/utils/i18n'
import { alertDialog } from '@/utils/tool'

declare global {
  interface Window {
    luckysheet: any;
    LuckyExcel: any;
    $: any; // jQuery
  }
}
// 定义 props
interface Props {
  src?: string
  fileName?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  fileName: '新建工作簿.xlsx'
})

// --- 配置项 ---
const CONTAINER_ID = 'luckysheet-container'
const CDN_BASE = 'https://unpkg.pjfun.top/luckysheet@2.1.13/dist' // 使用 unpkg 源
const JQUERY_URL = 'https://unpkg.pjfun.top/jquery@3.7.1/dist/jquery.min.js'
const LUCKY_EXCEL_URL = 'https://unpkg.pjfun.top/luckyexcel@1.0.1/dist/luckyexcel.umd.js'

// --- 状态管理 ---
const isReady = ref(false)
const isLoading = ref(true)
const loadingText = ref(t('initializingExcelEngine'))
const fileInput = ref<HTMLInputElement | null>(null)
const currentFileName = ref(t('newWorkbook'))
const isFullscreen = ref(false)

// --- 菜单处理逻辑 ---
const handleMenuClick = (menu: string) => {
  // 检查 luckysheet 是否已正确加载
  if (window.luckysheet) {
    switch (menu) {
      case 'file':
        // 对于文件菜单，我们触发上传按钮
        triggerUpload()
        break
      case 'saveAs':
        saveAsExcel()
        break
      case 'print':
        printExcel()
        break
      case 'fullscreen':
        toggleFullscreen()
        break
      default:
        console.log(`Unknown menu: ${menu}`)
    }
  } else {
    alertDialog(t('error'), t('excelEngineNotReady'))
  }
}

// --- 全屏功能 ---
const toggleFullscreen = () => {
  const container = document.querySelector('.luckysheet')?.closest('.flex.flex-col')

  if (!container) {
    alertDialog(t('error'), t('unableToFindContainer'))
    return
  }

  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen()
      isFullscreen.value = true
    } else {
      alertDialog(t('error'), t('fullscreenNotSupported'))
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}

// --- 另存为功能 ---
const saveAsExcel = () => {
  try {
    // 获取当前工作表数据
    const exportJson = window.luckysheet.getLuckysheetfile()

    if (!exportJson || exportJson.length === 0) {
      alertDialog(t('error'), t('noDataToSave'))
      return
    }

    // 设置默认文件名
    const fileName = currentFileName.value.replace(/\.[^/.]+$/, "") || t('workbook1')
    if (fileName !== null && fileName.trim() !== '') {
      performSaveAs(fileName.trim())
    }
  } catch (error) {
    console.error('另存为失败:', error)
    alertDialog(t('error'), t('saveFailed'))
  }
}

// --- 执行另存为操作 ---
const performSaveAs = (fileName: string) => {
  try {
    // 获取当前工作表数据
    const exportJson = window.luckysheet.getLuckysheetfile()

    // 创建一个简单的 Excel 文件内容
    const csvContent = convertToCSV(exportJson);

    // 创建 Blob 并下载
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.csv`
    document.body.appendChild(a)
    a.click()

    // 清理
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    console.error('保存失败:', error)
    alertDialog(t('error'), t('saveFailed'))
  }
}

// 新增辅助函数：将 Luckysheet 数据转换为 CSV 格式
const convertToCSV = (sheetData: any[]): string => {
  if (!sheetData || sheetData.length === 0) return ''

  const sheet = sheetData[0] // 取第一个工作表
  const { data } = sheet

  if (!data || data.length === 0) return ''

  let csvContent = ''

  // 遍历每一行
  data.forEach((row: any[]) => {
    if (row) {
      // 遍历每个单元格
      const rowContent = row.map(cell => {
        if (cell && cell.v !== undefined && cell.v !== null) {
          // 转义包含逗号或双引号的值
          let cellValue = String(cell.v)
          if (cellValue.includes(',') || cellValue.includes('"')) {
            cellValue = `"${cellValue.replace(/"/g, '""')}"`
          }
          return cellValue
        }
        return ''
      }).join(',')
      csvContent += rowContent + '\n'
    }
  })

  return csvContent
}

// --- 打印功能 ---
const printExcel = () => {
  try {
    // 检查是否有数据
    const exportJson = window.luckysheet.getLuckysheetfile()

    if (!exportJson || exportJson.length === 0) {
      alertDialog(t('error'), t('noDataToPrint'))
      return
    }

    // 尝试使用 luckysheet 内置打印功能（如果存在）
    if (window.luckysheet && typeof window.luckysheet.print === 'function') {
      window.luckysheet.print()
      return
    }

    // 备用方案：使用截图打印
    // 获取当前工作表的截图
    const screenshot = window.luckysheet.getScreenshot()

    if (!screenshot) {
      alertDialog(t('error'), t('printFailed'))
      return
    }

    // 创建打印窗口
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alertDialog(t('error'), t('popupBlocked'))
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('printPreview')}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            .print-container {
              text-align: center;
            }
            .print-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .print-image {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-title">${currentFileName.value}</div>
            <img src="${screenshot}" class="print-image" alt="Excel Sheet" />
          </div>
          <script>
            window.onload = function() {
              window.print();
              // 打印完成后关闭窗口
              setTimeout(() => {
                window.close();
              }, 1000);
            }
          <\/script>
        </body>
      </html>
    `)

    printWindow.document.close()
  } catch (error) {
    console.error('打印失败:', error)
    alertDialog(t('error'), t('printFailed'))
  }
}

// --- 动态加载资源的核心函数 ---
const loadLink = (href: string) => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve() // 已存在，直接返回
      return
    }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`))
    document.head.appendChild(link)
  })
}

const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    // 检查 script 是否已存在且加载完成 (简单判断)
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load JS: ${src}`))
    document.head.appendChild(script)
  })
}

// --- 初始化流程 ---
const initLuckysheet = async () => {
  try {
    loadingText.value = t('loadingStyles')
    // 1. 加载 CSS
    await Promise.all([
      loadLink(`${CDN_BASE}/plugins/css/pluginsCss.css`),
      loadLink(`${CDN_BASE}/plugins/plugins.css`),
      loadLink(`${CDN_BASE}/css/luckysheet.css`),
      loadLink(`${CDN_BASE}/assets/iconfont/iconfont.css`)
    ])

    loadingText.value = t('loadingCoreEngine')
    // 2. 加载 JS (注意顺序：jQuery -> Plugins -> Core -> ExcelParser)
    if (!window.$) await loadScript(JQUERY_URL)
    await loadScript(`${CDN_BASE}/plugins/js/plugin.js`)
    await loadScript(`${CDN_BASE}/luckysheet.umd.js`)
    await loadScript(LUCKY_EXCEL_URL)

    // 3. 渲染空表格
    renderSheet()
    isReady.value = true
    isLoading.value = false

    // 检查是否有传入的文件URL
    if (props.src) {
      loadExcelFromUrl(props.src)
    }

  } catch (error) {
    console.error('资源加载失败:', error)
    loadingText.value = t('resourceLoadFailed')
  }
}

// --- 渲染表格 ---
const renderSheet = (data: any[] = [], title: string = t('workbook1')) => {
  if (!window.luckysheet) return

  // 如果没有数据，默认创建一个空 Sheet
  const sheetData = data.length > 0 ? data : [{
    "name": "Sheet1",
    "status": 1,
    "order": 0,
    "data": [],
    "config": {},
    "index": 0
  }]

  window.luckysheet.create({
    container: CONTAINER_ID,
    lang: 'zh', // 语言
    title: title,
    data: sheetData,
    showinfobar: false, // 隐藏官方顶部栏，使用自定义的
    showtoolbar: true,
    showsheetbar: true,
    allowCopy: true,
    // 开启所有高级功能配置
    enableAddRow: true,
    enableAddBackTop: true,
    row: 30, // 默认行数
    column: 20, // 默认列数
  })
}

// --- 文件处理逻辑 ---
const handleFile = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  const file = files[0]
  //@ts-ignore
  currentFileName.value = file.name
  isLoading.value = true
  loadingText.value = t('parsingExcelFile')

  // 使用 LuckyExcel (已通过 CDN 全局注入)
  window.LuckyExcel.transformExcelToLucky(file, (exportJson: any) => {
    if (exportJson.sheets == null || exportJson.sheets.length === 0) {
      alertDialog(t('readFailed'), t('checkFileFormat'))
      isLoading.value = false
      return
    }

    // 销毁旧实例（重要：防止内存泄漏和DOM冲突）
    window.luckysheet.destroy()

    // 重新渲染
    renderSheet(exportJson.sheets, exportJson.info.name)
    isLoading.value = false
  }, (err: any) => {
    console.error('解析失败', err)
    isLoading.value = false
    alertDialog(t('parseFailed'), t('ensureValidXlsx'))
  })
}

// --- 从URL加载Excel文件 ---
const loadExcelFromUrl = async (url: string) => {
  try {
    isLoading.value = true
    loadingText.value = t('loadingExcelFromUrl')

    // 获取文件名
    const fileName = props.fileName || url.split('/').pop() || t('remoteFile')
    currentFileName.value = decodeURIComponent(fileName)

    // 使用 fetch 获取文件
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // 使用 LuckyExcel 解析
    window.LuckyExcel.transformExcelToLucky(file, (exportJson: any) => {
      if (exportJson.sheets == null || exportJson.sheets.length === 0) {
        alertDialog(t('readFailed'), t('checkFileFormat'))
        isLoading.value = false
        return
      }

      // 销毁旧实例（重要：防止内存泄漏和DOM冲突）
      window.luckysheet.destroy()

      // 重新渲染
      renderSheet(exportJson.sheets, exportJson.info.name)
      isLoading.value = false
    }, (err: any) => {
      console.error('解析失败', err)
      isLoading.value = false
      alertDialog(t('parseFailed'), t('ensureValidXlsx'))
    })
  } catch (error) {
    console.error('加载失败:', error)
    loadingText.value = t('loadFailedCheckUrl')
    setTimeout(() => {
      isLoading.value = false
    }, 2000)
  }
}

const triggerUpload = () => fileInput.value?.click()

// 监听props变化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    loadExcelFromUrl(newSrc)
  }
})

onMounted(() => {
  initLuckysheet()

  // 监听全屏变化事件
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    if (window.luckysheet) {
      // window.luckysheet.destroy()
    }
  })
})

</script>
<style>
.luckysheet-input-box {
  z-index: 9999 !important;
}
.luckysheet_info_detail_back {
  display: none !important;
}

/* 美化滚动条 */
.luckysheet-scrollbar-x, .luckysheet-scrollbar-y {
  scrollbar-width: thin;
  scrollbar-color: #1D6F42 #f0f0f0;
}

.luckysheet-scrollbar-x::-webkit-scrollbar, .luckysheet-scrollbar-y::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.luckysheet-scrollbar-x::-webkit-scrollbar-track, .luckysheet-scrollbar-y::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.luckysheet-scrollbar-x::-webkit-scrollbar-thumb, .luckysheet-scrollbar-y::-webkit-scrollbar-thumb {
  background-color: #1D6F42;
  border-radius: 3px;
}
</style>