// Gerätetest: Die Neufassung wird mit Geräteprofilen (Bildschirmgröße, Pixeldichte, Touch) geöffnet und bedient.
// Hinweis: Es läuft immer die Chrome-Engine. iPhone und iPad sind hier Profile, nicht Safari auf echten Geräten.
const { devices } = require("playwright");
const { serve, launch, open, report, sha } = require("./helpers.cjs");

const prof = n => { const { defaultBrowserType, ...d } = devices[n]; return d };
const PROFILES = [
  ["iPhone 14 hoch", prof("iPhone 14")], ["iPhone 14 quer", prof("iPhone 14 landscape")], ["iPhone SE hoch", prof("iPhone SE")],
  ["iPad hoch", prof("iPad (gen 7)")], ["iPad quer", prof("iPad (gen 7) landscape")], ["iPad Pro 11 hoch", prof("iPad Pro 11")], ["iPad Pro 11 quer", prof("iPad Pro 11 landscape")],
  ["Pixel 7 hoch", prof("Pixel 7")], ["Pixel 7 quer", prof("Pixel 7 landscape")], ["Galaxy Tab S4 hoch", prof("Galaxy Tab S4")], ["Galaxy Tab S4 quer", prof("Galaxy Tab S4 landscape")],
  ["Windows-PC 1920×1080", { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }], ["Windows-Laptop 1366×768, 125 %", { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1.25 }],
  ["MacBook 1440×900, Retina", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }],
];
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
const wait = (p, ms) => p.waitForTimeout(ms);
// Layoutprüfung der sichtbaren Seite: kein seitliches Scrollen, Bedienelemente im Bild, auf Touch-Geräten mindestens 44 px hoch
const layout = p => p.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && e.offsetParent !== null };
  const root = [...document.querySelectorAll("section.on,.mdl,#wm,#ed")].filter(e => getComputedStyle(e).display !== "none"), out = [], small = [];
  for (const el of root.flatMap(r => [...r.querySelectorAll("button,select,input:not([type=file])")]).filter(vis)) {
    const r = el.getBoundingClientRect(), sc = el.closest(".tw,#db table,#log,.fn"); if (sc) continue;
    if (r.left < -1 || r.right > innerWidth + 1) out.push((el.id || el.textContent.trim().slice(0, 20)) + "@" + Math.round(r.left) + "–" + Math.round(r.right));
    if (el.tagName === "BUTTON" && r.height < 43.5) small.push((el.id || el.textContent.trim().slice(0, 20)) + ":" + Math.round(r.height));
  }
  return { overflow: document.documentElement.scrollWidth - innerWidth, out, small, iw: innerWidth };
});

