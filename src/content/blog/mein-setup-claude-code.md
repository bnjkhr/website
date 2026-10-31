---
title: "Mein Setup: Wie ich Apps mit Claude Code baue"
description: "Ein Blick in den Maschinenraum: Wie Claude Code und ich iOS-Apps bauen. Mit Sicherheitsnetzen, Git-Prozess, Reviews, der Frage „Wann ist ein Pull Request grün?“ und einer Checkliste zum Nachbauen."
publishedAt: 2026-09-23
updatedAt: 2026-10-31
tags:
  - Hinter den Kulissen
  - Produktentwicklung
draft: false
---

Eigentlich komme ich aus der Entwicklung. GymBo habe ich ursprünglich angefangen, um wieder in SwiftUI hineinzukommen: selbst programmieren, Neues ausprobieren, auf den aktuellen Stand kommen. Dabei habe ich schnell gemerkt, dass Agentic Coding enorm hilft, wenn ich das Tempo hochhalten will. Aus dem Lernprojekt wurde so nach und nach meine heutige Arbeitsweise.

Heute entwickle ich mehrere Apps parallel und allein: FamilyManager, GymBo, Track4Kids und ein paar weitere Projekte. Das funktioniert nur, weil ein großer Teil der Umsetzung von KI-Agenten erledigt wird. Meine Rolle hat sich dadurch verschoben: Ich entscheide, prüfe und greife ein, wenn etwas schiefläuft.

Diesen Beitrag habe ich zu einer Art Tutorial ausgebaut. Wenn du selbst Apps mit Claude bauen willst, bekommst du hier einen Blick in den Maschinenraum: wie das Setup aufgebaut ist, welche Sicherheitsnetze ich eingezogen habe, wie ein Stück Code vom Einfall bis auf die Testgeräte kommt und woran ich erkenne, dass etwas wirklich fertig ist. Und auch, an welchen Stellen es gehakt hat. Am Ende findest du eine Checkliste, mit der du dir ein eigenes Setup aufbauen kannst.

## Der Ablauf im Überblick

Bevor es ins Detail geht, hier der Rahmen: der Weg einer Änderung vom Branch bis in die Produktion. Oben arbeiten Claude und die Agenten automatisch, unten entscheide ich bewusst von Hand.

![Vom Branch in die Produktion: Claude und die Agenten planen, öffnen den Pull Request, prüfen und reparieren automatisch. Danach teste ich auf dev, promote nach staging und gebe die Produktion frei.](/images/blog/vom-branch-in-die-produktion.png)

Alles, was in diesem Beitrag folgt, dient im Kern einem Ziel: Ich möchte den Agenten viel Freiheit geben können, ohne dass dabei etwas kaputtgeht, das ich nicht reparieren kann. Dafür braucht es drei Dinge: klare Regeln, Sicherheitsnetze und nachprüfbare Belege dafür, dass etwas funktioniert.

## Claude Code als Mittelpunkt

Das Zentrum meiner Arbeit ist Claude Code. Was der Agent wissen muss, steht in `CLAUDE.md`-Dateien, und zwar auf zwei Ebenen. Eine globale Datei gilt für alle Projekte: wie ich arbeiten möchte, wie Bugs analysiert werden, wie gebaut wird. Dazu hat jedes Projekt eine eigene Datei mit Architektur, Build-Befehlen, Farben und Sprachregeln.

Das Wichtigste daran: Fast jede Regel dort hat eine Geschichte. Sie ist entstanden, weil vorher etwas schiefgegangen ist. Ein Beispiel, das ich inzwischen für eine der wertvollsten Regeln halte: **Wirkt ein Fix nicht vollständig, war die Diagnose falsch, nicht der Schutz zu schwach.** Beim zweiten Fix für dasselbe Symptom wird angehalten und das Problem neu verstanden, statt eine weitere Absicherung obendrauf zu setzen.

Ein paar Grundsätze, nach denen ich arbeite:

