# QUORMEL 1 – Starten, Veröffentlichen, Tests

## Voraussetzungen

Für die Anwendung: keine. Der fertige Produktionsbuild liegt in `dist/`.

Für den Build: Node.js, keine weiteren Pakete.

Nur für die Tests: Node.js (aktuelle LTS-Version) und Playwright.

## Lokal starten

Die Seite muss über `http://` geöffnet werden. Im Ordner des Repositories:

```
python3 -m http.server 8080
```

oder, mit Node.js:

```
npx serve .
```

Danach `http://localhost:8080` (bzw. die angezeigte Adresse) im Browser öffnen.

## Veröffentlichen und installieren

Siehe [publish-and-install.md](publish-and-install.md).

## Produktionsbuild erzeugen

```
node tools/build.cjs
```

Das Skript aktualisiert `sw.js` (Dateiliste und Versionskennung) und legt `dist/` neu an. Nötig nach jeder Änderung an `index.html`, `css/`, `js/`, `icons/` oder `manifest.webmanifest`.

Der Build kopiert die Dateien unverändert. Er bündelt und verkleinert nichts.

## Tests ausführen

```
npm install
npx playwright install chromium
npm test              # prüft die Dateien im Hauptordner
npm run test:dist     # prüft den Produktionsbuild in dist/
```

| Befehl | Inhalt |
|---|---|
| `npm run test:golden` | Lernlogik: Original und Neufassung liefern mit gleichem Seed identische Ergebnisse |
| `npm run test:math` | Lernlogik gegen eine unabhängige Referenz |
| `npm run test:regress` | Langlauf, Rennen, Bestzeiten, Speicherstände, Fehlerfälle, Editor, Labor, Duell |
| `npm run test:ui` | Oberfläche am PC: gleiche Bedienfolge in beiden Fassungen |
| `npm run test:devices` | 14 Geräteprofile: Layout, Auflösung, Touch, Stift, Tastatur |
| `npm run test:retina` | Canvas-Bilder bei Pixeldichte 1 und 2 |
| `npm run test:pwa` | Offline, Versionswechsel, Installation, Speicherschutz |

Die Tests starten selbst einen lokalen Server und Chrome ohne Fenster. Ein Gesamtlauf dauert etwa zehn Minuten.

## Service Worker

`node tools/build.cjs` hält `sw.js` aktuell. Einzelheiten: [pwa-offline.md](pwa-offline.md).
