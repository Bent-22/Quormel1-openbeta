// Retina-Prüfung: Jedes Canvas muss bei Pixeldichte 2 dasselbe Bild zeigen wie bei Pixeldichte 1 – nur schärfer.
// Dazu werden beide Bilder auf eine kleine Vorschau verkleinert und verglichen. Ein falsch skaliertes Canvas
// (z. B. Inhalt nur in einer Ecke oder abgeschnitten) fällt dabei sofort auf.
const { serve, launch, open, report } = require("./helpers.cjs");

const thumbs = sel => [...document.querySelectorAll(sel)].map(cv => { const w = 200, h = Math.max(1, Math.round(cv.height / cv.width * w)), t = document.createElement("canvas"); t.width = w; t.height = h;
  const x = t.getContext("2d"); x.imageSmoothingQuality = "high"; x.fillStyle = "#000"; x.fillRect(0, 0, w, h); x.drawImage(cv, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data, g = []; for (let i = 0; i < d.length; i += 4)g.push(Math.round(.3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2])); return { w, h, g, px: cv.width } });
const runToEnd = p => p.evaluate(() => { const q = window.__q; while (q.get("st") === "training") q.f.trainStep() });
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));

// [Name, Canvas-Auswahl, Aktion]
const STEPS = [
  ["Streckenwahl: Vorschaubilder der drei Vorlagen", "#cards canvas", async p => { await p.click("#home .nav button.pri") }],
  ["Glücksrad", "#wc", async p => { await p.click("#cards .card:nth-child(1) button"); await p.evaluate(() => window.__q.seed(3)); await p.click("label:has(#pa) .wb") }],
  ["Training beendet: Strecke mit Auto und Fortschritt", "#sc", async p => { await p.click("#wm button:has-text('Abbrechen')"); await p.evaluate(() => { window.__q.seed(5); document.querySelector("#pn").value = "500" }); await p.click("#bGo"); await runToEnd(p) }],
  ["Training beendet: Erfolgsdiagramm", "#ch", async () => { }],
  ["Ideallinie eingeblendet", "#sc", async p => { await p.click("#bIdeal") }],
  ["Fehleranalyse: Miniaturen", "#ft canvas", async p => { await p.click("#bIdeal"); await p.click("#bMA"); await p.click("#bFail") }],
  ["Fehleranalyse: Detailansicht (letzter Schritt)", "#fc2", async p => { await p.click("#ft .card:nth-child(2)"); await p.evaluate(() => { const F = window.__q.get("FA"); F.run = false; F.j = F.f.log.length - 1 }) }],
  ["First-Person-Ansicht (Mitte der Fahrt)", "#fc", async p => { await p.click("#fm button:has-text('Schließen')"); await p.click("#bMB"); await p.click("#bBest"); await p.click("#rpPlay", { force: true }); await p.evaluate(() => { const e = document.querySelector("#rpT"); e.value = String(Math.floor(e.max / 2)); e.dispatchEvent(new Event("input", { bubbles: true })) }) }],
  ["First-Person-Ansicht mit Ideallinie und Debug-Anzeige", "#fc", async p => { await p.keyboard.press("q"); await p.keyboard.press("u"); await p.keyboard.press("1"); await p.click("#rpD") }],
  ["Rennen: Bereitschaftsbild", "#rc2", async p => { await p.click("#rpv > button"); await p.click("#bMB"); await p.click("#bRace") }],
  ["Parameter-Labor nach 3000 Lernschritten", "#lc", async p => { await p.click("#race > button"); await p.click("#sim .row > button:first-child"); await p.click("#pOpen"); await p.click("#pg2 button:nth-child(2)"); await p.click("#pGo"); await p.evaluate(() => { const q = window.__q; q.seed(7); for (let i = 0; i < 3000; i++)q.f.trainStep(); q.f.labUI() }) }],
  ["Duell beendet: beide Strecken", "#jA canvas, #jB canvas", async p => { await p.click("#pl button:has-text('Zur Parameterauswahl')"); await p.click("#kOpen"); await p.click("#kg button:nth-child(1)"); await p.click("#kSug"); await p.evaluate(() => { document.querySelector("#ks").value = "0"; document.querySelector("#kn").value = "500"; window.__q.seed(9) }); await p.click("#kGo");
    await p.evaluate(() => { const q = window.__q, D = q.get("DU"); while (!D.done) { q.f.duStep("A"); q.f.duStep("B"); if (D.A.ctx.epN >= D.n && D.B.ctx.epN >= D.n) q.f.djFinish() } }) }],
  ["Duell beendet: Q-Wert-Verlauf", "#jq", async () => { }],
  ["Duell: Vergleich der besten Fahrten (Schritt 100)", "#bA, #bB", async p => { await p.click("#jr button"); await p.evaluate(() => { const B = window.__q.get("BV"); B.run = false; B.k = 100 }) }],
  ["Streckeneditor mit gezeichneter Strecke", "#ec", async p => { await p.click("#bv button:has-text('Schließen')"); await p.click("#jRetry"); await p.click("#ko button:has-text('Schließen')"); await p.click("#drawblk");
    await p.evaluate(() => { const q = window.__q, P = []; for (let i = 0; i <= 80; i++) { const t = i / 80; P.push({ x: 200 + 880 * t, y: 600 - 330 * Math.sin(t * Math.PI) }) } q.set("ep", P); q.f.edDraw() }) }],
];

