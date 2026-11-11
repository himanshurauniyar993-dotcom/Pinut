export default {
  async fetch(request, env, ctx) {
    const RENDER_URL = "https://jpingovernmen-anifinix.hf.space"; 
    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    const cleanRequest = new Request(targetUrl, {
      method: request.method,
      headers: {
        "Accept": "*/*",
        "User-Agent": "Cloudflare-Worker-Streamer"
      }
    });

    // अगर रिक्वेस्ट .ts फाइल (वीडियो चंक) की है, तो Cloudflare का कैच इस्तेमाल करो
    if (url.pathname.endsWith('.ts')) {
      const cache = caches.default;
      let response = await cache.match(request);

      if (response) {
        return response; // सुपर फास्ट कैश हिट
      }

      let originalResponse = await fetch(cleanRequest);

      let newHeaders = new Headers(originalResponse.headers);
      newHeaders.set("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");
      newHeaders.set("Access-Control-Allow-Origin", "*");

      let cachedResponse = new Response(originalResponse.body, {
        status: originalResponse.status,
        headers: newHeaders
      });

      ctx.waitUntil(cache.put(request, cachedResponse.clone()));
      return cachedResponse;
    }

    // .m3u8 या अन्य फाइलों के लिए सीधा और बिना रुके स्ट्रीम पाइप करो (Zero-Lag Proxy)
    try {
      const response = await fetch(cleanRequest);
      
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });

      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      return newResponse;

    } catch (e) {
      return new Response("Relay Fetch Error: " + e.message, { status: 500 });
    }
  }
};
