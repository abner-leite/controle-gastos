// Controle de Gastos — abre na hora com a cópia salva no aparelho e busca a versão nova em segundo plano.
const CACHE = 'gastos-v3';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const chave = req.mode === 'navigate' ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const salvo = await cache.match(chave, {ignoreSearch: true});
    const novo = fetch(req).then(r => { if (r.ok) cache.put(chave, r.clone()); return r; }).catch(() => null);
    if (salvo) { e.waitUntil(novo); return salvo; }      // abre na hora; a versão nova vale na próxima abertura
    return (await novo) || new Response('Sem internet e sem cópia salva ainda. Abra uma vez com internet.', {status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
  }));
});
