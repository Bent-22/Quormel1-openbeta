// Rechenprüfung der Q-Learning-Logik gegen eine unabhängige Referenz.
// Die Referenz unten ist eine eigenständige, ausgeschriebene Umsetzung des Verfahrens (Sensoren, Zustand, ε-greedy, Bewegung, Reward, Q-Update,
// Abbruchregeln). Sie teilt keinen Code mit der Anwendung. Original und Neufassung müssen mit ihr Zahl für Zahl übereinstimmen.
const { serve, launch, open, report } = require("./helpers.cjs");

// ---------- Referenz (läuft im Browser, damit sie dieselbe Straßenmaske und dieselbe Strecke verwendet) ----------
const REFERENCE = `(function(){
  const WORLD_W = 1000, WORLD_H = 640, SPEED = 3, REACH = 120, RAY_STEP = 3;
  const TURNS = [-0.09, -0.045, 0, 0.045, 0.09], RAYS = [-90, -45, 0, 45, 90];
  const make = (track, mask, params) => {
    const pts = track.p, last = pts.length - 1, halfWidth = track.w / 2;
    const onRoad = (x, y) => x >= 0 && y >= 0 && x < WORLD_W && y < WORLD_H && mask[Math.trunc(y) * WORLD_W + Math.trunc(x)] === 1;
    const ray = (car, deg) => { const ang = car.a + deg * Math.PI / 180; let d = 0; while (d < REACH && onRoad(car.x + Math.cos(ang) * d, car.y + Math.sin(ang) * d)) d += RAY_STEP; return d };
    const distClass = d => d < 35 ? 0 : d < 70 ? 1 : 2;
    const stateOf = car => {
      const goal = pts[last]; let rel = Math.atan2(goal.y - car.y, goal.x - car.x) - car.a;
      while (rel > Math.PI) rel -= 2 * Math.PI; while (rel < -Math.PI) rel += 2 * Math.PI;
      const goalClass = rel < -1 ? 0 : rel < -0.3 ? 1 : rel < 0.3 ? 2 : rel < 1 ? 3 : 4;
      return RAYS.map(deg => distClass(ray(car, deg))).join("") + "|" + goalClass;
    };
    const startCar = () => ({ x: pts[0].x, y: pts[0].y, a: Math.atan2(pts[3].y - pts[0].y, pts[3].x - pts[0].x), i: 0, steps: 0, bestIdx: 0, bestAt: 0 });
    // ein Schritt: Bewegung, Fortschritt, Reward, Ende
    const move = (car, action) => {
      car.a += TURNS[action]; car.x += Math.cos(car.a) * SPEED; car.y += Math.sin(car.a) * SPEED; car.steps++;
      const prev = car.i; let idx = prev, dist = 1e9;
      for (let i = Math.max(0, prev - 5); i <= Math.min(last, prev + 40); i++) { const d = Math.hypot(pts[i].x - car.x, pts[i].y - car.y); if (d < dist) { dist = d; idx = i } }
      car.i = idx; let out;
      if (!onRoad(car.x, car.y)) out = { reward: -params.rc, done: true, win: false };
      else if (idx >= last - 2) out = { reward: params.rg, done: true, win: true };
      else { let r = (idx - prev) * params.rp - 0.1 - params.rd * (dist / halfWidth); if (idx <= prev) r -= params.ri; out = { reward: r, done: false, win: false } }
      if (car.i > car.bestIdx) { car.bestIdx = car.i; car.bestAt = car.steps }
      if (!out.done && car.steps - car.bestAt >= 1500) out = { reward: -params.rc, done: true, win: false }; // Stillstand zählt wie ein Crash
      return out;
    };
    const stepLimit = Math.min(60000, Math.max(1500, Math.ceil(last * 5 / SPEED * 2.5)));
    return { stateOf, startCar, move, stepLimit, onRoad };
  };
  // vollständiges Training
  const train = (track, mask, params, seed, episodes) => {
    let a = seed; const random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
    const randInt = n => Math.floor(random() * n), env = make(track, mask, params), Q = new Map(), row = k => { if (!Q.has(k)) Q.set(k, [0, 0, 0, 0, 0]); return Q.get(k) };
    let eps = params.e, ok = 0, fail = 0, sumRew = 0, sumSteps = 0, best = null, maxIdx = 0;
    for (let ep = 0; ep < episodes; ep++) {
      const car = env.startCar(); let state = env.stateOf(car), epRew = 0;
      for (;;) {
        const values = row(state); let action;
        if (random() < eps) action = randInt(5);                                   // Exploration
        else { const top = Math.max(...values), ties = []; values.forEach((v, i) => { if (v === top) ties.push(i) }); action = ties[randInt(ties.length)] } // Exploitation, Gleichstand zufällig
        const res = env.move(car, action), next = env.stateOf(car), nextValues = row(next);
        const target = res.done ? res.reward : res.reward + params.g * Math.max(...nextValues); // Endzustand ohne Zukunftswert
        values[action] = values[action] + params.a * (target - values[action]);
        epRew += res.reward; maxIdx = Math.max(maxIdx, car.i); state = next;
        if (res.done || car.steps >= env.stepLimit) { res.win ? ok++ : fail++; sumRew += epRew; sumSteps += car.steps; if (res.win && (best === null || car.steps < best)) best = car.steps; break }
      }
      eps = Math.max(0.05, eps * params.d);
    }
    return { Q: [...Q].sort((x, y) => x[0] < y[0] ? -1 : 1), ok, fail, eps, sumRew, sumSteps, best, maxIdx, stepLimit: env.stepLimit };
  };
  return { make, train };
})()`;

