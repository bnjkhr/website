---
title: "Das Build-Gate: Wie ich meinen Mac vor parallelen Agenten schütze"
description: "Mehrere Claude-Agenten bauen gleichzeitig und der Mac friert ein. Die Lösung ist ein kleines Bash-Skript, das iOS-Builds in eine Warteschlange stellt. So funktioniert es, mit dem Skript zum Nachlesen."
publishedAt: 2026-11-01
tags:
  - Hinter den Kulissen
  - Produktentwicklung
draft: false
---

Wenn mehrere KI-Agenten gleichzeitig an iOS-Apps arbeiten, stoßen sie irgendwann an dieselbe Wand: den eigenen Rechner. In diesem Beitrag zeige ich, wie ich das Problem mit einem Skript von knapp 400 Zeilen gelöst habe, das ich **Build-Gate** nenne. Es ist entstanden, als ich an FamilyManager mit mehreren Agenten parallel gearbeitet habe, und gilt inzwischen für alle meine iOS-Projekte. Du bekommst die Idee, die wichtigsten Teile des Skripts im Wortlaut und die Fehler, aus denen es gewachsen ist.

Wenn du nur den Überblick willst: Das Gate ist ein Türsteher. Es lässt auf meinem Mac höchstens zwei Builds gleichzeitig laufen. Wer später kommt, stellt sich hinten an und wird in der Reihenfolge der Ankunft bedient.

## Das Problem: Zehn Kerne, zehn Agenten

Mein Mac hat zehn Kerne, und ein einziger `xcodebuild` lastet ihn schon fast voll aus. Das ist bei einem Menschen kein Problem, denn der baut ja nicht alle fünf Sekunden. Bei Agenten sieht es anders aus. Ich lasse oft mehrere Claude-Sessions gleichzeitig laufen, jede in einem eigenen Git-Worktree, jede an einer anderen Aufgabe. Wenn zwei, drei oder fünf davon gleichzeitig bauen, testen und dafür jeweils einen Simulator starten, passiert Folgendes: Die Systemlast steigt auf rund 1000, und der Rechner reagiert nicht mehr.

Gegen dieses Problem hilft eine Anweisung an die Agenten nur begrenzt. Der erste Ansatz war ein Selbstcheck in jeder Session: „Prüfe die Last, und baue erst, wenn sie niedrig ist.“ Das scheitert an einem einfachen Punkt. Jede Session prüft für sich allein, also sehen alle fünf eine niedrige Last, starten im selben Moment und erzeugen die hohe Last erst gemeinsam. Es braucht einen **gemeinsamen Zähler**, den alle Sessions teilen.

## Die Idee: ein Türsteher mit Nummern

Das Gate ist eine maschinenweite Semaphore. Das Prinzip kennst du von der Garderobe im Theater: Es gibt zwei Haken (die „Plätze“), und wer einen Haken bekommen hat, darf rein. Alle anderen warten. Damit dabei niemand ewig übergangen wird, zieht jeder beim Ankommen eine Nummer, wie beim Amt.

Aufgerufen wird es, indem man den Build-Befehl dahinter hängt:

```bash
~/.claude/bin/ios-build-gate -- xcodebuild build -project MyApp.xcodeproj ...
~/.claude/bin/ios-build-gate -- xcodebuild test-without-building ...
```

Alles nach dem `--` ist der eigentliche Befehl. Das Gate wartet, bis ein Platz frei ist, führt den Befehl aus und gibt dessen Exit-Code unverändert zurück. Für die Frage „grün oder rot“ ändert sich dadurch also nichts. Dass die Agenten wirklich immer durch das Gate bauen, steht als Regel in meiner globalen `CLAUDE.md`: **„Nie `xcodebuild` direkt aufrufen. Immer `ios-build-gate --` davor.“**

## Das Skript im Detail

Das ganze Skript ist ein Bash-Skript ohne Abhängigkeiten. Es gibt keinen Dienst, der im Hintergrund läuft, und keine Datenbank. Der gemeinsame Zustand liegt als Ordner im temporären Verzeichnis des Systems. Ich zeige die wichtigsten Teile im Wortlaut. Die Auswahl ist gekürzt, Auslassungen sind mit `…` markiert, und die Kommentare sind im Original auf Deutsch.

### 1. Konfiguration

```bash
GATE_DIR="${TMPDIR:-/tmp}/claude-ios-build-gate"
SLOT_DIR="$GATE_DIR/slots"
QUEUE_DIR="$GATE_DIR/queue"
MAX="${IOS_GATE_MAX:-2}"
NCPU="$(sysctl -n hw.ncpu 2>/dev/null || echo 8)"
LOAD_CEIL="${IOS_GATE_LOAD:-$((NCPU + 2))}"
TIMEOUT="${IOS_GATE_TIMEOUT:-1800}"
```