- **Erst planen, dann bauen.** Alles, was mehr als ein paar Schritte hat, beginnt im Plan-Modus. Ich lese den Plan, bevor Code entsteht. Geht unterwegs etwas schief, wird gestoppt und neu geplant, nicht weitergedrückt.
- **Subagents mit klarer Rollenverteilung.** Das stärkste Modell plant, analysiert und prüft. Steht der Plan, setzt ein mittleres Modell ihn um. Reines Suchen, Nachschlagen und Auswerten von Logs übernimmt das kleinste und billigste Modell. So ist der Kopf frei für Entscheidungen, und die Rechnung bleibt klein.
- **Skills für wiederkehrende Abläufe.** Für iOS nutze ich die Skill-Sammlung Axiom, für App Store Connect Skills rund um die Kommandozeile `asc`. Dazu kommen eigene Skills, zum Beispiel einer, der Blogbeiträge wie diesen hier veröffentlicht.
- **Geplante Aufgaben.** Nach einem Release misst Claude selbstständig nach, etwa ob nach 48 Stunden alles stabil läuft oder wie sich die Beta-Anmeldungen entwickeln.
- **Kein „fertig“ ohne Beweis.** Tests laufen, Logs werden geprüft, die Änderung wird gegen den Hauptzweig verglichen. Die Leitfrage: Würde ein erfahrener Entwickler das so durchwinken?

## Sicherheitsnetze: Guards, die nicht nachfragen müssen

Claude darf bei mir viel ohne Rückfrage, auch Git-Befehle und Datenbankabfragen. Das macht den Alltag schnell, wäre aber leichtsinnig ohne Netz. Mein Prinzip: **Gefährliches wird nicht verboten, sondern mechanisch abgefangen.** Eine Regel in einer Textdatei kann ein Agent überlesen oder falsch auslegen. Ein Hook kann das nicht, denn er läuft, bevor der Befehl ausgeführt wird.

Diese Guards sind bei mir aktiv:

- **Destructive Command Guard für die Shell.** Jeder Befehl wird vorab geprüft. Was sich nicht rückgängig machen lässt, wird blockiert: Force-Push, `git reset --hard`, das Löschen nicht committeter Änderungen oder `rm -rf`. Will der Agent wirklich etwas löschen, muss er erklären, was und warum, und ich führe den Befehl selbst aus.
- **Datei-Guard für Geheimnisse.** `.env`-Dateien, Konfigurationsdateien mit Schlüsseln und alles, was `credentials` oder `secrets` im Pfad trägt, darf kein Agent schreiben. Vorlagen wie `.env.example` bleiben frei. Der Guard ist *fail-closed*: Lässt sich aus einem Aufruf nicht eindeutig erkennen, welche Datei betroffen ist, wird blockiert.
- **Datenbank-Guard.** Das Datenbank-Werkzeug kann lesen und schreiben, und zwar mit demselben Aufruf. Darum prüft ein Hook jedes SQL-Statement selbst: Ein Statement muss eindeutig lesend sein, sonst wird es blockiert. Lesen auf Produktion ist damit erlaubt, Schreiben nicht. Ein fälschlich blockierter `SELECT` kostet mich eine Rückfrage, ein durchgerutschtes `DELETE` im Zweifel viel mehr.
- **Build-Gate.** Eine Warteschlange, die verhindert, dass mehrere Agenten gleichzeitig bauen und meinen Rechner einfrieren (dazu unten mehr).

Wichtig ist mir die Ehrlichkeit über die Grenzen. Der Datei-Guard sieht nur die Datei-Werkzeuge; ein Schreibzugriff über die Shell läuft an ihm vorbei. Er schützt vor dem versehentlichen Bearbeiten durch einen Agenten, nicht vor böser Absicht. Das steht deshalb ausdrücklich in seinem Kopf. Ein Guard, der mehr verspricht, als er hält, wiegt dich in falscher Sicherheit.

Hinzu kommen Sicherheitsprüfungen im Code selbst: ein eigener Security-Reviewer als Agent für Verschlüsselung, Zugriffsregeln der Datenbank, Authentifizierung und Webhooks, außerdem automatische Prüfungen in der CI, die zum Beispiel kontrollieren, dass neue Datenbankfunktionen keine zu weiten Rechte bekommen. Dazu gleich mehr.

## Steuerung vom Telefon aus

Ich sitze nicht den ganzen Tag am Schreibtisch, und das muss ich auch nicht. Meine Sessions laufen auf dem Mac, und über **Remote Control** steuere ich sie vom iPhone aus. Ich sehe, was der Agent gerade macht, beantworte Rückfragen, gebe Freigaben und bekomme Ergebnisse wie Screenshots oder Berichte direkt aufs Telefon.

In der Praxis ist es eine Mischung: Manche Aufgaben starte ich am Mac und begleite sie unterwegs weiter, andere laufen in der Cloud. Die Arbeitsteilung ist dabei klar. Unterwegs treffe ich Entscheidungen, der Mac rechnet.

