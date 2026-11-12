// Erweiterter Regressionstest (Phase 5): Bereiche, die Lern- und Oberflächentest nicht oder nur am Rand abdecken.
// Jedes Szenario läuft im Original und in der Neufassung; die Ergebnisse müssen zeichengleich sein.
const { serve, launch, open, same, report } = require("./helpers.cjs");

const strip = h => typeof h === "string" ? h.replace(/ (on(click|input|change)|data-(click|input|change|arg))="[^"]*"/g, "") : h;
const norm = o => JSON.parse(JSON.stringify(o), (k, v) => typeof v === "string" && v.includes("<") ? strip(v) : v);

const S = {
  // Training bis zum Ende (wie im Vergleichstest), optional mit eigener Episodenzahl
  train: ({ track, episodes, seed }) => {
    const q = window.__q, { f } = q; q.seed(seed); const t = q.get("PRE")[track]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim(); f.$("pn").value = String(episodes); f.startTraining();
    while (q.get("st") === "training") f.trainStep();
    return { save: localStorage.getItem("q1save"), eps: q.get("P").eps_, kp: f.$("kp").innerHTML, agg: q.get("agg"), hist: q.get("hist").length, fails: q.get("fails").length };
  },
  // Rennen mit künstlicher Uhr und festem Fahrprogramm; Tasten werden als echte Tastaturereignisse ausgelöst
  race: ({ keys, slow }) => {
    const q = window.__q, { f } = q; let now = performance.now(); performance.now = () => now;
    const NAME = keys === "arrows" ? { up: "ArrowUp", dn: "ArrowDown", l: "ArrowLeft", r: "ArrowRight" } : { up: "w", dn: "s", l: "a", r: "d" }, held = {};
    const press = (k, on) => { if (!!held[k] === on) return; held[k] = on; window.dispatchEvent(new KeyboardEvent(on ? "keydown" : "keyup", { key: NAME[k], bubbles: true })) };
    f.$("bRace").click(); const info = f.$("rinfo").textContent, hint0 = f.$("rh").textContent; f.$("rGo").click(); now += 2800; f.raceTick();
    const T = q.get("T"), n = T.p.length, trace = []; let ticks = 0, R = q.get("R"); const st0 = R.s;
    while (R.s === "run" && ticks < 6000) {
      const c = R.car, g = T.p[Math.min(n - 1, c.i + 9)]; let d = Math.atan2(g.y - c.y, g.x - c.x) - c.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      press("l", d < -0.06); press("r", d > 0.06); const gas = Math.abs(d) < 0.5 ? c.v < (slow ? 1.6 : 9) : c.v < 1.2; press("up", gas); press("dn", !gas && Math.abs(d) >= 0.5 && c.v > 1.6);
      now += 50; f.raceTick(); R = q.get("R"); if (ticks++ % 20 === 0) trace.push([c.x, c.y, c.a, c.v, c.i, R.steps, R.viol]);
    }
    for (const k in held) press(k, false); f.raceTick();
    return { info, hint0, st0, ticks, trace, end: [R.s, R.steps, R.viol, R.msg, R.lines], rs: f.$("rs").innerHTML, hud: [f.$("hT").textContent, f.$("hK").textContent], pb: localStorage.getItem(f.pbKey()), keys: Object.keys(localStorage).filter(k => k.startsWith("q1pb")).sort() };
  },
  records: () => { const q = window.__q, { f } = q; localStorage.setItem("q1pb|Eigene Strecke", "12.3"); const pts = []; for (let i = 0; i < 80; i++)pts.push({ x: 120 + i * 9, y: 300 + 80 * Math.sin(i / 12) }); f.setTrack("Eigene Strecke", 70, pts); return { get: f.pbGet(), legacy: f.pbLegacy(), key: f.pbKey(), ids: f.presetIds() } },
  // sehr alter Speicherstand: ohne Strecken-ID, Lernlogik-Version, Langzeitstatistik, Fehlversuche
  oldSave: ({ raw }) => {
    const q = window.__q, { f } = q; q.seed(42); const d = JSON.parse(raw); for (const k of ["tid", "mv", "agg", "aggStart", "aggCur", "fails", "okSteps"]) delete d[k];
    const asked = f.loadSave(f.readSave(JSON.stringify(d)), true), dialog = getComputedStyle(f.$("mv")).display; f.$("mvOk").click();
    const st = { asked, dialog, page: q.get("page"), tid: q.get("T").id, isPreset: Object.values(f.presetIds()).includes(q.get("T").id), mv: q.get("saveMV"), agg: q.get("agg"), aggStart: q.get("aggStart"), aggCur: q.get("aggCur"), fails: q.get("fails"), recent: q.get("recent"), st: q.get("st"), kp: f.$("kp").innerHTML };
    f.$("bMore").click(); f.$("mx").value = "100"; f.$("mOk").click(); while (q.get("st") === "training") f.trainStep();
    return { st, save: localStorage.getItem("q1save") };
  },
  // Prüfung beschädigter Speicherstände
  saveMatrix: ({ raw }) => {
    const { f } = window.__q, mk = fn => { const d = JSON.parse(raw); fn(d); return JSON.stringify(d) };
    const cases = { gueltig: raw, "kein JSON": "{kaputt", leer: "", "null": "null", "falsche Version": mk(d => d.v = 2), "Name fehlt": mk(d => delete d.tn), "Breite 0": mk(d => d.w = 0), "Strecke zu kurz": mk(d => d.p = [[1, 2]]), "Streckenpunkt ungültig": mk(d => d.p[3] = [1, "x"]),
      "Parameter fehlt": mk(d => delete d.P.g), "Parameter keine Zahl": mk(d => d.P.a = "0.1"), "Q-Tabelle ist Liste": mk(d => d.q = []), "Q-Zeile zu kurz": mk(d => d.q[Object.keys(d.q)[0]] = [1, 2, 3]), "Q-Wert null": mk(d => d.q[Object.keys(d.q)[0]][2] = null),
      "Episoden negativ": mk(d => d.epN = -1), "Episoden Kommazahl": mk(d => d.epN = 1.5), "Verlauf fehlt": mk(d => delete d.hist), "beste Fahrt ohne Daten": mk(d => d.best = { steps: 10, rec: [] }), "Fehlversuche kein Array": mk(d => d.fails = {}), "ohne beste Fahrt": mk(d => d.best = null) };
    return Object.fromEntries(Object.entries(cases).map(([k, v]) => [k, !!f.readSave(v)]));
  },
  // Speicher voll: Schreiben schlägt fehl, Training läuft weiter, letzter guter Stand bleibt
  quota: () => {
    const q = window.__q, { f } = q; q.seed(8); const t = q.get("PRE")[0]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim(); f.$("pn").value = "100"; f.startTraining();
    while (q.get("epN") < 50) f.trainStep(); const good = localStorage.getItem("q1save"), orig = Storage.prototype.setItem; let blocked = 0;
    Storage.prototype.setItem = function (k, v) { if (k === "q1save") { blocked++; throw new DOMException("voll", "QuotaExceededError") } return orig.call(this, k, v) };
    let err = null, toast = ""; try { while (q.get("st") === "training") { f.trainStep(); if (blocked && !toast) toast = f.$("toast").textContent } } catch (e) { err = String(e) } Storage.prototype.setItem = orig;
    return { err, blocked: blocked > 0, kept: localStorage.getItem("q1save") === good, toast, endToast: f.$("toast").textContent, st: q.get("st"), epN: q.get("epN"), Q: [...q.get("Q")].sort((a, b) => a[0] < b[0] ? -1 : 1), cont: f.$("bCont").disabled };
  },
  // ungültiger Zahlenwert mitten im Training: kontrollierter Abbruch, Q-Tabelle unverändert
  abort: () => {
    const q = window.__q, { f } = q; q.seed(9); const t = q.get("PRE")[0]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim(); f.$("pn").value = "100"; f.startTraining();
    while (q.get("epN") < 20) f.trainStep(); const car = () => { const c = q.get("c"); return [c.x, c.y, c.a, c.i, c.steps] }, rows = new Map([...q.get("Q")].map(([k, v]) => [k, v.slice()])), car0 = car(), ep0 = q.get("epN"), save0 = localStorage.getItem("q1save");
    q.get("P").rp = NaN; f.trainStep(); const st = q.get("st"), toast = f.$("toast").textContent, btn = f.$("bPause").textContent, Q1 = [...q.get("Q")];
    // vorhandene Zeilen unverändert; neu angelegte Zeilen dürfen nur Nullen enthalten (eine noch nie besuchte Zeile ist gleichbedeutend mit Nullen)
    const unchanged = Q1.every(([k, v]) => rows.has(k) ? JSON.stringify(v) === JSON.stringify(rows.get(k)) : v.every(x => x === 0)) && Q1.length - rows.size <= 1 && JSON.stringify(car()) === JSON.stringify(car0) && q.get("epN") === ep0 && localStorage.getItem("q1save") === save0;
    q.get("P").rp = 1; f.$("bPause").click(); const st2 = q.get("st"); f.trainStep(); f.trainStep();
    return { unchanged, newRows: Q1.length - rows.size, st, toast, btn, st2, steps: q.get("c").steps > 0, Q1 };
  },
  // Tastaturzustand: Groß-/Kleinschreibung, Pfeiltasten, Zurücksetzen bei Fokusverlust
  keyboard: () => {
    const k = () => { const o = window.__q.get("keys"); return Object.keys(o).filter(x => o[x]).sort() }, ev = (t, key) => window.dispatchEvent(new KeyboardEvent(t, { key, bubbles: true })), out = [];
    ev("keydown", "W"); ev("keydown", "ArrowLeft"); ev("keydown", "d"); out.push(k()); ev("keyup", "w"); out.push(k()); window.dispatchEvent(new Event("blur")); out.push(k());
    ev("keydown", "a"); document.dispatchEvent(new Event("visibilitychange")); out.push(k()); return out;
  },
  // Streckeneditor: Prüfregeln (zu wenig, zu kurz, Überschneidung, enge Kurve, gültig)
  editor: ({ kind }) => {
    const q = window.__q, { f } = q; f.$("drawblk").click(); const P = []; const add = (x, y) => P.push({ x, y });
    if (kind === "wenige Punkte") for (let i = 0; i < 6; i++)add(300 + i * 4, 400);
    if (kind === "zu kurz") for (let i = 0; i < 30; i++)add(300 + i * 5, 400);
    if (kind === "Überschneidung") for (let i = 0; i <= 120; i++) { const t = i / 120 * 2 * Math.PI; add(640 + 260 * Math.sin(t), 400 + 150 * Math.sin(2 * t)) }
    if (kind === "enge Kurve") { for (let i = 0; i < 50; i++)add(250 + i * 8, 500); for (let i = 1; i <= 22; i++) { const a = Math.PI / 2 - i / 22 * Math.PI; add(650 + 36 * Math.cos(a), 464 + 36 * Math.sin(a)) } for (let i = 1; i < 50; i++)add(650 - i * 8, 428) }
    if (kind === "außerhalb des Zeichenbereichs") for (let i = 0; i <= 80; i++)add(40 + i * 14, 6);
    if (kind === "gültig") for (let i = 0; i <= 80; i++) { const t = i / 80; add(200 + 880 * t, 600 - 330 * Math.sin(t * Math.PI)) }
    q.set("ep", P); f.$("ew").value = "60"; f.edFinish(); const page = q.get("page"), T = q.get("T");
    const r = { toast: f.$("toast").textContent, edOpen: getComputedStyle(f.$("ed")).display, page, track: page === "sim" && T ? [T.name, T.w, T.id, T.p.length] : null }; if (r.edOpen !== "none") f.edClose(); return r;
  },
  // Glücksrad: für jeden Parameter Titel und Wertevorrat (mit festem Zufall)
  wheel: () => { const q = window.__q, { f } = q; q.seed(3); const t = q.get("PRE")[0]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim(); return [...document.querySelectorAll(".wb")].map(b => { b.click(); const r = [f.$("wt").textContent, q.get("wv"), f.$("wOk").disabled, getComputedStyle(f.$("wm")).display]; f.wClose(); return r }) },
  // Parameter-Labor: alle acht Parameter, je zwei Werte
  lab: () => {
    const q = window.__q, { f } = q, out = {}; const t = q.get("PRE")[0]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim(); const tid = q.get("T").id;
    for (const p of q.get("LPAR")) for (const pos of [0.2, 0.85]) { q.seed(17); f.labEnter(p.id); const sl = f.$("ls"), v = +sl.min + (+sl.max - +sl.min) * pos; sl.value = String(v); sl.dispatchEvent(new Event("input"));
      for (let i = 0; i < 2500; i++)f.trainStep(); f.labUI(); out[p.id + "@" + sl.value] = { Q: [...q.get("Q")], P: q.get("P"), epN: q.get("epN"), ok: q.get("ok"), lk: f.$("lk").innerHTML, lq: f.$("lq").innerHTML, lv: f.$("lv") ? f.$("lv").textContent : null }; f.labExit() }
    return { out, back: [q.get("T").id === tid, q.get("LAB"), q.get("page")] };
  },
  // KI gegen KI: jeder der acht Parameter mit den vorgeschlagenen Werten
  duel: ({ mode }) => {
    const q = window.__q, { f } = q, out = []; const t = q.get("PRE")[0]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim(); f.$("sim").querySelector(".row > button").click();
    const n = f.$("kg").children.length;
    for (let i = 0; i < n; i++) { q.seed(100 + i); f.$("kOpen").click(); f.$("kg").children[i].click(); f.$("kSug").click(); f.$("ks").value = "lab"; f.$("kn").value = "100"; f.$("kr").value = mode; f.$("kGo").click(); const D = q.get("DU");
      if (!D) { out.push({ fehler: f.$("toast").textContent }); continue }
      while (!D.done) { f.duStep("A"); f.duStep("B"); if (D.A.ctx.epN >= D.n && D.B.ctx.epN >= D.n) f.djFinish() }
      const side = s => { const x = D[s].ctx; return [[...x.Q], x.epN, x.ok, x.sumRew, x.P, D[s].first] }; out.push({ t: f.$("jt").textContent, a: [f.$("ka").value, f.$("kb").value], A: side("A"), B: side("B"), jr: f.$("jr").innerHTML, seeds: D.seeds }); f.djExit() }
    return { n, out };
  },
};

