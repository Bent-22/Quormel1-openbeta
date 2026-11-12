# QUORMEL 1 – Technische Architektur

Stand: Phase 5 (12.11.2026) – Abschluss

## Überblick

Die Anwendung besteht aus statischen Dateien ohne Abhängigkeiten zur Laufzeit. Der Produktionsbuild (`dist/`) ist eine unveränderte Kopie dieser Dateien:

```
index.html            Grundgerüst: 7 Seiten, 11 Modale, Overlays
sw.js                 Service Worker (Offline-Cache, Versionswechsel)
manifest.webmanifest  Angaben für die Installation
icons/                App-Icons
css/quormel.css       Design (unverändert aus der Originaldatei)
js/main.js            Einstieg: Hauptschleife, Initialisierung
js/state.js           gemeinsamer veränderlicher Zustand (Objekt app)
js/core/              Lernkern und Strecke
js/storage/           Speicherstand und Bestzeiten
js/render/            Zeichnen (Draufsicht, First-Person, High-DPI)
js/input/             Touch-Bedienung
js/pwa/               Anmeldung des Service Workers, Installationshilfe
js/ui/                Seiten, Dialoge, Eingaben
```

`index.html` lädt `js/main.js` als ES-Modul. Alle weiteren Dateien werden über `import` nachgeladen. Alle Pfade sind relativ; die Seite läuft deshalb unverändert in einem Unterordner (GitHub Pages) oder an der Wurzel einer Adresse (Cloudflare Pages).

## Module

| Datei | Aufgabe |
|---|---|
| `core/constants.js` | feste Größen: Welt 1000 × 640, Tempo, Lenkaktionen |
| `core/rng.js` | Zufalls-Helfer, Seed-Generator (Mulberry32) für das Duell |
| `core/track.js` | Vorlagen, Glättung, Abtastung, Straßenmaske, Strecken-ID, Prüfung, Ideallinie |
| `core/qlearning.js` | Sensoren, Zustand, Aktionswahl, Bewegung, Reward, Q-Update, Episodenende, Schrittlimit |
| `storage/save.js` | Speicherstand prüfen, speichern, laden, exportieren, importieren |
| `storage/records.js` | persönliche Bestzeiten pro Strecke |
| `render/sim-view.js` | Draufsicht, Sensorstrahlen, Fortschrittsmarkierung, Ideallinie, Diagramm |
| `render/fpv.js` | First-Person-Ansicht samt vorberechneter Geometrie |
| `render/hidpi.js` | Auflösung der Anzeige-Canvas (`pxScale`, `hd`) |
| `input/touch-controls.js` | Touch-Modus, Bildschirmtasten im Rennen, freie Fläche für die Strecke |
| `storage/protect.js` | Speichern beim Verlassen, Bitte um dauerhaften Speicher |
| `pwa/register.js` | Service Worker anmelden, Offline-Status, Update-Hinweis, Installationshilfe |
| `ui/dom.js` | Elementzugriff, Seitenwechsel, Hinweise, Modale |
| `ui/actions.js` | Aktionen für `data-click`, `data-input`, `data-change` |
| `ui/library.js`, `ui/editor.js` | Streckenwahl, Streckeneditor |
| `ui/sim.js` | Trainingsansicht: Einstellungen, Validierung, Start/Pause, Kennzahlen |
| `ui/explain.js`, `ui/wheel.js`, `ui/pause-anim.js` | Erklärtexte, Glücksrad, Pausenanimation |
| `ui/analysis.js` | Fehleranalyse, „KI-Entscheidung untersuchen“ |
| `ui/replay.js`, `ui/race.js` | Wiedergabe der besten Fahrt, Rennen gegen die KI |
| `ui/lab.js`, `ui/duel.js` | Parameter-Labor, KI gegen KI |
| `ui/home.js` | Startseite |

## Zustand

Die 67 früheren globalen Variablen liegen im Objekt `app` (`js/state.js`), mit unveränderten Namen und Startwerten, z. B. `app.Q` (Q-Tabelle), `app.P` (Parameter), `app.T` (Strecke), `app.mask` (Straßenmaske).

Parameter-Labor und Duell tauschen wie im Original Teile dieses Zustands aus:

