# QUORMEL 1 – Übersicht der Änderungen

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
