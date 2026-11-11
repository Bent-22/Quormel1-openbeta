# QUORMEL 1 – Testbericht

## Phase 3 (11.11.2026)

**Ergebnis: 775 von 775 Prüfungen bestanden** (29 Lernlogik, 107 Oberfläche am PC, 639 Geräteprofile).

Umgebung: Chrome 153 ohne Fenster (Playwright 1.63), Linux.

**Wichtig:** iPhone, iPad und Android-Geräte wurden als Profile in Chrome nachgestellt (Bildschirmgröße, Pixeldichte, Touch). Safari und echte Geräte standen nicht zur Verfügung. Berührungen und Stift wurden über das Testprotokoll des Browsers erzeugt; der Apple Pencil ist dabei ein Zeiger vom Typ „Stift“.

### 1. Lernlogik (`tests/golden.cjs`) – 29/29

Unverändert bestanden: identische Speicherstände wie das Original.

### 2. Oberfläche am PC (`tests/ui.cjs`) – 107/107

Unverändert bestanden bei 1280 × 800, Maus, Pixeldichte 1: HTML-Inhalt und Canvas-Bilder stimmen nach jedem Schritt mit dem Original überein. Die neuen Bildschirmtasten sind im Vergleich ausgenommen, weil es sie im Original nicht gibt.

### 3. Geräteprofile (`tests/devices.cjs`) – 639/639

| Profil | Größe (CSS-Pixel) | Pixeldichte | Prüfungen |
|---|---|---|---|
| iPhone 14 hoch / quer | 390 × 664 / 750 × 340 | 3 | 51 / 51 |
| iPhone SE hoch | 320 × 568 | 2 | 51 |
| iPad hoch / quer | 810 × 1080 / 1080 × 810 | 2 | 51 / 51 |
| iPad Pro 11 hoch / quer | 834 × 1194 / 1194 × 834 | 2 | 51 / 51 |
| Pixel 7 hoch / quer | 412 × 839 / 863 × 360 | 2,625 | 51 / 51 |
| Galaxy Tab S4 hoch / quer | 712 × 1138 / 1138 × 712 | 2,25 | 51 / 51 |
| Windows-PC | 1920 × 1080 | 1 | 26 |
| Windows-Laptop (125 %) | 1366 × 768 | 1,25 | 26 |
| MacBook (Retina) | 1440 × 900 | 2 | 26 |

Geprüft je Profil:

| Bereich | Prüfung |
|---|---|
| Layout | Auf 12 Ansichten und Dialogen: kein seitliches Scrollen, alle Bedienelemente im Bild; auf Touch-Geräten Schaltflächen mindestens 44 px hoch |
| Lernen | Straßenmaske und Speicherstand nach 500 Episoden sind auf allen 14 Profilen identisch |
| Auflösung | Strecke, Straßengrafik, Diagramm, Startseite, First-Person, Rennen und Editor zeichnen in Geräteauflösung |
| Rennen (Touch) | Vier Tasten sichtbar, mindestens 64 px, im Bild, ohne Überdeckung untereinander und mit der Strecke; Gas startet das Rennen; Gas und Links gleichzeitig; Gleiten von Links nach Rechts; Bremse; Loslassen; Tastatur weiterhin nutzbar |
| Rennen (PC) | Tasten ausgeblendet, Strecke nutzt das ganze Fenster, Start per Pfeiltaste |
| Editor (Touch) | Zeichnen mit dem Finger ohne Scrollen; zweiter Finger erzeugt keine Sprünge; abgebrochene Berührung; Stift verdrängt aufliegende Hand; nach Stiftbenutzung zeichnen Finger nicht mit |
| Editor (alle) | Drehen bzw. Größenänderung erhält die Form; eigene Strecke wird übernommen |
| Fehler | keine Skriptfehler |

### 4. Sichtprüfung

Bildschirmfotos von Startseite, Training, Entscheidungsdialog, First-Person, Rennen, Editor und Duell auf den Profilen iPhone 14 (hoch und quer), iPad (hoch und quer) und MacBook wurden angesehen.

Durch Tests und Sichtprüfung gefunden und behoben:

- Glücksrad-Dialog war auf Smartphones im Querformat höher als der Bildschirm (Schaltflächen nicht erreichbar).
- Namenszeile der Startseite ragte zwischen 700 und 1100 px Breite über den Rand.
- Breite Tabellen verbreiterten auf sehr schmalen Smartphones die ganze Trainingsansicht.
- Parameterauswahl ragte bei 320 px Breite über den Rand.
- Die Bildschirmtasten überlappten sich bei 320 px Breite.
- Fahrerklärung überdeckte im Querformat die Lenktasten.

### Nicht getestet

- **Safari auf iPhone und iPad sowie alle echten Geräte**
- echter Apple Pencil (Druck, Neigung, Handballenerkennung des Systems)
- Vollbildmodus (im Gerätetest abgeschaltet)
- Verhalten mit ein- und ausfahrender Adressleiste echter Mobilbrowser
- Bildrate auf echten Geräten

---

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
