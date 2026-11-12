# QUORMEL 1 – Testbericht

Stand: 12.11.2026, Abschluss von Phase 5.

## 1. Ergebnis in Kürze

- **947 von 947 automatischen Prüfungen bestanden**, einmal für die Dateien im Hauptordner und einmal für den Produktionsbuild `dist/`.
- Die Q-Learning-Logik liefert Zahl für Zahl dieselben Ergebnisse wie die Originaldatei und wie eine unabhängig geschriebene Referenz.
- In der Qualitätskontrolle wurden vier Fehler gefunden und behoben, einer davon schwerwiegend (Abschnitt 6).
- **Alle Tests liefen in einem einzigen Browser: Chrome 153 ohne Fenster, unter Linux.** Kein iPad, kein iPhone, kein Android-Gerät, kein Safari und kein Firefox wurde verwendet. Was daraus folgt, steht in Abschnitt 8.

## 2. Durchgeführte Prüfungen

Umgebung: Chrome 153 (Playwright 1.63), Linux, lokaler Testserver auf `127.0.0.1`. Firefox und WebKit (die Technik hinter Safari) waren in der Testumgebung nicht vorhanden.

| Testreihe | Prüfungen | Vergleich |
|---|---|---|
| `golden.cjs` – Lernlogik | 29 | Original gegen Neufassung |
| `math.cjs` – Lernlogik | 34 | Original und Neufassung gegen unabhängige Referenz |
| `regress.cjs` – erweiterte Regression | 62 | Original gegen Neufassung |
| `ui.cjs` – Oberfläche am PC | 107 | Original gegen Neufassung |
| `devices.cjs` – 14 Geräteprofile | 667 | Neufassung gegen feste Erwartungen |
| `retina.cjs` – Pixeldichte | 17 | Neufassung bei Pixeldichte 1 gegen 2 |
| `pwa.cjs` – Offline und Installation | 31 | Neufassung gegen feste Erwartungen |
| **Summe** | **947** | |

Beide Läufe (Hauptordner und `dist/`) ergaben dasselbe Ergebnis.

„Original gegen Neufassung“ heißt: Dieselben Schritte laufen in `legacy/Quormel1_Finalcode.html` und in der neuen Anwendung, mit demselben Seed für den Zufallsgenerator. Die Ergebnisse müssen zeichengleich sein.

## 3. Regression der Q-Learning-Logik

Drei voneinander unabhängige Nachweise:

**a) Gleiche Ergebnisse wie das Original** (`golden.cjs`, `regress.cjs`). Verglichen wird der vollständige Speicherstand: Q-Tabelle, Zähler, Verlauf, beste Fahrt, Fehlversuche, ε.

| Lauf | Ergebnis |
|---|---|
| Alle drei Vorlagen, je 500 Episoden, danach +500 | identisch |
| Geänderte Parameter und Reward-Gewichte, 1000 Episoden | identisch |
| Langlauf: 5000 Episoden | identisch, einschließlich Langzeitstatistik |
| Drei weitere Seeds auf Vorlage 2 | identisch |
| Parameter-Labor: alle acht Parameter, je zwei Werte | identisch |
| KI gegen KI: alle acht Parameter, gleiche und unterschiedliche Zufallsbasis | identisch |
| Speicherstand des Originals in der Neufassung laden und umgekehrt, weitertrainieren | identisch |

**b) Gleiche Ergebnisse wie eine unabhängige Referenz** (`math.cjs`). Die Referenz ist eine eigenständig ausgeschriebene Umsetzung des Verfahrens: Sensoren, Zustandsbildung, ε-greedy mit zufälliger Wahl bei Gleichstand, Bewegung, Reward, Q-Update, Stillstandsregel, Schrittlimit, ε-Abnahme. Sie teilt keinen Code mit der Anwendung. Vier Trainingsläufe (drei Vorlagen, einmal mit geänderten Parametern) stimmen in Q-Tabelle, Erfolgen, Rewards, Schritten und ε exakt überein – für das Original und für die Neufassung.