- Labor: `app.LAB.snap` sichert den Trainingsstand, `labExit()` stellt ihn wieder her.
- Duell: `getC()`/`setC()` wechseln pro Bild zwischen KI A und KI B; `Math.random` wird währenddessen durch den Seed-Generator ersetzt.

## Initialisierung

Jedes Modul enthält auf oberster Ebene nur Funktionen und Konstanten. Alles, was beim Laden etwas ausführt (Ereignisse anmelden, Karten erzeugen, Speicherstand prüfen), steht in `init()`-Funktionen. `main.js` ruft diese 25 Schritte in **genau der Reihenfolge der Originaldatei** auf, danach die Ergänzungen (`touchControls.init()`, `protect.init()`, `pwa.init()`), und startet die Hauptschleife. Module mit mehreren Schritten haben `init()`, `init2()` usw.

## Ereignisse

Die Originaldatei enthielt 37 Inline-Handler (`onclick="…"`). Sie setzen globale Funktionen voraus, die es in Modulen nicht gibt. Die Elemente tragen jetzt `data-click`, `data-input` oder `data-change` mit einem Aktionsnamen; `ui/actions.js` enthält die 32 Aktionen mit demselben Code wie zuvor und meldet je einen Listener am Dokument an. Das gilt auch für nachträglich erzeugtes HTML (Entscheidungsdialog, Fehleranalyse, Rennergebnis, Duell-Auswertung).

## Lernkern

`core/qlearning.js` ist aus der Originaldatei übernommen. Rechenweg, Konstanten, Reihenfolge der Zufallszahlen und Zustandsschlüssel sind unverändert.

**Eine Stelle ist umformuliert:** `sense()` holt Straßenmaske und Weltgröße einmal pro Aufruf in lokale Variablen und prüft die Straße damit direkt, statt für jeden Abtastpunkt `road()` aufzurufen. Die Rechnung ist dieselbe. Ohne diese Umformulierung lief das Training in Chrome rund 40 % langsamer, weil Zugriffe auf Modulvariablen in dieser innersten Schleife teurer sind als die früheren globalen Variablen. Der Vergleichstest belegt identische Ergebnisse.

Die Straßenmaske entsteht weiterhin aus einem Canvas mit exakt 1000 × 640 Pixeln. Dieses Canvas darf nie skaliert werden (siehe Plan, R1).

## Bekannte Kopplung

Der Lernkern ruft wie im Original direkt Oberflächenfunktionen auf (`toast`, `setPU`, `trainAbort`, `persist`, Schaltflächen sperren). `core/` ist deshalb nicht ohne `ui/` und `storage/` verwendbar. Eine Entkopplung hätte den Kern verändert und wurde in Phase 2 bewusst nicht vorgenommen.

## Abweichungen vom Plan aus Phase 1

| Plan | Umsetzung | Grund |
|---|---|---|
| Vite und TypeScript | native ES-Module (JavaScript), kein Build | Das Repository ist so direkt veröffentlichbar, auch ohne Node.js. In der Arbeitsumgebung ließen sich zudem keine Pakete installieren; ein ungetestetes Build-System wäre nicht vertretbar gewesen. |
| IndexedDB als Hauptspeicher | weiter `localStorage`, unverändert | Verhaltensänderung, nicht freigegeben (Plan, Abschnitt 10) |
| Gebündeltes Speichern | unverändert | nicht freigegeben |
| Grundstand auf `main` | nicht angelegt | alle Arbeit liegt auf `feat/quormel-cross-platform-pwa`; Zusammenführung in Phase 5 |
| Kontextobjekt ersetzt `getC`/`setC` | Zustand liegt in `app`, `getC`/`setC` bleiben | 1:1-Übernahme hat Vorrang |

## High-DPI (Phase 3)

`hd(canvas)` liefert den Zeichenkontext eines Canvas. Gezeichnet wird weiter in logischen Einheiten; die Pixelzahl des Canvas ist um `pxScale()` größer (Pixeldichte des Geräts, höchstens 2). Bei Pixeldichte 1 ändert sich nichts.

