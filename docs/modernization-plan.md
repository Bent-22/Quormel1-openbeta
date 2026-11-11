# QUORMEL 1 – Modernisierungsplan (Phase 1: Analyse und Architektur)

Stand: 11.11.2026 · Branch: `feat/quormel-cross-platform-pwa` · Status: Phase 1 abgeschlossen, Phase 2 wartet auf Freigabe

Dieses Dokument ist die verbindliche Grundlage für die Phasen 2 bis 5. In Phase 1 wurde kein Anwendungscode verändert.

---

## 0. Befund zum Repository

Untersucht wurde `Bent-22/Quormel1-openbeta` (öffentlich, zuletzt geändert am 11.11.2026).

| Prüfpunkt | Ergebnis |
|---|---|
| Zugriff lesend | vorhanden |
| Zugriff schreibend (Push) | **nicht vorhanden** – die Claude-GitHub-App hat für dieses Repository keine Schreibberechtigung |
| Ordner- und Dateistruktur | **leer** – das Repository enthält keine Dateien |
| Branches | keine (auch kein `main` mit Commit) |
| Commits | keine |
| README, Projektanweisungen | nicht vorhanden |
| Frameworks, Build-System | nicht vorhanden |
| OpenBeta-Funktionen im Repository | nicht vorhanden |
| Branch `feat/quormel-cross-platform-pwa` | existierte nicht, wurde lokal angelegt |

Folgen daraus:

- Es gibt keinen Repository-Code, der mit der Originaldatei verglichen werden könnte. **Der einzige vorhandene Entwicklungsstand ist `Quormel1 Finalcode.html`** (624 Zeilen, 118 KB). Die gesamte Analyse unten bezieht sich auf diese Datei.
- Es kann nichts überschrieben werden, was neuer wäre als die Originaldatei.
- Falls es bereits OpenBeta-Arbeiten gibt, die noch nicht hochgeladen wurden, müssen sie vor Phase 2 ins Repository, sonst baut Phase 2 nur auf der Originaldatei auf.
- Solange der Schreibzugriff fehlt, liegt dieser Plan nur als lokaler Commit vor und nicht im Remote-Repository.

---

## 1. Bestehende Architektur

Die Anwendung ist eine einzige HTML-Datei ohne externe Ressourcen, ohne Build-Schritt und ohne Abhängigkeiten.

| Teil | Umfang | Beschreibung |
|---|---|---|
| CSS | ca. 9 KB, ein `<style>`-Block | dunkles Design über CSS-Variablen (`--bg`, `--p`, `--l`, `--t`, `--m`, `--a`, `--g`), Präsentationsmodus `body.pres` |
| HTML | 7 `<section>`-Seiten, 11 Modale, 3 Overlays | Seitenwechsel über `show(id)` (Klasse `.on`) |
| JavaScript | ca. 93 KB, ein `<script>`, 117 Funktionen | globaler Zustand, eine zentrale `requestAnimationFrame`-Schleife `loop()` |

**Seiten:** `home` (Start), `lib` (Streckenwahl), `sim` (Training), `pl` (Parameter-Labor), `dj` (KI gegen KI), `rpv` (First-Person-Wiedergabe), `race` (Rennen gegen die KI).
**Overlays:** `ed` (Streckeneditor), `code` (Erklärung), `wm` (Glücksrad). **Modale:** `mm`, `fm`, `dm`, `po`, `ma`, `mb`, `ko`, `bv`, `ow`, `mv`, `im`.

**Zustandsmodell.** Der gesamte Lernzustand liegt in globalen Variablen (`Q`, `P`, `c`, `S`, `sn`, `epN`, `ok`, `fail`, `hist`, `best`, `rec`, …). Parameter-Labor und Duell benutzen dieselben Funktionen, indem sie diese Globals austauschen:

- Labor: `LAB.snap` sichert den Zustand, `labExit()` stellt ihn wieder her.
- Duell: `getC()`/`setC()` tauschen pro Bild den Kontext von KI A und KI B; `Math.random` wird während `duStep()` durch einen Seed-Generator (`mul`, Mulberry32) ersetzt.
- Das Flag `LAB` schaltet in `persist()` und `endEp()` Speicherung, Fehlversuchsliste und Langzeitstatistik ab.

