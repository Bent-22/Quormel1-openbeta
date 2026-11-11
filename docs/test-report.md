# QUORMEL 1 – Testbericht

## Phase 2 (11.11.2026)

**Ergebnis: 136 von 136 Prüfungen bestanden** (29 Lernlogik, 107 Oberfläche).

Umgebung: Chrome 153 ohne Fenster (Playwright 1.63), Linux, Fenstergröße 1280 × 800.

### Verfahren

Beide Tests laden die Originaldatei (`legacy/`) und die Neufassung im selben Browser, führen dieselben Schritte aus und vergleichen die Ergebnisse zeichengenau. Der Zufallsgenerator wird in beiden Fassungen auf denselben Seed gesetzt.

### 1. Lernlogik (`tests/golden.cjs`) – 29/29

Verglichen werden jeweils der vollständige Speicherstand (Q-Tabelle, Zähler, Verlauf, beste Fahrt, Fehlversuche), ε, letzter Lernschritt, Lernprotokoll und Kennzahlen.

| Szenario | Ergebnis |
|---|---|
| Training auf allen drei Vorlagen, je 500 Episoden | identisch |
| Weitertrainieren um 500 Episoden, je Vorlage | identisch |
| Training mit geänderten Parametern und Reward-Gewichten, 1000 Episoden | identisch |
| Speicherstand der Neufassung im Original laden und umgekehrt, je 100 Episoden weitertrainieren | identisch, beide Richtungen akzeptiert |
| Parameter-Labor (γ und ε-Abnahme, je 4000 Lernschritte), danach Rückkehr | identisch, Trainingsstand wiederhergestellt |
| Duell mit gleicher und mit unterschiedlicher Zufallsbasis, je 100 Episoden | identisch, inklusive Auswertungstext |
| Skriptfehler in der Konsole | keine |

### 2. Oberfläche (`tests/ui.cjs`) – 107/107

Nach jedem Schritt werden sichtbare Seite, offene Dialoge, der gesamte HTML-Inhalt und ausgewählte Canvas-Bilder verglichen (pixelgenau).

| Bereich | Geprüft |
|---|---|
| Navigation | Start, Streckenwahl, Trainingsansicht, Rückwege |
| Training | Erklärung, Ideallinie, Präsentationsmodus, Glücksrad, Eingabeprüfung, Warnung bei negativen Werten, Start, Pause, Fortsetzen, Weitertrainieren |
| Analyse | Fehleranalyse (Übersicht, Detail, zurück), Entscheidung untersuchen (Modus A und B, ausführen, vorführen, fortsetzen) |
| Beste Fahrt | First-Person an vier Positionen, Debug-Modus, Zeitleiste |
| Rennen | Start, Gas per Tastatur, Abbruch, Ergebnis, „Noch einmal“, „Zurück“ |
| Lernmodule | Parameter-Labor, Duell samt Vergleich der besten Fahrten |
| Editor | Zeichnen, Rückgängig, Löschen, Straßenbreite, Übernehmen, Abbrechen; Streckenpunkte und Maske identisch |
| Speichern | Export (Dateiname und Inhalt), Laden, Überschreib-Warnung, Import, Ablehnung ungültiger Dateien, Hinweis bei älterer Lernlogik |

Alle 32 Aktionen, die frühere Inline-Handler ersetzen, werden dabei mindestens einmal ausgelöst (eigene Prüfung am Ende des Tests).

### 3. Gegenproben

Damit feststeht, dass die Tests Fehler erkennen, wurden zwei Fehler absichtlich eingebaut und wieder entfernt:

| Eingebauter Fehler | Erkannt |
|---|---|
| Lenkwinkel 0,09 → 0,091 | ja, 14 von 29 Lernprüfungen schlugen fehl |
| Aktion „Rückgängig“ im Editor entfernt | ja, der betroffene Schritt schlug fehl |

### 4. Lerntempo

Gemessen: 400 000 Lernschritte am Stück, Vorlage 2, Chrome ohne Fenster.

| Fassung | Lernschritte pro Sekunde |
|---|---|
| Original | ca. 105 000 – 117 000 |
| Neufassung, erste Zerlegung | ca. 60 000 – 72 000 |
| Neufassung, mit umformulierter Sensorabfrage | ca. 109 000 – 112 000 |

Die Oberfläche fordert höchstens 100 Schritte pro Bild an (6000 pro Sekunde bei 60 Bildern).

### Nicht getestet

- Safari, Firefox und alle echten Mobilgeräte (in der Testumgebung stand nur Chrome zur Verfügung)
- Rennen: Fahrphysik im Detail (zeitabhängig; geprüft ist nur, dass Start, Gas, Abbruch und Ergebnis funktionieren)
- Vollbildmodus (im Browser ohne Fenster nicht aussagekräftig)
- Glücksrad-Animation und Pausenanimation als Bildfolge (geprüft sind Anfangs- und Endzustand)
- Verhalten bei vollem Browser-Speicher
