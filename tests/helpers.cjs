// Gemeinsame Hilfen für die Tests: statischer Server, Browserstart, einheitlicher Zugriff auf Original und Neufassung.
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };
const LEGACY = "/legacy/Quormel1_Finalcode.html", NEW = "/index.html";

// state.down = true: Server antwortet nicht mehr (Netzausfall) · state.over[pfad] = Inhalt: liefert stattdessen diesen Inhalt (neue Fassung)
function serve() {
  return new Promise(res => {
    const state = { down: false, over: {} };
    const srv = http.createServer((rq, rs) => {
      let p = decodeURIComponent(rq.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
      if (state.down) { rs.destroy(); return }
      if (p.startsWith("/unterordner/")) p = p.slice(12); // dieselbe Seite unter einer Unteradresse (wie bei GitHub Pages)
      if (p in state.over) { rs.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream", "cache-control": "no-store" }); rs.end(state.over[p]); return }
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); rs.end("404"); return }
      rs.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" }); fs.createReadStream(f).pipe(rs);
    }).listen(0, "127.0.0.1", () => res({ url: "http://127.0.0.1:" + srv.address().port, close: () => srv.close(), state }));
  });
}
async function launch() {
  try { return await chromium.launch() } catch (e) { return await chromium.launch({ channel: "chrome" }) }
}
function modules() { // alle Module der Neufassung, relativ zu /js/
  const out = []; (function walk(d) { for (const n of fs.readdirSync(d)) { const f = path.join(d, n); if (fs.statSync(f).isDirectory()) walk(f); else if (n.endsWith(".js")) out.push("/" + path.relative(ROOT, f).split(path.sep).join("/")) } })(path.join(ROOT, "js"));
  return out;
}
// Öffnet eine Fassung in einem frischen Kontext und stellt window.__q bereit: get(name), set(name,wert), f.<funktion>(…), seed(n)
async function open(browser, base, which, ctxOpts) { // ctxOpts: z. B. ein Geräteprofil (Bildschirmgröße, Pixeldichte, Touch)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, ...(ctxOpts || {}) });
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", e => errors.push(String(e))); page.on("console", m => { if (m.type() === "error") errors.push(m.text()) });
  await page.goto(base + (which === "legacy" ? LEGACY : NEW)); await page.waitForFunction(() => document.querySelectorAll("#cards .card").length === 3);
  if (which === "legacy") await page.evaluate(() => { const ev = (0, eval); window.__q = { get: n => ev(n), set: (n, v) => { window.__v = v; ev(n + "=window.__v") }, f: new Proxy({}, { get: (_, n) => ev(n) }) } });
  else await page.evaluate(async list => {
    const ns = await Promise.all(list.map(m => import(m))), app = (await import("/js/state.js")).app;
    const find = n => { for (const m of ns) if (n in m) return m[n]; throw new Error("unbekannt: " + n) };
    window.__q = { get: n => n in app ? app[n] : find(n), set: (n, v) => { if (!(n in app)) throw new Error("kein Zustand: " + n); app[n] = v }, f: new Proxy({}, { get: (_, n) => find(n) }) };
  }, modules());
  await page.evaluate(() => { window.__q.seed = a => { Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } } });
  const cdp = await ctx.newCDPSession(page);
  // Berührungen und Stift über das Testprotokoll des Browsers (mehrere Finger gleichzeitig möglich)
  const touch = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: (pts || []).map(([x, y, id]) => ({ x, y, id: id || 0 })) });
  const pen = (type, x, y) => cdp.send("Input.dispatchMouseEvent", { type, x, y, button: type === "mouseMoved" ? "none" : "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1, pointerType: "pen" });
  return { page, ctx, errors, which, touch, pen };
}
const sha = s => crypto.createHash("sha256").update(typeof s === "string" ? s : JSON.stringify(s)).digest("hex").slice(0, 16);
// Vergleich mit Fundstelle der ersten Abweichung
function same(name, a, b, log) {
  const A = typeof a === "string" ? a : JSON.stringify(a), B = typeof b === "string" ? b : JSON.stringify(b);
  if (A === B) { log.push({ name, ok: true, info: A.length <= 90 ? A : sha(A) + " (" + A.length + " Zeichen)" }); return true }
  let i = 0; while (i < A.length && A[i] === B[i]) i++;
  log.push({ name, ok: false, info: `Abweichung ab Zeichen ${i}:\n   Original:   …${A.slice(Math.max(0, i - 60), i + 80)}…\n   Neufassung: …${B.slice(Math.max(0, i - 60), i + 80)}…` }); return false;
}
function report(title, log) {
  const bad = log.filter(l => !l.ok); console.log(`\n== ${title}: ${log.length - bad.length}/${log.length} bestanden ==`);
  for (const l of log) console.log((l.ok ? "  ok   " : "  FEHL ") + l.name + (l.ok ? "  [" + l.info + "]" : "\n   " + l.info));
  return bad.length === 0;
}
module.exports = { serve, launch, open, same, report, sha, ROOT };
