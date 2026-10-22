// 必须回源的资源：入口 HTML 与各类入口/数据文件不带 hash，一旦被 CDN 缓存就会长期停在旧版本
const NO_CACHE_PATTERNS = [
  /\/$/,
  /\/index\.html$/,
  /\/version\.json$/,
  /\/generated\//,
  /\/pj_public\.js$/,
  /\/registerSW\.js$/,
  /\/sw(-[0-9]+)?\.js$/,
  /\/manifest\.webmanifest$/
]

// 文章原始文件可能同名更新，给短缓存
const SHORT_CACHE_PATTERN = /\/content\//

// 带 hash 的构建产物可以长期缓存
const IMMUTABLE_PATTERN = /\/static\//

function resolveCacheControl (pathname) {
  if (NO_CACHE_PATTERNS.some(pattern => pattern.test(pathname))) {
    return 'no-cache, must-revalidate'
  }
  if (SHORT_CACHE_PATTERN.test(pathname)) {
    return 'public, max-age=600'
  }
  if (IMMUTABLE_PATTERN.test(pathname)) {
    return 'public, max-age=31536000, immutable'
  }
  return 'public, max-age=604800'
}

// Assets 绑定返回的 Response headers 不可变，需要重建后写入缓存头
function applyCacheHeaders (response, pathname) {
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', resolveCacheControl(pathname))
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}

export default {
  /**
   * Handles incoming requests to the worker.
   *
   * For a static site with client-side routing, we want to:
   * 1. Serve static assets (JS, CSS, images) directly
   * 2. For all other requests (routes), serve index.html to let the client-side router handle it
   */
  async fetch (request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // For static assets, we try to serve them directly from the Assets namespace
    if (pathname.includes('.') || pathname.startsWith('/static/')) {
      if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);
        if (response.status !== 404) {
          return applyCacheHeaders(response, pathname);
        }
      }
    }

    // For all other requests (routes), serve index.html to enable client-side routing
    // This is essential for SPAs (Single Page Applications) that use client-side routing (like Vue Router)
    const indexUrl = new URL('/index.html', url.origin);
    const indexRequest = new Request(indexUrl, request);

    if (env.ASSETS) {
      return applyCacheHeaders(await env.ASSETS.fetch(indexRequest), '/index.html');
    }

    // Fallback for local development
    return applyCacheHeaders(await fetch(indexRequest), '/index.html');
  }
};