**c) Einzelschritte mit festen Zahlen** (`math.cjs`).

| Prüfung | Erwartet | Erhalten |
|---|---|---|
| Q-Update mit α 0,5, γ 0,9, Q = 3, r = 2,88, max Q′ = 5 | 5,18999925223215 | 5,18999925223215 |
| Crash: Ziel ist die Strafe, Folgewerte (absichtlich 1 000 000) bleiben unberücksichtigt | −46,5 | −46,5 |
| Ziel erreicht: Ziel ist die Belohnung, kein Zukunftswert | 50 | 50 |
| ε-Abnahme mit Faktor 0,5 | 1 → 0,5 → 0,25 → 0,125 → 0,0625 → 0,05 → 0,05 | wie erwartet |
| Sensorklassen bei 0, 34, 34,999, 35, 69,999, 70, 120 | 0 0 0 1 1 2 2 | wie erwartet |
| Zustandsschlüssel im Format `01212|3`, höchstens 1215 Zustände | – | 143 bis 301 Zustände, alle gültig |
| Schrittlimit der drei Vorlagen | 1500, 1563, 2846 | wie erwartet |

Dazu auf allen 14 Geräteprofilen: Straßenmaske und Speicherstand nach 500 Episoden sind überall gleich. Pixeldichte und Bildschirmgröße beeinflussen das Lernen nicht.

**Leistung:** Die Neufassung schafft rund 110 000 Lernschritte pro Sekunde, so viel wie das Original (gemessen in Phase 2). Die Oberfläche fordert höchstens 6000 pro Sekunde an. Ein Web Worker ist deshalb nicht nötig; diese im Plan offene Entscheidung ist damit getroffen.

## 4. Abdeckung der ursprünglichen Funktionen

„Verglichen“ = automatisch gegen das Original geprüft. „Teilweise“ = nur ein Ausschnitt ist automatisch geprüft.

