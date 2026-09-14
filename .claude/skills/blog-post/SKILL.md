---
name: blog-post
description: Macht aus Rohtext, Notizen oder Stichpunkten einen fertigen Blogbeitrag für benkohler.de, prüft ihn, öffnet einen PR und bereitet nach dem Deploy einen Newsletter-Entwurf in Resend vor. Verwenden, wenn der Nutzer News, ein Update, einen Wochenrückblick oder einen Beitrag veröffentlichen möchte.
---

# Blogbeitrag veröffentlichen

Der Nutzer liefert Inhalt (Rohtext, Stichpunkte, Release-Notes, Abschrift). Daraus entsteht ein Beitrag unter `src/content/blog/`, der **immer über einen PR** live geht. Ein Newsletter wird **nie automatisch versendet**.

## 1. Klären, bevor du schreibst

Frag nur, was sich nicht aus dem Input ergibt, und alles in einer Nachricht:

- Soll der Beitrag auch als Newsletter raus? (Keine Annahme treffen.)
- Veröffentlichungsdatum – Standard: heute.
- Titelbild vorhanden? Ohne Bild erscheint der Beitrag ohne Titelbild; nicht selbst eines suchen oder herunterladen, ohne ausdrückliche Freigabe.

## 2. Branch anlegen

```bash
git fetch origin && git switch -c post/<slug> origin/main
```

Nie direkt auf `main` committen oder pushen.

## 3. Datei anlegen

Pfad: `src/content/blog/<slug>.md`. Der Slug ist Dateiname und URL (`/blog/<slug>/`) und muss `^[a-z0-9-]+$` erfüllen (Umlaute transliterieren: ä→ae, ö→oe, ü→ue, ß→ss – **nur im Slug**).

Frontmatter (Schema: `src/content.config.ts`, der Build bricht bei Fehlern ab):

| Feld | Regel |
|---|---|
| `title` | Konkret, keine Clickbait-Formeln. In Anführungszeichen. |
| `description` | Ein Satz, ca. 120–160 Zeichen. Erscheint in Übersicht, RSS und Suchmaschinen. |
| `publishedAt` | `YYYY-MM-DD` |
| `tags` | Vorhandene Tags wiederverwenden: `grep -h -A3 "^tags:" src/content/blog/*.md` |
| `draft` | `false`. `true` nur, wenn der Nutzer den Beitrag bewusst noch nicht veröffentlichen will. |
| `heroImage` | Optional. Lokaler Pfad `/images/blog/<slug>.webp` – externe Bild-URLs blockiert die CSP in `vercel.json`. |
| `heroImageAlt` | Pflicht, wenn `heroImage` gesetzt ist. Beschreibt, was zu sehen ist. |
| `heroImageCredit`, `heroImageCreditUrl` | Pflicht bei fremden Fotos (z. B. `"Foto: Name · Unsplash"`). |
| `newsletterSubject` | Nur bei Newsletter. Kurz, neugierig machend, ehrlich. |
| `newsletterPreview` | Nur bei Newsletter. Ein Satz, der den Betreff ergänzt statt ihn zu wiederholen. |

Bilder: in `public/images/blog/<slug>.webp` ablegen, etwa 1600 px breit, möglichst unter 300 KB (z. B. `cwebp -q 80 -resize 1600 0 input.jpg -o <slug>.webp`, falls installiert; sonst den Nutzer fragen).

## 4. Schreiben

- **Du-Form**, durchgehend. Leserinnen und Leser werden direkt angesprochen („Trainingspläne, die besser zu dir passen“).
- **Deutsche Umlaute** immer (ä, ö, ü, ß), nie ae/oe/ue/ss im Text.
- Ich-Perspektive von Ben, ruhig und konkret. Keine Marketing-Floskeln, keine Superlative ohne Beleg.
- **Nichts erfinden.** Nur Fakten aus dem Input; Versionsnummern, Daten und Namen exakt übernehmen. Fehlt etwas, nachfragen statt auffüllen.
- Aufbau: kurzer Einstieg (worum geht es, warum ist es relevant), dann `##`-Abschnitte je Produkt oder Thema, Listen nur für echte Aufzählungen, am Ende ein kurzer Ausblick.
- Pläne als Absicht formulieren („soll“, „ist geplant“), nicht als Versprechen mit Datum.

