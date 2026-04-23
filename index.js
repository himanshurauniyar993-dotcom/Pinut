export default {
  async fetch(request, env, ctx) {
    const RENDER_URL = "https://anifinix-relay.onrender.com"; 
    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    // 1. Agar .ts file hai toh usse "Static Asset" bana do
    if (url.pathname.endsWith('.ts')) {
      const cache = caches.default;
      let response = await cache.match(request);

      // Agar cache mein pehle se hai toh wahin se dedo (HIT)
      if (response) {
        return response;
      }

      // Agar cache mein nahi hai, toh Render se mangao
      response = await fetch(targetUrl, {
        cf: {
          cacheEverything: true,
          cacheTtl: 86400, // 24 Ghante
        }
      });

      // Response ko "Public" aur "Cacheable" banao (BYPASS hatane ke liye)
      response = new Response(response.body, response);
      response.headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");
      response.headers.delete("Set-Cookie");

      // Is naye response ko Cloudflare ke cache mein save karo
      ctx.waitUntil(cache.put(request, response.clone()));

      return response;
    }

    // 2. .m3u8 ke liye normal fetch
    return fetch(targetUrl);
  },
};