| Funktion | Stand | Wie geprüft |
|---|---|---|
| Startseite, Navigation | verglichen | `ui`; die animierte Strecke nur per Sichtprüfung |
| Drei Vorlagen | verglichen | `golden`, `math`, `ui` |
| Editor: Zeichnen, Rückgängig, Löschen, Breite, Übernehmen, Abbrechen | verglichen | `ui` (Maus, Bild für Bild), `devices` (Finger, Stift) |
| Editor: Prüfregeln (zu wenig, zu kurz, außerhalb, Überschneidung, enge Kurve) | verglichen | `regress`, sechs Fälle |
| Parameter, Reward-Gewichte, Sperre nach Start | verglichen | `golden`, `ui` |
| Eingabeprüfung, Warnung bei negativen Werten | verglichen | `ui` |
| Glücksrad | verglichen | `ui` (ein Parameter mit Drehen), `regress` (alle zehn: Titel, Wertevorrat); Drehanimation nur Anfang und Ende |
| Erklärtexte, „So lernt das Auto“ | verglichen | `ui` |
| Start, Pause, Fortsetzen, Weitertrainieren | verglichen | `golden`, `ui` |
| Geschwindigkeitsregler | teilweise | Training über die Bildschleife läuft; einzelne Reglerstufen nicht geprüft |
| Sensorstrahlen, Fortschritt, Ideallinie, Kennzahlen, Diagramm, Q-Tabelle, Protokoll | verglichen | `ui` (HTML und Canvas-Bilder), `retina` |
| Kontrollierter Abbruch bei ungültigen Werten | verglichen | `regress` |
| Präsentationsmodus | verglichen | `ui` |
| KI-Entscheidung untersuchen (Modus A und B, ausführen, vorführen) | verglichen | `ui` |
| Fehleranalyse | verglichen | `ui`, `retina`; Zeitlupe nur am letzten Schritt |
| Beste Fahrt (First-Person), Zeitleiste, Debug-Modus | verglichen | `ui` (vier Positionen), `retina` |
| Beste Fahrt: Tempo 0,5× bis 4× | nicht geprüft | – |
| Rennen: Fahrphysik, Ergebnis, Rekord | verglichen | `regress`: zwei vollständige Rennen mit künstlicher Uhr, W/A/S/D und Pfeiltasten |
| Rennen: Countdown, Geisterauto, Zeit-Anzeige | teilweise | Zeit-Anzeige und Ergebnistext verglichen; Bilder nicht |
| Rennen: unsichtbare Wand, Abbruch bei Stillstand | teilweise | nur soweit die Testfahrten sie berühren |
| Persönliche Bestzeiten, alte namensbasierte Rekorde | verglichen | `regress` |
| Parameter-Labor | verglichen | `regress` (alle acht), `ui`, `retina` |
| KI gegen KI, Auswertung, Vergleich der besten Fahrten | verglichen | `regress` (alle acht, beide Zufallsarten), `ui`, `retina` |
| Automatisches Speichern, Überschreibschutz | verglichen | `golden`, `ui` |
| JSON-Export und -Import | verglichen | `ui`, `pwa` (auch ohne Internet) |
| Prüfung beschädigter Speicherstände | verglichen | `regress`, 20 Fälle |
| Hinweis bei älterer Lernlogik, Erkennung von Vorlagen in alten Ständen | verglichen | `ui`, `regress` |
| Speicher voll | verglichen | `regress`: kein Absturz, letzter guter Stand bleibt |
| Tastatur: Groß-/Kleinschreibung, Pfeiltasten, Zurücksetzen bei Fokusverlust | verglichen | `regress` |
| Vollbild | nicht geprüft | im Browser ohne Fenster nicht aussagekräftig |
| Pausenanimation | teilweise | Anfangs- und Endzustand |

## 5. Neue Funktionen

| Bereich | Geprüft (in Chrome, nachgestellt) |
|---|---|
| Touch-Rennsteuerung | auf elf Touch-Profilen: vier Tasten sichtbar, mindestens 64 px, ohne Überdeckung; Gas, zwei Finger, Gleiten, Bremse, Loslassen; Tastatur weiterhin nutzbar |
| Editor mit Finger und Stift | Zeichnen ohne Scrollen; zweiter Finger ohne Sprünge; abgebrochene Berührung; Stift verdrängt aufliegende Hand; Drehen erhält die Form |
| Layout | bis zu 12 Ansichten und Dialoge je Profil: kein seitliches Scrollen, Bedienelemente im Bild, Schaltflächen mindestens 44 px |
| Retina | 15 Canvas-Ansichten: gleiches Bild bei Pixeldichte 1 und 2, doppelte Auflösung |
| Offline | Server abgeschaltet: Start, Laden, Training, Export, Import |
| Versionswechsel | neue Fassung im Hintergrund, Wechsel erst nach Bestätigung, Trainingsstand unverändert |
| Hosting | Unteradresse (GitHub Pages) und Weiterleitung von `index.html` (Cloudflare Pages) nachgestellt |
| Installation | Chrome meldet keine Hindernisse; Installationsknopf und iOS-Hinweis erscheinen |
| Speicherschutz | Speichern beim Verlassen; gültiger Stand wird nie durch ungültigen ersetzt; Bitte um dauerhaften Speicher |

Sichtprüfung: Bildschirmfotos der wichtigsten Ansichten auf den Profilen iPhone 14 (hoch und quer), iPad (hoch und quer) und MacBook wurden angesehen.

## 6. In Phase 5 gefundene und behobene Fehler

