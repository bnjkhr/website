---
title: "Mein Setup: Wie ich Apps mit Claude Code baue"
description: "Wie ich mit Claude Code, Xcode und Remote Control mehrere iOS-Apps parallel entwickle – inklusive Git-, Test- und Release-Prozess."
publishedAt: 2026-09-23
tags:
  - Hinter den Kulissen
  - Produktentwicklung
draft: false
---

Eigentlich komme ich aus der Entwicklung. GymBo habe ich ursprünglich angefangen, um wieder in SwiftUI hineinzukommen: selbst programmieren, Neues ausprobieren, auf den aktuellen Stand kommen. Dabei habe ich schnell gemerkt, dass Agentic Coding enorm hilft, wenn ich das Tempo hochhalten will. Aus dem Lernprojekt wurde so nach und nach meine heutige Arbeitsweise.

Heute entwickle ich mehrere Apps parallel und allein: FamilyManager, GymBo, Track4Kids und ein paar weitere Projekte. Das funktioniert nur, weil ein großer Teil der Umsetzung von KI-Agenten erledigt wird. Meine Rolle hat sich dadurch verschoben: Ich entscheide, prüfe und greife ein, wenn etwas schiefläuft. In diesem Beitrag zeige ich dir, wie mein Setup konkret aussieht, und auch, an welchen Stellen es gehakt hat.

## Claude Code als Mittelpunkt

Das Zentrum meiner Arbeit ist Claude Code. Was der Agent wissen muss, steht in `CLAUDE.md`-Dateien, und zwar auf zwei Ebenen. Eine globale Datei gilt für alle Projekte: wie ich arbeiten möchte, wie Bugs analysiert werden, wie gebaut wird. Dazu hat jedes Projekt eine eigene Datei mit Architektur, Build-Befehlen, Farben und Sprachregeln.

Das Wichtigste daran: Fast jede Regel dort hat eine Geschichte. Sie ist entstanden, weil vorher etwas schiefgegangen ist. Ein Beispiel, das ich inzwischen für eine der wertvollsten Regeln halte: **Wirkt ein Fix nicht vollständig, war die Diagnose falsch, nicht der Schutz zu schwach.** Beim zweiten Fix für dasselbe Symptom wird angehalten und das Problem neu verstanden, statt eine weitere Absicherung obendrauf zu setzen.

Ein paar Grundsätze, nach denen ich arbeite:

- **Erst planen, dann bauen.** Alles, was mehr als ein paar Schritte hat, beginnt im Plan-Modus. Ich lese den Plan, bevor Code entsteht.
- **Ein Sicherheitsnetz für die Shell.** Claude darf bei mir viel ohne Rückfrage, auch Git-Befehle. Dafür prüft ein Hook namens Destructive Command Guard jeden Shell-Befehl, bevor er ausgeführt wird. Was sich nicht rückgängig machen lässt, wird blockiert: Force-Push, `git reset --hard`, das Löschen nicht committeter Änderungen oder `rm -rf`. Will der Agent wirklich etwas löschen, muss er erklären, was und warum, und ich führe den Befehl selbst aus.
- **Subagents mit klarer Rollenverteilung.** Suchen, Inventur und Durchsicht vieler Dateien erledigt das Standardmodell. Das stärkste Modell kommt nur dort zum Einsatz, wo das Denken den Unterschied macht: bei zähen Bugs, Architekturentscheidungen und kritischen Reviews.
- **Skills für wiederkehrende Abläufe.** Für iOS nutze ich die Skill-Sammlung Axiom, für App Store Connect Skills rund um die Kommandozeile `asc`. Dazu kommen eigene Skills, zum Beispiel einer, der Blogbeiträge wie diesen hier veröffentlicht.
- **Geplante Aufgaben.** Nach einem Release misst Claude selbstständig nach, etwa ob nach 48 Stunden alles stabil läuft oder wie sich die Beta-Anmeldungen entwickeln.
- **Kein „fertig“ ohne Beweis.** Tests laufen, Logs werden geprüft, die Änderung wird gegen `main` verglichen. Die Leitfrage: Würde ein erfahrener Entwickler das so durchwinken?

## Steuerung vom Telefon aus

Ich sitze nicht den ganzen Tag am Schreibtisch, und das muss ich auch nicht. Meine Sessions laufen auf dem Mac, und über **Remote Control** steuere ich sie vom iPhone aus. Ich sehe, was der Agent gerade macht, beantworte Rückfragen, gebe Freigaben und bekomme Ergebnisse wie Screenshots oder Berichte direkt aufs Telefon.

In der Praxis ist es eine Mischung: Manche Aufgaben starte ich am Mac und begleite sie unterwegs weiter, andere laufen in der Cloud. Die Arbeitsteilung ist dabei klar. Unterwegs treffe ich Entscheidungen, der Mac rechnet.

## Vom groben Layout zum fertigen Design

Bevor etwas gebaut wird, skizziere ich in Figma, wie ein Screen ungefähr aussehen soll: grobe Layouts, Anordnung und Struktur, nicht mehr. Das Ausarbeiten übernimmt dann Claude Design. Aus der Skizze wird ein ausgearbeiteter Entwurf mit Abständen, Typografie und Details, den ich prüfe und anpasse.