## Vom groben Layout zum fertigen Design

Bevor etwas gebaut wird, skizziere ich in Figma, wie ein Screen ungefähr aussehen soll: grobe Layouts, Anordnung und Struktur, nicht mehr. Das Ausarbeiten übernimmt dann Claude Design. Aus der Skizze wird ein ausgearbeiteter Entwurf mit Abständen, Typografie und Details, den ich prüfe und anpasse.

Dieser Entwurf ist dann direkt die Vorlage für die Umsetzung: Claude Code nimmt ihn und baut den Screen danach in SwiftUI. Zwischen Design und Code gibt es keine Übersetzung durch mich mehr. So bleibt meine Zeit bei der Frage, *was* ein Screen leisten soll, und weniger beim Verschieben von Pixeln.

Seit Kurzem schaut dabei zusätzlich jemand mit professionellem Blick drauf, aber dazu unten mehr.

## Xcode und Agentic Coding

Claude baut und testet meine Apps über die Kommandozeile mit `xcodebuild`, nicht über die Xcode-Oberfläche. Xcode bleibt trotzdem Teil meines Alltags: Manche Dinge programmiere ich weiterhin selbst, gerade wenn ich an einer Oberfläche feile oder etwas direkt ausprobieren will. Agent und Xcode schließen sich nicht aus. Es kommt darauf an, was gerade schneller ans Ziel führt.

Die spannendste Lektion in diesem Bereich hatte mit Hardware zu tun. Mein Mac hat zehn Kerne, und schon ein einziger Xcode-Build lastet ihn fast vollständig aus. Als mehrere Agenten gleichzeitig an verschiedenen Projekten gebaut und jeweils einen Simulator gestartet haben, stieg die Systemlast auf rund 1000, und der Rechner fror ein.

Die Lösung ist ein kleines Skript, das ich **Build-Gate** nenne: eine Warteschlange für den ganzen Rechner, die höchstens zwei Builds gleichzeitig zulässt. Alle anderen warten, bis sie dran sind. Die erste Version war allerdings eher eine Verlosung. Kurze Aufrufe konnten an lange Wartenden vorbeiziehen, und ein CI-Lauf ist dabei irgendwann in einen Timeout gelaufen. Heute werden die Plätze strikt in der Reihenfolge vergeben, in der jemand ankommt.

Weitere Regeln rund um Xcode:

- **Simulatoren wiederverwenden** statt für jede Aufgabe einen neuen anzulegen. Die CI bekommt ein eigenes, festes Gerät, nachdem sich zwei Projekte einen Simulator geteilt und sich gegenseitig die Tests zerschossen haben.
- **Eindeutige Ziele**, also Gerät und iOS-Version. Ohne Version ist das Ziel mehrdeutig, und die Tests verhalten sich unvorhersehbar.
- **Swift Testing** statt XCTest für neue Unit-Tests.

## Der Git-Prozess: Vom Branch bis in die Produktion

Das ist der Teil, nach dem ich am häufigsten gefragt werde, deshalb gehe ich ihn Schritt für Schritt durch. Die Beispiele stammen aus FamilyManager, dem Projekt mit dem strengsten Ablauf.

### Grundregel: Niemand arbeitet auf den geschützten Zweigen

Weder ich noch ein Agent committet direkt auf `main` oder `staging`. Jede Aufgabe bekommt einen eigenen Branch, meist in einem eigenen Git-Worktree. Ein Worktree ist ein zweites Arbeitsverzeichnis desselben Repositorys: So können mehrere Agenten parallel an verschiedenen Aufgaben arbeiten, ohne sich gegenseitig Dateien zu überschreiben.

### Drei Umgebungen, drei Zweige

Der Code wandert durch drei Stufen. Jede hat ihren eigenen Zweig und ihre eigene Datenbank:

| Stufe | Zweig | Wofür |
|---|---|---|
| Dev | `dev` | Hier landet jede fertige Arbeit. Hier teste ich und die Tester. Eigene Test-Datenbank. |
| Staging | `staging` | Der exakt getestete Release-Kandidat. |
| Produktion | `main` | Was Nutzer wirklich sehen. |

Die Trennung ist der Kern der Sicherheit: Was auf Dev kaputtgeht, trifft keinen echten Nutzer.

### Der Weg eines Pull Requests

