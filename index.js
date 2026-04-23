export default {
  async fetch(request, env, ctx) {
    // 1. Apna Render ka URL yahan check kar lo
    const RENDER_URL = "https://anifinix-relay.onrender.com"; 

    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    // 2. Sirf Video Chunks (.ts files) ke liye "Airforce" Logic
    if (url.pathname.endsWith('.ts')) {
      let response = await fetch(targetUrl, {
        cf: {
          cacheEverything: true,
          cacheTtl: 86400,       // 24 ghante Cloudflare storage mein
          edgeCacheTtl: 86400,   // Zabardasti cache karne ka command
        },
      });

      // 3. Headers Overwrite (EXPIRED ko HIT karne ke liye)
      let newHeaders = new Headers(response.headers);
      
      // Render ke purane cache rules ko delete karo
      newHeaders.delete("Cache-Control");
      newHeaders.delete("Expires");
      newHeaders.delete("Pragma");

      // Naye rules dalo jo player aur Cloudflare ko "HIT" dikhayein
      newHeaders.set("Cache-Control", "public, max-header-bytes=86400, max-age=86400, s-maxage=86400, immutable");
      newHeaders.set("Access-Control-Allow-Origin", "*"); // Sab jagah chalne ke liye

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // 4. Playlist (.m3u8) ke liye direct fetch (No Cache taaki live update ho)
    return fetch(targetUrl, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        }
    });
  },
};
