// Oberflächentest: Dieselbe Bedienfolge läuft im Original und in der Neufassung.
// Nach jedem Schritt müssen sichtbare Seite, offene Dialoge, HTML-Inhalt und ausgewählte Canvas-Bilder übereinstimmen.
const fs = require("fs"), os = require("os"), path = require("path");
const { serve, launch, open, same, report, sha } = require("./helpers.cjs");

const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))))));
const snapshot = (p, canv) => p.evaluate(sel => {
  const strip = h => h.replace(/ (on(click|input|change)|data-(click|input|change|arg))="[^"]*"/g, "");
  const b = document.body.cloneNode(true); b.querySelectorAll("script,[data-p3]").forEach(s => s.remove()); /* data-p3: Elemente, die es im Original nicht gibt (Bildschirmtasten) */ b.querySelector("#toast").removeAttribute("style");
  const vis = e => getComputedStyle(e).display !== "none";
  return {
    seite: [...document.querySelectorAll("section.on")].map(s => s.id), offen: [...document.querySelectorAll(".mdl,#ed,#code,#wm")].filter(vis).map(e => e.id),
    body: document.body.className, toast: document.querySelector("#toast").textContent, html: strip(b.innerHTML),
    bilder: (sel || []).flatMap(s => [...document.querySelectorAll(s)].map(c => c.width + "x" + c.height + ":" + c.toDataURL())),
  };
}, canv);
const setVal = (p, sel, v, ev) => p.evaluate(([s, v, ev]) => { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event(ev, { bubbles: true })) }, [sel, String(v), ev || "input"]);
const runToEnd = p => p.evaluate(() => { const q = window.__q; while (q.get("st") === "training") q.f.trainStep() });
const draw = async (p, pts) => { await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down(); for (const [x, y] of pts.slice(1)) await p.mouse.move(x, y, { steps: 6 }); await p.mouse.up() };
const arc = []; for (let i = 0; i <= 40; i++) { const t = i / 40; arc.push([180 + 900 * t, 620 - 420 * Math.sin(t * Math.PI) - 60 * t]) }

