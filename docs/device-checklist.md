# QUORMEL 1 – Checkliste für echte Geräte

Alle automatischen Tests liefen in Chrome auf einem Rechner ohne Bildschirm. iPhone, iPad und Android wurden dabei nur nachgestellt. Diese Liste enthält, was deshalb noch auf echten Geräten geprüft werden muss.

**So gehst du vor:** Seite veröffentlichen ([publish-and-install.md](publish-and-install.md)), Adresse auf dem Gerät öffnen, Punkte der Reihe nach durchgehen. Abweichungen notieren: Gerät, System-Version, Browser, was passiert ist.

Dauer: etwa 20 Minuten pro Gerät. Die Abschnitte A bis C sind die wichtigsten.

---

## A. iPad und iPhone in Safari (höchste Priorität)

Noch nie getestet: Safari verwendet eine andere Browser-Technik als Chrome.

| Nr. | Schritt | Erwartet |
|---|---|---|
| A1 | Adresse in Safari öffnen | Startseite erscheint vollständig, dunkles Design, animierte Strecke |
| A2 | Einige Sekunden warten | Zeile „Offline bereit – QUORMEL 1 funktioniert jetzt auch ohne Internet.“ |
| A3 | „Zur Strecke“ → Vorlage 1 → „Training starten“ | Auto fährt, Kennzahlen und Diagramm laufen mit |
| A4 | Strecke, Schrift und Diagramm genau ansehen | scharf, nicht verpixelt |
| A5 | Gerät drehen (hoch ↔ quer) | Layout passt sich an, nichts ist abgeschnitten, kein seitliches Scrollen |
| A6 | In ein Zahlenfeld tippen (z. B. Lernrate) | Seite zoomt nicht hinein |
| A7 | Schnell zweimal auf eine Schaltfläche tippen | kein Zoom |
| A8 | Glücksrad öffnen und drehen | Rad dreht, Wert lässt sich übernehmen |
| A9 | Training beenden lassen, „Beste Fahrt“ ansehen | 3D-Ansicht läuft flüssig, Schaltflächen unten erreichbar |
| A10 | Seite neu laden | Seite erscheint wieder (prüft das Zusammenspiel von Offline-Speicher und Hosting) |

## B. Rennen mit Touch-Steuerung

| Nr. | Schritt | Erwartet |
|---|---|---|
| B1 | „Rennen gegen die KI“ öffnen | vier Tasten sichtbar: Links, Rechts (unten links), Bremse, Gas (unten rechts) |
| B2 | „Rennen starten“, nach dem Countdown „Gas“ halten | Auto fährt los, Zeit läuft |
| B3 | „Gas“ halten und gleichzeitig „Links“ / „Rechts“ | Auto lenkt, während es Gas gibt |
| B4 | Finger von „Links“ nach „Rechts“ schieben, ohne abzuheben | Lenkrichtung wechselt |
| B5 | Tasten lange gedrückt halten | kein Kontextmenü, keine Textmarkierung, keine Lupe |
| B6 | Während der Fahrt am Bildschirmrand wischen | Seite scrollt nicht; Fahrt wird nicht durch „Zurück“-Geste beendet |
| B7 | Rennen beenden | Ergebniskarte mit „Noch einmal“ und „Zurück“ in der Karte |
| B8 | Hoch- und Querformat | Strecke vollständig sichtbar, Tasten verdecken sie nicht |
| B9 | iPad: Vollbild | „← Zurück“ oben links bleibt bedienbar und wird nicht von einer Schaltfläche des Systems verdeckt |

## C. Streckeneditor mit Finger und Apple Pencil

