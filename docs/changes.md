# QUORMEL 1 – Übersicht der Änderungen

## Phase 5 – Qualitätskontrolle und Fertigstellung (12.11.2026)

### Behobene Fehler

| Nr. | Fehler | Auswirkung | Behebung |
|---|---|---|---|
| 1 | Service Worker verwendete eine weitergeleitete Antwort für `index.html` | Bei Anbietern, die `index.html` auf den Ordner weiterleiten (Cloudflare Pages), wäre die Seite **ab dem zweiten Aufruf nicht mehr geladen** worden – online wie offline. Entstanden in Phase 4, vom damaligen Testserver nicht nachgestellt. | `sw.js` übernimmt den Inhalt weitergeleiteter Antworten in eine saubere Antwort. Test stellt das Verhalten nach. |
| 2 | Speichern beim Verlassen nach einem Trainingsabbruch | Nach einem Abbruch wegen ungültiger Zahlenwerte konnte beim Verlassen der App ein ungültiger Stand den letzten gültigen ersetzen. Entstanden in Phase 4. | `storage/protect.js` schreibt den vorherigen Stand zurück, wenn das Speichern keinen gültigen Stand ergibt. |
| 3 | Rennergebnis: „Noch einmal“ und „Zurück“ lagen außerhalb der Ergebniskarte | Die Schaltflächen standen am oberen Bildschirmrand über dem Streckennamen; auf Smartphones direkt neben „← Zurück“. **Fehler aus der Originaldatei.** | Eine CSS-Regel setzt sie in die Karte. |
| 4 | Hinweise konnten Bildschirmtasten verdecken | Ein eingeblendeter Hinweis fing auf Smartphones Berührungen der Rennsteuerung ab. Entstanden in Phase 3. | Hinweise lassen im Touch-Modus Berührungen durch. |

Punkt 3 ändert die Darstellung gegenüber der Originaldatei auch am PC: Die beiden Schaltflächen stehen jetzt unten in der Ergebniskarte.

### Neu

| Bereich | Umsetzung |
|---|---|
| Produktionsbuild | `node tools/build.cjs` erzeugt `dist/` mit genau den 36 Dateien, die veröffentlicht werden. Unverändert kopiert, nicht gebündelt, nicht verkleinert. `dist/` liegt im Repository. |
| Tests | drei neue Testreihen (`math`, `regress`, `retina`), Gesamtlauf `tests/run-all.cjs`, alle Reihen auch gegen `dist/` |
| Dokumentation | Abschluss-Testbericht, Checkliste für echte Geräte |

### Unverändert

- Q-Learning-Logik (nur ein Kommentar in `core/qlearning.js` nennt jetzt die richtigen Testdateien)
- Speicherformat und Speicherort
- alle Funktionen; nichts hinzugefügt, nichts entfernt

### Weiterhin offen (nicht freigegeben, daher nicht umgesetzt)

Die vier Punkte aus Abschnitt 10 des Modernisierungsplans: gebündeltes Speichern, IndexedDB, Ausgleich für 120-Hz-Displays, mehrere Speicherplätze. Außerdem gibt es weiterhin keinen Branch `main`.

## Phase 4 – PWA und Offline-Betrieb (11.11.2026)

### Neu

| Bereich | Umsetzung |
|---|---|
| Installierbar | Manifest, App-Icons (192, 512, maskierbar, iPad/iPhone), Theme-Farbe, Angaben für iOS |
| Offline | Service Worker lädt beim ersten Besuch alle 35 Dateien in einen Cache; danach läuft die App ohne Internet |
| Versionswechsel | Neue Fassung lädt im Hintergrund; Hinweis auf der Startseite; Wechsel erst nach „Jetzt aktualisieren“ |
| Installationshilfe | Android/Chrome/Edge: Knopf „App installieren“. iPad/iPhone: Hinweis auf „Teilen“ → „Zum Home-Bildschirm“ |
| Startseite | Statuszeile „Offline bereit …“ und Angabe, ob der Browser die Trainingsstände dauerhaft speichert |