// [Name, Aktion(p, env), Optionen {canv:[Selektoren], extra: p=>Wert, nosnap}]
const STEPS = [
  ["Start: Startseite nach dem Laden", async p => { await p.evaluate(() => window.__q.seed(123)) }],
  ["Startseite → Streckenwahl", p => p.click("#home .nav button.pri")],
  ["Streckenwahl → Start", p => p.click("#lib > button")],
  ["Vorlage 1 wählen → Trainingsansicht", async p => { await p.click("#home .nav button.pri"); await p.click("#cards .card:nth-child(1) button") }, { canv: ["#sc"] }],
  ["„So lernt das Auto“ öffnen", p => p.click("#bCode")],
  ["„So lernt das Auto“ schließen", p => p.click("#code button")],
  ["Ideallinie an", p => p.click("#bIdeal"), { canv: ["#sc"] }],
  ["Ideallinie aus", p => p.click("#bIdeal"), { canv: ["#sc"] }],
  ["Präsentationsmodus an", p => p.click("#bPres")],
  ["Präsentationsmodus aus", p => p.click("#bPres")],
  ["Parameter-Erklärung aufklappen", p => p.click("#pa ~ details.ex summary, label:has(#pa) details.ex summary")],
  ["Glücksrad öffnen", p => p.click("label:has(#pa) .wb"), { canv: ["#wc"] }],
  ["Glücksrad drehen", async p => { await p.click("#wSpin"); await p.waitForTimeout(3500) }, { canv: ["#wc"] }],
  ["Glücksrad: Wert übernehmen", p => p.click("#wOk"), { extra: p => p.inputValue("#pa") }],
  ["Glücksrad öffnen und abbrechen", async p => { await p.click("label:has(#pg) .wb"); await p.click("#wm button:has-text('Abbrechen')") }],
  ["Ungültige Lernrate → Start wird abgelehnt", async p => { await setVal(p, "#pa", "5"); await p.click("#bGo") }, { extra: p => p.evaluate(() => window.__q.get("st")) }],
  ["Negativer Strafwert → Warnung", async p => { await setVal(p, "#pa", ".15"); await p.click("summary:has-text('Reward-Gewichte')"); await setVal(p, "#rc", "-5") }],
  ["Training starten, bis Episode 200, dann Pause", async p => {
    await setVal(p, "#rc", "100"); await setVal(p, "#pn", "500", "change"); await p.evaluate(() => window.__q.seed(5)); await p.click("#bGo");
    await p.evaluate(() => { const q = window.__q; while (q.get("epN") < 200) q.f.trainStep(); q.f.pause() });
  }, { canv: ["#sc", "#ch"] }],
  ["Menü Analyse öffnen", p => p.click("#bMA")],
  ["Menü Analyse schließen", p => p.click("#ma button:has-text('Schließen')")],
  ["Fehleranalyse: Übersicht", async p => { await p.click("#bMA"); await p.click("#bFail") }, { canv: ["#ft canvas"] }],
  ["Fehleranalyse: Detail (letzter Schritt)", async p => { await p.click("#ft .card:nth-child(2)"); await p.evaluate(() => { const F = window.__q.get("FA"); F.run = false; F.j = F.f.log.length - 1 }) }, { canv: ["#fc2"] }],
  ["Fehleranalyse: zurück zur Übersicht", p => p.click("#fb button:has-text('Zur Übersicht')"), { canv: ["#ft canvas"] }],
  ["Fehleranalyse schließen", p => p.click("#fm button:has-text('Schließen')")],
  ["Entscheidung untersuchen (pausiert)", async p => { await p.click("#bMA"); await p.click("#bDec") }],
  ["Modus A wählen", p => p.click("#db button:has-text('Modus A')")],
  ["Prüfen ohne Vermutung → Hinweis", p => p.click("#db button:has-text('Vermutung überprüfen')")],
  ["Vermutung wählen und prüfen", async p => { await p.click("#db label:nth-of-type(3) input"); await p.click("#db button:has-text('Vermutung überprüfen')") }],
  ["Aktion ausführen", p => p.click("#db button:has-text('Aktion ausführen')"), { canv: ["#sc"] }],
  ["Nächste Entscheidung", p => p.click("#db button:has-text('Nächste Entscheidung')")],
  ["Modus B wählen", p => p.click("#db button:has-text('Modus B')")],
  ["Aktion ausführen (Modus B)", p => p.click("#db button:has-text('Aktion ausführen')")],
  ["Training fortsetzen aus dem Dialog", p => p.click("#db button:has-text('Training fortsetzen')"), { nosnap: true, extra: p => p.evaluate(() => [window.__q.get("st"), getComputedStyle(document.querySelector("#dm")).display]) }],
  ["Training bis zum Ende", p => runToEnd(p), { canv: ["#sc", "#ch"], extra: p => p.evaluate(() => [localStorage.getItem("q1save"), !!window.__q.get("best")]) }],
  ["Entscheidung nach Trainingsende: vorführen", async p => { await p.click("#bMA"); await p.click("#bDec"); await p.click("#db button:has-text('Modus B')"); await p.click("#db button:has-text('Aktion vorführen')") }],
  ["Zur Trainingsansicht", p => p.click("#db button:has-text('Zur Trainingsansicht')")],
  ["Entscheidungsdialog über Schließen beenden", async p => { await p.click("#bMA"); await p.click("#bDec"); await p.click("#dm button:has-text('Schließen')") }],
  ["Weitertrainieren: Dialog öffnen", p => p.click("#bMore")],
  ["Weitertrainieren: abbrechen", p => p.click("#mm button:has-text('Abbrechen')")],
  ["Weitertrainieren: eigene Anzahl 150", async p => { await p.click("#bMore"); await setVal(p, "#mx", "c", "change"); await p.fill("#mc", "150"); await p.click("#mOk"); await runToEnd(p) }, { canv: ["#sc", "#ch"], extra: p => p.evaluate(() => localStorage.getItem("q1save")) }],
  ["Menü Beste Fahrt öffnen", p => p.click("#bMB")],
  ["Menü Beste Fahrt schließen", p => p.click("#mb button:has-text('Schließen')")],
  ["Beste Fahrt (First-Person), angehalten am Anfang", async p => { await p.click("#bMB"); await p.click("#bBest"); await setVal(p, "#rpT", "0") }, { canv: ["#fc"] }],
  ["First-Person: Mitte der Fahrt", async p => { await p.evaluate(() => { const e = document.querySelector("#rpT"); e.value = String(Math.floor(e.max / 2)); e.dispatchEvent(new Event("input", { bubbles: true })) }) }, { canv: ["#fc"] }],
  ["First-Person: kurz vor dem Ziel", async p => { await p.evaluate(() => { const e = document.querySelector("#rpT"); e.value = String(e.max - 12); e.dispatchEvent(new Event("input", { bubbles: true })) }) }, { canv: ["#fc"] }],
  ["First-Person: Ideallinie und Debug-Modus (Tasten Q, U, 1)", async p => { await p.keyboard.press("q"); await p.keyboard.press("u"); await p.keyboard.press("1"); await p.click("#rpD") }, { canv: ["#fc"] }],
  ["First-Person: Erneut und Abspielen/Pause", async p => { await p.click("#rpAgain"); await p.click("#rpPlay"); await setVal(p, "#rpT", "30") }, { canv: ["#fc"] }],
  ["First-Person → zurück", p => p.click("#rpv > button")],
  ["Rennen: Seite öffnen", async p => { await p.click("#bMB"); await p.click("#bRace") }],
  ["Rennen: Start, Gas geben, Auto fährt", async p => { await p.click("#rGo"); await p.waitForTimeout(3100); await p.keyboard.down("w"); await p.waitForTimeout(1200); await p.keyboard.up("w") },
    { nosnap: true, extra: p => p.evaluate(() => { const R = window.__q.get("R"); return [R.s, R.go, R.car.i > 3, R.steps > 20] }) }],
  ["Rennen: Abbruch → Ergebnis", async p => { await p.evaluate(() => window.__q.f.endRace(false)) }, { nosnap: true, extra: p => p.evaluate(() => [getComputedStyle(document.querySelector("#rs")).display, /nicht abgeschlossen/.test(document.querySelector("#rs").textContent)]) }],
  ["Rennen: „Noch einmal“", p => p.click("#rs button:has-text('Noch einmal')"), { nosnap: true, extra: p => p.evaluate(() => [window.__q.get("R").s, getComputedStyle(document.querySelector("#rs")).display]) }],
  ["Rennen: Ergebnis → „Zurück“", async p => { await p.waitForTimeout(3000); await p.evaluate(() => window.__q.f.endRace(false)); await frames(p); await p.click("#rs button:has-text('Zurück')") }],
  ["Trainingsansicht → Strecken", p => p.click("#sim .row > button:first-child")],
  ["Parameterauswahl öffnen", p => p.click("#pOpen")],
  ["Parameterauswahl schließen", p => p.click("#po button:has-text('Schließen')")],
  ["Parameter-Labor: Discount-Faktor", async p => { await p.click("#pOpen"); await p.click("#pg2 button:nth-child(2)"); await p.click("#pGo") }, { canv: ["#lc"] }],
  ["Parameter-Labor: läuft (Schnell), dann Pause", async p => { await p.click("#lFast"); await p.click("#lGo"); await p.waitForTimeout(600); await p.click("#lGo") }, { nosnap: true, extra: p => p.evaluate(() => [window.__q.get("Q").size > 0, window.__q.get("LAB").run, document.querySelector("#lGo").textContent]) }],
  ["Parameter-Labor: Neu starten", async p => { await p.click("#lSlow"); await p.click("#lRe") }, { canv: ["#lc"] }],
  ["Parameter-Labor → Parameterauswahl", p => p.click("#pl button:has-text('Zur Parameterauswahl')"), { extra: p => p.evaluate(() => [window.__q.get("T").name, window.__q.get("epN"), window.__q.get("LAB")]) }],
  ["Duell: Auswahl öffnen", p => p.click("#kOpen")],
  ["Duell: Auswahl schließen", p => p.click("#ko button:has-text('Schließen')")],
  ["Duell: Lernrate, vorgegebene Werte, 500 Episoden, bis zum Ende", async p => {
    await p.click("#kOpen"); await p.click("#kg button:nth-child(1)"); await p.click("#kSug"); await setVal(p, "#ks", "0", "change"); await setVal(p, "#kn", "500", "change"); await p.evaluate(() => window.__q.seed(9)); await p.click("#kGo");
    await p.evaluate(() => { const q = window.__q, D = q.get("DU"); while (!D.done) { q.f.duStep("A"); q.f.duStep("B"); if (D.A.ctx.epN >= D.n && D.B.ctx.epN >= D.n) q.f.djFinish() } });
  }, { canv: ["#jA canvas", "#jB canvas", "#jq"], extra: p => p.isEnabled("#jr button") }],
  ["Duell: beste Fahrten vergleichen (angehalten bei Schritt 100)", async p => { await p.click("#jr button"); await p.evaluate(() => { const B = window.__q.get("BV"); B.run = false; B.k = 100 }) }, { canv: ["#bA", "#bB"] }],
  ["Duell: Vergleich – Erneut, Pause, Schließen", async p => { await p.click("#bvR"); await p.click("#bvP"); await p.evaluate(() => { const B = window.__q.get("BV"); B.run = false; B.k = 50 }); await frames(p); await p.click("#bv button:has-text('Schließen')") }, { extra: p => p.evaluate(() => window.__q.get("BV")) }],
  ["Duell: Erneut versuchen → Auswahl", p => p.click("#jRetry")],
  ["Duell: Auswahl schließen → Streckenwahl", p => p.click("#ko button:has-text('Schließen')"), { extra: p => p.evaluate(() => [window.__q.get("DU"), window.__q.get("LAB"), window.__q.get("T").name, window.__q.get("epN")]) }],
  ["Editor öffnen", p => p.click("#drawblk"), { canv: ["#ec"] }],
  ["Editor: Strecke zeichnen", p => draw(p, arc), { canv: ["#ec"], extra: p => p.evaluate(() => window.__q.get("ep").length) }],
  ["Editor: Rückgängig", p => p.click("#ed button:has-text('Rückgängig')"), { canv: ["#ec"], extra: p => p.evaluate(() => window.__q.get("ep").length) }],
  ["Editor: Löschen", p => p.click("#ed button:has-text('Löschen')"), { canv: ["#ec"], extra: p => p.evaluate(() => window.__q.get("ep").length) }],
  ["Editor: neu zeichnen, Straßenbreite 80", async p => { await draw(p, arc); await setVal(p, "#ew", "80") }, { canv: ["#ec"] }],
  ["Editor: Zeichnen beenden → eigene Strecke", p => p.click("#ed button:has-text('Zeichnen beenden')"), { canv: ["#sc"], extra: p => p.evaluate(() => { const q = window.__q, T = q.get("T"), m = q.get("mask"); let h = 0; for (let i = 0; i < m.length; i++)h = (h * 31 + m[i]) | 0; return [T.name, T.w, T.id, T.p.length, JSON.stringify(T.p), h] }) }],
  ["Editor öffnen und abbrechen", async p => { await p.click("#sim .row > button:first-child"); await p.click("#drawblk"); await p.click("#ed button:has-text('Abbrechen')") }],
  ["Start: Speicherstand exportieren", async (p, env) => { await p.click("#lib > button"); const [d] = await Promise.all([p.waitForEvent("download"), p.click("#bExp")]); env.file = path.join(env.dir, "export.json"); await d.saveAs(env.file); env.name = d.suggestedFilename().replace(/\d{4}-\d{2}-\d{2}/, "DATUM") },
    { extra: (p, env) => [env.name, fs.readFileSync(env.file, "utf8")] }],
  ["Letzten Speicherstand laden", p => p.click("#bCont"), { canv: ["#sc", "#ch"] }],
  ["Neue Strecke, Start → Überschreib-Warnung", async p => { await p.click("#sim .row > button:first-child"); await p.click("#cards .card:nth-child(3) button"); await setVal(p, "#pn", "100", "change"); await p.click("#bGo") }],
  ["Überschreib-Warnung: Abbrechen", p => p.click("#owNo")],
  ["Überschreib-Warnung: Überschreiben → Training läuft über die Bildschleife", async p => { await p.evaluate(() => window.__q.seed(31)); await p.click("#bGo"); await p.click("#owOk"); await p.waitForTimeout(400) }, { nosnap: true, extra: p => p.evaluate(() => [window.__q.get("st"), window.__q.get("c").steps + window.__q.get("epN") > 0]) }],
  ["Training bis zum Ende (Vorlage 3)", p => runToEnd(p), { canv: ["#sc", "#ch"], extra: p => p.evaluate(() => localStorage.getItem("q1save")) }],
  ["Import bei vorhandenem Stand → Rückfrage", async (p, env) => { await p.click("#sim .row > button:first-child"); await p.click("#lib > button"); await p.setInputFiles("#fImp", env.file); await p.waitForSelector("#im", { state: "visible" }) }],
  ["Import: Abbrechen", p => p.click("#imNo")],
  ["Import: Importieren und ersetzen", async (p, env) => { await p.setInputFiles("#fImp", env.file); await p.waitForSelector("#im", { state: "visible" }); await p.click("#imOk") }, { canv: ["#sc", "#ch"], extra: p => p.evaluate(() => localStorage.getItem("q1save")) }],
  ["Import: ungültige Datei wird abgelehnt", async (p, env) => { const f = path.join(env.dir, "kaputt.json"); fs.writeFileSync(f, '{"v":1,"tn":"x"}'); await p.click("#sim .row > button:first-child"); await p.click("#lib > button"); await p.setInputFiles("#fImp", f); await p.waitForFunction(() => /abgelehnt/.test(document.querySelector("#toast").textContent)) }, { extra: p => p.evaluate(() => localStorage.getItem("q1save")) }],
  ["Import: Stand mit älterer Lernlogik → Hinweis", async (p, env) => { const d = JSON.parse(fs.readFileSync(env.file, "utf8")); delete d.mv; const f = path.join(env.dir, "alt.json"); fs.writeFileSync(f, JSON.stringify(d)); await p.setInputFiles("#fImp", f); await p.waitForSelector("#im", { state: "visible" }); await p.click("#imOk"); await p.waitForSelector("#mv", { state: "visible" }) }],
  ["Älterer Stand: Abbrechen", p => p.click("#mvNo")],
  ["Älterer Stand: Trotzdem laden", async (p, env) => { await p.setInputFiles("#fImp", path.join(env.dir, "alt.json")); await p.waitForSelector("#im", { state: "visible" }); await p.click("#imOk"); await p.click("#mvOk") }, { canv: ["#sc"], extra: p => p.evaluate(() => [localStorage.getItem("q1save"), window.__q.get("saveMV")]) }],
];

