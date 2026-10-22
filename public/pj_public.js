const loadedResources = new Set()
// 提示文案统一由 index.html 从 src/constants 注入
const publicTexts = (typeof window !== 'undefined' && window.PJ_PUBLIC_TEXTS) || {}

function loadPublicResource (resourceName, type = 'js', callback) {
  // 输入验证
  if (typeof resourceName !== 'string') {
    console.error('resourceName must be a string')
    return Promise.reject(new Error('Invalid resourceName'))
  }
  // 解析资源 URL 列表
  const resourceUrls = resourceName
    .split(',')
    .map(url => url.trim())
    .filter(url => url && typeof url === 'string')

  if (resourceUrls.length === 0) {
    console.error('No valid URLs provided')
    return Promise.reject(new Error('No valid URLs'))
  }
  // 验证 type
  if (!['js', 'css'].includes(type)) {
    console.error('Type must be "js" or "css"')
    return Promise.reject(new Error('Invalid type'))
  }
  // 顺序尝试加载资源
  return tryLoadResources(resourceUrls, type === 'js', callback)
}

// 暴露给业务代码：PDF / Word / 代码高亮等按需库复用同一套多源回退逻辑
window.pjLoadResource = loadPublicResource

async function tryLoadResources (urls, isJs, callback) {
  let lastError = null

  for (const url of urls) {
    try {
      const result = await loadResourceMain(url, isJs)
      if (callback) callback(true, url)
      return result // 成功加载，返回结果
    } catch ( error ) {
      console.warn(`Failed to load ${ url }, trying next URL if available`)
      lastError = error
    }
  }

  // 所有 URL 都失败
  console.error('All resource URLs failed to load')
  const loadingText = document.querySelector('.loading-text')
  if (loadingText && publicTexts.resourceLoadFailed) {
    loadingText.textContent = publicTexts.resourceLoadFailed
  }
  if (callback) callback(false, urls[ urls.length - 1 ])
  throw lastError || new Error('All resource URLs failed')
}

function loadResourceMain (url, isJs) {
  return new Promise((resolve, reject) => {
    if (loadedResources.has(url)) {
      console.log(`${ isJs ? 'Script' : 'CSS' } already loaded: ${ url }`)
      resolve(url)
      return
    }
    const element = document.createElement(isJs ? 'script' : 'link')
    if (isJs) {
      element.defer = true
      element.crossOrigin = 'anonymous'
      element.src = url
      // 对于所有非CDN的JS文件，都设置为module类型
      // 因为构建后的代码使用了ES模块语法
      if (!url.startsWith('http')|| !url.includes('.js')) {
        element.type = 'module'
      } else if (url.includes('esm.sh')) {
        element.type = 'module'
      }
    } else {
      element.rel = 'stylesheet'
      element.href = url
    }
    document.head.appendChild(element)
    let timeoutId
    element.onload = () => {
      clearTimeout(timeoutId)
      loadedResources.add(url)
      resolve(url)
    }

    element.onerror = () => {
      clearTimeout(timeoutId)
      document.head.removeChild(element)
      reject(new Error(`Failed to load ${ url }`))
    }

    // 设置超时
    timeoutId = setTimeout(() => {
      console.warn(`Loading ${ url } timed out`)
      element.onerror = null
      document.head.removeChild(element)
      reject(new Error(`Timeout loading ${ url }`))
    }, 8000)
  })
}

// 页面加载后执行资源加载
document.addEventListener('DOMContentLoaded', () => {
  const timeoutDuration = 15000 // 15秒超时
  let timeoutId

  // 创建超时 Promise
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      console.warn('Resource loading exceeded 15 seconds, reloading page')
      window.location.reload()
    }, timeoutDuration)
  })
  // 加载所有资源的 Promise
  const loadResources = async () => {
    try {
      //优先加载核心 JS
      if (mainJs.length) {
        await Promise.all(mainJs.map(js => loadPublicResource(js, 'js')))
      }
      // 并行加载样式与全局库（当前只剩 vue-router 等轻量依赖）
      await Promise.all([
        ...cssResources.map(css => loadPublicResource(css, 'css')),
        ...jsResources.map(js => loadPublicResource(js, 'js'))
      ])
      // 应用入口引用 Vue / VueRouter 等全局变量，必须等上面的库就绪后再加载
      if (pjJsResources.length) {
        await Promise.all(pjJsResources.map(js => loadPublicResource(js, 'js')))
      }
      console.log('Core resources loaded successfully')

      // 清除超时计时器
      clearTimeout(timeoutId)
    } catch ( err ) {
      console.error('Resource loading failed:', err)
      // 不清除超时，让页面在超时后刷新
    }
  }
  // 启动资源加载并与超时竞争
  Promise.race([loadResources(), timeoutPromise])
    .then(() => {
      setTimeout(() => {
        if (!window.pjfun || window.pjfun.loaded !== true) {
          // 通知用户需要刷新页面
          const loadingText = document.querySelector('.loading-text')
          if (loadingText && publicTexts.refreshRequired) {
            loadingText.textContent = publicTexts.refreshRequired
          }
          console.warn(
            'Vue app not loaded successfully, reloading page in 2 seconds')
          // 2秒后自动刷新页面
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      }, 2000)
    }).catch(() => {
    // 错误已由 loadResources 或 timeoutPromise 处理
  })
})