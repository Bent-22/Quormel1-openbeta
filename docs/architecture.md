# QUORMEL 1 – Technische Architektur

Stand: Phase 2 (11.11.2026)

## Überblick

Die Anwendung besteht aus statischen Dateien ohne Build-Schritt und ohne Abhängigkeiten zur Laufzeit:

```
index.html            Grundgerüst: 7 Seiten, 11 Modale, Overlays
css/quormel.css       Design (unverändert aus der Originaldatei)
js/main.js            Einstieg: Hauptschleife, Initialisierung
js/state.js           gemeinsamer veränderlicher Zustand (Objekt app)
js/core/              Lernkern und Strecke
js/storage/           Speicherstand und Bestzeiten
js/render/            Zeichnen (Draufsicht, First-Person)
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

Jedes Modul enthält auf oberster Ebene nur Funktionen und Konstanten. Alles, was beim Laden etwas ausführt (Ereignisse anmelden, Karten erzeugen, Speicherstand prüfen), steht in `init()`-Funktionen. `main.js` ruft diese 25 Schritte in **genau der Reihenfolge der Originaldatei** auf und startet danach die Hauptschleife. Module mit mehreren Schritten haben `init()`, `init2()` usw.

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

## Hinweise für Phase 3

- Rennsteuerung per Touch: Bildschirmtasten müssen nur `app.keys.w/a/s/d` setzen (`ui/race.js`); die Fahrphysik in `raceTick()` bleibt unberührt.
- Editor: Zeigerereignisse stehen in `ui/editor.js` (`init()`), die Punktannahme in `edAccept()`.
- High-DPI: Anzeige-Canvas in `render/` und `ui/`; `setTrack()` in `core/track.js` nicht anfassen.
- Layout: ausschließlich `css/quormel.css` und `index.html`.
- Nach jeder Änderung: `npm test`.