(async () => {
  const srv = await serve(), browser = await launch(), log = [];
  const L = await open(browser, srv.url, "legacy"), N = await open(browser, srv.url, "new");
  // Neufassung: mitzählen, welche Aktionen (frühere Inline-Handler) ausgelöst werden
  await N.page.evaluate(() => { const A = window.__q.get("ACTIONS"); window.__used = new Set(); for (const k of Object.keys(A)) { const f = A[k]; A[k] = el => { window.__used.add(k); return f(el) } } });
  const envs = [L, N].map(x => ({ dir: fs.mkdtempSync(path.join(os.tmpdir(), "quormel-" + x.which + "-")) }));
  for (const [name, act, opt = {}] of STEPS) {
    const res = [];
    try {
      for (const [i, x] of [L, N].entries()) {
        await act(x.page, envs[i]); await frames(x.page);
        res.push({ snap: opt.nosnap ? null : await snapshot(x.page, opt.canv), extra: opt.extra ? await opt.extra(x.page, envs[i]) : null });
      }
    } catch (e) { log.push({ name, ok: false, info: "Abbruch: " + String(e).split("\n")[0] }); break }
    const a = res[0], b = res[1]; let ok = true;
    if (!opt.nosnap) {
      ok = same(name, { ...a.snap, bilder: a.snap.bilder.map(sha) }, { ...b.snap, bilder: b.snap.bilder.map(sha) }, log);
      if (ok && opt.canv) log[log.length - 1].info += " · " + a.snap.bilder.length + " Bild(er) identisch";
    }
    if (opt.extra) same(name + " – Zusatzprüfung", a.extra, b.extra, log);
  }
  const act = await N.page.evaluate(() => [Object.keys(window.__q.get("ACTIONS")).sort(), [...window.__used].sort()]);
  same(`alle ${act[0].length} Aktionen wurden mindestens einmal ausgelöst`, act[0], act[1], log);
  same("keine Skriptfehler (Original)", [], L.errors, log); same("keine Skriptfehler (Neufassung)", [], N.errors, log);
  const ok = report("Oberflächentest (Original gegen Neufassung)", log);
  await browser.close(); srv.close(); process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2) });
