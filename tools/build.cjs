// Produktionsbuild: legt in dist/ genau die Dateien ab, die veröffentlicht werden. Ohne Abhängigkeiten.
//   node tools/build.cjs          aktualisiert sw.js und erzeugt dist/ neu
//   node tools/build.cjs --check  prüft nur, ob dist/ dem aktuellen Stand entspricht (Rückgabewert 1, wenn nicht)
// Die Dateien werden unverändert kopiert (nicht gebündelt, nicht verkleinert): Was getestet wurde, wird veröffentlicht.
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist"), check = process.argv.includes("--check");
if (!check) execFileSync(process.execPath, [path.join(__dirname, "update-sw.cjs")], { stdio: "inherit" });
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8"), files = ["sw.js", ...JSON.parse(sw.match(/const FILES=(\[.*?\]);/)[1])];
const walk = d => fs.existsSync(d) ? fs.readdirSync(d).flatMap(n => { const f = path.join(d, n); return fs.statSync(f).isDirectory() ? walk(f) : [path.relative(dist, f).split(path.sep).join("/")] }) : [];
if (check) {
  const have = walk(dist).sort(), want = files.slice().sort(), diff = [];
  for (const f of want) if (!have.includes(f)) diff.push("fehlt: " + f); else if (!fs.readFileSync(path.join(dist, f)).equals(fs.readFileSync(path.join(root, f)))) diff.push("veraltet: " + f);
  for (const f of have) if (!want.includes(f)) diff.push("überzählig: " + f);
  if (diff.length) { console.error("dist/ entspricht nicht dem aktuellen Stand (" + diff.slice(0, 5).join(", ") + (diff.length > 5 ? ", …" : "") + "). Bitte ausführen: node tools/build.cjs"); process.exit(1) }
  console.log("dist/ ist aktuell (" + want.length + " Dateien)."); process.exit(0);
}
fs.rmSync(dist, { recursive: true, force: true }); let bytes = 0;
for (const f of files) { const to = path.join(dist, f); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(root, f), to); bytes += fs.statSync(to).size }
console.log(`dist/ erzeugt: ${files.length} Dateien, ${Math.round(bytes / 1024)} KB. Diesen Ordner veröffentlichen.`);
