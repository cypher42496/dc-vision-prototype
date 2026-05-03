# DC Vision Prototype

Ein webbasierter Prototyp zur AR-gestützten Visualisierung von Rechenzentrumsinfrastruktur, entwickelt im Rahmen einer Masterarbeit an der Hochschule des Bundes für öffentliche Verwaltung in Kooperation mit dem ITZBund.

**Die Anwendung ist während des Prüfungszeitraums live erreichbar unter: https://dc-vision-prototype.vercel.app**

---

## Was ist dieses Projekt?

DC Vision kombiniert klassische DCIM-Darstellung (Rack-Übersicht, Gerätedaten, Verkabelung) mit einer browserbasierten Augmented-Reality-Funktion. Über die Kamera eines Smartphones oder Tablets erkennt die Anwendung ArUco-Marker an einem physischen Rack und blendet Statusinformationen direkt in das Kamerabild ein — ohne native App, ohne Installation.

Die vier Anzeigemodi (Standard, Netzwerk, Sicherheit, Umwelt) ermöglichen es, denselben physischen Rack aus verschiedenen fachlichen Perspektiven zu analysieren. Abweichungen zwischen Soll- und Ist-Zustand werden farblich hervorgehoben.

Der Prototyp dient als Proof of Concept und ist nicht für den Produktivbetrieb ausgelegt.

---

## Technischer Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **AR-Erkennung:** js-aruco2 (browsernativ, kein Backend erforderlich)
- **Deployment:** Vercel (automatisch bei Push auf `main`)
- **Persistenz:** localStorage (keine Datenbank)

---

## Ausführung aus der eingereichten ZIP-Datei

Wenn Sie die ZIP-Datei der Abschlussarbeit erhalten haben, können Sie den Prototyp lokal starten:

**Voraussetzungen:** Node.js 18 oder neuer

```bash
# 1. ZIP entpacken, dann ins Projektverzeichnis wechseln
cd dc-vision-prototype

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev
```

Die Anwendung ist anschließend unter `http://localhost:5173` erreichbar.

Alternativ lässt sich ein statischer Build erzeugen (`npm run build`), dessen Ausgabe im Ordner `dist/` auf jedem beliebigen Webserver oder Static-Hosting-Dienst deployed werden kann.

---

## Entwicklungsworkflow (Überblick)

Das Projekt wurde lokal in VS Code entwickelt, per Git zu GitHub gepusht und von dort automatisch über Vercel deployed. Jeder Push auf den `main`-Branch löst einen neuen Build aus — die Live-URL ist damit stets aktuell.

---

## Hinweise

- Die AR-Funktion erfordert eine Kameraberechtigung im Browser (HTTPS oder localhost).
- Für optimale Erkennung sollten die ArUco-Marker (MIP 36h12, ID 0 oben / ID 1 unten) ausgedruckt und am Rack befestigt sein.
- Lokale Änderungen an Geräten und Racks werden im localStorage des Browsers gespeichert und überleben Seitenneuladen.