(async () => {
  const srv = await serve(), browser = await launch(), log = [];
  const mk = async dpr => { const P = await open(browser, srv.url, "new", { viewport: { width: 1280, height: 800 }, deviceScaleFactor: dpr }); P.page.setDefaultTimeout(8000); await P.page.evaluate(() => { document.documentElement.requestFullscreen = () => Promise.reject(new Error("im Test abgeschaltet")) }); return P };
  const A = await mk(1), B = await mk(2);
  for (const [name, sel, act] of STEPS) {
    let a, b; try { for (const P of [A, B]) { await act(P.page); await frames(P.page) } a = await A.page.evaluate(`(${thumbs.toString()})(${JSON.stringify(sel)})`); b = await B.page.evaluate(`(${thumbs.toString()})(${JSON.stringify(sel)})`) }
    catch (e) { log.push({ name, ok: false, info: "Abbruch: " + String(e).split("\n")[0] }); break }
    let ok = a.length > 0 && a.length === b.length, worst = 0, block = 0, sharp = true;
    for (let i = 0; ok && i < a.length; i++) { const x = a[i], y = b[i]; if (x.w !== y.w || x.h !== y.h) { ok = false; break }
      let sum = 0; for (let k = 0; k < x.g.length; k++)sum += Math.abs(x.g[k] - y.g[k]); worst = Math.max(worst, sum / x.g.length);
      // größte Abweichung eines 20 × 20-Feldes: findet verschobene oder fehlende Bildteile
      for (let by = 0; by + 20 <= x.h; by += 20)for (let bx = 0; bx + 20 <= x.w; bx += 20) { let s1 = 0, s2 = 0; for (let yy = 0; yy < 20; yy++)for (let xx = 0; xx < 20; xx++) { const k = (by + yy) * x.w + bx + xx; s1 += x.g[k]; s2 += y.g[k] } block = Math.max(block, Math.abs(s1 - s2) / 400) }
      if (y.px !== x.px * 2) sharp = false }
    ok = ok && worst < 4 && block < 14 && sharp;
    log.push({ name: `${name} (${a.length} Bild${a.length === 1 ? "" : "er"})`, ok, info: `mittlere Abweichung ${worst.toFixed(2)} von 255, größtes Feld ${block.toFixed(1)}${sharp ? ", doppelte Auflösung" : ", Auflösung NICHT verdoppelt"}` });
  }
  for (const [P, n] of [[A, "Pixeldichte 1"], [B, "Pixeldichte 2"]]) log.push({ name: `keine Skriptfehler (${n})`, ok: !P.errors.length, info: P.errors.slice(0, 2).join(" | ") || "ok" });
  const good = report("Retina-Prüfung (Pixeldichte 1 gegen 2)", log); await browser.close(); srv.close(); process.exit(good ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2) });