- `MAX` ist die Zahl der gleichzeitigen Builds. Auf meiner Maschine sind es zwei.
- `LOAD_CEIL` ist eine weiche Bremse: Liegt die Systemlast über der Kernzahl plus zwei, wartet das Gate zusätzlich.
- `TIMEOUT` ist die längste Wartezeit auf einen Platz, standardmäßig 30 Minuten.
- `SLOT_DIR` und `QUEUE_DIR` sind der gemeinsame Zustand: In `slots/` stehen die zwei Plätze, in `queue/` die Nummern der Wartenden.

### 2. Ein Platz ist ein Ordner

Der Trick, auf dem alles aufbaut: `mkdir` ist **atomar**. Wenn zwei Prozesse im selben Moment denselben Ordner anlegen wollen, gewinnt genau einer, und der andere bekommt einen Fehler. Genau dieses Verhalten braucht man für eine Sperre, und es braucht dafür keine Bibliothek.

```bash
claim_slot() {
  local n=0 cand
  while [ "$n" -lt "$MAX" ]; do
    cand="$SLOT_DIR/slot.$n"
    if mkdir "$cand" 2>/dev/null; then
      if printf '%s\n' "$$" > "$cand/pid" 2>/dev/null; then
        read_pid "$cand"
        if [ "$PIDVAL" = "$$" ]; then
          MY_SLOT="$cand"
          return 0
        fi
      fi
    fi
    n=$((n + 1))
  done
  return 1
}
```

Das Gate probiert `slot.0`, dann `slot.1`. Hat es einen Ordner angelegt, schreibt es seine eigene Prozess-ID (`$$`) hinein und liest sie zur Kontrolle wieder aus. Nur wenn die eigene PID wirklich drinsteht, gilt der Platz als gewonnen. Warum diese Doppelprüfung nötig ist, siehst du weiter unten bei den Fehlern.

### 3. Die Nummer ziehen

Die Warteschlange funktioniert nach demselben Prinzip: Eine Nummer ist ebenfalls ein Ordner.

```bash
take_ticket() {
  local n cand try=0
  MY_TICKET=""
  MY_SEQ=""
  while [ "$try" -lt 100 ]; do
    try=$((try + 1))
    queue_scan
    n=$((QMAX + 1))
    cand="$QUEUE_DIR/t.$n"
    mkdir "$cand" 2>/dev/null || continue
    printf '%s\n' "$$" > "$cand/pid" 2>/dev/null || continue
    read_pid "$cand"
    if [ "$PIDVAL" = "$$" ]; then
      MY_TICKET="$cand"
      MY_SEQ="$n"
      return 0
    fi
  done
  return 1
}
```

Das Gate sieht nach, welche Nummer die höchste ist, und versucht, die nächste anzulegen (`t.7`, dann `t.8` und so weiter). Gewinnt ein anderes Gate das `mkdir`, rechnet es einfach neu. Eine Nummer wird nie vergeben, solange eine höhere existiert. Wer schon wartet, kann also nicht überholt werden.

Die eigene Position ergibt sich aus einem Durchgang durch das Verzeichnis: Sie ist 1 plus die Zahl der Nummern, die kleiner sind als die eigene.

### 4. Warten, bis man dran ist

Das ist der Kern, die Warteschleife:

```bash
while :; do
  # … gelegentlich aufräumen (tote Plätze und Wartende, siehe unten) …

  queue_scan
  count_free

  # Zugreifen darf nur, wer weiter vorne steht, als es freie Plaetze gibt —
  # dann nimmt er niemandem etwas weg.
  if [ -z "$MY_SEQ" ] || [ "$QPOS" -le "$FREE" ]; then
    claim_slot && break
  fi

  # Kein Platz frei -> warten.
  if [ "$SECONDS" -ge "$TIMEOUT" ]; then
    echo "ios-build-gate: Timeout nach ${TIMEOUT}s Warten auf freien Slot …" >&2
    exit 75
  fi

  # Vorne haeufiger nachschauen, damit ein frei gewordener Platz nicht
  # brachliegt; weiter hinten reicht selten.
  if [ -z "$MY_SEQ" ] || [ "$QPOS" -gt 3 ]; then
    sleep 5
  elif [ "$QPOS" = 1 ]; then
    sleep 1
  else
    sleep 2
  fi
done
```