**Weltmodell.** Feste logische Welt von 1000 × 640 Punkten (`W`, `H`). Strecken sind Mittellinien im 5-px-Raster (`rs`), Vorlagen entstehen über Catmull-Rom (`cat`). `setTrack()` rastert die Straße in ein Canvas und leitet daraus `mask` (Uint8Array, 1 = Straße) ab. `road(x,y)` liest ausschließlich diese Maske.

**Speicherung.** `localStorage`:

| Schlüssel | Inhalt |
|---|---|
| `q1save` | ein Speicherstand als JSON (`v:1`, Lernlogik-Version `mv:2`) |
| `q1pb2|<Strecken-ID>` | persönliche Bestzeit pro Strecke |
| `q1pb|<Streckenname>` | ältere, namensbasierte Bestzeiten |
| `q1pres` | Präsentationsmodus |
| `q1drv` | Fahrerklärung auf-/zugeklappt |

---

## 2. Vorhandene Funktionen (Erhaltungsliste)

Diese Liste ist die Abnahmegrundlage für „sämtliche bisherigen Funktionen bleiben erhalten“.

**Start und Strecken**
- Startseite mit animierter Strecke, Namen der Entwickler, Speicherstand laden/exportieren/importieren
- Drei Vorlagen: Flitzpiepen-Ring (einfach), Omega-Schleife (mittel), Nervenflatter Grand Prix (schwierig)
- Streckeneditor: Freihandzeichnen, Straßenbreite 44–110, Rückgängig, Löschen, Zeichenbereich mit Rand, Prüfung auf Überschneidung/Mindestlänge, Warnung bei Kurvenradius < 40 px, Anpassung bei Fenstergröße

**Training**
- Einstellungen α, γ, ε, Explorationsabnahme, Episodenzahl, fünf Reward-Gewichte; nach Start gesperrt
- Eingabevalidierung mit Feldmarkierung, Warnung bei negativen Reward-Werten
- Glücksrad für jeden Parameter, Erklärtexte zu jedem Parameter
- Start, Pause/Fortsetzen (mit Pfeil-Animation), Weitertrainieren mit zusätzlichen Episoden
- Geschwindigkeit 1–100 Schritte pro Bild
- Sensorstrahlen, Fortschrittsmarkierung, Ideallinie (nur Anzeige), Kennzahlen, Erfolgsdiagramm über das gesamte Training, Q-Tabelle der letzten 10 Zustände, Lernprotokoll
- Kontrollierter Abbruch bei ungültigen Zahlenwerten (`trainAbort`)
- Präsentationsmodus für Beamer

**Analyse**
- „KI-Entscheidung untersuchen“: Modus A (vorhersagen) und B (direkt anzeigen), Ausführen im pausierten Training, Vorführen ohne Lernen nach Trainingsende
- Fehleranalyse: letzte 8 Fehlversuche mit Miniaturen, Zeitlupen-Wiedergabe der letzten 80 Schritte, Ursachentext
- „So lernt das Auto“

**Beste Fahrt und Rennen**
- First-Person-Wiedergabe mit 3D-Umgebung (Randsteine, Banden, Tribünen, Bäume, Zielbogen), Minikarte, Tempo 0,5×–4×, Zeitleiste, versteckter Debug-Modus (Tasten Q, U, 1)
- Rennen gegen die KI: Countdown, Start beim ersten Gasgeben, Geisterauto, Zeit-HUD, Fahrbahnverletzungen, unsichtbare Wand, Abbruch bei Stillstand, Ergebnisanzeige, persönlicher Rekord pro Strecke

**Lernmodule**
- Parameter-Labor: 8 Parameter einzeln auf fester S-Kurve, Zeitlupe/Schnell, Live-Q-Tabelle
- KI gegen KI: ein Parameter unterschiedlich, gleiche oder unterschiedliche Zufallsbasis, Auswertungstabelle, Q-Wert-Verlauf, Vergleich der besten Fahrten

