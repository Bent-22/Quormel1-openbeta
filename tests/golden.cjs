// Vergleichstest: Die Neufassung muss mit demselben Zufalls-Seed exakt dieselben Lernergebnisse liefern wie die Originaldatei.
const { serve, launch, open, same, report } = require("./helpers.cjs");

// Szenarien laufen im Browser; q = window.__q (einheitlicher Zugriff auf beide Fassungen)
const scenarios = {
  // Training auf einer Vorlage mit Standardwerten, synchron bis zum Ende
  train: ({ track, episodes, seed, params }) => {
    const q = window.__q, { f } = q; q.seed(seed);
    const t = q.get("PRE")[track]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim();
    f.$("pn").value = String(episodes); for (const k in (params || {})) f.$(k).value = params[k];
    f.startTraining(); let steps = 0; const t0 = performance.now();
    while (q.get("st") === "training") { f.trainStep(); steps++ }
    const ms = performance.now() - t0, P = q.get("P");
    return { cmp: { save: localStorage.getItem("q1save"), eps: P.eps_, last: q.get("last"), logs: q.get("logs"), recent: q.get("recent"), st: q.get("st"), steps, tid: q.get("T").id, kp: f.$("kp").innerHTML }, perf: steps / ms * 1000 };
  },
  // Weitertrainieren über den Dialog
  more: ({ extra }) => {
    const q = window.__q, { f } = q; f.$("bMore").click(); f.$("mx").value = String(extra); f.$("mOk").click();
    while (q.get("st") === "training") f.trainStep();
    return { cmp: { save: localStorage.getItem("q1save"), eps: q.get("P").eps_, epN: q.get("epN") } };
  },
  // Fremden Speicherstand laden und weitertrainieren
  loadAndMore: ({ raw, extra }) => {
    const q = window.__q, { f } = q; q.seed(99); const d = f.readSave(raw); if (!d) return { cmp: "Speicherstand abgelehnt" };
    const okLoad = f.loadSave(d, true); f.$("bMore").click(); f.$("mx").value = String(extra); f.$("mOk").click();
    while (q.get("st") === "training") f.trainStep();
    return { cmp: { okLoad, save: localStorage.getItem("q1save"), eps: q.get("P").eps_, epN: q.get("epN") } };
  },
  // Parameter-Labor: eigener Lernstand, danach muss der vorherige Zustand wiederhergestellt sein
  lab: ({ id, value, steps }) => {
    const q = window.__q, { f } = q; q.seed(7); const before = { epN: q.get("epN"), ok: q.get("ok"), qs: q.get("Q").size, tid: q.get("T").id, st: q.get("st") };
    f.labEnter(id); const sl = f.$("ls"); sl.value = String(value); sl.dispatchEvent(new Event("input"));
    for (let i = 0; i < steps; i++)f.trainStep(); f.labUI();
    const lab = { Q: [...q.get("Q")], epN: q.get("epN"), ok: q.get("ok"), fail: q.get("fail"), eps: q.get("P").eps_, P: q.get("P"), lk: f.$("lk").innerHTML, lq: f.$("lq").innerHTML, tid: q.get("T").id };
    f.labExit(); const after = { epN: q.get("epN"), ok: q.get("ok"), qs: q.get("Q").size, tid: q.get("T").id, st: q.get("st") };
    return { cmp: { before, lab, after, save: localStorage.getItem("q1save") } };
  },
  // KI gegen KI: Start über den Dialog, Schritte wie in djTick, danach Auswertung und Rückkehr
  duel: ({ param, a, b, track, episodes, mode, seed }) => {
    const q = window.__q, { f } = q; q.seed(seed); const before = { epN: q.get("epN"), tid: q.get("T") && q.get("T").id };
    f.$("kOpen").click(); f.$("kg").children[param].click(); f.$("ka").value = String(a); f.$("kb").value = String(b);
    f.$("ks").value = String(track); f.$("kn").value = String(episodes); f.$("kr").value = mode; f.$("kGo").click();
    let DU = q.get("DU");
    while (!DU.done) { f.duStep("A"); f.duStep("B"); if (DU.A.ctx.epN >= DU.n && DU.B.ctx.epN >= DU.n) f.djFinish() }
    const side = s => { const x = DU[s].ctx; return { Q: [...x.Q], epN: x.epN, ok: x.ok, fail: x.fail, sumRew: x.sumRew, sumSteps: x.sumSteps, best: x.best, eps: x.P.eps_, first: DU[s].first, qh: DU[s].qh } };
    const res = { seeds: DU.seeds, A: side("A"), B: side("B"), jr: f.$("jr").innerHTML, jt: f.$("jt").textContent };
    f.djExit(); const after = { epN: q.get("epN"), tid: q.get("T") && q.get("T").id, lab: q.get("LAB"), du: q.get("DU") };
    return { cmp: { before, res, after } };
  },
};
const strip = h => typeof h === "string" ? h.replace(/ (on(click|input|change)|data-(click|input|change|arg))="[^"]*"/g, "") : h;
const norm = o => JSON.parse(JSON.stringify(o), (k, v) => (k === "jr" || k === "kp" || k === "lk" || k === "lq") ? strip(v) : v);