- Canvas mit fester logischer Größe (Strecke 1000 × 640, Diagramm, Vorschauen, Glücksrad …): `hd(cv)`.
- Vollflächige Canvas (First-Person, Editor): `hd(cv, innerWidth, innerHeight)`.
- Rennen: eigene Transformation in Gerätepixeln (`raceTick()`).
- `app.roadC` (Straßengrafik) wird in `setTrack()` um `pxScale()` feiner erzeugt und immer als 1000 × 640 dargestellt.
- **`app.mask` bleibt 1000 × 640.** Der Gerätetest prüft, dass Maske und Lernergebnis auf allen Profilen identisch sind.

## Touch-Bedienung (Phase 3)

- **Touch-Modus** (`body.touch`): gesetzt bei `pointer: coarse` oder bei der ersten Berührung mit Finger/Stift. Bleibt bis zum Neuladen aktiv.
- **Bildschirmtasten** (`#tc` in `index.html`): Zeigerereignisse am Container; pro Zeiger wird die Taste unter dem Finger bestimmt. Gesetzt werden `app.keys.a/d/s/w` – `raceTick()` und die Fahrphysik sind unverändert.
- **Freie Fläche im Rennen** (`raceInsets()`): Kopfzeile oben; Tasten seitlich oder unten, gewählt nach dem größeren Maßstab. Ohne Touch-Modus alle Ränder 0.
- **Editor** (`edDown`, `edMove`, `edUp` in `ui/editor.js`): ein aktiver Zeiger (`edSt.pid`), Stiftvorrang (`edSt.pen`, `edSt.len0`), `pointercancel`, zusammengefasste Ereignisse für Finger und Stift. Die Maus verhält sich wie zuvor.

## Layout (Phase 3)

Alle Regeln stehen im Block „Phase 3“ am Ende von `css/quormel.css`. Stufen: bis 700 px (Smartphone hoch), bis 1100 px (Tablet, schmale Fenster), Höhe bis 520 px (Smartphone quer), `pointer: coarse` (Bedienflächen).

## PWA (Phase 4)

Beschrieben in [pwa-offline.md](pwa-offline.md). Kurzfassung:

- `sw.js` hält eine Dateiliste und eine Versionskennung (beides von `tools/update-sw.cjs` eingetragen), beantwortet genau diese Dateien aus dem Cache und wechselt die Fassung nur auf Nachricht der Seite.
- `pwa/register.js` zeigt Status, Update-Hinweis und Installationshilfe im Bereich `#pwa` der Startseite.
- `storage/protect.js` ruft `persist()` auf, wenn die Seite verborgen wird, und bittet um dauerhaften Speicher. Format und Inhalt des Speicherstands sind unverändert.
- Trainingsstände liegen weiter in `localStorage`; der Service Worker berührt sie nicht.

## Produktionsbuild und Tests (Phase 5)

- `tools/build.cjs` aktualisiert `sw.js` und kopiert die 36 Dateien der Anwendung nach `dist/`. Keine Bündelung, keine Verkleinerung: Veröffentlicht wird, was getestet wurde.
- `tests/run-all.cjs` führt sieben Testreihen aus; mit `--dist` gegen den Produktionsbuild.

| Testreihe | Prüft |
|---|---|
| `golden.cjs` | Lernergebnisse: Original gegen Neufassung, gleicher Seed |
| `math.cjs` | Lernlogik gegen eine unabhängige, ausgeschriebene Referenz; Einzelschritte mit festen Zahlen |
| `regress.cjs` | Langlauf, Rennen, Bestzeiten, alte und beschädigte Speicherstände, Fehlerfälle, Editor-Regeln, Labor und Duell vollständig |
| `ui.cjs` | Oberfläche am PC: HTML und Canvas-Bilder nach jedem Bedienschritt |
| `devices.cjs` | 14 Geräteprofile: Layout, Auflösung, Touch, Stift, Tastatur |
| `retina.cjs` | jedes Canvas bei Pixeldichte 1 und 2 |
| `pwa.cjs` | Offline, Versionswechsel, Installation, Speicherschutz, Hosting mit Weiterleitung |

## Für die Weiterentwicklung

- Nach jeder Änderung an der Anwendung: `node tools/build.cjs`, dann `npm test` und `npm run test:dist`.
- `core/qlearning.js` nur ändern, wenn `golden.cjs` und `math.cjs` danach bestehen.
- `setTrack()` und die Straßenmaske (1000 × 640) nie skalieren.
- Offene Entscheidungen: Abschnitt 10 des Modernisierungsplans; Branch `main`.