**Speichern**
- Automatisches Speichern, Überschreibschutz, Export/Import als `.json` mit vollständiger Prüfung (`saveOk`), Hinweis bei älterer Lernlogik (`mv`), Erkennung von Vorlagen in alten Ständen (`matchPreset`)

---

## 3. Technische Schwachstellen

### 3.1 Geräte und Bedienung

| Nr. | Schwachstelle | Auswirkung |
|---|---|---|
| G1 | Rennen nur per Tastatur (`keys.w/a/s/d`, Pfeiltasten) | auf Tablet und Smartphone nicht spielbar; Hinweistexte nennen nur Tasten |
| G2 | Kein `touch-action` im Editor, in Rennen und Wiedergabe | Zeichnen und Fahren lösen Scrollen, Zoomen und Zurück-Geste aus |
| G3 | Editor ohne `pointercancel`, ohne Begrenzung auf einen Zeiger | abgebrochene Gesten lassen `drawing` aktiv; zweiter Finger oder Handballen erzeugt Sprünge in der Linie |
| G4 | Editor nutzt keine zusammengefassten Zeigerereignisse | Apple-Pencil-Striche werden gröber abgetastet als möglich |
| G5 | Alle Canvas haben feste Pixelgröße ohne `devicePixelRatio` | unscharfe Darstellung auf Retina- und High-DPI-Displays |
| G6 | Layout bricht erst bei 1100 px auf eine Spalte um, Reihenfolge Einstellungen → Strecke → Analyse | auf Tablets im Hochformat und Smartphones liegt die Strecke weit unter den Einstellungen |
| G7 | Feste Breiten (`.nav button` 260 px, `#drv` 290 px, Zeitleiste 300 px, `.pw` 40 px Rand), HUDs überdecken im Rennen die Strecke | Überlappungen auf kleinen Bildschirmen |
| G8 | `100vh`/`55vh`, kein `viewport-fit=cover`, keine Safe-Area-Abstände | Inhalte unter Adressleiste, Notch und Home-Indikator |
| G9 | Vollbild über `requestFullscreen` | auf dem iPhone nicht verfügbar (Fehler wird abgefangen, aber es gibt keinen Ersatz) |
| G10 | Kleine Bedienflächen (Glücksrad-Knopf, Erklär-Pfeile), Hinweise nur über `title` | auf Touch-Geräten schwer treffbar bzw. unsichtbar |
| G11 | Zahlenfelder `type="number"` ohne `inputmode` | Dezimalkomma deutscher Bildschirmtastaturen kann als ungültig gelten |
| G12 | Drehen des Geräts im Editor skaliert Punkte getrennt in x und y | gezeichnete Strecke wird verzerrt |
| G13 | Schrift „Arial Black“ fehlt auf iOS und Android | Titel und Canvas-Schrift sehen je nach Gerät anders aus |

### 3.2 Zeitverhalten

| Nr. | Schwachstelle | Auswirkung |
|---|---|---|
| Z1 | Training, Labor, Wiedergabe, Fehleranalyse und Bestenvergleich zählen in Bildern statt in Zeit | auf 120-Hz-Displays (iPad Pro, viele Android-Geräte) läuft alles doppelt so schnell; die Angabe „≈ 5 Schritte/s“ stimmt dann nicht. Das Rennen ist nicht betroffen (fester 60-Hz-Takt) |
| Z2 | Training läuft im Hauptthread in der Bildschleife | bei hohen Geschwindigkeiten ruckelt die Oberfläche auf schwächeren Geräten |
| Z3 | Training hält an, sobald Tab oder Bildschirm inaktiv ist | lange Trainings brechen auf Mobilgeräten bei Bildschirmsperre ab |

### 3.3 Speicherung