## 5. Heikle Details prüfen

Vor dem PR den Text gegen diese Liste lesen. Treffer **nicht still entfernen und nicht still veröffentlichen**, sondern dem Nutzer mit Zeilennummer und Formulierungsvorschlag ausweisen:

- Zahlen zu betroffenen Nutzern, Konten oder Ausfällen
- Sicherheitslücken, offene Schwachstellen oder Formulierungen, die solche nahelegen („die Absicherung wird verbessert“)
- Unvollständige Datenlöschung oder andere Datenschutzlücken
- Alles zu Kinderkonten und Kinderdaten
- Namen von Testern, Kunden oder Familien; interne Systeme, Zugangsdaten, Umgebungen
- Screenshots mit personenbezogenen Daten
- Konkrete Release-Termine, die der Nutzer nicht ausdrücklich öffentlich machen will

## 6. Prüfen

```bash
npm test
```

Muss grün sein. Zusätzlich:

- `dist/blog/<slug>/index.html` existiert und enthält den Titel.
- Der Beitrag steht in `dist/rss.xml` (sofern `draft: false`).
- Seite lokal ansehen (`npm run preview` bzw. Browser-Pane) und dem Nutzer einen Screenshot zeigen: Titelbild, Überschriften, Listen, Links.

## 7. PR öffnen

```bash
git add src/content/blog/<slug>.md public/images/blog/<slug>.webp
git commit -m "content: add blog post <slug>"
git push -u origin post/<slug>
gh pr create --base main --title "Blog: <Titel>" --body "..."
```

Commit-Nachricht und PR-Beschreibung mit den Attributionszeilen aus der Session beenden. Die PR-Beschreibung enthält: Kurzfassung, Link zur Vercel-Preview (erscheint als Bot-Kommentar), ausgewiesene heikle Stellen, ob ein Newsletter geplant ist. Danach anbieten, Auto-Fix für den PR einzuschalten.

Mit dem Merge auf `main` deployt Vercel automatisch. Erst weitermachen, wenn `https://benkohler.de/blog/<slug>/` mit Status 200 antwortet.

## 8. Newsletter-Entwurf (nur wenn gewünscht, erst nach dem Deploy)

**Nie `send-broadcast` aufrufen und nie `send: true` setzen.** Versenden macht der Nutzer selbst in Resend nach einer Testmail.

**Weg A – Skript** (bevorzugt, wenn `.env.local` `RESEND_API_KEY` und `RESEND_NEWSLETTER_SEGMENT_ID` enthält):

```bash
npm run newsletter:draft -- <slug>
```

Setzt Segment, Topic, Betreff, Vorschautext, Abmeldelink und Link zum Beitrag.

**Weg B – Resend-Connector** (wenn die Werte lokal fehlen):

1. `list-segments` – das Segment **„BenKohler.de Blog“** (bestätigte Website-Abonnenten) wählen. Nie „General“ und nie ein Test- oder Preview-Segment. Fehlt es oder ist die Wahl nicht eindeutig, den Nutzer fragen.
2. HTML wie im Skript erzeugen: `scripts/create-newsletter-draft.mjs` zeigt Aufbau und Stil (Titel, Beschreibung, Beitragstext, Link „Beitrag auf benkohler.de lesen“, Abmeldelink `{{{RESEND_UNSUBSCRIBE_URL}}}`). Relative Links und Bilder auf `https://benkohler.de` umschreiben.
3. `create-broadcast` mit `from: "Ben Kohler <newsletter@benkohler.de>"`, `replyTo: ["mail@benkohler.de"]`, `subject` = `newsletterSubject` (sonst `title`), `previewText` = `newsletterPreview` (sonst `description`), `name: "Blog: <Titel>"`, `html` und `text`.
4. Der Connector kann kein Topic setzen. Dem Nutzer sagen, dass er vor dem Versand in Resend das Newsletter-Topic auswählen muss, falls eines genutzt wird.

Das Titelbild ist in beiden Wegen nicht Teil der Mail.

## 9. Rückmeldung

Kurz an den Nutzer: PR-Link, Preview-URL, ausgewiesene heikle Stellen, ob und wo der Newsletter-Entwurf liegt und was er als Nächstes tun muss (PR mergen, Testmail prüfen, Broadcast senden).
