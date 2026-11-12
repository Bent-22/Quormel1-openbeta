// Führt alle Testreihen nacheinander aus und gibt eine Zusammenfassung aus.
//   node tests/run-all.cjs          prüft die Dateien im Hauptordner
//   node tests/run-all.cjs --dist   prüft den Produktionsbuild in dist/
const { spawnSync } = require("child_process"), path = require("path");
const SUITES = [["golden", "Lernlogik: Original gegen Neufassung"], ["math", "Lernlogik: unabhängige Referenz"], ["regress", "Erweiterte Regression: Original gegen Neufassung"], ["ui", "Oberfläche am PC: Original gegen Neufassung"],
  ["devices", "Geräteprofile: Layout, Touch, Stift, Tastatur"], ["retina", "Retina: Pixeldichte 1 gegen 2"], ["pwa", "PWA: Offline, Aktualisierung, Installation, Speicherschutz"]];
const dist = process.argv.includes("--dist"), env = { ...process.env, ...(dist ? { QUORMEL_ROOT: "dist" } : {}) }, rows = []; let total = 0, good = 0, fail = false;
for (const [file, title] of SUITES) {
  const t0 = Date.now(), r = spawnSync(process.execPath, [path.join(__dirname, file + ".cjs")], { env, encoding: "utf8", maxBuffer: 1 << 28 }), out = (r.stdout || "") + (r.stderr || "");
  const m = [...out.matchAll(/^== (.*?): (\d+)\/(\d+) bestanden ==$/gm)], last = m.length ? (m.find(x => /gesamt/.test(x[1])) || m[m.length - 1]) : null;
  const a = last ? +last[2] : 0, b = last ? +last[3] : 0; total += b; good += a; if (r.status !== 0 || !last) { fail = true; console.log(out.split("\n").filter(l => /FEHL|Error/.test(l)).slice(0, 8).join("\n")) }
  rows.push(`${r.status === 0 ? "ok  " : "FEHL"}  ${String(a).padStart(4)}/${String(b).padEnd(4)}  ${title}  (${Math.round((Date.now() - t0) / 1000)} s)`); console.log(rows[rows.length - 1]);
}
console.log(`\n== ${dist ? "Produktionsbuild dist/" : "Hauptordner"}: ${good}/${total} Prüfungen bestanden ==`); process.exit(fail ? 1 : 0);
