# Redesign "Warm Editorial" – Implementierungsplan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ersetze die zwei konkurrierenden CSS-Dateien durch ein einheitliches "Warm Editorial"-Design und bereinige das HTML.

**Architecture:** Eine neue `css/style.css` ersetzt beide bestehenden Dateien komplett. HTML wird um irrelevante Sections (Prozess, Stack) und Dekorations-Divs bereinigt. Keine externen CSS-Abhängigkeiten außer den bereits geladenen Fonts (Inter, JetBrains Mono).

**Tech Stack:** Vanilla HTML/CSS, CSS Custom Properties, CSS Grid, `color-mix()`, `clamp()`

---

## Übersicht der Änderungen

| Datei | Aktion |
|---|---|
| `css/style.css` | Komplett neu schreiben |
| `css/modern.css` | Löschen |
| `index.html` | `<link modern.css>` entfernen, HTML bereinigen, Über-mich-Block hinzufügen |

---

### Task 1: CSS-Fundament – Variablen, Reset, Basis

**Files:**
- Modify: `css/style.css` (komplett ersetzen)

**Step 1: Datei komplett überschreiben mit Variablen + Reset**

```css
/* ============================================
   Ben Kohler – Warm Editorial
   ============================================ */

/* CSS Custom Properties */
:root {
    --bg:            #faf9f7;
    --bg-elevated:   #ffffff;
    --bg-soft:       #f3f1ee;
    --text:          #1c1917;
    --text-soft:     #57534e;
    --text-muted:    #a8a29e;
    --border:        #e7e5e0;
    --border-strong: #d6d3ce;
    --accent:        #0f766e;
    --accent-hover:  #0c5f58;
    --accent-soft:   rgba(15, 118, 110, 0.1);

    --status-live:   #0d8f5f;
    --status-live-bg: rgba(13, 143, 95, 0.1);
    --status-beta:   #5244d4;
    --status-beta-bg: rgba(82, 68, 212, 0.1);
    --status-dev:    #a85f00;
    --status-dev-bg: rgba(168, 95, 0, 0.1);

    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-pill: 999px;

    --shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.08);

    --container: 1100px;
}

[data-theme="dark"] {
    --bg:            #100f0e;
    --bg-elevated:   #1a1917;
    --bg-soft:       #252320;
    --text:          #f5f0eb;
    --text-soft:     #a8a29e;
    --text-muted:    #78716c;
    --border:        #2e2b27;
    --border-strong: #3d3a36;
    --accent:        #14b8a6;
    --accent-hover:  #2dd4bf;
    --accent-soft:   rgba(20, 184, 166, 0.15);

    --status-live:   #4ed6a0;
    --status-live-bg: rgba(78, 214, 160, 0.12);
    --status-beta:   #a699ff;
    --status-beta-bg: rgba(166, 153, 255, 0.12);
    --status-dev:    #ffbf63;
    --status-dev-bg: rgba(255, 191, 99, 0.12);

    --shadow-hover: 0 8px 28px rgba(0, 0, 0, 0.35);
}

/* Reset */
*, *::before, *::after {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    overflow-x: hidden;
}

body {
    margin: 0;
    padding-top: 92px;
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    letter-spacing: -0.015em;
    color: var(--text);
    background-color: var(--bg);
    -webkit-font-smoothing: antialiased;
}

::selection {
    background: var(--accent);
    color: #fff;
}

a {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease;
}

h1, h2, h3, h4 {
    margin: 0;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.03em;
}

p {
    margin: 0 0 1rem;
}

.container {
    max-width: var(--container);
    margin: 0 auto;
    padding: 0 1.5rem;
}
```

**Step 2: Visuell prüfen**

Browser öffnen → `index.html` laden. Seite sollte jetzt einen warmen, hellen Hintergrund haben. Alle bisherigen Styles sind weg – es sieht noch unfertig aus, das ist korrekt.

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: replace css foundation with warm editorial variables and reset"
```

---

### Task 2: Navigation

**Files:**
- Modify: `css/style.css` (Navigation-Block anhängen)

**Step 1: Navigation-Styles anhängen**

```css
/* ============================================
   Navigation
   ============================================ */
.ascii-nav {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: min(96vw, 900px);
    z-index: 60;
    background: color-mix(in oklab, var(--bg-elevated) 85%, transparent);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.ascii-nav .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    gap: 1rem;
}

.header-text {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--text-soft);
    white-space: nowrap;
}

.ascii-nav__menu {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.ascii-nav__link {
    font-size: 0.875rem;
    color: var(--text-soft);
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius-pill);
    transition: color 0.15s ease, background-color 0.15s ease;
}

