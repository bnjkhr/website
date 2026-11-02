---
title: "The build gate: how I protect my Mac from parallel agents"
description: "Several Claude agents build at the same time and the Mac freezes. The fix is a small Bash script that queues iOS builds. Here is how it works, with the script to read."
publishedAt: 2026-11-01
tags:
  - Behind the scenes
  - Product development
draft: false
heroImage: "/images/blog/hero-build-gate.webp"
heroImageAlt: "Stainless steel turnstiles with green and red status lights"
heroImageCredit: "Photo: Martin Leitgeb · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/u5Mm6I8qQC8"
translationOf: "build-gate-warteschlange-fuer-ios-builds"
---

When several AI agents work on iOS apps at the same time, they eventually hit the same wall: your own computer. In this post I show how I solved that with a script of just under 400 lines that I call the **build gate**. It came out of working on FamilyManager with several agents in parallel, and by now it applies to all my iOS projects. You get the idea, the most important parts of the script verbatim, and the mistakes it grew out of.

If you only want the overview: the gate is a bouncer. On my Mac it lets at most two builds run at the same time. Whoever arrives later joins the back of the line and is served in order of arrival.

## The problem: ten cores, ten agents

My Mac has ten cores, and a single `xcodebuild` already uses almost all of them. For a human that is no problem, because a human doesn't build every five seconds. Agents are different. I often run several Claude sessions at once, each in its own Git worktree, each on a different task. When two, three or five of them build and test at the same time, each starting a simulator, this happens: the system load climbs to around 1000 and the computer stops responding.

An instruction to the agents only helps so much here. My first approach was a self-check in every session: "Check the load, and only build when it is low." That fails for a simple reason. Each session checks on its own, so all five see a low load, start at the same moment and only create the high load together. What you need is a **shared counter** that all sessions use.

## The idea: a bouncer with numbers

The gate is a machine-wide semaphore. You know the principle from a theatre cloakroom: there are two hooks (the "slots"), and whoever gets a hook may go in. Everyone else waits. So that nobody gets passed over forever, everyone takes a number on arrival, like at a government office.

You call it by putting the build command behind it:

```bash
~/.claude/bin/ios-build-gate -- xcodebuild build -project MyApp.xcodeproj ...
~/.claude/bin/ios-build-gate -- xcodebuild test-without-building ...
```

Everything after the `--` is the actual command. The gate waits until a slot is free, runs the command and returns its exit code unchanged. So for the question "green or red" nothing changes. That the agents really always build through the gate is a rule in my global `CLAUDE.md`: **"Never call `xcodebuild` directly. Always put `ios-build-gate --` in front."**

## The script in detail

The whole thing is a Bash script without dependencies. There is no service running in the background and no database. The shared state lives as folders in the system's temporary directory. I show the most important parts verbatim. The selection is shortened, omissions are marked with `…`, and the comments are in German in the original.

### 1. Configuration

```bash
GATE_DIR="${TMPDIR:-/tmp}/claude-ios-build-gate"
SLOT_DIR="$GATE_DIR/slots"
QUEUE_DIR="$GATE_DIR/queue"
MAX="${IOS_GATE_MAX:-2}"
NCPU="$(sysctl -n hw.ncpu 2>/dev/null || echo 8)"
LOAD_CEIL="${IOS_GATE_LOAD:-$((NCPU + 2))}"
TIMEOUT="${IOS_GATE_TIMEOUT:-1800}"
```

- `MAX` is the number of simultaneous builds. On my machine it is two.
- `LOAD_CEIL` is a soft brake: if the system load is above the core count plus two, the gate waits additionally.
- `TIMEOUT` is the longest wait for a slot, 30 minutes by default.
- `SLOT_DIR` and `QUEUE_DIR` are the shared state: `slots/` holds the two slots, `queue/` the numbers of those waiting.

### 2. A slot is a folder

The trick everything builds on: `mkdir` is **atomic**. If two processes try to create the same folder at the same moment, exactly one wins and the other gets an error. That is exactly the behaviour you need for a lock, and it needs no library.

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

The gate tries `slot.0`, then `slot.1`. Once it has created a folder, it writes its own process ID (`$$`) into it and reads it back as a check. Only if its own PID is really in there does the slot count as won. Why this double check is necessary you will see in the mistakes section below.

### 3. Taking a number

The queue works on the same principle: a number is also a folder.

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

The gate looks up which number is the highest and tries to create the next one (`t.7`, then `t.8` and so on). If another gate wins the `mkdir`, it simply recalculates. A number is never reused as long as a higher one exists. Whoever is already waiting can't be overtaken.

Your own position comes from one pass through the directory: it is 1 plus the number of tickets smaller than your own.

### 4. Waiting for your turn

This is the core, the wait loop:

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

The decisive line is `[ "$QPOS" -le "$FREE" ]`: a gate only reaches for a slot if its position is less than or equal to the number of free slots. If both slots are free, the first two may go right away. If one slot is free, only the first may. Whoever stands further back looks, but doesn't reach, and so takes nothing from anyone.

Two details:

