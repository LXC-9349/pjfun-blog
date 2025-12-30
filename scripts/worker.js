export default {
  /**
   * Handles incoming requests to the worker.
   * 
   * For a static site with client-side routing, we want to:
   * 1. Serve static assets (JS, CSS, images) directly
   * 2. For all other requests (routes), serve index.html to let the client-side router handle it
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // For static assets, we try to serve them directly from the Assets namespace
    if (pathname.includes('.') || pathname.startsWith('/static/')) {
      if (env.ASSETS) {
        const response = await env.ASSETS.fetch(request);
        if (response.status !== 404) {
          return response;
        }
      }
    }

    // For all other requests (routes), serve index.html to enable client-side routing
    // This is essential for SPAs (Single Page Applications) that use client-side routing (like Vue Router)
    const indexUrl = new URL('/index.html', url.origin);
    const indexRequest = new Request(indexUrl, request);
    
    if (env.ASSETS) {
      return await env.ASSETS.fetch(indexRequest);
    }
    
    // Fallback for local development
    return await fetch(indexRequest);
  }
};