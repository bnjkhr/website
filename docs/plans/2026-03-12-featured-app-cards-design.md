# Featured App Cards Design

**Datum:** 2026-03-12

## Ziel

Die Projektsektion soll `GymBo` und `FamilyManager` als zwei gleich große, hervorgehobene Karten nebeneinander zeigen.

## Entscheidung

- Die beiden Highlight-Projekte werden in ein eigenes Top-Grid ausgelagert.
- `GymBo` behält den bisherigen Featured-Look und seine aktuelle Farbwelt.
- `FamilyManager` erhält eine eigene Featured-Variante auf Basis der Landingpage-Farben:
  - Hintergrund: warmes Sand/Creme
  - Akzent: sattes Blau `#3D5BE0`
  - Text: dunkles Braun `#2C2620`
- Der restliche Projekt-Grid bleibt strukturell unverändert.

## Responsive Verhalten

- Desktop: zwei gleich breite Highlight-Karten nebeneinander
- Tablet/Mobile: Highlight-Karten untereinander

## Auswirkungen

- Kleine HTML-Umstrukturierung in der Projektsektion
- Neue CSS-Variante fuer `FamilyManager`
- Ein einfacher Layout-Test stellt sicher, dass die Highlight-Struktur und die Farbvariante bestehen bleiben
