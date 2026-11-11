# QUORMEL 1 – Übersicht der Änderungen

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