.ascii-nav__link:hover {
    color: var(--text);
    background: var(--bg-soft);
}

/* Theme Toggle */
.theme-toggle {
    position: fixed;
    top: 24px;
    right: max(1rem, calc((100vw - var(--container)) / 2 + 0.5rem));
    z-index: 80;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    color: var(--text);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: transform 0.15s ease, border-color 0.15s ease;
}

.theme-toggle:hover {
    transform: translateY(-1px);
    border-color: var(--border-strong);
}

.theme-toggle svg { width: 18px; height: 18px; }
.theme-toggle .moon-icon { display: none; }
[data-theme="dark"] .theme-toggle .sun-icon { display: none; }
[data-theme="dark"] .theme-toggle .moon-icon { display: block; }

/* Mobile Nav */
@media (max-width: 640px) {
    body { padding-top: 100px; }

    .ascii-nav {
        top: 10px;
        width: calc(100% - 1.5rem);
        border-radius: var(--radius-lg);
    }

    .ascii-nav .container {
        flex-direction: column;
        gap: 0.15rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        min-height: unset;
    }

    .ascii-nav__menu { gap: 0; }

    .theme-toggle {
        top: 14px;
        right: 0.75rem;
        width: 34px;
        height: 34px;
    }
}
```

**Step 2: Visuell prüfen**

Nav sollte jetzt als saubere Pill erscheinen, kein Neon, kein Glow.

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: add clean pill navigation styles"
```

---

### Task 3: Hero

**Files:**
- Modify: `css/style.css` (Hero-Block anhängen)

**Step 1: Hero-Styles anhängen**

```css
/* ============================================
   Hero
   ============================================ */
.hero {
    min-height: clamp(480px, 68vh, 720px);
    display: grid;
    place-items: center;
    padding: clamp(3rem, 8vw, 6rem) 0 2rem;
}

.hero__layout {
    display: block;
}

.hero__content {
    max-width: 740px;
    text-align: center;
    margin: 0 auto;
}

.hero__title {
    font-size: clamp(2.6rem, 8vw, 4.8rem);
    letter-spacing: -0.04em;
    line-height: 1.05;
    margin-bottom: 1.25rem;
    color: var(--text);
}

.hero__description {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    color: var(--text-soft);
    max-width: 540px;
    margin: 0 auto 2rem;
    line-height: 1.65;
}

.hero__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}
```

**Step 2: Visuell prüfen**

Headline sollte groß und zentriert erscheinen, kein Typewriter-Effekt nötig (der wurde bereits in `index.html` auf statischen Text gesetzt).

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: add clean centered hero styles"
```

---

### Task 4: Buttons

**Files:**
- Modify: `css/style.css` (Button-Block anhängen)

**Step 1: Button-Styles anhängen**

```css
/* ============================================
   Buttons
   ============================================ */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    border-radius: var(--radius-pill);
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.btn:hover {
    transform: translateY(-1px);
}

.btn:active {
    transform: translateY(0);
}

.btn--primary {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
}

.btn--primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
    color: #fff;
}

.btn--secondary {
    background: transparent;
    color: var(--text);
    border-color: var(--border-strong);
}

.btn--secondary:hover {
    background: var(--bg-soft);
    color: var(--text);
}
```

**Step 2: Visuell prüfen**

CTAs im Hero sollten sauber erscheinen – Teal Primary, Ghost Secondary.

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: add clean button styles"
```

---

### Task 5: Sections & App-Cards

**Files:**
- Modify: `css/style.css` (Section + Cards anhängen)

**Step 1: Section + Card-Styles anhängen**