// Training in der Anwendung mit demselben Seed; Ergebnis im selben Format wie die Referenz
const appTrain = ({ track, episodes, seed, params }) => {
  const q = window.__q, { f } = q, t = q.get("PRE")[track]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim();
  f.$("pn").value = String(episodes); for (const k in (params || {})) f.$(k).value = params[k];
  f.startTraining(); if (q.get("st") !== "training") return { error: "Training wurde nicht gestartet" };
  q.seed(seed); while (q.get("st") === "training") f.trainStep();
  const P = q.get("P"), best = q.get("best");
  const app = { Q: [...q.get("Q")].sort((x, y) => x[0] < y[0] ? -1 : 1), ok: q.get("ok"), fail: q.get("fail"), eps: P.eps_, sumRew: q.get("sumRew"), sumSteps: q.get("sumSteps"), best: best ? best.steps : null, maxIdx: q.get("maxIdx"), stepLimit: f.maxSteps() };
  const ref = REF.train(q.get("T"), q.get("mask"), P, seed, episodes);
  return { app, ref, states: app.Q.length, keysOk: app.Q.every(([k, v]) => /^[0-2]{5}\|[0-4]$/.test(k) && v.length === 5 && v.every(Number.isFinite)) };
};
// Einzelprüfungen mit von Hand nachvollziehbaren Zahlen
const unit = () => {
  const q = window.__q, { f } = q, out = {};
  out.constants = [q.get("W"), q.get("H"), q.get("V"), q.get("TURN"), q.get("ACT").length];
  out.bins = [0, 34, 34.999, 35, 69.999, 70, 120].map(f.binS);
  const t = q.get("PRE")[0]; f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); f.openSim();
  f.startTraining(); if (q.get("st") !== "training") return { error: "Training wurde nicht gestartet" };
  // Parameter direkt setzen (die Eingabefelder lassen so kleine Werte für die ε-Abnahme nicht zu): α 0,5 · γ 0,9 · ε 1 · Abnahme 0,5 · 6 Episoden
  Object.assign(q.get("P"), { a: 0.5, g: 0.9, e: 1, eps_: 1, d: 0.5, n: 6 });
  const T = q.get("T"), P = q.get("P"), env = REF.make(T, q.get("mask"), P), copy = c => ({ x: c.x, y: c.y, a: c.a, i: c.i, steps: c.steps, bestIdx: c.bi || 0, bestAt: c.bs || 0 });
  // Sensoren und Zustand am Start
  out.startState = [q.get("S"), env.stateOf(env.startCar())];
  // 1) normaler Schritt: Q(s,a) ← Q + α·(r + γ·max Q(s') − Q)
  { const c = copy(q.get("c")), s = q.get("S"), res = env.move(c, 2), s2 = env.stateOf(c); f.getQ(s).splice(0, 5, 1, 2, 3, 4, 5); if (s2 !== s) f.getQ(s2).splice(0, 5, 0, 10, 0, 0, 0);
    const nmax = Math.max(...f.getQ(s2)), expected = 3 + 0.5 * ((res.reward + 0.9 * nmax) - 3); q.set("FORCE", { ex: false, a: 2 }); f.trainStep();
    out.update = { done: res.done, reward: res.reward, nmax, expected, got: f.getQ(s)[2], untouched: f.getQ(s).filter((v, i) => i !== 2), s2: [q.get("S"), s2] } }
  // 2) Crash: Ziel = −Strafe, ohne Zukunftswert (die Folgewerte sind absichtlich riesig)
  { const car = q.get("c"), a0 = T.a0; car.x = T.p[5].x; car.y = T.p[5].y; car.a = a0 + Math.PI / 2; car.i = 5; car.steps = 0; car.bi = 5; car.bs = 0; let guard = 0;
    for (;;) { const probe = copy(car); if (env.move(probe, 2).done || ++guard > 200) break; car.x = probe.x; car.y = probe.y; car.a = probe.a; car.i = probe.i }
    q.set("S", f.keyOf(car)); const s = q.get("S"), c = copy(car), res = env.move(c, 2), s2 = env.stateOf(c); f.getQ(s2).splice(0, 5, 1e6, 1e6, 1e6, 1e6, 1e6); f.getQ(s).splice(0, 5, 7, 7, 7, 7, 7);
    const ep0 = q.get("epN"), fail0 = q.get("fail"), eps0 = P.eps_; q.set("FORCE", { ex: false, a: 2 }); f.trainStep();
    out.crash = { done: res.done, win: res.win, reward: res.reward, expected: 7 + 0.5 * (-P.rc - 7), got: f.getQ(s)[2], epN: q.get("epN") - ep0, fail: q.get("fail") - fail0, eps: [eps0, q.get("P").eps_] } }
  // 3) Ziel: Reward = Zielbelohnung, ohne Zukunftswert
  { const car = q.get("c"), n = T.p.length, k = n - 5; car.x = T.p[k].x; car.y = T.p[k].y; car.a = Math.atan2(T.p[k + 1].y - T.p[k].y, T.p[k + 1].x - T.p[k].x); car.i = k; car.steps = 10; car.bi = k; car.bs = 10;
    let guard = 0, res, s, c; for (;;) { c = copy(car); res = env.move(c, 2); if (res.done || ++guard > 20) break; car.x = c.x; car.y = c.y; car.a = c.a; car.i = c.i; car.steps = c.steps }
    q.set("S", f.keyOf(car)); s = q.get("S"); const s2 = env.stateOf(c); f.getQ(s2).splice(0, 5, 1e6, 1e6, 1e6, 1e6, 1e6); f.getQ(s).splice(0, 5, 0, 0, 0, 0, 0); const ok0 = q.get("ok"); q.set("FORCE", { ex: false, a: 2 }); f.trainStep();
    out.goal = { done: res.done, win: res.win, reward: res.reward, expected: 0 + 0.5 * (P.rg - 0), got: f.getQ(s)[2], ok: q.get("ok") - ok0, hasBest: !!q.get("best") } }
  // 4) ε-Abnahme mit Untergrenze 0,05: Start 1, Faktor 0,5 (ε nach jeder weiteren Episode)
  { const seq = [q.get("P").eps_]; let guard = 0; while (q.get("st") === "training" && ++guard < 5e5) { const e = q.get("epN"); f.trainStep(); if (q.get("epN") !== e) seq.push(q.get("P").eps_) } out.epsSeq = seq; out.st = q.get("st") }
  // 5) Schrittlimit je Vorlage: 2,5-fache Idealzeit, mindestens 1500, höchstens 60000
  out.limits = q.get("PRE").map(t => { f.setTrack(t.n, t.w, f.rs(f.cat(t.c), 5)); const n = q.get("T").p.length; return [f.maxSteps(), Math.min(60000, Math.max(1500, Math.ceil((n - 1) * 5 / 3 * 2.5)))] });
  return out;
};

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
(async () => {
  const srv = await serve(), browser = await launch(), log = [], ok = (n, c, info) => log.push({ name: n, ok: !!c, info: c ? (info === undefined ? "ok" : String(info)) : String(info) });
  const RUNS = [
    ["Vorlage 1, Standardwerte, 500 Episoden, Seed 101", { track: 0, episodes: 500, seed: 101 }],
    ["Vorlage 2, Standardwerte, 500 Episoden, Seed 202", { track: 1, episodes: 500, seed: 202 }],
    ["Vorlage 3, Standardwerte, 500 Episoden, Seed 303", { track: 2, episodes: 500, seed: 303 }],
    ["Vorlage 1, α 0,4 · γ 0,7 · ε 0,5 · Abnahme 0,97 · Rewards geändert, 1000 Episoden, Seed 404", { track: 0, episodes: 1000, seed: 404, params: { pa: ".4", pg: ".7", pe: ".5", pd: ".97", rg: "250", rc: "40", rp: "3", ri: ".8", rd: ".4" } }],
  ];
  for (const which of ["legacy", "new"]) {
    const label = which === "legacy" ? "Original" : "Neufassung";
    for (const [name, arg] of RUNS) {
      const P = await open(browser, srv.url, which); await P.page.evaluate(`window.REF = ${REFERENCE}`);
      const r = await P.page.evaluate(`(${appTrain.toString()})(${JSON.stringify(arg)})`);
      if (r.error) { ok(`${label} = Referenz: ${name}`, false, r.error); await P.ctx.close(); continue }
      const same = eq(r.app, r.ref); let info = `${r.states} Zustände, ${r.app.ok} Erfolge, ε ${r.app.eps}`;
      if (!same) { const d = Object.keys(r.app).filter(k => !eq(r.app[k], r.ref[k])); info = "Abweichung bei: " + d.join(", ") + " · Anwendung " + JSON.stringify(d.map(k => k === "Q" ? "…" : r.app[k])) + " · Referenz " + JSON.stringify(d.map(k => k === "Q" ? "…" : r.ref[k])) }
      ok(`${label} = Referenz: ${name}`, same, info);
      ok(`${label}: Zustandsschlüssel gültig, höchstens 1215 Zustände (${name.split(",")[0]})`, r.keysOk && r.states <= 1215, r.states);
      await P.ctx.close();
    }
    const P = await open(browser, srv.url, which); await P.page.evaluate(`window.REF = ${REFERENCE}`); const u = await P.page.evaluate(`(${unit.toString()})()`);
    if (u.error) { ok(`${label}: Einzelprüfungen`, false, u.error); await P.ctx.close(); continue }
    ok(`${label}: Konstanten (Welt 1000 × 640, Tempo 3, fünf Lenkwinkel)`, eq(u.constants, [1000, 640, 3, [-0.09, -0.045, 0, 0.045, 0.09], 5]), JSON.stringify(u.constants));
    ok(`${label}: Sensorklassen (< 35 nah, < 70 mittel, sonst weit)`, eq(u.bins, [0, 0, 0, 1, 1, 2, 2]), u.bins.join());
    ok(`${label}: Startzustand stimmt mit der Referenz überein`, u.startState[0] === u.startState[1], u.startState[0]);
    ok(`${label}: Q-Update Q ← Q + α·(r + γ·max Q′ − Q) mit festen Zahlen`, !u.update.done && u.update.got === u.update.expected && eq(u.update.untouched, [1, 2, 4, 5]) && u.update.s2[0] === u.update.s2[1], `r = ${u.update.reward.toFixed(4)}, max Q′ = ${u.update.nmax}, erwartet ${u.update.expected}, erhalten ${u.update.got}`);
    ok(`${label}: Crash – Ziel ist die Strafe, kein Zukunftswert; Episode endet als Fehlversuch`, u.crash.done && !u.crash.win && u.crash.reward === -100 && u.crash.got === u.crash.expected && u.crash.epN === 1 && u.crash.fail === 1, `erwartet ${u.crash.expected}, erhalten ${u.crash.got}`);
    ok(`${label}: Ziel – Reward ist die Zielbelohnung, kein Zukunftswert; beste Fahrt wird gesetzt`, u.goal.done && u.goal.win && u.goal.got === u.goal.expected && u.goal.ok === 1 && u.goal.hasBest, `erwartet ${u.goal.expected}, erhalten ${u.goal.got}`);
    // die ersten beiden Episoden enden in den Prüfungen „Crash“ und „Ziel“, die übrigen vier laufen frei
    const epsAll = [u.crash.eps[0], u.crash.eps[1], ...u.epsSeq];
    ok(`${label}: ε-Abnahme je Episode (Faktor 0,5) mit Untergrenze 0,05; Training endet nach 6 Episoden`, eq(epsAll, [1, 0.5, 0.25, 0.125, 0.0625, 0.05, 0.05]) && u.st === "done", epsAll.join(" → "));
    ok(`${label}: Schrittlimit je Vorlage (2,5-fache Idealzeit, 1500 bis 60000)`, u.limits.every(l => l[0] === l[1]), u.limits.map(l => l[0]).join(", "));
    ok(`${label}: keine Skriptfehler`, !P.errors.length, P.errors.slice(0, 2).join(" | ")); await P.ctx.close();
  }
  const good = report("Rechenprüfung Q-Learning (unabhängige Referenz)", log); await browser.close(); srv.close(); process.exit(good ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2) });