- **The waiting is graded.** The first in line checks every second, so that a freed slot doesn't sit unused, positions two and three every two seconds, everyone further back every five.
- **Waiting is cheap.** The loop only uses Bash builtins: no `cat`, no `date`, no subprocesses. That is deliberate: fifteen waiting gates that constantly spawn new processes would load the machine the gate is supposed to protect. That's also why it counts with `$SECONDS` (the shell's built-in second clock) instead of `date`.

If the time window runs out, the gate aborts with exit code 75 (`EX_TEMPFAIL`, "temporarily not possible"). It means the machine really was full the whole time.

### 5. Off it goes

Once the gate has a slot, it gives its number back immediately so the next one can move up. Then comes the soft load brake, and finally the build runs:

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

The brake prevents two freshly released builds from crashing into the simulator's boot phase at the very same moment. After two minutes the build starts anyway, so nobody hangs at the brake forever. `"$@"` is the actual command that came after the `--`.

Cleanup is handled by a signal handler: `trap release EXIT` makes sure slot and number are released on every exit, including Ctrl-C or `kill`.

### 6. What happens when a gate dies?

This is the hardest part, because it decides whether the gate holds up in daily use. A process can be killed hard at any time (`kill -9`), and then nobody gives its slot back. Without a countermeasure, a dead gate process would block the slot forever.

So every waiting gate cleans up regularly: it reads the PID from every slot and every number and uses `kill -0` to check whether the process is still alive. Dead entries are removed. To keep that from going wrong, it isn't done with a blind `rm`:

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

First the entry is **renamed atomically**, and only then is it checked whether it still carries the dead PID. If another gate cleared the entry and handed it out again between "read" and "delete", it is given back. A live gate never loses its slot to a cleaner working with stale information.

## What went wrong: the mistakes behind the script

The script looks tidy, but it came out of two rounds of real mistakes. Almost every paragraph in the comment header of the file tells such a story.

**Round 1 (15 September 2026): three builds with two slots.** I saw three running `xcodebuild` processes although the gate should have allowed two, and the load was back at around 1000. The causes were small gaps:

- A slot comes into being in two steps: first `mkdir`, then writing the PID. The cleaner deleted every folder without a PID immediately, and if it hit exactly that moment, a gate started building without a slot. Since then a folder without a PID stays for a minute, and a gate checks after writing whether the slot really carries its PID (that is the double check in `claim_slot`).
- On exit, a gate blindly deleted its remembered path, even if that now belonged to another gate. Now it only releases its own slot.
- `trap release EXIT INT TERM` only cleaned up on an abort and then kept waiting. Now `INT` and `TERM` really end the gate.

**Round 2 (16 September 2026): the lottery.** The first version served the waiting by chance: everyone checked every five seconds, and whoever caught a `mkdir` first got the slot. That isn't a queue, it's a lottery. Short calls slipped past long waiters. With humans you barely notice, but for CI it really hurt: a CI run has a fixed time window, and it ran into exit 75 after 900 seconds while other sessions kept getting ahead of it.

The fix was the numbers from section 3 and the "position ≤ free slots" rule from section 4. Since then it is strictly first come, first served.

One consequence matters to me because it isn't obvious: **don't build your own retry loop around the gate.** If you simply re-queue after exit 75, you take a new, higher number and are at the back again. That isn't just pointless, it's harmful. Call the gate once and let it wait, nothing more is needed. If a call gets exit 75, the machine really is full.

I didn't change the slot format (`slot.N` with a `pid` file) in either round. That way old gates that were still running during the swap could keep using the same counter, and `MAX` held even in mixed operation.

## The rules around it

The script alone isn't enough, you need rules the agents follow. In my setup they live in the global `CLAUDE.md`:

- **Every iOS build and every test runs through the gate**, in all projects. Never `xcodebuild` directly.
- **Don't raise `MAX` and don't bypass the gate.** Sessions having to wait is the point.
- **Reuse simulators.** No throwaway simulator per task. An existing, booted simulator with a matching runtime is used, and never several simulators of the same runtime in parallel.
- **CI gets its own fixed device.** Two projects once shared the same simulator, and one installed its app in the middle of the other's UI test. The test lost its app.
- **The old load self-check is replaced**, not supplemented. It checks per session independently, so everyone still starts at once. The gate is the only shared counter.

## Build it yourself

If you have the same problem, you need less than the script suggests. The basic idea fits into a handful of lines: one folder per slot, `mkdir` as the lock, the PID in the folder, `kill -0` against dead entries. Everything else in my script, meaning numbers, graded waiting, atomic cleanup, came out of real mishaps. The same mishaps can happen to you, just later.

A checklist:

1. **Build a shared counter** that all sessions use. A check per session isn't enough.
2. **Write a rule into your `CLAUDE.md`** that all builds run through the gate, with the reason. Agents follow rules they understand better.
3. **Serve in order of arrival.** Otherwise calls with a limited time window lose against ones that can queue up forever.
4. **Plan for dead processes.** A process that is killed hard returns nothing.
5. **Keep waiting cheap.** Whoever waits shouldn't create load.
6. **Pass the exit code through,** so nothing changes for green and red.
