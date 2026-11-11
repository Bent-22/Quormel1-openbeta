# QUORMEL 1

Ein Auto lernt mit tabellarischem Q-Learning, eine Rennstrecke zu fahren – durch Versuch und Irrtum, ohne vorgegebene Fahrlinie.

Dieses Repository enthält die Weiterentwicklung der ursprünglichen Einzeldatei zu einer plattformübergreifenden Web-Anwendung. Stand: **Phase 3 von 5 abgeschlossen** (Gerätekompatibilität und Touch-Bedienung). Installierbarkeit und Offline-Betrieb folgen in Phase 4.

## Starten

Die Seite besteht aus statischen Dateien und braucht keinen Build-Schritt. Sie muss über einen Webserver geöffnet werden – ein Doppelklick auf `index.html` funktioniert nicht mehr (siehe [bekannte Einschränkungen](docs/known-limitations.md)).

```
python3 -m http.server 8080
```

Danach im Browser `http://localhost:8080` öffnen.

## Veröffentlichen

Zur Website gehören `index.html`, `css/` und `js/`. Anleitung für GitHub Pages und Cloudflare Pages: [docs/install-and-build.md](docs/install-and-build.md).

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [docs/modernization-plan.md](docs/modernization-plan.md) | Analyse und Plan (Phase 1) |
| [docs/architecture.md](docs/architecture.md) | Technische Architektur |
| [docs/changes.md](docs/changes.md) | Übersicht der Änderungen je Phase |
| [docs/install-and-build.md](docs/install-and-build.md) | Starten, Veröffentlichen, Tests |
| [docs/test-report.md](docs/test-report.md) | Testbericht |
| [docs/known-limitations.md](docs/known-limitations.md) | Bekannte Einschränkungen |

## Ordner

| Ordner | Inhalt |
|---|---|
| `index.html`, `css/`, `js/` | die Anwendung |
| `legacy/` | unveränderte Originaldatei als Vergleichsgrundlage |
| `tests/` | automatische Vergleichs- und Oberflächentests |
| `docs/` | Dokumentation |
