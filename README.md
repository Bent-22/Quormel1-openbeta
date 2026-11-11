# QUORMEL 1

Ein Auto lernt mit tabellarischem Q-Learning, eine Rennstrecke zu fahren – durch Versuch und Irrtum, ohne vorgegebene Fahrlinie.

Dieses Repository enthält die Weiterentwicklung der ursprünglichen Einzeldatei zu einer plattformübergreifenden Web-Anwendung. Stand: **Phase 4 von 5 abgeschlossen**. Die Anwendung ist installierbar und funktioniert nach dem ersten Laden offline.

## Starten

Die Seite besteht aus statischen Dateien und braucht keinen Build-Schritt. Sie muss über einen Webserver geöffnet werden – ein Doppelklick auf `index.html` funktioniert nicht mehr (siehe [bekannte Einschränkungen](docs/known-limitations.md)).

```
python3 -m http.server 8080
```

Danach im Browser `http://localhost:8080` öffnen.

## Veröffentlichen

Schritt für Schritt, einschließlich Installation auf iPad, iPhone und Android: [docs/publish-and-install.md](docs/publish-and-install.md).

Nach jeder Änderung an Dateien der Anwendung vor dem Hochladen: `node tools/update-sw.cjs`.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [docs/modernization-plan.md](docs/modernization-plan.md) | Analyse und Plan (Phase 1) |
| [docs/architecture.md](docs/architecture.md) | Technische Architektur |
| [docs/changes.md](docs/changes.md) | Übersicht der Änderungen je Phase |
| [docs/publish-and-install.md](docs/publish-and-install.md) | Veröffentlichen über HTTPS, Installation auf iPad, iPhone, Android |
| [docs/pwa-offline.md](docs/pwa-offline.md) | Offline-Betrieb, Versionswechsel, Schutz der Trainingsstände |
| [docs/install-and-build.md](docs/install-and-build.md) | Lokal starten, Tests |
| [docs/test-report.md](docs/test-report.md) | Testbericht |
| [docs/known-limitations.md](docs/known-limitations.md) | Bekannte Einschränkungen |

## Ordner

| Ordner | Inhalt |
|---|---|
| `index.html`, `sw.js`, `manifest.webmanifest`, `css/`, `js/`, `icons/` | die Anwendung |
| `tools/` | Hilfsskripte (Service-Worker-Liste, Icons) |
| `legacy/` | unveränderte Originaldatei als Vergleichsgrundlage |
| `tests/` | automatische Vergleichs- und Oberflächentests |
| `docs/` | Dokumentation |
