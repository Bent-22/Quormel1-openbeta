# QUORMEL 1 – Veröffentlichen und installieren

Diese Anleitung führt in drei Schritten zum Ziel:

1. Die Seite über HTTPS veröffentlichen.
2. Prüfen, dass sie offline bereit ist.
3. Auf iPad, iPhone oder Android als App installieren.

HTTPS ist Pflicht. Ohne HTTPS läuft die Seite zwar, aber Browser erlauben dann weder Offline-Betrieb noch Installation. Cloudflare Pages und GitHub Pages liefern HTTPS automatisch.

---

## 1. Veröffentlichen

### Was hochgeladen werden muss

**Den Ordner `dist/`.** Er enthält genau die 36 Dateien der fertigen Anwendung und nichts anderes.

Am einfachsten: auf GitHub „Code“ → „Download ZIP“ wählen, die ZIP-Datei entpacken und daraus den Ordner `dist` hochladen.

### Weg A: Cloudflare Pages (Hochladen per Drag & Drop)

Erste Veröffentlichung:

1. Im Cloudflare-Dashboard „Workers & Pages“ öffnen.
2. „Create application“ → „Get started“ → „Drag and drop your files“.
3. Einen Projektnamen eingeben. Er wird Teil der Adresse: `<projektname>.pages.dev`.
4. Den Ordner `dist` in das Upload-Feld ziehen.
5. „Deploy site“ wählen.

Neue Fassung hochladen:

1. Das Projekt öffnen.
2. „Create a new deployment“ wählen, Umgebung „production“.
3. Den neuen Ordner `dist` hochladen.

Grenzen laut Cloudflare: höchstens 1000 Dateien, höchstens 25 MiB pro Datei. QUORMEL 1 liegt weit darunter. Die Bezeichnungen im Dashboard können sich ändern.

### Weg B: GitHub Pages

1. Im Repository „Settings“ → „Pages“ öffnen.
2. Unter „Source“ „Deploy from a branch“ wählen.
3. Den Branch und den Ordner `/ (root)` auswählen, speichern. (Im Hauptordner liegen dieselben Dateien wie in `dist/`, dazu Dokumentation und Tests.)
4. Nach ein bis zwei Minuten ist die Seite unter `https://<benutzername>.github.io/Quormel1-openbeta/` erreichbar.

Bei diesem Weg steht der GitHub-Benutzername in der Adresse.

### Wenn du selbst Dateien änderst

Der Offline-Speicher erkennt neue Fassungen an einer Kennung in `sw.js`. Nach jeder Änderung an `index.html`, `css/`, `js/`, `icons/` oder `manifest.webmanifest` einmal ausführen:

```
node tools/build.cjs
```

Das aktualisiert die Kennung und erzeugt `dist/` neu. Danach `dist` hochladen. Ohne diesen Schritt bekommen Geräte, die die Seite schon kennen, die Änderung nicht.

---

## 2. Prüfen

1. Die veröffentlichte Adresse im Browser öffnen.
2. Auf der Startseite erscheint nach wenigen Sekunden: „Offline bereit – QUORMEL 1 funktioniert jetzt auch ohne Internet.“
3. Gegenprobe: Flugmodus einschalten, die Seite neu laden. Sie muss vollständig erscheinen.

Erscheint der Hinweis nicht, siehe „Wenn etwas nicht klappt“ am Ende.

---

## 3. Installieren

### iPad und iPhone

1. Die Adresse in **Safari** öffnen und warten, bis „Offline bereit“ erscheint.
2. Auf das Teilen-Symbol tippen (Quadrat mit Pfeil nach oben).
3. „Zum Home-Bildschirm“ wählen.
4. Falls ein Schalter „Als Web-App öffnen“ erscheint (ab iOS 26 / iPadOS 26): eingeschaltet lassen.
5. „Hinzufügen“ tippen.
6. **Die App einmal mit Internet vom Home-Bildschirm starten** und wieder auf „Offline bereit“ warten.

