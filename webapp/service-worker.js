const CACHE_NAME = "salavat-shomar-v4";
const FONT_CACHE = "salavat-fonts-v1";
const APP_SHELL = ["./","./index.html","./style.css","./script.js","./manifest.json","./logo.png","./icons/icon-72.png","./icons/icon-96.png","./icons/icon-128.png","./icons/icon-144.png","./icons/icon-152.png","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-384.png","./icons/icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME&&k!==FONT_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const req=e.request,u=new URL(req.url);if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){e.respondWith(caches.open(FONT_CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>(c.put(req,r.clone()),r)).catch(()=>hit))));return}if(u.origin===self.location.origin)e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>(caches.open(CACHE_NAME).then(c=>c.put(req,r.clone())),r)).catch(()=>hit)))});