So läuft eine Änderung ab, vom Einfall bis nach `dev`:

1. **Plan.** Claude erklärt, was geändert wird und warum. Ich gebe frei oder korrigiere.
2. **Umsetzung im eigenen Branch.** Der Agent baut, testet lokal und committet in kleinen, einzelnen Schritten.
3. **Aufräumen vor dem PR.** Der geänderte Code wird auf Vereinfachung und Wiederverwendung durchgesehen. Ein Review-Durchgang findet die Dinge, die man beim Schreiben nicht sieht.
4. **Pull Request gegen `dev`.** Er wird als „bereit“ geöffnet, nicht als Entwurf, denn Entwürfe lösen bei mir den Review nicht aus.
5. **Automatische Prüfungen laufen.** Dazu gleich mehr.
6. **Claude-Review.** Ein zweiter Claude liest den ganzen PR und prüft ihn auf Korrektheit, Sicherheit, Verschlüsselung und Datenbank.
7. **Auto-Fix.** Wird etwas rot oder hat der Review einen Befund, repariert der Agent das selbst und die Prüfungen laufen erneut. Ich muss dafür nicht daneben sitzen.
8. **Alles grün am aktuellen Stand?** Dann wird nach `dev` gemergt.
9. **Ich bekomme Bescheid:** „Ist jetzt in dev, du kannst testen“, mit Link zum PR und der Angabe, worauf ich achten soll.

Ich teste nur auf `dev` und möchte nie nachfragen müssen, ob etwas schon da ist. Deshalb meldet sich der Agent aktiv bei mir.

### Wann ist ein Pull Request „grün“?

Das ist die wichtigste Frage des ganzen Prozesses, und ich habe dafür eine harte Definition. Ein Pull Request darf nach `dev`, wenn **alle** folgenden Bedingungen am **aktuellen letzten Commit** (nicht an irgendeinem älteren) erfüllt sind:

- Er ist offen, kein Entwurf, und sein Ziel ist `dev`.
- GitHub meldet keine Merge-Konflikte.
- Der Claude-Review-Lauf ist vorhanden und erfolgreich durchgelaufen.
- Der Review meldet ausdrücklich **null offene Befunde**.
- Alle übrigen Prüfläufe sind abgeschlossen und erfolgreich.
- Der PR verändert nicht selbst den Review-Mechanismus. Wer die Prüfung ändert, darf sich nicht selbst prüfen.

Und die Regel dahinter, die mich mehr Lehrgeld gekostet hat als jede andere: **Ein fehlender Check ist nie ein grüner Check.** Wenn ein Lauf gar nicht erst gestartet wird, zeigt GitHub oft ein beruhigendes Grün aus null Läufen. Genau das ist mir mit Xcode Cloud passiert (dazu unten bei der CI). Deshalb zählt bei mir nicht, was die Oberfläche anzeigt, sondern ein kleines Werkzeug, das die Bedingungen oben aktiv nachmisst und im Zweifel „keine Aussage“ meldet. In diesem Fall wird nicht gemergt.

Dazu eine ehrliche Randnotiz: GitHub kann solche Regeln bei mir nur teilweise technisch erzwingen. Da ich als Inhaber Ausnahmen habe und alle Agenten mit meinem Zugang arbeiten, würden die Schutzregeln sie nicht aufhalten. Die Beweislast liegt deshalb bei den Werkzeugen und Regeln, nicht bei der Plattform. Wenn du allein arbeitest, wird es dir ähnlich gehen. Plane das ein.

### Reviews: Maschine zuerst, Mensch zum Schluss

Früher habe ich zwei bekannte Review-Dienste eingesetzt. Beide meldeten fleißig „grün“, ohne dass ich überzeugt war, dass sie den Code wirklich gelesen haben. Ein Review, dessen Grün nichts bedeutet, ist schlimmer als keiner. Heute läuft der Review über Claude Code selbst, direkt im PR. Er prüft nicht nur Korrektheit, Sicherheit, Verschlüsselung und Datenbank, sondern auch, ob eine Änderung auf iOS und im Web zusammenpasst. Ein Feature, das nur auf einer Plattform ankommt und nirgends als offener Punkt vermerkt ist, zählt als Befund.

Der Review ersetzt nicht mein Urteil. Er nimmt mir die Fleißarbeit ab, damit ich mich beim Testen auf das konzentrieren kann, was nur ein Mensch beurteilt.

