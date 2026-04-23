export default {
  async fetch(request, env, ctx) {
    const RENDER_URL = "https://anifinix-relay.onrender.com"; 
    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    // 1. Ek dum saaf (clean) request banao bina kisi purani cookie ke
    const cleanRequest = new Request(targetUrl, {
      method: "GET",
      headers: {
        "Accept": "*/*",
        "User-Agent": "Cloudflare-Worker"
      }
    });

    if (url.pathname.endsWith('.ts')) {
      // Cloudflare ka default cache use karo
      const cache = caches.default;
      let response = await cache.match(request);

      if (response) {
        return response; // Yahan se HIT milega
      }

      // Render se fresh maal mangao
      let originalResponse = await fetch(cleanRequest, {
        cf: {
          cacheEverything: true,
          cacheTtl: 86400,
        }
      });

      // 2. Response ko puri tarah "Public" banao
      let newHeaders = new Headers();
      newHeaders.set("Content-Type", "video/mp2t");
      newHeaders.set("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("X-Cache-Status", "Forced-by-Anifinix");

      let forcedResponse = new Response(originalResponse.body, {
        status: 200,
        headers: newHeaders
      });

      // Cache mein store karo
      ctx.waitUntil(cache.put(request, forcedResponse.clone()));

      return forcedResponse;
    }

    return fetch(cleanRequest);
  }
};