| Nr. | Schwachstelle | Auswirkung |
|---|---|---|
| S1 | `persist()` läuft bei **jeder** erfolgreichen Episode und prüft danach den gesamten Stand erneut (`hasValidSave` → `JSON.parse` + `saveOk`) | bei hoher Erfolgsquote wird pro Episode der komplette Stand serialisiert, geschrieben, gelesen und geprüft – spürbare Ruckler |
| S2 | Nur `localStorage` (synchron, ca. 5 MB) | große Q-Tabellen und Fahrtaufzeichnungen können das Limit erreichen |
| S3 | Kein Schutz vor automatischem Löschen durch den Browser | Safari kann Website-Daten nach längerer Nichtnutzung entfernen, solange die App nicht zum Home-Bildschirm hinzugefügt ist (auf echten Geräten in Phase 4 zu prüfen) |
| S4 | Ein einziger Speicherplatz | ein neues Training ersetzt den alten Stand (nur Warnung und Export als Schutz) |
| S5 | Export über `a[download]` mit Blob-URL | in installierten iOS-Web-Apps unzuverlässig |
| S6 | Speicherstände hängen an der Adresse der Seite | bei Umzug auf eine neue Adresse sind alte Stände nur per Export/Import übertragbar |

### 3.4 Offline und Installation

- Kein Manifest, kein Service Worker, keine Icons, keine Theme-Farbe. Die Seite ist nicht installierbar und ohne Netz nicht neu ladbar.
- Positiv: Es gibt keine einzige externe Ressource. Offline-Caching muss nur die eigenen Dateien abdecken.

### 3.5 Wartbarkeit

- Ein-Buchstaben-Globals mit Überdeckungen: globales `c`, `Q`, `st`, `T` werden in `pose()`, `drawFPV()`, `buildGeo()` und `paTick()` lokal anders verwendet.
- 37 Inline-Handler (`onclick="…"`, auch in erzeugten HTML-Zeichenketten wie in `decUI()`), die globale Funktionen voraussetzen.
- Ungenutzter Code: `MAXSTEPS`, `proj()`, `sideFree()`, `fpI`/`fpK`, CSS für `#pz`, leerer `fullscreenchange`-Listener; `okSteps` wird gezählt, aber nie angezeigt. Doppelte CSS-Regeln (`.orb`, `.n1`, `.cards`).
- Keine Tests, kein Linting, keine Versionsnummer der Anwendung.
- Modale ohne Escape-Taste und Fokusführung; Canvas-Inhalte ohne Textalternative.

---

## 4. Risiken für die Q-Learning-Logik

Die Lernlogik bleibt unverändert. Folgende Stellen sind bei einer Modernisierung gefährdet und werden deshalb ausdrücklich abgesichert.

### 4.1 Eingefrorener Kern (keine inhaltliche Änderung erlaubt)

| Baustein | Ort im Original | Festgelegtes Verhalten |
|---|---|---|
| Konstanten | `W`, `H`, `V`, `TURN`, `ACT` | 1000 × 640, Tempo 3, Lenkwinkel ±0,09 / ±0,045 / 0 |
| Sensoren | `sense()` | 5 Strahlen (−90°, −45°, 0°, 45°, 90°), Schrittweite 3, Reichweite 120 |
| Zustand | `binS()`, `keyOf()` | Klassen < 35 / < 70 / sonst; Zielrichtung in 5 Klassen (−1, −0,3, 0,3, 1); Schlüssel `"01212|3"` → höchstens 1215 Zustände |
| Aktionswahl | `chooseAction()`, `best_()` | ε-greedy, bei Gleichstand zufällige Wahl unter den besten |
| Bewegung und Reward | `stepCar()`, `nearest()` | Suchfenster −5/+40 Punkte, Ziel bei Index ≥ n−3, Reward-Formel mit `rp`, `rd`, `ri`, Grundabzug 0,1 |
| Update | `trainStep()` | `Q ← Q + α·(r + γ·max Q' − Q)`, Endzustand ohne Zukunftswert |
| Abbruchregeln | `trainStep()`, `maxSteps()` | Stillstand nach 1500 Schritten ohne Fortschritt = Crash-Strafe; Schrittlimit 2,5-fache Idealzeit, 1500–60000 |
| Episodenende | `endEp()` | ε ← max(0,05; ε·Abnahme), beste Fahrt nach Schrittzahl |
| Schutz | `trainAbort()` | ungültige Schritte werden verworfen, Q-Tabelle bleibt unverändert |

