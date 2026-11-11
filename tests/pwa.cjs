// PWA-Test: Manifest, Icons, Service Worker, Offline-Betrieb, Update ohne Datenverlust, Installationshilfe, Schutz der Trainingsstände.
// Hinweis: Es läuft die Chrome-Engine. Das Installieren selbst (Home-Bildschirm) lässt sich nicht automatisch prüfen.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const { serve, launch, open, report, ROOT } = require("./helpers.cjs");
const log = [], ok = (n, c, info) => log.push({ name: n, ok: !!c, info: c ? (info === undefined ? "ok" : String(info)) : String(info) });
const trainTo = (p, n) => p.evaluate(n => { const q = window.__q; while (q.get("st") === "training" && q.get("epN") < n) q.f.trainStep() }, n);
const swInfo = p => p.evaluate(async () => { const ks = await caches.keys(), n = ks.length ? (await (await caches.open(ks[0])).keys()).length : 0; return { ctl: !!navigator.serviceWorker.controller, keys: ks, n, state: document.querySelector("#pwaState").textContent } });
const saved = p => p.evaluate(() => { try { return JSON.parse(localStorage.getItem("q1save")).epN } catch (e) { return null } });

(async () => {
  const srv = await serve(), browser = await launch();
  // ---------- 1) Dateien ----------
  let fresh = true; try { execFileSync(process.execPath, [path.join(ROOT, "tools/update-sw.cjs"), "--check"], { stdio: "pipe" }) } catch (e) { fresh = false }
  ok("sw.js enthält die aktuelle Dateiliste und Versionskennung", fresh, "bitte ausführen: node tools/update-sw.cjs");
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8"), FILES = JSON.parse(sw.match(/const FILES=(\[.*?\]);/)[1]), VERSION = sw.match(/const VERSION="(.*?)"/)[1];
  ok("alle Dateien der Liste existieren", FILES.every(f => fs.existsSync(path.join(ROOT, f))), FILES.length + " Dateien");
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));
  ok("Manifest: Name, Startadresse, Anzeige, Farben", man.name === "QUORMEL 1" && man.start_url === "./" && man.scope === "./" && man.display === "standalone" && man.orientation === "any" && man.theme_color === "#0b0d12" && man.background_color === "#0b0d12");
  ok("Manifest: Icons 192, 512 und maskierbar", ["192x192", "512x512"].every(s => man.icons.some(i => i.sizes === s && i.purpose === "any")) && man.icons.some(i => i.purpose === "maskable" && i.sizes === "512x512"));

  // ---------- 2) Erster Besuch ----------
  const P = await open(browser, srv.url, "new"), p = P.page, failed = []; p.on("requestfailed", r => failed.push(r.url()));
  await p.waitForFunction(() => /Offline bereit/.test(document.querySelector("#pwaState").textContent), null, { timeout: 15000 });
  await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  let s = await swInfo(p); ok("Service Worker aktiv und steuert die Seite", s.ctl); ok("Cache enthält alle Dateien der Anwendung", s.keys.length === 1 && s.keys[0] === "quormel1-" + VERSION && s.n === FILES.length, `${s.keys.join()} · ${s.n} Dateien`);
  const head = await p.evaluate(async () => { const g = s => document.querySelector(s), dim = src => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth + "x" + i.naturalHeight); i.onerror = () => r("fehlt"); i.src = src }); return { man: !!g('link[rel=manifest]'), theme: g('meta[name=theme-color]').content, vp: g('meta[name=viewport]').content, apple: await dim(g('link[rel=apple-touch-icon]').href), i192: await dim("icons/icon-192.png"), i512: await dim("icons/icon-512.png"), mask: await dim("icons/icon-maskable-512.png") } });
  ok("Seite verweist auf Manifest, Theme-Farbe und Icons", head.man && head.theme === "#0b0d12" && /viewport-fit=cover/.test(head.vp) && head.apple === "180x180" && head.i192 === "192x192" && head.i512 === "512x512" && head.mask === "512x512", JSON.stringify(head));
  ok("Am PC ohne Installationsangebot: Knopf und iOS-Hinweis ausgeblendet, kein Update-Hinweis", await p.evaluate(() => ["bInst", "iosHint", "pwaUpd"].every(i => getComputedStyle(document.getElementById(i)).display === "none")));

  // ---------- 3) Training, Speichern beim Verlassen ----------
  await p.click("#home .nav button.pri"); await p.click("#cards .card:nth-child(1) button"); await p.evaluate(() => { window.__q.seed(5); document.querySelector("#pn").value = "500" }); await p.click("#bGo");
  await p.evaluate(() => { const q = window.__q, sv = () => JSON.parse(localStorage.getItem("q1save")).epN; while (q.get("epN") < 60 || sv() >= q.get("epN")) q.f.trainStep() });
  const before = [await saved(p), await p.evaluate(() => window.__q.get("epN"))]; await p.evaluate(() => window.dispatchEvent(new Event("pagehide"))); const after = await saved(p);
  ok("Verlassen der App speichert den aktuellen Stand sofort", before[0] < before[1] && after === before[1], `gespeichert ${before[0]} → ${after}, Training bei Episode ${before[1]}`);
  await trainTo(p, 200); await p.evaluate(() => window.__q.f.pause()); const ep = await saved(p), raw = await p.evaluate(() => localStorage.getItem("q1save")); ok("Trainingsstand gespeichert (Episode 200, pausiert)", ep === 200, ep);

  // ---------- 4) Offline ----------
  srv.state.down = true; await P.ctx.setOffline(true); failed.length = 0; P.errors.length = 0;
  await p.goto(srv.url + "/"); await p.waitForFunction(() => document.querySelectorAll("#cards .card").length === 3);
  await p.evaluate(async () => { const list = [...document.querySelectorAll("link[rel=manifest],link[rel=icon]")].map(l => l.href); await Promise.all(list.map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u) }))) });
  ok("Ohne Internet: Startseite lädt vollständig aus dem Cache", failed.length === 0 && P.errors.length === 0, failed.concat(P.errors).slice(0, 3).join(" | "));
  ok("Ohne Internet: gespeicherter Stand ist unverändert vorhanden", await p.evaluate(() => localStorage.getItem("q1save")) === raw);
  await p.click("#bCont"); const loaded = await p.evaluate(async () => { const { app } = await import("./js/state.js"); return [app.page, app.epN, app.st, app.Q.size > 0] }); ok("Ohne Internet: Stand laden und weitertrainieren", loaded[0] === "sim" && loaded[1] === 200 && loaded[2] === "paused" && loaded[3], loaded.join());
  await p.click("#bPause"); await p.waitForTimeout(500); const run = await p.evaluate(async () => { const { app } = await import("./js/state.js"); return [app.st, app.epN > 200 || app.c.steps > 0] }); ok("Ohne Internet: Training läuft", run[0] === "training" && run[1], run.join());
  await p.click("#bPause"); const exp = await Promise.all([p.waitForEvent("download"), (async () => { await p.click("#sim .row > button:first-child"); await p.click("#lib > button"); await p.click("#bExp") })()]);
  const file = path.join(require("os").tmpdir(), "quormel-pwa-export.json"); await exp[0].saveAs(file); ok("Ohne Internet: JSON-Export liefert den gespeicherten Stand", fs.readFileSync(file, "utf8") === await p.evaluate(() => localStorage.getItem("q1save")), exp[0].suggestedFilename());
  await p.setInputFiles("#fImp", file); await p.waitForSelector("#im", { state: "visible" }); await p.click("#imOk"); ok("Ohne Internet: JSON-Import lädt den Stand", await p.evaluate(async () => (await import("./js/state.js")).app.page) === "sim");
  ok("Ohne Internet: keine Skriptfehler, keine fehlgeschlagenen Abrufe", failed.length === 0 && P.errors.length === 0, failed.concat(P.errors).slice(0, 3).join(" | "));

  // ---------- 5) Neue Fassung ----------
  srv.state.down = false; await P.ctx.setOffline(false); const keep = await p.evaluate(() => localStorage.getItem("q1save"));
  srv.state.over["/sw.js"] = sw.replace(`const VERSION="${VERSION}"`, 'const VERSION="testfassung2"'); srv.state.over["/css/quormel.css"] = fs.readFileSync(path.join(ROOT, "css/quormel.css"), "utf8") + "\n/* testfassung2 */\n";
  await p.click("#sim .row > button:first-child"); await p.click("#lib > button"); await p.evaluate(async () => { (await navigator.serviceWorker.getRegistration()).update() });
  await p.waitForSelector("#pwaUpd", { state: "visible", timeout: 15000 }); s = await swInfo(p);
  ok("Neue Fassung wird im Hintergrund geladen, alte bleibt aktiv, Hinweis erscheint", s.keys.length === 2 && await p.evaluate(async () => !(await (await fetch("css/quormel.css")).text()).includes("testfassung2")), s.keys.join());
  await Promise.all([p.waitForEvent("load"), p.click("#bUpd")]); await p.waitForFunction(() => document.querySelectorAll("#cards .card").length === 3); await p.waitForFunction(() => !!navigator.serviceWorker.controller);
  s = await swInfo(p); const css2 = await p.evaluate(async () => (await (await fetch("css/quormel.css")).text()).includes("testfassung2"));
  ok("„Jetzt aktualisieren“: Seite lädt neu mit der neuen Fassung, alter Cache entfernt", s.keys.length === 1 && s.keys[0] === "quormel1-testfassung2" && css2 && await p.evaluate(() => getComputedStyle(document.querySelector("#pwaUpd")).display === "none"), s.keys.join());
  ok("Update lässt den Trainingsstand unberührt", await p.evaluate(() => localStorage.getItem("q1save")) === keep && await p.evaluate(() => !document.querySelector("#bCont").disabled));
  ok("keine Skriptfehler", P.errors.length === 0, P.errors.slice(0, 2).join(" | ")); await P.ctx.close(); srv.state.over = {};

  // ---------- 6) Installationshilfe ----------
  { const A = await open(browser, srv.url, "new"), a = A.page;
    const r = await a.evaluate(async () => { const e = new Event("beforeinstallprompt", { cancelable: true }); let called = 0; e.prompt = () => { called++ }; window.dispatchEvent(e); const b = document.querySelector("#bInst"), vis1 = getComputedStyle(b).display !== "none"; b.click(); const vis2 = getComputedStyle(b).display !== "none"; return [e.defaultPrevented, vis1, called, vis2] });
    ok("Android/Chrome: Knopf „App installieren“ erscheint und öffnet den Installationsdialog", r[0] && r[1] && r[2] === 1 && !r[3], r.join()); await A.ctx.close() }
  { const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    const A = await open(browser, srv.url, "new", { userAgent: ua, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true }); const t = await A.page.evaluate(() => { const e = document.querySelector("#iosHint"); return [getComputedStyle(e).display !== "none", e.textContent] });
    ok("iPhone/iPad im Browser: Hinweis auf „Teilen → Zum Home-Bildschirm“", t[0] && /Teilen/.test(t[1]) && /Home-Bildschirm/.test(t[1]), t[1]); await A.ctx.close();
    const B = await browser.newContext({ userAgent: ua, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: true }); await B.addInitScript(() => { Object.defineProperty(navigator, "standalone", { get: () => true }); navigator.canShare = () => true; navigator.share = d => { window.__shared = d; return Promise.resolve() } });
    const b = await B.newPage(); await b.goto(srv.url + "/"); await b.waitForFunction(() => document.querySelectorAll("#cards .card").length === 3);
    ok("Als App gestartet (iPhone/iPad): kein Installationshinweis mehr", await b.evaluate(() => getComputedStyle(document.querySelector("#iosHint")).display === "none"));
    await b.evaluate(v => localStorage.setItem("q1save", v), raw); await b.reload(); await b.waitForFunction(() => document.querySelectorAll("#cards .card").length === 3); await b.click("#bExp"); await b.waitForFunction(() => !!window.__shared);
    const sh = await b.evaluate(async () => { const f = window.__shared.files[0]; return [f.name, f.type, await f.text() === localStorage.getItem("q1save")] }); ok("Als App gestartet (iPhone/iPad): Export über den Teilen-Dialog mit vollständigem Stand", /^quormel1_.*\.json$/.test(sh[0]) && sh[1] === "application/json" && sh[2], sh.join()); await B.close() }

  // ---------- 7) Dauerhafter Speicher ----------
  { const C = await browser.newContext({ viewport: { width: 1280, height: 800 } }); await C.addInitScript(() => { window.__persist = 0; navigator.storage.persist = () => { window.__persist++; return Promise.resolve(true) } });
    const c = await C.newPage(); await c.goto(srv.url + "/"); await c.waitForFunction(() => document.querySelectorAll("#cards .card").length === 3); const n0 = await c.evaluate(() => window.__persist);
    await c.click("#home .nav button.pri"); await c.click("#cards .card:nth-child(1) button"); await c.click("#bGo"); await c.waitForTimeout(300); await c.click("#bPause");
    const r = await c.evaluate(() => [window.__persist, document.querySelector("#pwaStore").textContent]); ok("Beim Trainingsstart wird der Browser um dauerhaften Speicher gebeten", n0 === 0 && r[0] === 1 && /dauerhaft gespeichert/.test(r[1]), r.join(" · ")); await C.close() }

  // ---------- 8) Unteradresse (GitHub Pages) und Installierbarkeit laut Browser ----------
  { const D = await browser.newContext({ viewport: { width: 1280, height: 800 } }), d = await D.newPage(), bad = []; d.on("requestfailed", r => bad.push(r.url())); d.on("pageerror", e => bad.push(String(e)));
    await d.goto(srv.url + "/unterordner/"); await d.waitForFunction(() => /Offline bereit/.test(document.querySelector("#pwaState").textContent), null, { timeout: 15000 }); await d.waitForFunction(() => !!navigator.serviceWorker.controller);
    const urls = await d.evaluate(async () => { const k = await caches.keys(); return (await (await caches.open(k[0])).keys()).map(r => new URL(r.url).pathname) });
    const cdp = await D.newCDPSession(d), inst = (await cdp.send("Page.getInstallabilityErrors")).installabilityErrors.map(e => e.errorId).filter(e => e !== "in-incognito");
    ok("Browser meldet keine Hindernisse für die Installation", inst.length === 0, inst.join());
    srv.state.down = true; await D.setOffline(true); bad.length = 0; await d.goto(srv.url + "/unterordner/"); await d.waitForFunction(() => document.querySelectorAll("#cards .card").length === 3);
    ok("Unter einer Unteradresse: Cache und Offline-Start funktionieren", urls.length === FILES.length && urls.every(u => u.startsWith("/unterordner/")) && bad.length === 0, bad.slice(0, 2).join(" | ")); srv.state.down = false; await D.close() }

  const good = report("PWA-Test", log); await browser.close(); srv.close(); process.exit(good ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2) });