Die entscheidende Zeile ist `[ "$QPOS" -le "$FREE" ]`: Ein Gate greift nur nach einem Platz, wenn seine Position kleiner oder gleich der Zahl freier Plätze ist. Sind beide Plätze frei, dürfen die ersten zwei sofort los. Ist ein Platz frei, darf nur der Erste. Wer weiter hinten steht, schaut zwar nach, aber greift nicht zu und nimmt damit niemandem etwas weg.

Zwei Details dazu:

- **Die Wartezeit ist abgestuft.** Der Erste in der Schlange schaut jede Sekunde nach, damit ein frei gewordener Platz nicht ungenutzt herumliegt, die Plätze zwei und drei alle zwei Sekunden, alle weiter hinten alle fünf.
- **Das Warten ist billig.** Die Schleife benutzt nur Bash-Builtins, also keinen `cat`, kein `date`, keine Unterprozesse. Das ist Absicht: Fünfzehn wartende Gates, die jeweils ständig neue Prozesse starten, würden den Rechner belasten, den das Gate eigentlich schützen soll. Deshalb zählt auch `$SECONDS` (die eingebaute Sekundenuhr der Shell) statt `date`.

Läuft das Zeitfenster ab, bricht das Gate mit Exit-Code 75 ab (`EX_TEMPFAIL`, „vorübergehend nicht möglich“). Das bedeutet: Die Maschine war in der ganzen Zeit wirklich voll.

### 5. Los geht’s

Hat das Gate einen Platz, gibt es seine Nummer sofort zurück, damit der Nächste nachrücken kann. Danach kommt die weiche Lastbremse, und dann läuft endlich der Build:

```bash
release_ticket

lstart=$SECONDS
while [ "$(load1_int)" -gt "$LOAD_CEIL" ]; do
  [ $((SECONDS - lstart)) -ge 120 ] && break   # nach 2 min trotzdem starten
  sleep 5
done

"$@"
exit $?
```

Die Bremse verhindert, dass zwei frisch freigegebene Builds im selben Augenblick in die Boot-Phase des Simulators krachen. Nach zwei Minuten startet der Build trotzdem, damit niemand ewig an der Bremse hängt. `"$@"` ist der eigentliche Befehl, der nach dem `--` stand.

Das Aufräumen übernimmt ein Signal-Handler: `trap release EXIT` sorgt dafür, dass Platz und Nummer bei jedem Ende freigegeben werden, auch bei Strg-C oder `kill`.

### 6. Was passiert, wenn ein Gate stirbt?

Das ist der schwierigste Teil, denn er entscheidet, ob das Gate im Alltag hält. Ein Prozess kann jederzeit hart beendet werden (`kill -9`), und dann gibt niemand seinen Platz zurück. Ohne Gegenmaßnahme würde ein toter Gate-Prozess den Platz für immer blockieren.

Deshalb räumt jedes wartende Gate regelmäßig auf: Es liest die PID aus jedem Platz und jeder Nummer und prüft mit `kill -0`, ob der Prozess noch lebt. Tote Einträge werden entfernt. Damit dabei nichts schiefgeht, passiert das nicht mit einem blinden `rm`:

```bash
reap() {
  local entry="$1" dead="$2" parent tomb
  parent="${entry%/*}"
  tomb="$parent/.reap.$$.$RANDOM"
  mv "$entry" "$tomb" 2>/dev/null || return 0
  read_pid "$tomb"
  if [ "$PIDVAL" = "$dead" ]; then
    rm -rf "$tomb"
  else
    [ -e "$entry" ] || mv "$tomb" "$entry" 2>/dev/null
  fi
}
```

Zuerst wird der Eintrag **atomar umbenannt**, erst dann wird geprüft, ob er immer noch die tote PID trägt. Hat zwischen „Lesen“ und „Löschen“ ein anderes Gate den Eintrag geräumt und neu vergeben, wird er zurückgegeben. Ein lebendes Gate verliert so nie seinen Platz durch einen Aufräumer, der mit veralteten Informationen arbeitet.

## Was schiefging: die Fehler hinter dem Skript

Das Skript sieht aufgeräumt aus, ist aber in zwei Runden aus echten Fehlern entstanden. Fast jeder Absatz im Kommentarkopf der Datei erzählt eine solche Geschichte.

**Runde 1 (15.09.2026): Drei Builds bei zwei Plätzen.** Ich beobachtete drei laufende `xcodebuild`-Prozesse, obwohl das Gate nur zwei zulassen sollte, und die Last stand wieder bei etwa 1000. Die Ursachen lagen in kleinen Lücken:

