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

## Veröffentlichen

Zur Website gehören genau diese Dateien und Ordner:

```
index.html
css/
js/
```

`docs/`, `tests/`, `legacy/`, `package.json` und `README.md` werden für den Betrieb nicht benötigt. Sie stören nicht, wenn sie mit hochgeladen werden.

### Cloudflare Pages (Hochladen per Drag & Drop)

1. Einen Ordner anlegen, der nur `index.html`, `css/` und `js/` enthält.
2. Diesen Ordner im Cloudflare-Dashboard unter „Workers & Pages“ als neues Pages-Projekt hochladen bzw. als neue Version eines bestehenden Projekts.

### GitHub Pages

1. Im Repository: Settings → Pages.
2. „Deploy from a branch“ wählen, Branch und Ordner `/ (root)` einstellen.
3. Die Seite erscheint unter `https://<name>.github.io/Quormel1-openbeta/`.

Die Datei `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert ausliefert.

### Hinweis zu Speicherständen

Speicherstände liegen im Browser und gehören zur Adresse der Seite. Unter einer neuen Adresse sind alte Stände nicht sichtbar. Übertragen lassen sie sich über „Speicherstand exportieren“ auf der alten und „Speicherstand importieren“ auf der neuen Seite.

## Tests ausführen

```
npm install
npx playwright install chromium
npm test
```

| Befehl | Inhalt |
|---|---|
| `npm run test:golden` | Lernlogik: Original und Neufassung müssen mit gleichem Seed identische Ergebnisse liefern |
| `npm run test:ui` | Oberfläche: gleiche Bedienfolge in beiden Fassungen, Vergleich nach jedem Schritt |

Die Tests starten selbst einen lokalen Server und einen Browser ohne Fenster. Laufzeit zusammen etwa zweieinhalb Minuten.

## PWA und Offline

Noch nicht vorhanden. Manifest, Service Worker und Offline-Betrieb folgen in Phase 4; die Anleitung dazu entsteht dann in `docs/pwa-offline.md`.