Dieser Entwurf ist dann direkt die Vorlage für die Umsetzung: Claude Code nimmt ihn und baut den Screen danach in SwiftUI. Zwischen Design und Code gibt es keine Übersetzung durch mich mehr. So bleibt meine Zeit bei der Frage, *was* ein Screen leisten soll, und weniger beim Verschieben von Pixeln.

## Xcode und Agentic Coding

Claude baut und testet meine Apps über die Kommandozeile mit `xcodebuild`, nicht über die Xcode-Oberfläche. Xcode bleibt trotzdem Teil meines Alltags: Manche Dinge programmiere ich weiterhin selbst, gerade wenn ich an einer Oberfläche feile oder etwas direkt ausprobieren will. Agent und Xcode schließen sich nicht aus. Es kommt darauf an, was gerade schneller ans Ziel führt.

Die spannendste Lektion in diesem Bereich hatte mit Hardware zu tun. Mein Mac hat zehn Kerne, und schon ein einziger Xcode-Build lastet ihn fast vollständig aus. Als mehrere Agenten gleichzeitig an verschiedenen Projekten gebaut und jeweils einen Simulator gestartet haben, stieg die Systemlast auf rund 1000, und der Rechner fror ein.

Die Lösung ist ein kleines Skript, das ich **Build-Gate** nenne: eine Warteschlange für den ganzen Rechner, die höchstens zwei Builds gleichzeitig zulässt. Alle anderen warten, bis sie dran sind. Die erste Version war allerdings eher eine Verlosung. Kurze Aufrufe konnten an lange Wartenden vorbeiziehen, und ein CI-Lauf ist dabei irgendwann in einen Timeout gelaufen. Heute werden die Plätze strikt in der Reihenfolge vergeben, in der jemand ankommt.

Weitere Regeln rund um Xcode:

- **Simulatoren wiederverwenden** statt für jede Aufgabe einen neuen anzulegen. Die CI bekommt ein eigenes, festes Gerät, nachdem sich zwei Projekte einen Simulator geteilt und sich gegenseitig die Tests zerschossen haben.
- **Eindeutige Ziele**, also Gerät und iOS-Version. Ohne Version ist das Ziel mehrdeutig, und die Tests verhalten sich unvorhersehbar.
- **Swift Testing** statt XCTest für neue Unit-Tests.

## Git-Prozess

Niemand arbeitet direkt auf `main`, weder ich noch ein Agent. Jedes Feature bekommt einen eigenen Branch, meist in einem eigenen Git-Worktree. So können mehrere Agenten parallel an verschiedenen Aufgaben arbeiten, ohne sich in die Quere zu kommen.

Vor jedem Pull Request wird der Code vereinfacht und reviewt. Bei FamilyManager gibt es zusätzlich eine Stufe dazwischen: Features laufen erst nach `staging` und von dort nach `main`. Nach dem Merge wird der Worktree aufgeräumt. Auch dieser Blogbeitrag ist über einen Pull Request online gegangen.

## Test-Prozess und CI

Zwei Regeln haben meine Tests deutlich besser gemacht:

1. **Ein Test für einen Bug muss vor dem Fix fehlschlagen.** Wird er nicht rot, testet er das Falsche.
2. **Tests laufen mit realistischer Historie.** Statt eines einzelnen Datensatzes lege ich mehrere an, so wie sie auch im echten Betrieb entstehen. Viele Fehler zeigen sich erst, wenn es alte Daten gibt.

Bei der CI trenne ich bewusst: Feature-Branches verifiziere ich lokal, die komplette Testsuite in der Cloud läuft nur dort, wo es vor einem Release zählt. Bei FamilyManager prüfen GitHub Actions zusätzlich Datenbanktests, Web-Checks, Regeln für den iOS-Code und ein automatisches Review.

Auch hier habe ich Lehrgeld bezahlt. Das Rechenkontingent von Xcode Cloud hängt am Apple-Konto, nicht am einzelnen Projekt, und alle meine Apps teilen sich denselben Topf. Als er leer war, wurden Läufe einfach abgebrochen. Das Tückische: In GitHub erschienen sie nicht als rot, sondern gar nicht. Seitdem gilt für mich: **Ein grüner Pull Request ohne iOS-Ergebnis ist kein grüner Pull Request.**

## Release

Für App Store Connect nutze ich die Kommandozeile `asc`: TestFlight-Verteilung, Metadaten, Screenshots und die Einreichung zur Prüfung. Eine Falle, in die man leicht tappt: Wird eine App auf einer Beta-Version von macOS gebaut, lehnt der App Store sie ab, selbst wenn Xcode und SDK regulär sind.

## Fazit

Mein Setup ist nicht am Reißbrett entstanden, sondern gewachsen, mit jedem Fehler ein Stück mehr. Die Agenten nehmen mir viel Umsetzungsarbeit ab, aber die Verantwortung bleibt bei mir: Ich entscheide, was gebaut wird, und ich prüfe, ob es wirklich funktioniert. Wenn du selbst mit KI-Agenten entwickelst, ist mein wichtigster Tipp: Schreib deine Lektionen auf, und zwar dort, wo dein Agent sie liest.