Schritt 6 ist wichtig: Auf iPad und iPhone hat die installierte App einen eigenen Speicher, getrennt von Safari. Sie muss ihre Dateien einmal selbst laden. Aus demselben Grund sind Trainingsstände aus Safari in der App nicht sichtbar (siehe Abschnitt 5).

### Android

1. Die Adresse in **Chrome** öffnen und warten, bis „Offline bereit“ erscheint.
2. Auf der Startseite von QUORMEL 1 „App installieren“ tippen.
   Erscheint der Knopf nicht: Chrome-Menü (drei Punkte) → „App installieren“ oder „Zum Startbildschirm hinzufügen“.
3. „Installieren“ bestätigen.

### Windows und Mac

- Chrome oder Edge: Installationssymbol rechts in der Adresszeile, oder der Knopf „App installieren“ auf der Startseite.
- Safari auf dem Mac: Menü „Ablage“ → „Zum Dock hinzufügen“.

---

## 4. Aktualisieren

1. Neue Fassung hochladen (Abschnitt 1).
2. Die App mit Internet öffnen. Sie lädt die neue Fassung im Hintergrund.
3. Auf der Startseite erscheint „Eine neue Version von QUORMEL 1 ist verfügbar.“ → „Jetzt aktualisieren“ tippen.

Bis dahin läuft die alte Fassung unverändert weiter. Trainingsstände bleiben bei einer Aktualisierung erhalten.

Erscheint der Hinweis nicht sofort: App schließen und erneut öffnen.

---

## 5. Trainingsstände sichern und übertragen

Trainingsstände liegen nur auf dem Gerät, im Speicher des Browsers bzw. der installierten App. Es gibt keine Cloud-Synchronisation.

Ein Stand ist deshalb **nicht** automatisch vorhanden:

- auf einem anderen Gerät,
- unter einer anderen Adresse (z. B. nach einem Umzug von GitHub Pages zu Cloudflare Pages),
- auf iPad und iPhone: in der installierten App, wenn er in Safari entstanden ist, und umgekehrt.

Übertragen:

1. Am alten Ort auf der Startseite „Speicherstand exportieren“ wählen. Es entsteht eine `.json`-Datei.
   In der installierten App auf iPad und iPhone öffnet sich der Teilen-Dialog; dort „In Dateien sichern“ wählen.
2. Die Datei auf das Zielgerät bringen (AirDrop, E-Mail, USB-Stick, Cloud-Ordner).
3. Am neuen Ort „Speicherstand importieren“ wählen und die Datei auswählen.

**Vor dem Löschen der App vom Home-Bildschirm exportieren.** Mit der App werden auch ihre Trainingsstände gelöscht.

Was die App selbst zum Schutz tut, steht in [pwa-offline.md](pwa-offline.md).

---

## Wenn etwas nicht klappt

| Beobachtung | Ursache und Abhilfe |
|---|---|
| „Offline bereit“ erscheint nicht | Adresse beginnt nicht mit `https://`, oder der Browser ist im privaten Modus. Es wurde nicht der Inhalt von `dist` hochgeladen, sodass `sw.js` nicht neben `index.html` liegt. |
| Seite ist offline leer | Sie wurde auf diesem Gerät noch nie mit Internet geladen. Auf iPad/iPhone: die installierte App wurde noch nie mit Internet gestartet. |
| Alte Fassung wird angezeigt | App schließen, mit Internet neu öffnen, auf der Startseite „Jetzt aktualisieren“ wählen. Wurde vor dem Hochladen `node tools/build.cjs` ausgeführt? |
| Kein Knopf „App installieren“ auf Android | App ist schon installiert, oder Chrome bietet es gerade nicht an. Weg über das Chrome-Menü nehmen. |
| Trainingsstand fehlt | Anderes Gerät, andere Adresse oder App statt Safari (Abschnitt 5). |

Die Schritte zur Installation beschreiben das übliche Vorgehen der Systeme. Sie wurden nicht auf echten Geräten durchgespielt; Menübezeichnungen können je nach Version abweichen. Was auf echten Geräten noch zu prüfen ist: [device-checklist.md](device-checklist.md).