(async () => {
  const srv = await serve(), browser = await launch(), log = [], perf = [];
  const run = async (name, pages, sc, arg) => {
    const r = []; for (const p of pages) r.push(await p.page.evaluate(`(${scenarios[sc].toString()})(${JSON.stringify(arg)})`));
    same(name, norm(r[0].cmp), norm(r[1].cmp), log); if (r[0].perf) perf.push([name, r[0].perf, r[1].perf]); return r;
  };
  const fresh = async () => [await open(browser, srv.url, "legacy"), await open(browser, srv.url, "new")];
  const done = async ps => { for (const p of ps) { same(`keine Skriptfehler (${p.which === "legacy" ? "Original" : "Neufassung"})`, [], p.errors, log); await p.ctx.close() } };

  // 1) Training auf allen drei Vorlagen, danach Weitertrainieren
  for (const [track, episodes, seed] of [[0, 500, 1], [1, 500, 2], [2, 500, 3]]) {
    const ps = await fresh();
    await run(`Training Vorlage ${track + 1}, ${episodes} Episoden, Seed ${seed}`, ps, "train", { track, episodes, seed });
    await run(`Weitertrainieren +500 (Vorlage ${track + 1})`, ps, "more", { extra: 500 });
    await done(ps);
  }
  // 2) Geänderte Parameter und Reward-Gewichte
  { const ps = await fresh(); await run("Training mit geänderten Parametern (α 0,3 · γ 0,8 · ε 0,6 · Abnahme 0,98 · Rewards geändert)", ps, "train", { track: 0, episodes: 1000, seed: 11, params: { pa: ".3", pg: ".8", pe: ".6", pd: ".98", rg: "150", rc: "60", rp: "2", ri: "1", rd: ".2" } }); await done(ps) }
  // 3) Speicherstände über Kreuz laden und weitertrainieren
  {
    const ps = await fresh(); const r = await run("Training für Speicherstand-Tausch (Vorlage 2, 100 Episoden)", ps, "train", { track: 1, episodes: 100, seed: 5 });
    const rawL = r[0].cmp.save, rawN = r[1].cmp.save; await done(ps);
    const qs = await fresh();
    const x = [await qs[0].page.evaluate(`(${scenarios.loadAndMore.toString()})(${JSON.stringify({ raw: rawN, extra: 100 })})`), await qs[1].page.evaluate(`(${scenarios.loadAndMore.toString()})(${JSON.stringify({ raw: rawL, extra: 100 })})`)];
    same("Original lädt Stand der Neufassung / Neufassung lädt Stand des Originals, +100 Episoden", x[0].cmp, x[1].cmp, log);
    same("Geladener Stand wurde akzeptiert", true, x[0].cmp.okLoad === true && x[1].cmp.okLoad === true, log); await done(qs);
  }
  // 4) Parameter-Labor (aus laufendem Trainingsstand heraus) und Duell
  {
    const ps = await fresh(); await run("Vorbereitung: Training Vorlage 1, 100 Episoden", ps, "train", { track: 0, episodes: 100, seed: 4 });
    await run("Parameter-Labor γ = 0,5 · 4000 Lernschritte · Zustand danach wiederhergestellt", ps, "lab", { id: "g", value: .5, steps: 4000 });
    await run("Parameter-Labor ε-Abnahme = 0,9 · 4000 Lernschritte", ps, "lab", { id: "d", value: .9, steps: 4000 });
    await run("Duell α 0,1 gegen 0,8 · S-Kurve · 100 Episoden · gleiche Zufallsbasis", ps, "duel", { param: 0, a: .1, b: .8, track: "lab", episodes: 100, mode: "same", seed: 21 });
    await run("Duell γ 0,5 gegen 0,95 · Vorlage 1 · 100 Episoden · unterschiedliche Zufallsbasis", ps, "duel", { param: 1, a: .5, b: .95, track: 0, episodes: 100, mode: "diff", seed: 22 });
    await done(ps);
  }
  const ok = report("Vergleichstest Lernlogik (Original gegen Neufassung)", log);
  console.log("\nLerntempo im Test (Lernschritte pro Sekunde, synchron):"); for (const [n, a, b] of perf) console.log(`  ${n}: Original ${Math.round(a)} · Neufassung ${Math.round(b)} · Verhältnis ${(b / a).toFixed(2)}`);
  await browser.close(); srv.close(); process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2) });