| Nr. | Schritt | Erwartet |
|---|---|---|
| C1 | „Eigene Strecke zeichnen“, mit dem Finger eine Strecke ziehen | Linie folgt dem Finger, Seite scrollt und zoomt nicht |
| C2 | Während des Zeichnens zweiten Finger aufsetzen | keine Sprünge in der Linie |
| C3 | Mit dem Apple Pencil zeichnen, Hand liegt auf | nur der Stift zeichnet, die Hand erzeugt keine Striche |
| C4 | Schnell und in engen Bögen zeichnen | Linie bleibt glatt, keine Ecken |
| C5 | Stift: Doppeltipp, Schweben über dem Bildschirm (falls unterstützt) | nichts Unerwartetes |
| C6 | „Rückgängig“, „Löschen“, Straßenbreite ändern | funktioniert, Schaltflächen gut treffbar |
| C7 | Gerät im Editor drehen | Zeichnung behält ihre Form |
| C8 | „Zeichnen beenden“ | Strecke erscheint im Training |

## D. Installation und Offline-Betrieb

| Nr. | Schritt | Erwartet |
|---|---|---|
| D1 | iPad/iPhone: Teilen → „Zum Home-Bildschirm“ | Symbol mit QUORMEL-Icon und Name „QUORMEL 1“ |
| D2 | App vom Home-Bildschirm starten (mit Internet) | öffnet ohne Adressleiste; „Offline bereit“ erscheint |
| D3 | Flugmodus einschalten, App schließen und neu starten | App startet vollständig |
| D4 | Im Flugmodus trainieren, App schließen, neu starten, „Letzten Speicherstand laden“ | Stand ist vorhanden |
| D5 | Training starten, zum Home-Bildschirm wechseln, eine Minute warten, zurückkehren | Training ist angehalten oder läuft weiter; Stand ist nicht verloren |
| D6 | Startseite: Zeile zum Speicher lesen | „dauerhaft gespeichert“ oder Hinweis auf Export |
| D7 | Android: „App installieren“ auf der Startseite | Installationsdialog, danach App im Startbildschirm |
| D8 | Oberer und unterer Rand (Notch, Home-Balken) | nichts Wichtiges verdeckt |

## E. Speicherstand exportieren und importieren

| Nr. | Schritt | Erwartet |
|---|---|---|
| E1 | In Safari: „Speicherstand exportieren“ | Datei wird geladen bzw. zum Sichern angeboten |
| E2 | In der installierten App (iPad/iPhone): „Speicherstand exportieren“ | Teilen-Dialog; „In Dateien sichern“ legt eine `.json`-Datei ab |
| E3 | „Speicherstand importieren“, Datei aus „Dateien“ wählen | Stand wird geladen |
| E4 | Datei von einem anderen Gerät importieren (z. B. vom PC) | Stand wird geladen, Training lässt sich fortsetzen |
| E5 | Einen Stand aus der Originaldatei importieren | wird angenommen |

## F. Aktualisierung

| Nr. | Schritt | Erwartet |
|---|---|---|
| F1 | Neue Fassung hochladen, App mit Internet öffnen | Hinweis „Eine neue Version … ist verfügbar“ auf der Startseite |
| F2 | „Jetzt aktualisieren“ | App lädt neu, Trainingsstand ist noch da |

## G. Dauerbetrieb

| Nr. | Schritt | Erwartet |
|---|---|---|
| G1 | 5000 Episoden bei hoher Geschwindigkeit trainieren | Oberfläche bleibt bedienbar, Gerät wird nicht übermäßig warm |
| G2 | iPad Pro oder anderes 120-Hz-Gerät | Training und Wiedergaben laufen doppelt so schnell wie auf 60-Hz-Geräten (bekannte Einschränkung) |
| G3 | Nach einer Woche ohne Nutzung öffnen (nicht installierte Seite in Safari) | prüfen, ob der Speicherstand noch vorhanden ist |

## H. Windows und Mac

In Chrome bereits automatisch geprüft. Offen sind andere Browser.

| Nr. | Schritt | Erwartet |
|---|---|---|
| H1 | Firefox: Training, Rennen mit Tastatur, Editor mit Maus | funktioniert wie in Chrome |
| H2 | Safari auf dem Mac: dasselbe | funktioniert wie in Chrome |
| H3 | Edge: „App installieren“ | App wird installiert und startet |
| H4 | Laptop mit Touchscreen: Bildschirm berühren, dann Rennen öffnen | Bildschirmtasten erscheinen, Tastatur funktioniert weiterhin |