| Nr. | Fehler | Schwere | Herkunft |
|---|---|---|---|
| 1 | Bei Anbietern, die `index.html` weiterleiten (Cloudflare Pages), hätte der Service Worker die Seite ab dem zweiten Aufruf nicht mehr geladen | schwer | Phase 4 |
| 2 | Nach einem Trainingsabbruch wegen ungültiger Werte konnte das Speichern beim Verlassen den letzten gültigen Stand durch einen ungültigen ersetzen | mittel, selten | Phase 4 |
| 3 | Rennergebnis: „Noch einmal“ und „Zurück“ lagen am oberen Bildschirmrand statt in der Ergebniskarte | gering | Originaldatei |
| 4 | Ein eingeblendeter Hinweis konnte auf Smartphones Berührungen der Rennsteuerung abfangen | gering | Phase 3 |

Zu jedem der Fehler 1, 2 und 3 gibt es jetzt einen Test. Die Tests zu 1 und 2 schlugen vor der Korrektur nachweislich fehl.

Fehler 1 zeigt die Grenze der Tests: Er war in Phase 4 nicht aufgefallen, weil der Testserver sich anders verhielt als der echte Anbieter. Das Verhalten von Cloudflare Pages ist jetzt nach dessen Dokumentation nachgestellt, aber nicht dort ausprobiert.

Eine Beobachtung ohne Änderung: Bei einem ungültigen Zahlenwert legt die Anwendung, wie das Original, eine leere Zeile für den Folgezustand in der Q-Tabelle an. Das ändert das Lernen nicht.

## 7. Gegenproben

Damit feststeht, dass die Tests Fehler erkennen:

| Eingebauter oder vorhandener Fehler | Erkannt |
|---|---|
| Lenkwinkel 0,09 → 0,091 (Phase 2) | ja, 14 von 29 Lernprüfungen schlugen fehl |
| Aktion „Rückgängig“ entfernt (Phase 2) | ja |
| Fehler 1 und 2 aus Abschnitt 6 vor der Korrektur | ja |

## 8. Nicht geprüft – muss auf echten Geräten erfolgen

Die folgenden Punkte sind **nicht** durch die automatischen Tests gedeckt. Die Schritte dazu stehen in [device-checklist.md](device-checklist.md).

| Bereich | Warum offen |
|---|---|
| **Safari auf iPad und iPhone** | andere Browser-Technik als Chrome; nichts davon lief je in Safari |
| **Echte Touch-Bedienung** | Berührungen wurden künstlich erzeugt; Systemgesten, Handballen, Lupe, Kontextmenü, Zurück-Wischen sind ungeprüft |
| **Apple Pencil** | nachgestellt als Zeiger vom Typ „Stift“; Druck, Neigung, Handballenerkennung des Systems, Schweben und Doppeltipp fehlen |
| **Installation auf dem Home-Bildschirm** | lässt sich nicht automatisieren; Start der installierten App, Icon, Statusleiste ungeprüft |
| **Offline-Betrieb der installierten App auf iOS** | eigener Speicher, getrennt von Safari |
| **Teilen-Dialog beim Export (iOS)** | nur mit einem Platzhalter geprüft |
| **Dateiauswahl beim Import auf Mobilgeräten** | Test setzt die Datei direkt |
| **Dauerhafter Speicher** | ob und wann ein Browser ihn gewährt; ob Safari Daten nach längerer Nichtnutzung löscht |
| **Verhalten im Hintergrund** | ob das System die App beendet und ob das Speichern beim Verlassen dann noch greift |
| **Vollbild auf dem iPad** | mögliche Überdeckung von „← Zurück“ durch eine Schaltfläche des Systems |
| **Notch, Home-Balken, ein- und ausfahrende Adressleiste** | Abstände nur rechnerisch berücksichtigt |
| **120-Hz-Displays** | doppeltes Tempo von Training und Wiedergaben (bekannt, unverändert) |
| **Leistung und Wärme** | Bildrate bei langem Training auf echten Geräten |
| **Veröffentlichung** | weder bei Cloudflare Pages noch bei GitHub Pages ausprobiert |
| **Firefox, Safari auf dem Mac, Edge** | nicht vorhanden bzw. nicht geprüft |

