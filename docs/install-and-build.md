# QUORMEL 1 – Starten, Veröffentlichen, Tests

## Voraussetzungen

Für die Anwendung: keine. Es gibt keinen Build-Schritt; die Dateien im Repository sind die fertige Website.

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

## Tests ausführen

```
npm install
npx playwright install chromium
npm test
```

| Befehl | Inhalt |
|---|---|
| `npm run test:golden` | Lernlogik: Original und Neufassung müssen mit gleichem Seed identische Ergebnisse liefern |
| `npm run test:ui` | Oberfläche am PC: gleiche Bedienfolge in beiden Fassungen, Vergleich nach jedem Schritt |
| `npm run test:devices` | 14 Geräteprofile: Layout, Auflösung, Touch-Rennsteuerung, Editor mit Finger und Stift |
| `npm run test:pwa` | Manifest, Service Worker, Offline-Betrieb, Versionswechsel, Installationshilfe, Schutz der Trainingsstände |

Die Tests starten selbst einen lokalen Server und einen Browser ohne Fenster. Laufzeit zusammen etwa acht Minuten.

## Service Worker aktuell halten

Nach jeder Änderung an `index.html`, `css/`, `js/`, `icons/` oder `manifest.webmanifest`:

```
node tools/update-sw.cjs
```

Einzelheiten: [pwa-offline.md](pwa-offline.md).