```css
/* ============================================
   Sections
   ============================================ */
.section {
    padding: clamp(3rem, 7vw, 5rem) 0;
}

.section__title {
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    margin-bottom: 0.5rem;
}

.section__description {
    font-size: clamp(1rem, 2vw, 1.1rem);
    color: var(--text-soft);
    margin-bottom: 2.5rem;
}

/* ============================================
   App Cards
   ============================================ */
.apps-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
    margin-top: 2rem;
}

.app-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.app-card:hover {
    transform: translateY(-2px);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-hover);
}

.app-card--featured {
    grid-column: span 8;
    border-color: color-mix(in oklab, var(--accent) 30%, var(--border));
    padding: 2rem;
}

.app-card--large {
    grid-column: span 4;
}

.app-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.875rem;
}

.app-card__platform {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
}

.app-card__status {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.68rem;
    padding: 0.22rem 0.55rem;
    border-radius: var(--radius-pill);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.app-card__status::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
}

.app-card__status--live {
    color: var(--status-live);
    background: var(--status-live-bg);
}

.app-card__status--live::before {
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.app-card__status--beta {
    color: var(--status-beta);
    background: var(--status-beta-bg);
}

.app-card__status--dev {
    color: var(--status-dev);
    background: var(--status-dev-bg);
}

.app-card__title {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}

.app-card--featured .app-card__title {
    font-size: 1.6rem;
}

.app-card__description {
    font-size: 0.9375rem;
    color: var(--text-soft);
    line-height: 1.6;
    flex-grow: 1;
    margin-bottom: 1.25rem;
}

.app-card__link {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: auto;
    transition: gap 0.15s ease;
}

.app-card__link::after {
    content: "↗";
    font-size: 0.8rem;
}

.app-card__link:hover {
    gap: 0.55rem;
    color: var(--accent-hover);
}

/* Responsive Cards */
@media (max-width: 980px) {
    .apps-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .app-card--featured,
    .app-card--large {
        grid-column: span 1;
    }
}

@media (max-width: 640px) {
    .apps-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }
}
```

**Step 2: Visuell prüfen**

Cards sollten sauber und flach erscheinen – kein Glassmorphism. Hover zeigt nur leichten Shadow. Featured Card hat Teal-Border-Tint.

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: add section and app card styles"
```

---

### Task 6: Kontakt, Footer, Utilities

**Files:**
- Modify: `css/style.css` (restliche Styles anhängen)

**Step 1: Kontakt, Footer und Utility-Styles anhängen**

```css
/* ============================================
   Kontakt
   ============================================ */
.contact-grid {
    display: grid;
    grid-template-columns: minmax(200px, 0.8fr) 1.2fr;
    gap: 1.5rem;
    margin-top: 2rem;
}

@media (max-width: 768px) {
    .contact-grid {
        grid-template-columns: 1fr;
    }
}

.contact-info,
.contact-form {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1.5rem;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.contact-item h3 {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.68rem;
    font-weight: 400;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0 0 0.3rem;
}

.contact-item a {
    font-size: 0.9375rem;
    color: var(--text);
    transition: color 0.15s ease;
}

.contact-item a:hover {
    color: var(--accent);
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group--hp {
    position: absolute;
    left: -9999px;
    opacity: 0;
    height: 0;
    overflow: hidden;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    font-family: inherit;
    font-size: 0.9375rem;
    color: var(--text);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    outline: none;
}

.form-input::placeholder,
.form-textarea::placeholder {
    color: var(--text-muted);
}

.form-input:focus,
.form-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.form-textarea {
    resize: vertical;
    min-height: 120px;
}

.form-submit {
    align-self: flex-start;
}

.form-status {
    font-size: 0.875rem;
    min-height: 1.2rem;
}

.form-status--success { color: var(--status-live); }
.form-status--error { color: #dc2626; }
.form-status--error a { color: inherit; text-decoration: underline; }

/* ============================================
   About (neu)
   ============================================ */
.about-block {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: clamp(2rem, 5vw, 4rem) 0;
    border-top: 1px solid var(--border);
}

.about-block p {
    font-size: clamp(1rem, 2vw, 1.1rem);
    color: var(--text-soft);
    line-height: 1.7;
    margin: 0;
}

/* ============================================
   Footer
   ============================================ */
.footer {
    border-top: 1px solid var(--border);
    padding: 2rem 0 1.5rem;
    background: color-mix(in oklab, var(--bg) 80%, var(--bg-soft));
}

.footer__content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.footer__brand {
    font-family: "JetBrains Mono", monospace;
    font-size: 1rem;
    font-weight: 400;
    margin: 0;
    color: var(--text);
}

.footer__tagline {
    font-size: 0.8125rem;
    color: var(--text-muted);
    margin: 0.2rem 0 0;
}

.footer__links {
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    align-items: center;
}

.footer__links a {
    font-size: 0.8125rem;
    color: var(--text-soft);
    transition: color 0.15s ease;
}

.footer__links a:hover {
    color: var(--text);
}

.footer__copyright {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
}

@media (max-width: 640px) {
    .footer__content { flex-direction: column; }
}

/* ============================================
   Utilities
   ============================================ */
.scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent);
    z-index: 120;
    transition: width 0.1s linear;
}

.back-to-top {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    width: 40px;
    height: 40px;
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--bg-elevated);
    color: var(--text);
    display: grid;
    place-items: center;
    text-decoration: none;
    font-size: 1.1rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(6px);
    transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
    z-index: 70;
}

.back-to-top.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.back-to-top:hover {
    border-color: var(--border-strong);
    color: var(--text);
}