### 4.2 Einzelrisiken

| Nr. | Risiko | Gegenmaßnahme |
|---|---|---|
| R1 | **Straßenmaske hängt an der Canvas-Rasterung.** `mask` entsteht aus einem 1000 × 640-Canvas (Alpha > 128). Wird dieses Canvas für High-DPI vergrößert, ändern sich Straßenränder, Sensorwerte und damit das Lernen. | Die Masken-Erzeugung bleibt bei exakt 1000 × 640 ohne Skalierung. High-DPI betrifft nur Anzeige-Canvas. |
| R2 | **Reihenfolge der Zufallszahlen.** Das Duell mit „gleicher Zufallsbasis“ ist nur fair, wenn pro Schritt genau dieselben `Math.random`-Aufrufe in derselben Reihenfolge stattfinden. | Keine zusätzlichen Zufallsaufrufe im Kern; Reihenfolge durch Vergleichstest abgesichert. |
| R3 | **Kontexttausch über Globals** (`getC`/`setC`, `LAB.snap`, Flag `LAB`). Beim Aufteilen in Module können Felder vergessen werden, dann vermischen sich Trainingsstände. | Der Zustand wird zu einem einzigen Kontextobjekt; die Feldlisten aus `getC` und `LAB.snap` werden 1:1 übernommen und getestet. |
| R4 | **Speicherstände werden beim Laden neu abgetastet.** `loadSave()` ruft `setTrack()` mit den auf eine Nachkommastelle gerundeten Punkten auf; `tid` erhält die Strecken-ID. | Verhalten bleibt genau so; Test mit echten Speicherständen aus der Originaldatei. |
| R5 | **Zahlendarstellung.** `|0`, `toFixed`, `===`-Vergleiche bei Gleichstand, `Math.max(...q)`. Eine „saubere“ Umformulierung in TypeScript kann Ergebnisse verschieben. | Kernfunktionen werden wortgleich übertragen, nur mit Typen versehen. |
| R6 | **Web Worker.** Ein Auslagern des Trainings verändert Ablauf, Kontexttausch und Maskenerzeugung. | In Phase 2 **nicht** vorgesehen. Erst in Phase 5 prüfen, falls Messungen es nötig machen, und nur mit bestandenem Vergleichstest. |
| R7 | **Bildrate (Z1).** Eine Zeitsteuerung des Trainings ändert nicht das Lernergebnis, aber das sichtbare Tempo. | Bedeutung von „Schritte pro Bild“ bleibt; Entkopplung von 120 Hz nur für Wiedergaben und Labor-Zeitlupe, getrennt dokumentiert. |
| R8 | **Speicherhäufigkeit (S1).** Seltener speichern ändert, was nach einem Absturz noch vorhanden ist. | Inhalt und Format bleiben; nur die doppelte Prüfung wird entlastet und das Schreiben gebündelt. Wird als bewusste Änderung dokumentiert. |
| R9 | **Inline-Handler.** In ES-Modulen sind Funktionen nicht mehr global; `onclick="decRun()"` würde stillschweigend ausfallen. | Alle 37 Handler werden auf `addEventListener` umgestellt und einzeln geprüft. |

### 4.3 Absicherung: Vergleichstest gegen das Original

Vor jeder Codeänderung wird die Originaldatei unverändert als Referenz abgelegt (`legacy/`). Ein automatischer Test lädt Original und Neufassung im selben Browser, setzt denselben Seed für `Math.random`, trainiert auf allen drei Vorlagen und der S-Kurve eine feste Zahl Episoden und vergleicht:

- vollständige Q-Tabelle (Schlüssel und Werte),
- `epN`, `ok`, `fail`, `sumRew`, `sumSteps`, `maxIdx`, ε,
- beste Fahrt (`steps`, `rec`),
- Ergebnis eines Duells mit gleicher Zufallsbasis.

