#!/bin/sh
# Vercel „Ignored Build Step“ (vercel.json → ignoreCommand), läuft im Repo-Wurzelverzeichnis.
# Exit 0 = Build überspringen, Exit 1 = bauen. Andere Codes wertet Vercel als Fehler
# und bricht das Deployment ab, darum wird am Ende alles auf 0 oder 1 normalisiert.
#
# Regeln:
# 1. `main` baut immer (Production).
# 2. Sonst wird übersprungen, wenn sich seit dem letzten Deployment (VERCEL_GIT_PREVIOUS_SHA,
#    ersatzweise HEAD^) nur Dateien geändert haben, die die gebaute Seite nicht beeinflussen.
#    Branch-Vorschauen mit Seitenänderungen (z. B. Blogbeiträge) bauen also weiter.
# 3. Im Zweifel wird gebaut: Fehlt der Vergleichs-Commit im flachen Klon (git diff endet
#    mit 128), ist die Liste leer oder lässt sich nichts bestimmen, gibt es Exit 1.
#
# Als seitenfremd gilt nur, was eindeutig nicht in den Build eingeht (siehe `ignorierbar`).
# Alles andere, auch `scripts/` (astro.config.mjs importiert scripts/translations.mjs),
# `package.json`, `vercel.json`, `src/`, `public/`, `api/`, `lib/`, `css/`, `impressum.html`,
# lässt den Build laufen.

[ "$VERCEL_GIT_COMMIT_REF" = "main" ] && exit 1

# Dateien, die die gebaute Seite nicht beeinflussen. Rückgabe 0 = ignorierbar.
ignorierbar() {
  case "$1" in
    docs/*|Skills/*|tests/*|.worktrees/*|.claude/*|.playwright-mcp/*|proposals/*) return 0 ;;
    CURRENT_STATE.md) return 0 ;;
    *-preview.png|*-preview.html) return 0 ;;
    */*) return 1 ;;      # Rest in Unterordnern: bauen
    *.md) return 0 ;;     # Markdown nur im Wurzelverzeichnis
  esac
  return 1
}

basis="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"

# Dateiliste holen; scheitert git diff (z. B. 128, Commit fehlt), wird gebaut.
dateien=$(git diff --name-only "$basis" HEAD 2>/dev/null) || exit 1
[ -n "$dateien" ] || exit 1

# Zeilenweise prüfen, ohne Unterprozess, damit `exit` hier wirkt.
IFS='
'
for datei in $dateien; do
  ignorierbar "$datei" || exit 1
done

exit 0