## 9. Offene Entscheidungen

Nicht freigegeben und deshalb nicht umgesetzt (Modernisierungsplan, Abschnitt 10): gebündeltes Speichern, IndexedDB, Ausgleich für 120-Hz-Displays, mehrere Speicherplätze. Es gibt außerdem keinen Branch `main`; die gesamte Arbeit liegt auf `feat/quormel-cross-platform-pwa`.

---

# Verlauf der früheren Phasen

Die folgenden Abschnitte geben den Stand zum jeweiligen Zeitpunkt wieder. Zahlen und offene Punkte daraus sind durch die Abschnitte oben überholt.

## Phase 4 (11.11.2026)

**Ergebnis: 803 von 803 Prüfungen bestanden** (29 Lernlogik, 107 Oberfläche am PC, 639 Geräteprofile, 28 PWA).

Umgebung: Chrome 153 ohne Fenster (Playwright 1.63), Linux, Testserver auf `127.0.0.1`.

**Wichtig:** Service Worker, Offline-Betrieb und Versionswechsel wurden in Chrome geprüft. Safari, echte Geräte und das tatsächliche Installieren auf dem Home-Bildschirm wurden nicht getestet.

### PWA (`tests/pwa.cjs`) – 28/28

| Bereich | Prüfung |
|---|---|
| Dateien | Dateiliste und Versionskennung in `sw.js` aktuell; alle 35 Dateien vorhanden; Manifest mit Name, Startadresse, Anzeige, Farben, Icons |
| Erster Besuch | Service Worker aktiv und steuert die Seite; Cache enthält alle Dateien; Verweise auf Manifest, Theme-Farbe und Icons (192, 512, maskierbar, 180) |
| Ohne Internet | Server abgeschaltet und Browser offline: Startseite lädt; Stand laden; Training läuft; JSON-Export und -Import funktionieren; keine fehlgeschlagenen Abrufe |
| Versionswechsel | Neue Fassung lädt im Hintergrund, alte bleibt aktiv, Hinweis erscheint; nach „Jetzt aktualisieren“ neue Fassung aktiv, alter Cache entfernt; Trainingsstand unverändert |
| Schutz | Verlassen der App speichert sofort (im Test: gespeichert Episode 50 → 60 bei laufender Episode 60); Bitte um dauerhaften Speicher beim Trainingsstart |
| Installationshilfe | Knopf „App installieren“ erscheint beim Angebot des Browsers und öffnet den Dialog; iPhone-Profil zeigt den Hinweis auf „Teilen“; als App gestartet kein Hinweis |
| Export als App (iPhone-Profil) | Teilen-Dialog erhält Datei mit vollständigem Stand |
| Adresse | Unter einer Unteradresse (wie GitHub Pages) funktionieren Cache und Offline-Start |
| Installierbarkeit | Chrome meldet keine Hindernisse für die Installation |

### Übrige Tests

Lernlogik 29/29, Oberfläche am PC 107/107 und Geräteprofile 639/639 laufen mit aktivem Service Worker unverändert durch.

### Sichtprüfung

Startseite auf dem iPhone-Profil mit allen Hinweisen (Update, Installation, Offline-Status, Speicherhinweis) angesehen.

### Nicht getestet

- **Safari, iPad, iPhone, Android-Geräte**; Installation auf dem Home-Bildschirm; Start der installierten App
- Veröffentlichung bei Cloudflare Pages und GitHub Pages (geprüft wurde mit einem lokalen Testserver)
- ob und wann ein Browser den dauerhaften Speicher tatsächlich gewährt
- Verhalten, wenn das System die App im Hintergrund beendet
- Teilen-Dialog auf echtem iPad/iPhone

---

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
