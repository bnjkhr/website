# Featured App Cards Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Zeige `GymBo` und `FamilyManager` als zwei gleich große Highlight-Karten nebeneinander, ohne das restliche Projektraster unnötig zu verändern.

**Architecture:** Die ersten beiden Projekte werden in ein separates Highlight-Grid oberhalb des bestehenden Kartenrasters verschoben. `GymBo` nutzt den bestehenden Featured-Stil weiter, `FamilyManager` bekommt eine zweite Featured-Variante mit eigener Farbpalette aus der FamilyManager-Landingpage.

**Tech Stack:** Statisches HTML, CSS, Shell-Test mit `rg`

---

### Task 1: Layout-Test absichern

**Files:**
- Create: `tests/featured-app-cards.sh`
- Test: `tests/featured-app-cards.sh`

**Step 1: Write the failing test**

Ein Shell-Test soll die neue Highlight-Struktur und die FamilyManager-Variante erwarten.

**Step 2: Run test to verify it fails**

Run: `./tests/featured-app-cards.sh`
Expected: FAIL, weil Highlight-Grid und FamilyManager-Featured-Stil noch fehlen

### Task 2: Projektsektion umstrukturieren

**Files:**
- Modify: `index.html`

**Step 1: Write minimal implementation**

- Fuehre ein separates Highlight-Grid fuer `GymBo` und `FamilyManager` ein
- Belasse die restlichen Projekte im bestehenden Grid

**Step 2: Run test to verify progress**

Run: `./tests/featured-app-cards.sh`
Expected: Teilweise oder weiterhin FAIL, bis die CSS-Klassen vorhanden sind

### Task 3: Highlight-Styling fertigstellen

**Files:**
- Modify: `css/style.css`
- Test: `tests/featured-app-cards.sh`

**Step 1: Write minimal implementation**

- Fuehre ein Zwei-Spalten-Grid fuer Highlight-Karten ein
- Entferne die Vollbreiten-Logik von Featured-Karten in diesem Bereich
- Ergaenze eine `FamilyManager`-Featured-Variante mit Farben aus der Landingpage

**Step 2: Run test to verify it passes**

Run: `./tests/featured-app-cards.sh`
Expected: PASS

### Task 4: Abschluss-Check

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Test: `tests/featured-app-cards.sh`

**Step 1: Verify final state**

Run: `./tests/featured-app-cards.sh`
Expected: PASS

Run: `git diff -- index.html css/style.css tests/featured-app-cards.sh`
Expected: Nur die beabsichtigten Layout- und Testaenderungen
