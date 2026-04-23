export default {
  async fetch(request, env, ctx) {
    const RENDER_URL = "https://anifinix-relay.onrender.com"; 
    const url = new URL(request.url);
    const targetUrl = RENDER_URL + url.pathname + url.search;

    // 1. Request se Cookies aur Auth hata do (BYPASS fix karne ke liye)
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: new Headers(request.headers),
    });
    newRequest.headers.delete("Cookie");
    newRequest.headers.delete("Authorization");

    if (url.pathname.endsWith('.ts')) {
      let response = await fetch(newRequest, {
        cf: {
          cacheEverything: true,
          cacheTtl: 86400,
          edgeCacheTtl: 86400,
        },
      });

      // 2. Response Headers ko zabardasti "Public" karo
      let newHeaders = new Headers(response.headers);
      newHeaders.set("Cache-Control", "public, max-age=86400, s-maxage=86400, immutable");
      newHeaders.delete("Set-Cookie"); // Kisi bhi tarah ki cookie hata do

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return fetch(newRequest);
  },
};