(async () => {
  const srv = await serve(), browser = await launch(), log = [];
  const both = async (name, pages, sc, argL, argN) => { const r = []; for (const [i, p] of pages.entries()) r.push(await p.page.evaluate(`(${S[sc].toString()})(${JSON.stringify((i ? (argN === undefined ? argL : argN) : argL) || {})})`)); same(name, norm(r[0]), norm(r[1]), log); return r };
  const fresh = async () => [await open(browser, srv.url, "legacy"), await open(browser, srv.url, "new")];
  const done = async ps => { for (const p of ps) { same(`keine Skriptfehler (${p.which === "legacy" ? "Original" : "Neufassung"})`, [], p.errors, log); await p.ctx.close() } };
  const check = (name, cond, info) => log.push({ name, ok: !!cond, info: cond ? "ok" : String(info) });

  // 1) Langlauf
  { const ps = await fresh(); const r = await both("Langlauf: Vorlage 1, 5000 Episoden, Seed 77 (Speicherstand, Langzeitstatistik, Kennzahlen)", ps, "train", { track: 0, episodes: 5000, seed: 77 });
    check("Langlauf: Langzeitstatistik hat 50 Blöcke, Detailverlauf ist begrenzt", r[1].agg.length === 50 && r[1].hist <= 4000, `${r[1].agg.length} Blöcke, ${r[1].hist} Einträge`); await done(ps) }
  // 2) Mehrere Seeds
  for (const seed of [11, 222, 3333]) { const ps = await fresh(); await both(`Vorlage 2, 500 Episoden, Seed ${seed}`, ps, "train", { track: 1, episodes: 500, seed }); await done(ps) }
  // 3) Rennen, Bestzeiten
  { const ps = await fresh(); await both("Vorbereitung Rennen: Vorlage 1, 500 Episoden", ps, "train", { track: 0, episodes: 500, seed: 5 });
    for (const p of ps) await p.page.evaluate(() => localStorage.setItem("q1pb|" + window.__q.get("T").name, "99.5"));
    const r1 = await both("Rennen 1 (W/A/S/D): Fahrverlauf, Ergebnis, alter namensbasierter Rekord wird übernommen und unterboten", ps, "race", { keys: "wasd" });
    check("Rennen 1: Ziel erreicht, Rekord gespeichert, alter Rekord angezeigt", r1[1].end[0] === "done" && /Deine Zeit: \d/.test(r1[1].end[4][1]) && r1[1].pb !== null && +r1[1].pb < 99.5 && /Dein Rekord 99\.50 s/.test(r1[1].info), JSON.stringify([r1[1].end, r1[1].pb, r1[1].info]));
    const r2 = await both("Rennen 2 (Pfeiltasten, langsamer): Rekord bleibt bestehen", ps, "race", { keys: "arrows", slow: true });
    check("Rennen 2: Ziel erreicht, langsamer, Rekord unverändert", r2[1].end[0] === "done" && r2[1].end[1] > r1[1].end[1] && r2[1].pb === r1[1].pb, JSON.stringify([r2[1].end[1], r1[1].end[1], r2[1].pb]));
    await both("Bestzeiten: eigene Strecke mit älterem namensbasiertem Rekord", ps, "records"); await done(ps) }
  // 4) Speicherstände
  { const ps = await fresh(); const r = await both("Vorbereitung Speicherstand: Vorlage 2, 500 Episoden", ps, "train", { track: 1, episodes: 500, seed: 6 }); const raw = r[1].save; await done(ps);
    const qs = await fresh(); const o = await both("Sehr alter Speicherstand (ohne Strecken-ID, Lernlogik-Version, Statistik): Hinweis, Laden, Vorlage erkannt, +100 Episoden", qs, "oldSave", { raw });
    check("Alter Stand: Hinweis auf ältere Lernlogik erscheint, Vorlage wird erkannt", o[1].st.asked === false && o[1].st.dialog !== "none" && o[1].st.isPreset && o[1].st.mv === 1 && o[1].st.page === "sim", JSON.stringify([o[1].st.asked, o[1].st.dialog, o[1].st.isPreset, o[1].st.mv]));
    const m = await both("Beschädigte Speicherstände: 20 Fälle werden gleich beurteilt", qs, "saveMatrix", { raw }); const ok = Object.entries(m[1]).filter(e => e[1]).map(e => e[0]);
    check("Beschädigte Speicherstände: nur „gültig“ und „ohne beste Fahrt“ werden angenommen", JSON.stringify(ok) === JSON.stringify(["gueltig", "ohne beste Fahrt"]), ok.join()); await done(qs) }
  // 5) Fehlerfälle
  { const ps = await fresh(); const r = await both("Speicher voll: kein Absturz, Hinweis, letzter guter Stand bleibt, Training läuft weiter", ps, "quota");
    check("Speicher voll: Training endet regulär, alter Stand unversehrt", r[1].err === null && r[1].blocked && r[1].kept && r[1].st === "done" && r[1].epN === 100 && /Speichern fehlgeschlagen/.test(r[1].toast), JSON.stringify([r[1].err, r[1].kept, r[1].st, r[1].toast])); await done(ps) }
  { const ps = await fresh(); const r = await both("Ungültiger Zahlenwert im Training: kontrollierter Abbruch, danach Fortsetzen", ps, "abort");
    check("Abbruch: Q-Tabelle und Speicherstand unverändert, Training pausiert und fortsetzbar", r[1].unchanged && r[1].st === "paused" && /Training pausiert/.test(r[1].toast) && r[1].st2 === "training" && r[1].steps, JSON.stringify(r[1])); await done(ps) }
  // 6) Tastatur, Editor, Glücksrad
  { const ps = await fresh(); const r = await both("Tastatur: Großbuchstaben, Pfeiltasten, Loslassen, Zurücksetzen bei Fokusverlust", ps, "keyboard");
    check("Tastatur: erwartete Tastenzustände", JSON.stringify(r[1]) === JSON.stringify([["arrowleft", "d", "w"], ["arrowleft", "d"], [], []]), JSON.stringify(r[1]));
    for (const kind of ["wenige Punkte", "zu kurz", "außerhalb des Zeichenbereichs", "Überschneidung", "enge Kurve", "gültig"]) { const e = await both(`Editor-Prüfregel: ${kind}`, ps, "editor", { kind }); log[log.length - 1].info += " · " + (e[1].track ? "übernommen" : "„" + e[1].toast + "“") }
    const w = await both("Glücksrad: Titel und Wertevorrat für alle Parameter", ps, "wheel"); check("Glücksrad: zehn Parameter, je acht Werte", w[1].length === 10 && w[1].every(x => x[1].length === 8 && x[3] === "flex"), w[1].length); await done(ps) }
  // 7) Lernmodule vollständig
  { const ps = await fresh(); const l = await both("Parameter-Labor: alle acht Parameter mit je zwei Werten, 2500 Lernschritte", ps, "lab"); check("Parameter-Labor: 16 Läufe, Rückkehr zum Trainingsstand", Object.keys(l[1].out).length === 16 && l[1].back[0] && !l[1].back[1], JSON.stringify(l[1].back)); await done(ps) }
  for (const mode of ["same", "diff"]) { const ps = await fresh(); const d = await both(`KI gegen KI: alle acht Parameter, vorgeschlagene Werte, 100 Episoden, ${mode === "same" ? "gleiche" : "unterschiedliche"} Zufallsbasis`, ps, "duel", { mode });
    check(`KI gegen KI (${mode === "same" ? "gleich" : "unterschiedlich"}): acht Duelle beendet`, d[1].n === 8 && d[1].out.every(x => !x.fehler && x.A[1] === 100 && x.B[1] === 100), JSON.stringify(d[1].out.map(x => x.fehler || x.A[1]))); await done(ps) }

  const good = report("Erweiterter Regressionstest (Original gegen Neufassung)", log); await browser.close(); srv.close(); process.exit(good ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2) });