### Schutz der Trainingsstände

| Maßnahme | Vorher | Nachher |
|---|---|---|
| Speichern beim Verlassen | nur alle 50 Episoden, bei Erfolg und bei neuem Bestfortschritt | zusätzlich sofort, wenn die App in den Hintergrund geht oder geschlossen wird |
| Dauerhafter Speicher | nicht angefragt | Bitte an den Browser beim Trainingsstart, Laden und Import |
| Export in der installierten App auf iPad/iPhone | Download (dort unzuverlässig) | Teilen-Dialog |

### Unverändert

- Q-Learning-Logik
- Speicherformat und Speicherort (`localStorage`, `q1save`); JSON-Import und -Export am PC und im Browser wie bisher
- Darstellung am PC bis auf die neuen Zeilen auf der Startseite
- keine Cloud-Synchronisation, keine fremden Ressourcen

### Dateien

- neu: `sw.js`, `manifest.webmanifest`, `icons/`, `js/pwa/register.js`, `js/storage/protect.js`, `tools/update-sw.cjs`, `tools/make-icons.cjs`, `tests/pwa.cjs`, `docs/pwa-offline.md`, `docs/publish-and-install.md`
- geändert: `index.html` (Kopfangaben, Bereich auf der Startseite), `css/quormel.css` (Block „Phase 4“), `js/main.js`, `js/storage/save.js` (nur Export)

### Neue Pflicht

Nach jeder Änderung an Dateien der Anwendung: `node tools/update-sw.cjs`.

## Phase 3 – Gerätekompatibilität und Touch-Bedienung (11.11.2026)

### Neu

| Bereich | Umsetzung |
|---|---|
| Rennsteuerung | Vier Bildschirmtasten: Links, Rechts (unten links), Bremse, Gas (unten rechts). Mehrere Finger gleichzeitig; ein Finger kann von Links nach Rechts gleiten. Die Tasten setzen dieselben Eingaben wie A, D, S, W. |
| Touch-Modus | Aktiv auf Geräten mit Touch als Hauptbedienung und ab der ersten Berührung mit Finger oder Stift. Blendet die Tasten ein und ändert zwei Hinweistexte („Tippe auf Gas …“, „Zeichne … mit dem Finger oder Stift“). |
| Rennansicht | Im Touch-Modus bleibt die Kopfzeile frei, und die Strecke wird neben oder über den Tasten platziert – je nachdem, wo sie größer wird. |
| Streckeneditor | Finger und Stift (Apple Pencil): keine Scroll-/Zoom-Gesten auf der Zeichenfläche, genau ein zeichnender Zeiger, abgebrochene Berührungen beenden den Strich, feinere Abtastung bei Finger und Stift. |
| Stiftvorrang | Liegt die Hand schon auf, wenn der Stift aufsetzt, wird ihr Strich verworfen. Nach der ersten Stiftberührung zeichnen Finger bis zum Schließen des Editors nicht mehr mit. |
| Retina / High-DPI | Alle Anzeige-Canvas zeichnen in Geräteauflösung (Faktor bis 2). Die Straßengrafik wird entsprechend feiner erzeugt. |
| Layout | Smartphone und Tablet in Hoch- und Querformat: Strecke zuerst, darunter Einstellungen und Analyse (auf Tablets nebeneinander). Abstände zu Notch und Home-Balken, Höhe folgt der sichtbaren Fläche, Dialoge scrollen, Bedienflächen mindestens 44 px. |

### Geändertes Verhalten am PC

| Stelle | Vorher | Nachher |
|---|---|---|
| Editor, Fenstergröße ändern | Zeichnung wurde gestreckt | Zeichnung behält ihre Form |
| Fenster schmaler als 1100 px | Einstellungen, Strecke, Analyse untereinander | Strecke zuerst; zwischen 701 und 1100 px Einstellungen und Analyse nebeneinander |
| Fenster schmaler als 1100 px | Namenszeile auf der Startseite ragte über den Rand | Namenszeile bricht um |
| Retina-Bildschirme | unscharfe Canvas | scharfe Canvas |