**Abweichung = Fehler.** Kein Schritt von Phase 2 gilt als fertig, solange dieser Test nicht besteht. Zusätzlich: Ein mit der Originaldatei erzeugter Export muss sich in der Neufassung laden, weitertrainieren und wieder exportieren lassen – und umgekehrt in der Originaldatei ladbar bleiben.

---

## 5. Architekturentscheidung

| Thema | Entscheidung | Begründung |
|---|---|---|
| Build | **Vite** | Module, Entwicklungsserver, gebündelte statische Ausgabe in `dist/` |
| Sprache | **TypeScript** | Typen für Speicherformat, Kontextobjekt und Strecke verhindern genau die Fehler aus R3/R4 |
| UI | **kein Framework** | die Oberfläche ist imperativ und Canvas-lastig; ein Neuschreiben in React würde Funktionsverlust riskieren, ohne messbaren Vorteil |
| Laufzeit-Abhängigkeiten | **keine** | nur Entwicklungswerkzeuge: Vite, TypeScript, Vitest, Playwright |
| Speicher | **IndexedDB** als Hauptspeicher, `localStorage` wird weiter gelesen | mehr Platz, kein Blockieren; alte Stände bleiben nutzbar. JSON-Format `v:1` unverändert |
| Service Worker | **selbst geschrieben**, Dateiliste beim Build erzeugt | wenige Zeilen, keine Zusatzbibliothek |
| Web Worker | **vorerst nein** | siehe R6 |
| Pfade | **relativ** (`base: './'`) | läuft unverändert auf GitHub Pages (Unterordner) und Cloudflare Pages (Wurzel), auch per Hochladen des `dist`-Ordners |
| Cloud | **keine** | wie gefordert; kein Netzwerkzugriff außer dem Laden der eigenen Dateien |

---

## 6. Vorgeschlagene Projektstruktur

```
/
├─ index.html                  Grundgerüst (Sektionen, Modale)
├─ package.json  vite.config.ts  tsconfig.json
├─ public/
│  ├─ manifest.webmanifest
│  └─ icons/                   192, 512, maskable, apple-touch-icon
├─ src/
│  ├─ main.ts                  Start, Hauptschleife
│  ├─ core/                    Lernkern, ohne Oberfläche
│  │  ├─ constants.ts          W, H, V, TURN, ACT
│  │  ├─ track.ts              cat, rs, trackHash, validate, idealLine, Vorlagen
│  │  ├─ mask.ts               setTrack-Rasterung (fest 1000 × 640)
│  │  ├─ qlearning.ts          sense, keyOf, stepCar, trainStep, endEp
│  │  ├─ context.ts            Kontextobjekt (ersetzt getC/setC/LAB.snap)
│  │  └─ rng.ts                Mulberry32
│  ├─ storage/
│  │  ├─ save-format.ts        Typen, saveOk, Versionen v / mv
│  │  ├─ store.ts              IndexedDB + Lesen alter localStorage-Stände
│  │  ├─ transfer.ts           JSON-Export und -Import
│  │  └─ records.ts            Bestzeiten
│  ├─ render/
│  │  ├─ canvas.ts             High-DPI-Hilfen
│  │  ├─ sim-view.ts  chart.ts
│  │  └─ fpv.ts  geo.ts        First-Person-Ansicht
│  ├─ ui/                      home, library, sim, lab, duel, replay, race,
│  │                           editor, wheel, decision, failures, modals, toast
│  ├─ input/
│  │  ├─ keyboard.ts
│  │  ├─ touch-controls.ts     Links, Rechts, Gas, Bremse
│  │  └─ pointer.ts            Finger und Stift im Editor
│  ├─ pwa/
│  │  ├─ sw.ts                 Service Worker
│  │  └─ register.ts           Anmeldung, Update-Hinweis
│  └─ styles/                  base, layout, components, touch
├─ legacy/
│  └─ Quormel1 Finalcode.html  unveränderte Referenz
├─ tests/
│  ├─ golden/                  Vergleichstest gegen legacy/
│  ├─ unit/                    Strecke, Speicherformat
│  └─ e2e/                     Geräteprofile, Offline
└─ docs/
   ├─ modernization-plan.md    dieses Dokument
   ├─ architecture.md          ab Phase 2
   ├─ changes.md               Übersicht geänderter Funktionen
   ├─ install-and-build.md     Installation, Build, Veröffentlichung
   ├─ pwa-offline.md           ab Phase 4
   ├─ test-report.md           fortlaufend
   └─ known-limitations.md
```

