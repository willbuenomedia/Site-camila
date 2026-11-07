// Guarda só a "casca" do app (arquivos do próprio site). Dados de pacientes vêm do Supabase (outro domínio) e NUNCA são guardados aqui.
const V='cm-balcao-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||!/^\/(balcao\.html|balcao\.js|db\.js|config\.js|manifest\.json|assets\/icons\/.+)$/.test(u.pathname))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
