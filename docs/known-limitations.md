# QUORMEL 1 – Bekannte Einschränkungen

Stand: Phase 2 (11.11.2026)

## Neu durch Phase 2

- **Kein Start per Doppelklick.** `index.html` muss über einen Webserver geöffnet werden (veröffentlichte Adresse oder lokaler Server). Die Originaldatei `legacy/Quormel1_Finalcode.html` funktioniert weiterhin per Doppelklick.
- **Nur in Chrome getestet.** ES-Module werden von allen aktuellen Browsern unterstützt; Safari und Firefox wurden aber nicht geprüft.
- **Zwischenspeicher des Browsers.** Nach einer neuen Veröffentlichung kann ein Browser kurzzeitig alte und neue Moduldateien mischen. Abhilfe bis Phase 4: Seite neu laden ohne Cache.

## Unverändert aus der Originaldatei (Phase 3 und 4)

- Rennen nur per Tastatur spielbar.
- Streckeneditor ohne Schutz vor Scroll- und Zoom-Gesten, keine Stift-Optimierung.
- Canvas-Darstellung auf Retina- und High-DPI-Displays unscharf.
- Layout für Smartphones und Tablets im Hochformat nicht optimiert.
- Nicht installierbar, nicht offline nutzbar.
- Auf 120-Hz-Displays laufen Training, Labor und Wiedergaben doppelt so schnell.
- Training hält an, wenn Tab oder Bildschirm inaktiv sind.

## Unverändert, Entscheidung offen (Plan, Abschnitt 10)

- Speicherung nur in `localStorage`, ein Speicherplatz.
- Bei jeder erfolgreichen Episode wird der gesamte Stand gespeichert und erneut geprüft.

## Technisch

- Der Lernkern (`js/core/`) ruft direkt Oberflächen- und Speicherfunktionen auf.
- Das CSS enthält doppelte und ungenutzte Regeln; es wurde bewusst unverändert übernommen.
- Kein Build-System und keine Typprüfung (Abweichung vom Plan, begründet in `architecture.md`).