---

## 7. Notwendige PWA-Komponenten (Phase 4)

| Komponente | Inhalt |
|---|---|
| Manifest | `name` „QUORMEL 1“, `short_name`, `start_url` und `scope` relativ, `display: standalone`, `orientation: any`, `background_color`/`theme_color` `#0b0d12`, `lang: de` |
| Icons | 192 und 512 px, zusätzlich maskierbar; `apple-touch-icon` 180 px |
| Meta-Angaben | `theme-color`, `viewport-fit=cover`, Apple-Web-App-Angaben |
| Service Worker | Vorab-Cache aller eigenen Dateien mit Versionsnamen, Antwort zuerst aus dem Cache, alte Caches beim Aktivieren löschen |
| Update-Ablauf | neue Version wird im Hintergrund geladen; Hinweis „Neue Version verfügbar“ mit Knopf. **Kein automatischer Neustart während eines Trainings** |
| Offline-Anzeige | Statushinweis „Offline verfügbar“ nach erfolgreichem Caching |
| Speicherschutz | Anfrage auf dauerhaften Speicher (`navigator.storage.persist()`), Anzeige des belegten Speichers |
| Export in installierter App | Teilen-Dialog (`navigator.share` mit Datei) als Ersatz, wenn der Download nicht funktioniert |
| Voraussetzung | Auslieferung über HTTPS (GitHub Pages und Cloudflare Pages erfüllen das) |

---

## 8. Geplante Geräteoptimierungen (Phase 3)

**Rennsteuerung**
- Vier Bildschirmtasten: Links und Rechts unten links, Bremse und Gas unten rechts; Mehrfinger-Bedienung, mindestens 64 px groß, mit Safe-Area-Abstand.
- Die Tasten setzen dieselben Einträge wie die Tastatur (`keys.a`, `keys.d`, `keys.w`, `keys.s`). Die Fahrphysik bleibt unberührt.
- Sichtbar auf Touch-Geräten, auf Wunsch auch am PC einblendbar. Hinweistexte passen sich an („Tippe auf Gas“ statt „Drücke W“).
- Im Hochformat: Strecke oben, Steuerung darunter.

**Streckeneditor**
- `touch-action: none`, Behandlung von `pointercancel`, nur ein aktiver Zeiger.
- Stift hat Vorrang: Sobald ein Stift erkannt wurde, werden Finger- und Handballenkontakte beim Zeichnen ignoriert.
- Zusammengefasste Zeigerereignisse für glattere Linien.
- Werkzeugleiste umbruchfähig und daumenfreundlich; Drehen des Geräts ohne Verzerrung.

**Darstellung**
- Gemeinsame Hilfsfunktion: Canvas-Auflösung = Anzeigegröße × `devicePixelRatio`, begrenzt (First-Person-Ansicht höchstens Faktor 2, wegen Rechenlast).
- Logische Welt bleibt 1000 × 640; Maske unberührt (R1).

**Layout**
- Stufen für Smartphone hoch/quer, Tablet hoch/quer, Desktop.
- Training auf kleinen Bildschirmen: Strecke zuerst, Einstellungen und Analyse als einklappbare Bereiche bzw. Reiter.
- Duell: nebeneinander im Querformat, untereinander im Hochformat.
- `dvh` statt `vh`, Safe-Area-Abstände, Bedienflächen mindestens 44 px, Tabellen scrollen im eigenen Bereich.
- Vollbild-Ersatz für das iPhone (feste Vollflächen-Ansicht); kein versehentliches Zoomen, Markieren oder Herunterziehen in Rennen und Editor.
- Dezimaleingabe mit passender Bildschirmtastatur; Komma wird akzeptiert.
- Das dunkle Design (Farben, Typografie, Karten) bleibt erhalten.

