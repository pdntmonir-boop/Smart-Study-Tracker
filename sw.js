// আপডেট দিলে CACHE নামের সংখ্যা বাড়ান (v3 -> v4)
const CACHE = 'sst-v3';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(SHELL);
    try { await c.add(new Request('https://cdn.tailwindcss.com', { mode: 'no-cors' })); } catch (_) {}
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: false });
    const net = fetch(e.request).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(e.request, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || (e.request.mode === 'navigate' ? c.match('./index.html') : Response.error());
  }));
});
