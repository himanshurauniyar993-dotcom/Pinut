export default {
  async fetch(request, env, ctx) {
    // 1. Apne RENDER ka URL yahan dalo
    const RENDER_URL = "https://anifinix-relay.onrender.com"; 

    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    // 2. Caching Logic (Bandwidth Bachane ke liye)
    let cacheTtl = 0;
    if (url.pathname.endsWith('.ts')) {
      cacheTtl = 86400; // Video Chunks ko 24 ghante save rakho (Loop ke liye best)
    } else if (url.pathname.endsWith('.m3u8')) {
      cacheTtl = 1; // Playlist ko har second update hone do
    }

    // 3. Render se data mangwana aur Cache karna
    return fetch(targetUrl, {
      cf: {
        cacheEverything: true,
        cacheTtl: cacheTtl,
        cacheKey: url.pathname,
      },
    });
  },
};
