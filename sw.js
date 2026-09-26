importScripts("https://cdn.jsdelivr.net/gh/AlternateWayz/CDN-sj@main/templates/html/2.0.67-alpha.1/controller/controller.sw.js");

const ASSET_MAP = new Map([
  ["/scramjet/scramjet.js", "https://unpkg.com/@mercuryworkshop/scramjet@2.0.67-alpha.1/dist/scramjet.js"],
  ["/scramjet/scramjet.wasm", "https://unpkg.com/@mercuryworkshop/scramjet@2.0.67-alpha.1/dist/scramjet.wasm"],
  ["/controller/controller.inject.js", "https://cdn.jsdelivr.net/gh/AlternateWayz/CDN-sj@main/templates/html/2.0.67-alpha.1/controller/controller.inject.js"],
  ["/controller/controller.sw.js", "https://cdn.jsdelivr.net/gh/AlternateWayz/CDN-sj@main/templates/html/2.0.67-alpha.1/controller/controller.sw.js"]
]);

const resolveAssetUrl = (pathname) => {
  if (ASSET_MAP.has(pathname)) return ASSET_MAP.get(pathname);
  if (pathname.endsWith("/scramjet.wasm.js")) {
    return null;
  }
  if (pathname.endsWith("/scramjet.wasm")) {
    return "https://unpkg.com/@mercuryworkshop/scramjet@2.0.67-alpha.1/dist/scramjet.wasm";
  }
  if (pathname.endsWith("/scramjet.js")) {
    return "https://unpkg.com/@mercuryworkshop/scramjet@2.0.67-alpha.1/dist/scramjet.js";
  }
  if (pathname.endsWith("/controller.inject.js")) {
    return "https://cdn.jsdelivr.net/gh/AlternateWayz/CDN-sj@main/templates/html/2.0.67-alpha.1/controller/controller.inject.js";
  }
  return null;
};

addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const pathname = requestUrl.pathname;

  if (pathname.endsWith("/scramjet.wasm.js")) {
    const wasmUrl = "https://unpkg.com/@mercuryworkshop/scramjet@2.0.67-alpha.1/dist/scramjet.wasm";
    event.respondWith(
      fetch(wasmUrl)
        .then((response) => response.arrayBuffer())
        .then((buffer) => {
          let binary = "";
          const bytes = new Uint8Array(buffer);
          for (const byte of bytes) {
            binary += String.fromCharCode(byte);
          }
          const base64 = btoa(binary);
          return new Response(`self.WASM = ${JSON.stringify(base64)};`, {
            headers: {
              "Content-Type": "application/javascript; charset=utf-8",
              "Cache-Control": "no-cache"
            }
          });
        })
        .catch(() => new Response("self.WASM = '';", { headers: { "Content-Type": "application/javascript; charset=utf-8" } }))
    );
    return;
  }

  const assetUrl = resolveAssetUrl(pathname);

  if (assetUrl) {
    event.respondWith(fetch(assetUrl, { headers: event.request.headers }));
    return;
  }

  if (self.$scramjetController && typeof self.$scramjetController.shouldRoute === "function" && self.$scramjetController.shouldRoute(event)) {
    event.respondWith(self.$scramjetController.route(event));
    return;
  }

  return;
});