/* ============================================
   Consent Banner
   ============================================ */
.consent-banner {
    position: fixed;
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    z-index: 100;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.consent-banner--show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.consent-banner__inner {
    max-width: 880px;
    margin: 0 auto;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.consent-banner__text {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-soft);
    max-width: 60ch;
}

.consent-banner__actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
}

.consent-banner__btn {
    padding: 0.6rem 1.1rem;
    font-size: 0.875rem;
}

.consent-banner__link {
    font-size: 0.8125rem;
    color: var(--text-soft);
    text-decoration: underline;
}

.consent-banner__link:hover {
    color: var(--text);
}

/* ============================================
   Scroll Animations
   ============================================ */
.fade-in,
.fade-in-stagger {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-in.visible,
.fade-in-stagger.visible {
    opacity: 1;
    transform: translateY(0);
    animation: none;
}

.apps-grid .app-card:nth-child(2) { transition-delay: 60ms; }
.apps-grid .app-card:nth-child(3) { transition-delay: 120ms; }
.apps-grid .app-card:nth-child(4) { transition-delay: 180ms; }
.apps-grid .app-card:nth-child(5) { transition-delay: 240ms; }
.apps-grid .app-card:nth-child(6) { transition-delay: 300ms; }

/* ============================================
   Reduced Motion
   ============================================ */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
    .fade-in, .fade-in-stagger {
        opacity: 1;
        transform: none;
    }
}

/* ============================================
   Legal Pages
   ============================================ */
.legal-section {
    padding: 6rem 1.5rem;
}

.legal-section .container {
    max-width: 720px;
}

.legal-section h2 {
    text-align: center;
    margin-bottom: 3rem;
}

.legal-section h4 {
    margin-top: 2rem;
    margin-bottom: 0.75rem;
}

.legal-section p,
.legal-section li {
    color: var(--text-soft);
}

.legal-section ul {
    padding-left: 1.25rem;
}

.back-link {
    display: block;
    text-align: center;
    margin-top: 3rem;
}

.legal-footer {
    text-align: center;
    padding: 4rem 1.5rem;
    font-size: 0.9375rem;
    color: var(--text-soft);
}
```

**Step 2: Visuell prüfen**

Gesamte Seite in Light + Dark Mode durchklicken. Kontaktformular, Footer und Banner prüfen.

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "style: add contact, footer, and utility styles"
```

---

### Task 7: HTML bereinigen

**Files:**
- Modify: `index.html`

**Step 1: `<link>` für modern.css entfernen**

In `index.html` Zeile 54 entfernen:
```html
<link rel="stylesheet" href="css/modern.css" />
```

**Step 2: `apple-aura` Div entfernen**

```html
<!-- ENTFERNEN: -->
<div class="apple-aura"></div>
```

**Step 3: Prozess-Section entfernen**

Den gesamten Block `<section class="section" id="process">` ... `</section>` entfernen (Zeilen 192–228).

**Step 4: Stack-Section entfernen**

Den gesamten Block `<section class="section" id="tech">` ... `</section>` entfernen (Zeilen 230–301).

**Step 5: Nav bereinigen**

In der Nav den Link `<a href="#tech" class="ascii-nav__link">Tech</a>` entfernen, da die Section weg ist.

**Step 6: Über-mich-Block einfügen**

Direkt nach der schließenden `</section>` der Projekte-Section einfügen:

```html
<div class="about-block">
    <div class="container">
        <p>Ich bin Ben – Indie-Entwickler, der Apps baut, die er selbst vermisst hat. Keine aufgeblähten Feature-Listen, kein Schnickschnack. Nur Dinge, die wirklich funktionieren.</p>
    </div>
</div>
```

**Step 7: Visuell prüfen**

Seite lädt ohne Prozess/Stack. Struktur: Hero → Projekte → Über mich → Kontakt → Footer.

**Step 8: Commit**

```bash
git add index.html
git commit -m "feat: clean up html, remove process/stack sections, add about block"
```

---

### Task 8: modern.css löschen

**Files:**
- Delete: `css/modern.css`

**Step 1: Datei löschen**

```bash
git rm css/modern.css
git commit -m "chore: remove modern.css, consolidated into style.css"
```

**Step 2: Final-Check**

- Light Mode: Seite in Chrome, Firefox, Safari testen
- Dark Mode: Toggle prüfen
- Mobile (375px): Nav, Cards, Formular prüfen
- Kein Console-Error

---

## Fertig

Wenn alle Tasks abgeschlossen sind → `superpowers:finishing-a-development-branch` aufrufen.
