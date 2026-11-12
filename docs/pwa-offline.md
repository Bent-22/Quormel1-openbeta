# QUORMEL 1 – PWA und Offline-Betrieb

Stand: Phase 5 (12.11.2026). Die Schritt-für-Schritt-Anleitung für Nutzer steht in [publish-and-install.md](publish-and-install.md).

## Bestandteile

| Datei | Aufgabe |
|---|---|
| `manifest.webmanifest` | Name, Icons, Farben, Startadresse; macht die Seite installierbar |
| `icons/` | App-Icons 192 und 512 px, maskierbares Icon, Icon für iPad/iPhone (180 px); Quelle `icon.svg` |
| `sw.js` | Service Worker: Offline-Cache und Versionswechsel |
| `js/pwa/register.js` | meldet den Service Worker an; Offline-Status, Update-Hinweis, Installationshilfe |
| `js/storage/protect.js` | Schutz der Trainingsstände |
| `tools/update-sw.cjs` | trägt Dateiliste und Versionskennung in `sw.js` ein |
| `tools/make-icons.cjs` | erzeugt die PNG-Icons aus `icons/icon.svg` |

## Offline-Cache

- **Installieren:** Beim ersten Besuch lädt der Service Worker alle 35 Dateien der Anwendung in den Cache `quormel1-<Version>`.
- **Abrufen:** Diese Dateien werden danach immer aus dem Cache beantwortet, mit und ohne Internet. Alles andere (z. B. `docs/`, `legacy/`) läuft normal über das Netz und ist offline nicht verfügbar.
- **Startadresse:** Der Aufruf des Ordners (`…/`) wird mit `index.html` beantwortet.
- **Pfade:** Alles ist relativ zur Lage von `sw.js`. Die Seite funktioniert an der Wurzel einer Adresse und in einem Unterordner.

Die Anwendung lädt keine fremden Ressourcen. Ohne Internet fehlt deshalb nichts.

## Versionswechsel

`sw.js` enthält eine Versionskennung, berechnet aus dem Inhalt aller Dateien. Ändert sich eine Datei, ändert sich die Kennung.

1. Der Browser bemerkt die geänderte `sw.js` (beim Öffnen und beim Zurückkehren in die App).
2. Die neue Fassung wird vollständig in einen neuen Cache geladen. Die alte Fassung läuft unverändert weiter.
3. Auf der Startseite erscheint „Eine neue Version von QUORMEL 1 ist verfügbar.“
4. Erst nach „Jetzt aktualisieren“ übernimmt die neue Fassung, der alte Cache wird gelöscht, die Seite lädt neu.

So werden nie mitten in einer Sitzung alte und neue Dateien gemischt, und ein laufendes Training wird nie ungefragt unterbrochen. Läuft beim Aktualisieren ein Training, wird es vorher angehalten und gespeichert.

**Nach jeder Änderung an Dateien der Anwendung:** `node tools/build.cjs` (aktualisiert `sw.js` und `dist/`). Der Test `tests/pwa.cjs` schlägt fehl, wenn das vergessen wurde.

**Weiterleitungen:** Manche Anbieter leiten `index.html` auf den Ordner weiter (Cloudflare Pages). Der Service Worker übernimmt den Inhalt solcher Antworten in eine neue Antwort, weil Browser weitergeleitete Antworten für Seitenaufrufe ablehnen.

## Installationshilfe

| Gerät | Verhalten |
|---|---|
| Android, Chrome, Edge | Sobald der Browser die Installation anbietet, erscheint auf der Startseite „App installieren“. |
| iPad, iPhone im Browser | Hinweis auf der Startseite: „Teilen“ → „Zum Home-Bildschirm“. Eine andere Möglichkeit bietet iOS nicht. |
| bereits installiert | keine Installationshinweise |

## Schutz der Trainingsstände

Trainingsstände liegen unverändert in `localStorage` unter `q1save`, im bisherigen JSON-Format. Der Service Worker und sein Cache berühren sie nie; ein Versionswechsel lässt sie unangetastet.

Neu in Phase 4:

| Maßnahme | Wirkung |
|---|---|
| Speichern beim Verlassen | Geht die App in den Hintergrund oder wird sie geschlossen, wird ein laufendes oder pausiertes Training sofort gespeichert. Vorher konnten bis zu 49 Episoden seit dem letzten automatischen Speichern verloren gehen. Ergibt das Speichern keinen gültigen Stand, bleibt der vorherige erhalten. |
| Dauerhafter Speicher | Beim Start eines Trainings, beim Laden und beim Import bittet die App den Browser, die Daten nicht selbstständig zu löschen. Ob er zustimmt, entscheidet der Browser. Die Startseite zeigt das Ergebnis. |
| Export in der installierten App (iPad/iPhone) | Der Export läuft dort über den Teilen-Dialog, weil Downloads in installierten Web-Apps unzuverlässig sind. Überall sonst bleibt es beim Download. |

Unverändert vorhanden: Warnung vor dem Überschreiben, Export vor dem Überschreiben, vollständige Prüfung beim Import, Hinweis bei Ständen mit älterer Lernlogik.

Wovor die App nicht schützen kann, steht in [known-limitations.md](known-limitations.md).
