# QUORMEL 1 – Bekannte Einschränkungen

Stand: Phase 5 (12.11.2026) – Abschluss

## Wichtigste Einschränkung

**Kein echtes Gerät und kein anderer Browser als Chrome wurde getestet.** Safari auf iPad und iPhone, Firefox und alle realen Geräte sind ungeprüft. Was dort noch zu prüfen ist, steht in [device-checklist.md](device-checklist.md).

## Installation, Offline, Speicher (Phase 4)

- **Nicht auf echten Geräten und nicht in Safari getestet.** Service Worker, Offline-Betrieb und Versionswechsel sind in Chrome geprüft. Installation und Start vom Home-Bildschirm sind ungeprüft.
- **iPad und iPhone: getrennter Speicher.** Die installierte App und Safari teilen ihre Daten nicht. Die App muss einmal mit Internet gestartet werden, und Trainingsstände aus Safari erscheinen dort nicht (Übertragung per Export und Import).
- **App löschen löscht Trainingsstände.** Vorher exportieren.
- **Der Browser entscheidet über dauerhaften Speicher.** Lehnt er ab, kann er Daten bei Platzmangel oder langer Nichtnutzung löschen. Die Startseite zeigt, was gilt. Einzig sicher ist der Export als Datei.
- **Speichern beim Verlassen ist nicht garantiert.** Beendet das System die App schlagartig, kann der letzte Schritt fehlen; dann gilt der letzte automatische Speicherstand.
- **Privater Modus.** Dort gibt es in manchen Browsern keinen Offline-Betrieb, und Daten werden beim Schließen verworfen.
- **`node tools/build.cjs` nicht vergessen.** Ohne diesen Schritt nach Änderungen erhalten Geräte, die die Seite kennen, die neue Fassung nicht, und `dist/` ist veraltet.
- **Update-Hinweis nur auf der Startseite.** Wer nie zur Startseite zurückkehrt, sieht ihn nicht.
- **Offline nur die Anwendung.** `docs/` und `legacy/` sind ohne Internet nicht erreichbar.

## Geräte und Touch (Phase 3)

- **Nicht auf echten Geräten und nicht in Safari getestet.** iPhone, iPad und Android wurden als Profile in Chrome nachgestellt. Vor einer Vorführung auf einem echten iPad oder iPhone ausprobieren.
- **Vollbild auf dem iPad.** Editor, Wiedergabe und Rennen fordern wie bisher Vollbild an. Safari auf dem iPad blendet dabei möglicherweise eine eigene Schließen-Schaltfläche oben links ein, wo auch „Zurück“ liegt. Ungeprüft.
- **Editor im Hochformat.** Die Strecke lebt in einer querformatigen Welt (1000 × 640). Im Hochformat ist deshalb nur ein schmaler Streifen dieser Welt bezeichenbar; die Strecke erscheint im Training entsprechend klein. Zum Zeichnen ist das Querformat besser geeignet.
- **Editor-Werkzeugleiste.** Auf kleinen Bildschirmen liegt sie über dem oberen Rand des Zeichenbereichs; dort kann nicht gezeichnet werden.
- **Stiftvorrang.** Nach der ersten Stiftberührung zeichnen Finger nicht mehr mit, bis der Editor geschlossen und neu geöffnet wird.
- **Fahrerklärung im Rennen.** Sie ist wie bisher anfangs aufgeklappt und verdeckt auf Smartphones einen Teil der Strecke, bis zum ersten Gasgeben.
- **Touch-Modus bleibt an.** Auf Laptops mit Touchscreen bleiben die Bildschirmtasten nach der ersten Berührung bis zum Neuladen sichtbar.
- **Dezimalkomma.** Zahlenfelder erwarten weiterhin einen Punkt (0.15). Ein Komma wird als ungültig gemeldet.
- **Auflösung begrenzt.** Canvas zeichnen höchstens mit Faktor 2, auch auf Geräten mit Pixeldichte 3.

## Aus Phase 2

- **Kein Start per Doppelklick.** `index.html` muss über einen Webserver geöffnet werden. Die Originaldatei `legacy/Quormel1_Finalcode.html` funktioniert weiterhin per Doppelklick, enthält aber keine der neuen Funktionen.

## Unverändert aus der Originaldatei

- Auf 120-Hz-Displays (z. B. iPad Pro) laufen Training, Labor und Wiedergaben doppelt so schnell.
- Training hält an, wenn Tab oder Bildschirm inaktiv sind.
- In der Wiedergabe wackeln die Schaltflächen auf breiten Bildschirmen leicht, weil die Zeitanzeige ihre Breite ändert.

## Unverändert, Entscheidung offen (Plan, Abschnitt 10)

- Speicherung nur in `localStorage`, ein Speicherplatz.
- Bei jeder erfolgreichen Episode wird der gesamte Stand gespeichert und erneut geprüft.

## Technisch

- Der Lernkern (`js/core/`) ruft direkt Oberflächen- und Speicherfunktionen auf.
- Das ursprüngliche CSS enthält doppelte und ungenutzte Regeln; es wurde unverändert übernommen. Neue Regeln stehen im Block „Phase 3“.
- Der Produktionsbuild kopiert die Dateien unverändert; es gibt keine Bündelung, keine Verkleinerung und keine Typprüfung.
- Bei einem ungültigen Zahlenwert im Training legt die Anwendung wie die Originaldatei eine leere Zeile (fünf Nullen) für den Folgezustand an. Das ändert das Lernen nicht.
- Fehlt beim Hochladen eine Datei, bemerkt man das nur am Fehlen von „Offline bereit“.
