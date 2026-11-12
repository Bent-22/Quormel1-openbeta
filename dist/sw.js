// QUORMEL 1 – Service Worker: macht die Anwendung nach dem ersten Laden offline nutzbar.
//
// Arbeitsweise:
// - Beim Installieren werden alle Dateien der Anwendung in einen eigenen Cache geladen.
// - Danach werden diese Dateien immer aus dem Cache beantwortet – mit und ohne Internet.
// - Eine neue Fassung wird im Hintergrund geladen und wartet, bis der Nutzer „Jetzt aktualisieren“ wählt.
//   So wechseln nie mitten in einer Sitzung einzelne Dateien.
// - Trainingsstände liegen nicht im Cache, sondern im Speicher der Seite (localStorage). Der Service Worker fasst sie nie an.
//
// VERSION und FILES werden von tools/update-sw.cjs gesetzt. Nach jeder Änderung an Dateien der Anwendung: node tools/update-sw.cjs
/* BEGIN GENERATED */
const VERSION="0d764c14c405";
const FILES=["index.html","manifest.webmanifest","css/quormel.css","js/core/constants.js","js/core/qlearning.js","js/core/rng.js","js/core/track.js","js/input/touch-controls.js","js/main.js","js/pwa/register.js","js/render/fpv.js","js/render/hidpi.js","js/render/sim-view.js","js/state.js","js/storage/protect.js","js/storage/records.js","js/storage/save.js","js/ui/actions.js","js/ui/analysis.js","js/ui/dom.js","js/ui/duel.js","js/ui/editor.js","js/ui/explain.js","js/ui/home.js","js/ui/lab.js","js/ui/library.js","js/ui/pause-anim.js","js/ui/race.js","js/ui/replay.js","js/ui/sim.js","js/ui/wheel.js","icons/apple-touch-icon.png","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];
/* END GENERATED */
const CACHE="quormel1-"+VERSION,BASE=new URL("./",self.location);

// Manche Anbieter leiten index.html auf den Ordner weiter (z. B. Cloudflare Pages). Eine weitergeleitete Antwort darf ein Service Worker
// nicht für einen Seitenaufruf verwenden – deshalb wird ihr Inhalt in eine neue, saubere Antwort übernommen.
const clean=async r=>r.redirected?new Response(await r.blob(),{status:r.status,statusText:r.statusText,headers:r.headers}):r;
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(async f=>{const u=new URL(f,BASE),r=await fetch(new Request(u,{cache:"reload"}));
 if(!r.ok)throw new Error("Abruf fehlgeschlagen: "+f);await c.put(u,await clean(r))})))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("quormel1-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("message",e=>{if(e.data==="skipWaiting")self.skipWaiting()});
self.addEventListener("fetch",e=>{const rq=e.request;if(rq.method!=="GET")return;
 const u=new URL(rq.url);if(u.origin!==BASE.origin||!u.pathname.startsWith(BASE.pathname))return;
 const key=u.pathname.slice(BASE.pathname.length)||"index.html"; // Aufruf des Ordners = Startseite
 if(!FILES.includes(key))return; // alles andere (z. B. Dokumentation) läuft normal über das Netz
 e.respondWith(caches.open(CACHE).then(c=>c.match(new URL(key,BASE))).then(r=>r||fetch(rq)))});