- Ein Platz entsteht in zwei Schritten: erst `mkdir`, dann die PID schreiben. Der Aufräumer löschte jedes Verzeichnis ohne PID sofort, und traf er genau diesen Moment, baute ein Gate ohne Platz los. Seitdem bleibt ein Verzeichnis ohne PID eine Minute stehen, und ein Gate prüft nach dem Schreiben, ob der Platz wirklich seine PID trägt (das ist die Doppelprüfung in `claim_slot`).
- Beim Beenden löschte ein Gate blind den gemerkten Pfad, auch wenn der inzwischen einem anderen gehörte. Jetzt gibt es nur noch den eigenen Platz frei.
- `trap release EXIT INT TERM` räumte bei einem Abbruch nur auf und wartete dann weiter. Jetzt beenden `INT` und `TERM` das Gate wirklich.

**Runde 2 (16.09.2026): Die Verlosung.** Die erste Version hat Wartende mit einer Zufallslogik bedient: Alle prüften alle fünf Sekunden, wer zuerst ein `mkdir` erwischte, bekam den Platz. Das ist keine Warteschlange, sondern eine Verlosung. Kurze Aufrufe zogen an langen Wartenden vorbei. Bei Menschen merkt man das kaum, aber bei der CI hat es richtig wehgetan: Ein CI-Lauf hat ein festes Zeitfenster, und er lief nach 900 Sekunden in Exit 75, während andauernd andere Sessions vor ihm drankamen.

Die Lösung waren die Nummern aus Abschnitt 3 und die Regel „Position ≤ freie Plätze“ aus Abschnitt 4. Seitdem gilt strikt: Wer zuerst kommt, bekommt den nächsten freien Platz.

Eine Folge davon ist mir wichtig, weil sie nicht naheliegt: **Man darf keine eigene Wiederholungsschleife um das Gate bauen.** Wer nach Exit 75 einfach neu anstellt, zieht eine neue, höhere Nummer und steht wieder hinten. Das ist nicht nur überflüssig, sondern schädlich. Das Gate einmal aufrufen und warten lassen, mehr braucht es nicht. Bekommt ein Aufruf Exit 75, ist die Maschine wirklich voll.

Das Format der Plätze (`slot.N` mit einer Datei `pid`) habe ich in beiden Runden nicht verändert. So konnten noch laufende alte Gates während des Austauschs weiter denselben Zähler benutzen, und `MAX` galt auch im Mischbetrieb.

## Die Regeln drumherum

Das Skript allein reicht nicht, es braucht Regeln, an die sich die Agenten halten. Bei mir stehen sie in der globalen `CLAUDE.md`:

- **Jeder iOS-Build und jeder Test läuft durch das Gate**, in allen Projekten. Nie `xcodebuild` direkt.
- **`MAX` nicht hochsetzen und das Gate nicht umgehen.** Dass Sessions warten müssen, ist der Zweck.
- **Simulatoren wiederverwenden.** Kein Wegwerf-Simulator pro Aufgabe. Ein vorhandener, gebooteter Simulator mit passender Runtime wird genutzt, und nie laufen mehrere Simulatoren derselben Runtime parallel.
- **Die CI bekommt ein eigenes, festes Gerät.** Zwei Projekte hatten sich einmal denselben Simulator geteilt, und eines installierte seine App mitten in einen UI-Test des anderen. Der Test verlor seine App.
- **Der alte Last-Selbstcheck wird ersetzt**, nicht ergänzt. Er prüft pro Session unabhängig, deshalb starten trotzdem alle gleichzeitig. Das Gate ist der einzige gemeinsame Zähler.

## Zum Nachbauen

Wenn du dasselbe Problem hast, brauchst du weniger, als das Skript vermuten lässt. Die Grundidee passt auf eine Handvoll Zeilen: ein Verzeichnis pro Platz, `mkdir` als Sperre, die PID im Verzeichnis, `kill -0` gegen tote Einträge. Alles Weitere in meinem Skript, also Nummern, abgestuftes Warten, atomares Aufräumen, ist aus echten Pannen entstanden. Bei dir können dieselben Pannen auftreten, nur eben später.

Eine Checkliste:

1. **Einen gemeinsamen Zähler bauen,** den alle Sessions teilen. Eine Prüfung pro Session reicht nicht.
2. **Eine Regel in die `CLAUDE.md` schreiben,** dass alle Builds durch das Gate laufen, mit dem Grund. Agenten halten sich besser an Regeln, die sie verstehen.
3. **In Reihenfolge der Ankunft bedienen.** Sonst verlieren Aufrufe mit begrenztem Zeitfenster gegen unbegrenzt nachrückende.
4. **Tote Prozesse einplanen.** Ein hart beendeter Prozess gibt nichts zurück.
5. **Das Warten billig halten.** Wer wartet, soll keine Last erzeugen.
6. **Den Exit-Code durchreichen,** damit sich für Grün und Rot nichts ändert.