Bei einem Fenster ab 1101 px Breite mit Maus und Pixeldichte 1 ist die Darstellung unverändert (belegt durch den Vergleichstest mit dem Original).

### Unverändert

- Q-Learning-Logik und Straßenmaske (1000 × 640)
- Tastatur- und Maussteuerung
- Speicherformat, Speicherort, alle Texte außerhalb des Touch-Modus

### Dateien

- neu: `js/render/hidpi.js`, `js/input/touch-controls.js`, `tests/devices.cjs`
- geändert: `index.html` (Viewport, Bildschirmtasten), `css/quormel.css` (Block „Phase 3“ am Ende), `js/ui/editor.js`, `js/ui/race.js`, `js/render/*`, `js/core/track.js` (nur Straßengrafik), kleinere Anpassungen an allen Stellen, die ein Canvas zeichnen

## Phase 2 – Technische Modernisierung (11.11.2026)

Ziel war ein Umbau ohne Verhaltensänderung. Es wurde keine Funktion hinzugefügt und keine entfernt.

### Geändert

| Bereich | Vorher | Nachher |
|---|---|---|
| Dateien | eine HTML-Datei (118 KB) | `index.html`, `css/quormel.css`, 24 JavaScript-Module |
| Skript | ein klassisches Skript mit globalen Variablen | ES-Module mit `import`/`export` |
| Zustand | 67 globale Variablen | Objekt `app` in `js/state.js`, gleiche Namen und Startwerte |
| Start | Anweisungen quer durch die Datei | `init()`-Funktionen, von `main.js` in Originalreihenfolge aufgerufen |
| Ereignisse | 37 Inline-Handler (`onclick="…"`) | `data-click` / `data-input` / `data-change` und 32 Aktionen in `js/ui/actions.js` |
| Sensorabfrage | `sense()` ruft pro Abtastpunkt `road()` | `sense()` prüft die Maske direkt über lokale Variablen (gleiche Rechnung, Tempo wie im Original) |

### Entfernt (nachweislich ungenutzt)

- Konstante `MAXSTEPS`
- Funktionen `proj()` und `sideFree()`
- Variablen `fpI`, `fpK`
- leerer `fullscreenchange`-Listener

### Unverändert

- Q-Learning: Rechenweg, Konstanten, Zustandsschlüssel, Reihenfolge der Zufallszahlen
- Speicherformat (`v:1`, `mv:2`) und alle `localStorage`-Schlüssel (`q1save`, `q1pb2|…`, `q1pb|…`, `q1pres`, `q1drv`)
- Speicherhäufigkeit und Speicherort
- HTML-Struktur, Texte und das gesamte CSS (auch doppelte und ungenutzte Regeln)
- alle Funktionen aus Abschnitt 2 des Modernisierungsplans

### Hinzugefügt

- `legacy/Quormel1_Finalcode.html`: unveränderte Originaldatei als Vergleichsgrundlage
- `tests/`: Vergleichstest der Lernlogik und Oberflächentest
- `package.json`: nur für die Tests (Playwright)
- `.nojekyll`: GitHub Pages liefert die Dateien unverarbeitet aus
- Dokumentation in `docs/`, `README.md`

### Neue Einschränkung

Die Seite muss über einen Webserver geöffnet werden. Ein Doppelklick auf `index.html` funktioniert nicht mehr, weil Browser ES-Module von der Festplatte nicht laden. Die Originaldatei in `legacy/` lässt sich weiterhin per Doppelklick öffnen.

## Phase 1 – Analyse und Architektur (11.11.2026)

- `docs/modernization-plan.md` erstellt. Kein Anwendungscode geändert.