---

## 9. Reihenfolge der Umsetzung

| Phase | Schritte | Abnahme |
|---|---|---|
| **2 – Technische Modernisierung** | 2.0 Originaldatei unverändert nach `legacy/`, Grundstand auf `main` · 2.1 Vite/TypeScript einrichten · 2.2 Vergleichstest gegen das Original · 2.3 Code 1:1 in Module aufteilen (erst Kern, dann Speicher, Darstellung, Oberfläche) · 2.4 Inline-Handler ersetzen · 2.5 Kontextobjekt statt Globals · 2.6 Speicherschicht mit IndexedDB, alte Stände lesbar · 2.7 toter Code entfernen | Vergleichstest identisch; Funktionsliste aus Abschnitt 2 vollständig; alter Export ladbar |
| **3 – Geräte und Touch** | 3.1 High-DPI · 3.2 responsive Layouts · 3.3 Rennsteuerung · 3.4 Editor mit Finger und Stift · 3.5 Safe-Area, Vollbild-Ersatz, Eingabefelder | Geräteprofile iPhone, iPad, Android-Smartphone, Android-Tablet, Desktop jeweils hoch und quer |
| **4 – PWA und Offline** | 4.1 Manifest und Icons · 4.2 Service Worker · 4.3 Update-Hinweis · 4.4 Speicherschutz und Export-Ersatz | installierbar; nach erstem Laden ohne Netz vollständig nutzbar |
| **5 – Tests und Fertigstellung** | 5.1 vollständiger Testbericht · 5.2 Leistungsmessung (Entscheidung Web Worker) · 5.3 Dokumentation abschließen · 5.4 Zusammenführung nach `main` nach Freigabe | Testbericht, bekannte Einschränkungen dokumentiert |

Nach jeder Phase: Prüfung, Tests, Dokumentation, nachvollziehbare Commits.

**Git-Regeln:** Arbeit auf `feat/quormel-cross-platform-pwa`, keine Force-Pushes, keine direkten Änderungen an `main` außer dem einmaligen Grundstand, keine Zugangsdaten im Repository.

---

## 10. Bewusste Verhaltensänderungen (zur Freigabe)

Diese Punkte sind keine reinen Umbauten. Sie werden nur umgesetzt, wenn sie freigegeben sind:

1. **Speicherhäufigkeit (S1):** gebündeltes Speichern statt bei jeder erfolgreichen Episode.
2. **Speicherort:** neue Stände in IndexedDB; `localStorage`-Stände werden weiter gelesen, aber nicht gelöscht.
3. **120-Hz-Displays (Z1):** Wiedergaben und Labor-Zeitlupe laufen überall gleich schnell. Das Trainingstempo („Schritte pro Bild“) bleibt wie bisher.
4. **Mehrere Speicherplätze (S4):** optional, das Exportformat bleibt ein einzelner Stand.

---

## 11. Offene Punkte vor Phase 2

| Nr. | Punkt | Wer |
|---|---|---|
| O1 | Schreibzugriff für die Claude-GitHub-App auf `Bent-22/Quormel1-openbeta` einrichten | Repository-Inhaber |
| O2 | Bestätigen, dass das Repository absichtlich leer ist, oder vorhandene OpenBeta-Dateien hochladen | Repository-Inhaber |
| O3 | Veröffentlichungsweg festlegen: Mit Vite entsteht die auslieferbare Seite erst durch einen Build (`dist/`). Entweder lokal mit Node.js bauen oder den fertigen `dist`-Ordner je Phase bereitstellen lassen | Repository-Inhaber |
| O4 | Freigabe der Punkte aus Abschnitt 10 | Repository-Inhaber |

## 12. Grenzen dieser Analyse

- Die Analyse beruht auf dem Lesen des Quelltextes (Syntaxprüfung bestanden). Die Anwendung wurde in Phase 1 nicht auf echten Geräten ausgeführt.
- Aussagen zum Verhalten von Safari bei Speicherlöschung und Downloads in installierten Web-Apps sind in Phase 4 auf echten Geräten zu bestätigen.