### Von `dev` über `staging` bis `main`

Hier greift eine Grenze, die ich bewusst nicht an die Agenten delegiere: Der Agent mergt nach `dev`, aber **nicht weiter**. Von `dev` nach `staging` und von dort nach `main` wird nicht gemergt, sondern *promotet*, mit einem Skript. Das Skript setzt die Zielbranches atomar auf denselben Commit (Fast-Forward) und bricht ab, wenn die Historie divergiert oder sich der Remote-Stand zwischendurch verändert hat. Zusätzlich misst es vor der Promotion noch einmal den CI-Stand genau dieses Commits. Erst danach folgt eine wörtlich getippte Bestätigung.

Für Produktion gibt es zusätzlich eine ausdrückliche Freigabe von mir, jedes Mal neu. Eine frühere Zustimmung zählt nicht. Und das Produktions-Skript hat bewusst keine Abkürzung, die die Bestätigung überspringt. Auf Staging prüfe ich nur lesend gegen echte Daten, und nach dem Release wird die Produktion ebenfalls nur gelesen.

## Test-Prozess: Maschinen, Menschen und eine UX-Designerin

Gute Tests haben zwei Seiten: Automatik, die Fehler früh und billig findet, und Menschen, die finden, was keine Automatik erwartet.

### Automatische Tests

Zwei Regeln haben meine Tests deutlich besser gemacht:

1. **Ein Test für einen Bug muss vor dem Fix fehlschlagen.** Wird er nicht rot, testet er das Falsche.
2. **Tests laufen mit realistischer Historie.** Statt eines einzelnen Datensatzes lege ich mehrere an, so wie sie auch im echten Betrieb entstehen. Viele Fehler zeigen sich erst, wenn es alte Daten gibt.

Bei FamilyManager laufen dann bei jedem Pull Request mehrere Prüfungen parallel: Datenbanktests gegen eine frische lokale Datenbank, Checks für die Serverfunktionen (darunter die Frage, ob neue Funktionen oder Tabellen zu weite Zugriffsrechte haben), Web-Checks mit echten Browser-Tests, Regeln für den iOS-Quellcode, Prüfungen der Verschlüsselung gegen feste Testvektoren und der Claude-Review.

Bei der CI trenne ich bewusst: Feature-Branches verifiziere ich lokal, die komplette iOS-Testsuite in der Cloud läuft nur dort, wo es vor einem Release zählt, nämlich bei Pull Requests nach `staging` und `main`.

Auch hier habe ich Lehrgeld bezahlt. Das Rechenkontingent von Xcode Cloud hängt am Apple-Konto, nicht am einzelnen Projekt, und alle meine Apps teilen sich denselben Topf. Als er leer war, wurden Läufe einfach abgebrochen. Das Tückische: In GitHub erschienen sie nicht als rot, sondern gar nicht. Seitdem gilt für mich: **Ein grüner Pull Request ohne iOS-Ergebnis ist kein grüner Pull Request.**

### Menschliche Tester

Keine Automatik ersetzt echte Menschen. Ich habe deshalb Tester, die die Apps in ganz unterschiedlichen Konstellationen durchspielen: auf verschiedenen Geräten, in unterschiedlichen Situationen und auf Wegen, an die ich beim Bauen nicht gedacht habe. Gerade bei einer App wie FamilyManager, in der mehrere Personen mit unterschiedlichen Rollen zusammenarbeiten, zeigen sich viele Fehler erst im Zusammenspiel. Ein Agent testet, was ihm einfällt. Ein Mensch tippt auf das, was ihm einfällt, und das sind selten dieselben Dinge.

Neue Stände landen deshalb zuerst auf `dev` und per TestFlight bei den Testern. Ihr Feedback sammelt Claude ein und sortiert es, sodass ich es morgens aufbereitet vor mir habe.

### Neu an Bord: eine UX-Designerin

Seit Kurzem habe ich Verstärkung: Eine UX-Designerin geht gemeinsam mit mir die Views und Flows durch. Sie schaut darauf, ob alles zusammenpasst: ob ein Ablauf logisch ist, ob ein Screen sein Ziel erreicht und ob die Oberfläche an den Stellen führt, an denen Nutzer Hilfe brauchen. Das ist eine Sicht, die weder ein Agent noch ich als Entwickler zuverlässig einnehmen kann, denn wir kennen die App zu gut.

