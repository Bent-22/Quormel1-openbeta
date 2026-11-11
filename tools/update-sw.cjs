// Trägt Dateiliste und Versionskennung in sw.js ein. Ohne Abhängigkeiten.
//   node tools/update-sw.cjs          aktualisiert sw.js
//   node tools/update-sw.cjs --check  prüft nur (Rückgabewert 1, wenn sw.js veraltet ist)
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const root = path.join(__dirname, ".."), files = ["index.html", "manifest.webmanifest"];
const walk = (d, ok) => { for (const n of fs.readdirSync(path.join(root, d)).sort()) { const r = d + "/" + n; if (fs.statSync(path.join(root, r)).isDirectory()) walk(r, ok); else if (ok(n)) files.push(r) } };
walk("css", n => n.endsWith(".css")); walk("js", n => n.endsWith(".js")); walk("icons", n => n.endsWith(".png"));
const h = crypto.createHash("sha256"); for (const f of files) { h.update(f); h.update(fs.readFileSync(path.join(root, f))) }
const block = `/* BEGIN GENERATED */\nconst VERSION="${h.digest("hex").slice(0, 12)}";\nconst FILES=${JSON.stringify(files)};\n/* END GENERATED */`;
const p = path.join(root, "sw.js"), old = fs.readFileSync(p, "utf8"), neu = old.replace(/\/\* BEGIN GENERATED \*\/[\s\S]*?\/\* END GENERATED \*\//, () => block);
if (process.argv.includes("--check")) { if (old !== neu) { console.error("sw.js ist veraltet. Bitte ausführen: node tools/update-sw.cjs"); process.exit(1) } console.log("sw.js ist aktuell (" + files.length + " Dateien)."); }
else { fs.writeFileSync(p, neu); console.log((old === neu ? "sw.js unverändert" : "sw.js aktualisiert") + " (" + files.length + " Dateien)."); }
