# Redesign Design: Warm Editorial

**Datum:** 2026-02-19
**Ziel:** Frische, moderne, leichtgewichtige UI für potenzielle App-Nutzer
**Ton:** Persönlich & nahbar

---

## Kontext & Ausgangslage

Die aktuelle Seite lädt zwei konkurrierende CSS-Dateien (`style.css` + `modern.css`), die sich gegenseitig überschreiben. `style.css` enthält starkes Glassmorphism, Neon-Farben (Magenta/Cyan) und Terminal-Ästhetik. `modern.css` war ein halbfertiger Modernisierungsversuch. Das Ergebnis ist visuell inkonsistent.

---

## Design-Richtung: "Warm Editorial"

**Inspiration:** Notion, Linear, arc.net
**Kernprinzip:** Eine Datei, ein System, keine Tricks.

---

## Farb-System

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#faf9f7` | `#100f0e` |
| `--bg-elevated` | `#ffffff` | `#1a1917` |
| `--bg-soft` | `#f3f1ee` | `#252320` |
| `--text` | `#1c1917` | `#f5f0eb` |
| `--text-soft` | `#57534e` | `#a8a29e` |
| `--text-muted` | `#a8a29e` | `#78716c` |
| `--border` | `#e7e5e0` | `#2e2b27` |
| `--border-strong` | `#d6d3ce` | `#3d3a36` |
| `--accent` | `#0f766e` | `#14b8a6` |
| `--accent-soft` | `rgba(15,118,110,0.1)` | `rgba(20,184,166,0.15)` |

Status-Farben bleiben (live/beta/dev), aber ohne Glow-Effekte.

---

## Typografie

- **Body:** Inter, `font-size: 16px`, `letter-spacing: -0.015em`, `line-height: 1.6`
- **Headlines:** Inter, `letter-spacing: -0.04em`
- **Mono (Labels, Badges, Nav-Brand):** JetBrains Mono
- **Keine** monospace Headlines mehr

---

## Seitenstruktur

```
Nav (Pill)
Hero (zentriert)
Projekte (Grid)
Über mich (kurzer Block, neu)
Kontakt (Form + Links)
Footer
```

**Entfernt:** Prozess-Section, Stack-Section

---

## Komponenten

### Navigation
- Pill-Nav: `position: fixed`, zentriert, `width: min(96%, 900px)`
- Hintergrund: `color-mix(in oklab, var(--bg-elevated) 85%, transparent)` + `backdrop-filter: blur(12px)`
- Brand: "Ben Kohler" in JetBrains Mono, `var(--text-soft)`
- Links: Projekte, Kontakt – kein Neon, kein Text-Shadow
- Theme-Toggle: rechts außerhalb der Pill

### Hero
- Zentriert, `min-height: clamp(500px, 70vh, 720px)`
- Headline: `clamp(2.8rem, 8vw, 5rem)`, `letter-spacing: -0.04em`
- Kein Typewriter-Effekt, kein Apple-Aura-Div
- Zwei CTAs: Primary (Teal) + Secondary (Ghost)

### App-Cards
- Hintergrund: `var(--bg-elevated)`
- Border: `1px solid var(--border)`
- `border-radius: 16px`
- Shadow: **nur** auf Hover – `0 8px 24px rgba(0,0,0,0.08)`
- **Kein** Glassmorphism, **kein** `backdrop-filter`, **keine** Status-basierten Gradient-Hintergründe
- Featured Card: leichte Akzent-Border-Tint, sonst gleich
- Grid: 12 Spalten (Featured: 8, Regular: 4), responsive auf 2→1 Spalten

### Über mich (neu)
- Kurzer Paragraph, 2–3 Sätze
- Optional: kleines Foto links, Text rechts
- Kein großer Section-Header

### Kontakt
- Struktur bleibt (Info-Links + Formular)
- Form-Inputs: sauberer Focus-Ring in Teal (`box-shadow: 0 0 0 3px var(--accent-soft)`)

### Footer
- Minimal: Name + Tagline links, Impressum/Datenschutz rechts
- `border-top: 1px solid var(--border)`

---

## Was verschwindet

| Element | Grund |
|---|---|
| `css/modern.css` | Wird in neue `css/style.css` integriert |
| Neon-Farben (Magenta/Cyan) | Passen nicht zum nahbaren Ton |
| Glassmorphism (`backdrop-filter` auf Cards) | Zu komplex, nicht nötig |
| Terminal-Fenster-Klassen | Kein Terminal im aktuellen HTML |
| `apple-aura` Div | Ersetzt durch saubere Typografie |
| Prozess-Section | Irrelevant für App-Nutzer |
| Stack-Section | Irrelevant für App-Nutzer |
| Typewriter-Effekt | Unnötige Komplexität |

---

## Technische Umsetzung

1. `css/style.css` komplett neu schreiben (ein konsistentes System)
2. `css/modern.css` löschen
3. `index.html` bereinigen: `apple-aura` div, Prozess- und Stack-Sections entfernen, Über-mich-Block hinzufügen
4. `<link>` für `modern.css` aus dem `<head>` entfernen
