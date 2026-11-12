# QUORMEL 1

Ein Auto lernt mit tabellarischem Q-Learning, eine Rennstrecke zu fahren – durch Versuch und Irrtum, ohne vorgegebene Fahrlinie.

Dieses Repository enthält die Weiterentwicklung der ursprünglichen Einzeldatei zu einer plattformübergreifenden Web-Anwendung. Stand: **alle fünf Phasen abgeschlossen** (12.11.2026). Die Anwendung ist installierbar, funktioniert nach dem ersten Laden offline und lässt sich per Touch, Stift, Tastatur und Maus bedienen.

**Getestet wurde ausschließlich in Chrome auf einem Rechner.** iPad, iPhone, Android und Safari wurden nachgestellt, aber nicht real geprüft. Siehe [Testbericht](docs/test-report.md) und [Checkliste für echte Geräte](docs/device-checklist.md).

## Starten

Die Seite besteht aus statischen Dateien und braucht keinen Build-Schritt. Sie muss über einen Webserver geöffnet werden – ein Doppelklick auf `index.html` funktioniert nicht mehr (siehe [bekannte Einschränkungen](docs/known-limitations.md)).

```
python3 -m http.server 8080
```

Danach im Browser `http://localhost:8080` öffnen.

## Veröffentlichen

Schritt für Schritt, einschließlich Installation auf iPad, iPhone und Android: [docs/publish-and-install.md](docs/publish-and-install.md).

Veröffentlicht wird der Ordner `dist/`. Nach jeder Änderung an Dateien der Anwendung: `node tools/build.cjs`.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [docs/modernization-plan.md](docs/modernization-plan.md) | Analyse und Plan (Phase 1) |
| [docs/architecture.md](docs/architecture.md) | Technische Architektur |
| [docs/changes.md](docs/changes.md) | Übersicht der Änderungen je Phase |
| [docs/publish-and-install.md](docs/publish-and-install.md) | Veröffentlichen über HTTPS, Installation auf iPad, iPhone, Android |
| [docs/pwa-offline.md](docs/pwa-offline.md) | Offline-Betrieb, Versionswechsel, Schutz der Trainingsstände |
| [docs/install-and-build.md](docs/install-and-build.md) | Lokal starten, Build, Tests |
| [docs/test-report.md](docs/test-report.md) | Testbericht: was geprüft wurde und was nicht |
| [docs/device-checklist.md](docs/device-checklist.md) | Prüfungen, die auf echten Geräten noch ausstehen |
| [docs/known-limitations.md](docs/known-limitations.md) | Bekannte Einschränkungen |

## Ordner

| Ordner | Inhalt |
|---|---|
| `index.html`, `sw.js`, `manifest.webmanifest`, `css/`, `js/`, `icons/` | die Anwendung |
| `dist/` | Produktionsbuild: der Ordner, der veröffentlicht wird |
| `tools/` | Hilfsskripte (Build, Service-Worker-Liste, Icons) |
| `legacy/` | unveränderte Originaldatei als Vergleichsgrundlage |
| `tests/` | automatische Vergleichs- und Oberflächentests |
| `docs/` | Dokumentation |
