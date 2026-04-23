export default {
  async fetch(request, env, ctx) {
    // 1. Apna RENDER ka URL yahan sahi se dalo
    const RENDER_URL = "https://anifinix-relay.onrender.com"; 

    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    // 2. Caching Rules
    let cacheTtl = 0;
    if (url.pathname.endsWith('.ts')) {
      cacheTtl = 86400; // Video chunks 24 ghante ke liye save
    } else if (url.pathname.endsWith('.m3u8')) {
      cacheTtl = 1; // Playlist har second update hogi
    }

    // 3. Response mangwana
    return fetch(targetUrl, {
      cf: {
        cacheEverything: true,
        cacheTtl: cacheTtl,
      },
    });
  },
};