async function runProfile(browser, base, name, opts, ref) {
  const P = await open(browser, base, "new", opts), p = P.page, log = [], ok = (n, c, info) => log.push({ name: n, ok: !!c, info: c ? (info === undefined ? "ok" : String(info)) : String(info) });
  const env = await p.evaluate(() => ({ touch: document.body.classList.contains("touch"), dpr: devicePixelRatio, w: innerWidth, h: innerHeight })), s = Math.min(2, Math.max(1, env.dpr));
  p.setDefaultTimeout(8000); const isTouch = !!opts.hasTouch; try {
  // Vollbild im Test abschalten: Der Browser ohne Fenster lässt sich im Vollbild nicht mehr drehen. (Auf dem iPhone gibt es die Funktion ohnehin nicht.)
  await p.evaluate(() => { document.documentElement.requestFullscreen = () => Promise.reject(new Error("im Test abgeschaltet")) }); ok("Touch-Modus " + (isTouch ? "aktiv" : "aus"), env.touch === isTouch, `${env.w}×${env.h}, Pixeldichte ${env.dpr}`);
  const lay = async label => { await frames(p); const l = await layout(p), wide = l.iw - opts.viewport.width; // wide > 0: Inhalt war breiter als der Bildschirm, der Mobilbrowser hat herausgezoomt
    ok(`${label}: kein seitliches Scrollen, Bedienelemente im Bild`, l.overflow <= 1 && wide <= 1 && !l.out.length, l.overflow > 1 || wide > 1 || l.out.length ? `Überstand ${Math.max(l.overflow, wide)}px; außerhalb: ${l.out.join(", ")}` : "ok"); if (isTouch) ok(`${label}: Schaltflächen mindestens 44 px hoch`, !l.small.length, l.small.join(", ")) };

  await lay("Startseite"); await p.click("#home .nav button.pri"); await lay("Streckenwahl");
  await p.click("#cards .card:nth-child(1) button"); await lay("Training (bereit)");
  await p.click("label:has(#pa) .wb"); await lay("Glücksrad"); await p.click("#wm button:has-text('Abbrechen')");
  // Lernen: gleiche Maske und gleiches Lernergebnis auf jedem Gerät
  await p.evaluate(() => { window.__q.seed(5); document.querySelector("#pn").value = "500" }); await p.click("#bGo");
  const learn = await p.evaluate(() => { const q = window.__q; while (q.get("st") === "training") q.f.trainStep(); const m = q.get("mask"); let h = 0; for (let i = 0; i < m.length; i++)h = (h * 31 + m[i]) | 0; return { mask: m.length + ":" + h, save: localStorage.getItem("q1save"), road: q.get("roadC").width, sc: document.querySelector("#sc").width, ch: document.querySelector("#ch").width, hc: document.querySelector("#hc").width } });
  if (!ref.mask) { ref.mask = learn.mask; ref.save = sha(learn.save) }
  ok("Straßenmaske identisch mit Referenz (1000 × 640)", learn.mask === ref.mask && learn.mask.startsWith("640000:"), learn.mask); ok("Lernergebnis nach 500 Episoden identisch mit Referenz", sha(learn.save) === ref.save, sha(learn.save));
  ok(`Canvas-Auflösung passt zur Pixeldichte (Faktor ${s})`, learn.sc === Math.round(1000 * s) && learn.road === Math.round(1000 * s) && learn.ch === Math.round(320 * s) && learn.hc === Math.round(900 * s), `Strecke ${learn.sc}, Straßengrafik ${learn.road}, Diagramm ${learn.ch}, Start ${learn.hc}`);
  await lay("Training (beendet)");
  await p.click("#bMA"); await p.click("#bDec"); await p.click("#db button:has-text('Modus B')"); await lay("Dialog Entscheidung"); await p.click("#dm button:has-text('Schließen')");

  // First-Person
  const best = await p.evaluate(() => !!window.__q.get("best")); ok("beste Fahrt vorhanden", best);
  await p.click("#bMB"); await p.click("#bBest"); await p.click("#rpPlay", { force: true }); await lay("First-Person"); // force: die Zeitanzeige ändert während der Wiedergabe ihre Breite
  const fpv = await p.evaluate(() => [document.querySelector("#fc").width, innerWidth]); ok("First-Person-Bild in Geräteauflösung", fpv[0] === Math.round(fpv[1] * s), fpv.join(" / ")); await p.click("#rpv > button");

  // Rennen
  await p.click("#bMB"); await p.click("#bRace"); await frames(p);
  const race = await p.evaluate(async () => {
    const tc = document.querySelector("#tc"), shown = getComputedStyle(tc).display !== "none", ins = (await import("/js/input/touch-controls.js")).raceInsets();
    const cw = innerWidth, ch = innerHeight, sc = Math.min((cw - ins.l - ins.r) / 1000, (ch - ins.t - ins.b) / 640), x0 = ins.l + ((cw - ins.l - ins.r) - 1000 * sc) / 2, y0 = ins.t + ((ch - ins.t - ins.b) - 640 * sc) / 2;
    const btn = [...tc.querySelectorAll("button")].map(b => { const r = b.getBoundingClientRect(); return { k: b.dataset.key, l: r.left, t: r.top, r: r.right, b: r.bottom, cx: r.left + r.width / 2, cy: r.top + r.height / 2 } });
    return { shown, sc, track: { l: x0, t: y0, r: x0 + 1000 * sc, b: y0 + 640 * sc }, btn, cw, ch, rc: document.querySelector("#rc2").width, hint: document.querySelector("#rh").textContent };
  });
  ok("Renn-Bild in Geräteauflösung", race.rc === Math.round(race.cw * s), race.rc);
  if (isTouch) {
    const B = Object.fromEntries(race.btn.map(b => [b.k, b])), hit = (a, b) => a.l < b.r - 1 && a.r > b.l + 1 && a.t < b.b - 1 && a.b > b.t + 1;
    ok("vier Bildschirmtasten sichtbar (Links, Rechts, Bremse, Gas)", race.shown && race.btn.length === 4 && "adsw".split("").every(k => B[k]));
    ok("Tasten mindestens 64 px groß und vollständig im Bild", race.btn.every(b => b.r - b.l >= 64 && b.b - b.t >= 64 && b.l >= 0 && b.t >= 0 && b.r <= race.cw && b.b <= race.ch), race.btn.map(b => Math.round(b.r - b.l)).join("/"));
    ok("Tasten überdecken sich nicht und liegen nicht auf der Strecke", !race.btn.some((a, i) => race.btn.some((b, j) => i < j && hit(a, b))) && !race.btn.some(b => hit(b, race.track)));
    ok("Strecke vollständig im Bild und ausreichend groß", race.track.l >= -1 && race.track.t >= -1 && race.track.r <= race.cw + 1 && race.track.b <= race.ch + 1 && race.sc >= .28, `Maßstab ${race.sc.toFixed(2)} → ${Math.round(1000 * race.sc)}×${Math.round(640 * race.sc)} px`);
    ok("Starthinweis nennt die Gas-Taste", /Tippe auf Gas/.test(race.hint));
    const st = () => p.evaluate(() => { const q = window.__q, R = q.get("R"), k = q.get("keys"); return { a: !!k.a, d: !!k.d, w: !!k.w, s: !!k.s, go: !!R.go, steps: R.steps || 0, ang: R.car ? R.car.a : 0, i: R.car ? R.car.i : 0, v: R.car ? R.car.v : 0 } });
    await p.click("#rGo"); await wait(p, 3100); const a0 = (await st()).ang;
    await P.touch("touchStart", [[B.w.cx, B.w.cy, 1]]); await wait(p, 250); let v = await st(); ok("Gas: Rennen startet, Auto beschleunigt", v.w && v.go && v.steps > 0 && v.v > 0, JSON.stringify(v));
    await P.touch("touchMove", [[B.w.cx, B.w.cy, 1], [B.a.cx, B.a.cy, 2]]); await wait(p, 300); v = await st(); ok("Zwei Finger gleichzeitig: Gas und Links", v.w && v.a && !v.d && v.ang < a0, JSON.stringify(v));
    const a1 = v.ang; await P.touch("touchMove", [[B.w.cx, B.w.cy, 1], [B.d.cx, B.d.cy, 2]]); await wait(p, 300); v = await st(); ok("Finger gleitet von Links nach Rechts", v.w && !v.a && v.d && v.ang > a1, JSON.stringify(v));
    await P.touch("touchMove", [[B.s.cx, B.s.cy, 1], [B.d.cx, B.d.cy, 2]]); await wait(p, 120); v = await st(); ok("Bremse statt Gas", v.s && !v.w, JSON.stringify(v));
    await P.touch("touchEnd", []); await wait(p, 80); v = await st(); ok("Loslassen: alle Tasten frei", !v.a && !v.d && !v.w && !v.s, JSON.stringify(v));
    await p.keyboard.down("w"); await wait(p, 150); v = await st(); await p.keyboard.up("w"); ok("Tastatur funktioniert weiterhin (W)", v.w, JSON.stringify(v));
  } else {
    ok("Bildschirmtasten ausgeblendet", !race.shown); ok("Strecke nutzt das ganze Fenster", Math.abs(race.sc - Math.min(race.cw / 1000, race.ch / 640)) < 1e-9, race.sc.toFixed(3));
    await p.click("#rGo"); await wait(p, 3100); await p.keyboard.down("ArrowUp"); await wait(p, 300); const v = await p.evaluate(() => { const R = window.__q.get("R"); return [R.go, R.steps > 0] }); await p.keyboard.up("ArrowUp"); ok("Tastatur: Rennen startet mit Pfeil nach oben", v[0] && v[1], v.join());
  }
  // Rennergebnis: Schaltflächen liegen in der Ergebniskarte, sind sichtbar und nicht verdeckt
  await p.evaluate(() => window.__q.f.endRace(false)); await wait(p, 500);
  const res = await p.evaluate(() => { const c = document.querySelector("#rs .rc").getBoundingClientRect(); return [...document.querySelectorAll("#rs button")].map(b => { const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: b.textContent, inCard: r.left >= c.left && r.right <= c.right && r.top >= c.top && r.bottom <= c.bottom, onScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, free: e === b } }) });
  ok("Rennergebnis: „Noch einmal“ und „Zurück“ in der Karte, im Bild und bedienbar", res.length === 2 && res.every(b => b.inCard && b.onScreen && b.free), JSON.stringify(res));
  await p.click("#rs button:has-text('Zurück')"); ok("Rennergebnis: „Zurück“ führt zur Trainingsansicht", await p.evaluate(() => window.__q.get("page")) === "sim");
  await p.click("#sim .row > button:first-child");

  // Editor
  await p.click("#drawblk"); await frames(p); const W = await p.evaluate(() => innerWidth), H = await p.evaluate(() => innerHeight), path = n => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n; o.push([W * (.16 + .68 * t), H * (.72 - .3 * Math.sin(t * Math.PI))]) } return o }, pts = path(40);
  const sy0 = await p.evaluate(() => scrollY);
  const ed = () => p.evaluate(() => { const q = window.__q; return { n: q.get("ep").length, drawing: q.get("drawing"), sy: scrollY, ec: document.querySelector("#ec").width, pts: q.get("ep").map(a => [a.x, a.y]) } });
  ok("Editor-Bild in Geräteauflösung", (await ed()).ec === Math.round(W * s), (await ed()).ec);
  const near = (list, q, d) => list.some(a => Math.hypot(a[0] - q[0], a[1] - q[1]) < d);
  if (isTouch) {
    await lay("Editor");
    const palm = [W * .5, H * .85];
    await P.touch("touchStart", [[...pts[0], 1]]); for (const q of pts.slice(1, 20)) await P.touch("touchMove", [[...q, 1]]);
    await P.touch("touchMove", [[...pts[19], 1], [...palm, 2]]); for (const q of pts.slice(20)) await P.touch("touchMove", [[...q, 1], [palm[0] + 3, palm[1] + 3, 2]]); await P.touch("touchEnd", []);
    let e = await ed(); ok("Finger zeichnet eine Strecke, Seite scrollt nicht", e.n >= 30 && e.sy === sy0 && !e.drawing, e.n + " Punkte"); ok("Zweiter Finger während des Zeichnens erzeugt keine Sprünge", !near(e.pts, palm, 40));
    await P.touch("touchStart", [[...pts[40], 1]]); await P.touch("touchCancel", []); e = await ed(); ok("Abgebrochene Berührung beendet den Strich", !e.drawing);
    await p.click("#ed button:has-text('Löschen')");
    // Stift: Handballen liegt zuerst auf, dann zeichnet der Stift
    await P.touch("touchStart", [[...palm, 5]]); await P.touch("touchMove", [[palm[0] + 8, palm[1] + 2, 5]]); await P.touch("touchMove", [[palm[0] + 16, palm[1] + 4, 5]]);
    await P.pen("mousePressed", ...pts[0]); for (const q of pts.slice(1)) await P.pen("mouseMoved", ...q); await P.pen("mouseReleased", ...pts[40]); await P.touch("touchEnd", []);
    e = await ed(); ok("Stift zeichnet; Strich der aufliegenden Hand wird verworfen", e.n >= 30 && !near(e.pts, palm, 40) && !e.drawing, e.n + " Punkte");
    const n0 = e.n; await P.touch("touchStart", [[W * .5, H * .5, 6]]); await P.touch("touchMove", [[W * .55, H * .52, 6]]); await P.touch("touchEnd", []); e = await ed(); ok("Nach Stiftbenutzung zeichnen Finger nicht mehr mit", e.n === n0, n0 + " → " + e.n);
  } else {
    await p.mouse.move(...pts[0]); await p.mouse.down(); for (const q of pts.slice(1)) await p.mouse.move(q[0], q[1], { steps: 3 }); await p.mouse.up();
    const e = await ed(); ok("Maus zeichnet eine Strecke", e.n >= 30 && !e.drawing, e.n + " Punkte");
  }
  // Drehen bzw. Fenstergröße ändern: Form bleibt erhalten
  const b0 = (await ed()).pts, shape = q => { const d = (i, j) => Math.hypot(q[i][0] - q[j][0], q[i][1] - q[j][1]), m = q.length >> 1, l = q.length - 1; return [d(0, m) / d(0, l), (q[m][1] - q[0][1]) / (q[l][0] - q[0][0])] };
  await p.setViewportSize({ width: H, height: W }); await frames(p); const b1 = (await ed()).pts, s0 = shape(b0), s1 = shape(b1);
  ok("Gerät gedreht: Zeichnung behält ihre Form", b0.length === b1.length && Math.abs(s0[0] - s1[0]) < 1e-6 && Math.abs(s0[1] - s1[1]) < 1e-6, s0.map(v => v.toFixed(4)).join("/") + " → " + s1.map(v => v.toFixed(4)).join("/"));
  await p.setViewportSize({ width: W, height: H }); await frames(p);
  await p.click("#ed button:has-text('Zeichnen beenden')"); await frames(p);
  const made = await p.evaluate(() => { const q = window.__q; return [q.get("T").name, q.get("page"), q.get("mask").length] }); ok("Eigene Strecke wird übernommen", made[0] === "Eigene Strecke" && made[1] === "sim" && made[2] === 640000, made.join());
  await p.click("#sim .row > button:first-child");

  // Parameter-Labor und Duell
  await p.click("#pOpen"); await lay("Dialog Parameterwahl"); await p.click("#pg2 button:nth-child(1)"); await p.click("#pGo"); await lay("Parameter-Labor"); await p.click("#pl button:has-text('Zur Parameterauswahl')");
  await p.click("#kOpen"); await p.click("#kg button:nth-child(1)"); await lay("Dialog Duell"); await p.evaluate(() => { document.querySelector("#kn").value = "100"; window.__q.seed(9) }); await p.click("#kGo");
  await p.evaluate(() => { const q = window.__q, D = q.get("DU"); while (!D.done) { q.f.duStep("A"); q.f.duStep("B"); if (D.A.ctx.epN >= D.n && D.B.ctx.epN >= D.n) q.f.djFinish() } }); await lay("Duell (beendet)");
  } catch (e) { ok("Ablauf ohne Abbruch", false, String(e).split("\n").slice(0, 3).join(" ")) }
  ok("keine Skriptfehler", !P.errors.length, P.errors.slice(0, 2).join(" | "));
  await P.ctx.close(); return log;
}

(async () => {
  const srv = await serve(), browser = await launch(), ref = {}, only = process.argv[2]; let all = true, total = 0, good = 0;
  for (const [name, opts] of PROFILES) {
    if (only && !name.includes(only)) continue; let log;
    try { log = await runProfile(browser, srv.url, name, opts, ref) } catch (e) { log = [{ name: "Ablauf", ok: false, info: String(e).split("\n")[0] }] }
    all = report(name, log) && all; total += log.length; good += log.filter(l => l.ok).length;
  }
  console.log(`\n== Gerätetest gesamt: ${good}/${total} bestanden ==`); await browser.close(); srv.close(); process.exit(all ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2) });