Das Schöne daran: Ihr Feedback lässt sich direkt in den Prozess einspeisen. Aus Anmerkungen werden Aufgaben, die Claude umsetzt. Ich prüfe das Ergebnis wieder auf `dev`, und wir gehen es gemeinsam durch, bevor es weiterwandert.

## Release

Für App Store Connect nutze ich die Kommandozeile `asc`: TestFlight-Verteilung, Metadaten, Screenshots und die Einreichung zur Prüfung. Eine Falle, in die man leicht tappt: Wird eine App auf einer Beta-Version von macOS gebaut, lehnt der App Store sie bei der Einreichung ab, selbst wenn Xcode und SDK regulär sind. Für TestFlight spielt das keine Rolle. Vor einer Store-Einreichung prüfe ich es deshalb im fertigen Build nach.

## Wie wir zwei das zusammen machen

Wenn ich von „Claude und ich“ spreche, meine ich eine sehr konkrete Arbeitsteilung, die sich über viele Wochen eingespielt hat:

- **Ich entscheide das Was, Claude macht das Wie.** Welches Feature gebaut wird, wie es sich anfühlen soll und was liegen bleibt, bestimme ich. Wie es technisch umgesetzt wird, schlägt Claude vor, und ich lese den Plan.
- **Claude darf viel, aber nie unbemerkt.** Freiheit gibt es innerhalb der Guards. Alles, was sich nicht zurückholen lässt, geht über mich.
- **Claude meldet sich, ich muss nicht fragen.** Er sagt mir von sich aus, wenn etwas auf `dev` zum Testen bereitliegt oder wenn etwas rot bleibt und er nicht weiterkommt. Dann nennt er mir den Stand und den Blocker, statt etwas halb Grünes durchzuwinken.
- **Fehler wandern ins Regelwerk.** Jedes Mal, wenn etwas schiefgeht, schreiben wir die Lehre auf, in die `CLAUDE.md`, in einen Test oder in einen Guard. So macht Claude denselben Fehler nicht zweimal, auch nicht in der nächsten Session.
- **Ich bleibe verantwortlich.** Der Agent liefert Belege, ich prüfe sie. „Fertig“ ist erst, wenn es nachweisbar funktioniert.

## Zum Nachbauen: Dein Starter-Setup

Du musst nicht alles auf einmal haben. Ich habe auch klein angefangen. Diese Reihenfolge würde ich heute wählen:

1. **`CLAUDE.md` anlegen.** Build-Befehle, Architektur, Sprachregeln und deine zwei, drei wichtigsten Grundsätze. Nach jedem Fehler eine Zeile ergänzen.
2. **Nie auf dem Hauptzweig arbeiten.** Jede Aufgabe in einen eigenen Branch, bei parallelen Agenten in einen eigenen Worktree.
3. **Einen Shell-Guard einrichten**, der unumkehrbare Befehle blockiert. Das ist die Versicherung mit dem besten Preis-Leistungs-Verhältnis.
4. **Geheimnisse schützen.** Einen Hook, der Agenten das Schreiben von `.env` und Schlüsseldateien verbietet.
5. **Eine `dev`-Stufe einziehen.** Alles landet zuerst dort, nie direkt in der Produktion, mit eigener Test-Datenbank.
6. **Pull Requests mit automatischem Review und Tests.** Definiere schriftlich, wann „grün“ gilt, und dass ein fehlender Check nie grün ist.
7. **Auto-Fix aktivieren**, damit der Agent rote Prüfungen selbst repariert.
8. **Produktion mit Handbremse.** Promotion nur per Skript, mit Bestätigung von dir.
9. **Echte Menschen testen lassen**, und wenn du kannst, jemanden mit UX-Blick einbinden.
10. **Lehren aufschreiben**, dort, wo dein Agent sie liest.

## Fazit

Mein Setup ist nicht am Reißbrett entstanden, sondern gewachsen, mit jedem Fehler ein Stück mehr. Die Agenten nehmen mir viel Umsetzungsarbeit ab, aber die Verantwortung bleibt bei mir und inzwischen auch bei Menschen, die auf das schauen, was eine Maschine nicht sieht: Tester, die die Apps wirklich benutzen, und eine UX-Designerin, die auf Abläufe und Oberflächen achtet. Wenn du selbst mit KI-Agenten entwickelst, ist mein wichtigster Tipp: Schreib deine Lektionen auf, und zwar dort, wo dein Agent sie liest.
