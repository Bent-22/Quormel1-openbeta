// Erzeugt die App-Icons aus icons/icon.svg. Nur nötig, wenn das Icon geändert wird. Benötigt das Paket "sharp".
const sharp = require("sharp"), fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..", "icons"), svg = fs.readFileSync(path.join(dir, "icon.svg"));
const bg = "#0b0d12";
(async () => {
  for (const s of [192, 512]) await sharp(svg, { density: 300 }).resize(s, s).png().toFile(path.join(dir, `icon-${s}.png`));
  await sharp(svg, { density: 300 }).resize(180, 180).flatten({ background: bg }).png().toFile(path.join(dir, "apple-touch-icon.png"));
  // maskierbares Icon: Motiv auf 72 % verkleinert, damit es in jeder Maskenform vollständig sichtbar bleibt
  const inner = await sharp(svg, { density: 300 }).resize(368, 368).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: bg } }).composite([{ input: inner, gravity: "center" }]).png().toFile(path.join(dir, "icon-maskable-512.png"));
  console.log("Icons erzeugt.");
})();
