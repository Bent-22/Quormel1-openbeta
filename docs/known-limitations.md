# QUORMEL 1 – Bekannte Einschränkungen

Stand: Phase 3 (11.11.2026)

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
- **Zwischenspeicher des Browsers.** Nach einer neuen Veröffentlichung kann ein Browser kurzzeitig alte und neue Dateien mischen. Abhilfe bis Phase 4: Seite neu laden ohne Cache.

## Unverändert aus der Originaldatei

- Nicht installierbar, nicht offline nutzbar (Phase 4).
- Auf 120-Hz-Displays (z. B. iPad Pro) laufen Training, Labor und Wiedergaben doppelt so schnell.
- Training hält an, wenn Tab oder Bildschirm inaktiv sind.
- In der Wiedergabe wackeln die Schaltflächen auf breiten Bildschirmen leicht, weil die Zeitanzeige ihre Breite ändert.

## Unverändert, Entscheidung offen (Plan, Abschnitt 10)

- Speicherung nur in `localStorage`, ein Speicherplatz.
- Bei jeder erfolgreichen Episode wird der gesamte Stand gespeichert und erneut geprüft.

## Technisch

- Der Lernkern (`js/core/`) ruft direkt Oberflächen- und Speicherfunktionen auf.
- Das ursprüngliche CSS enthält doppelte und ungenutzte Regeln; es wurde unverändert übernommen. Neue Regeln stehen im Block „Phase 3“.
- Kein Build-System und keine Typprüfung.
