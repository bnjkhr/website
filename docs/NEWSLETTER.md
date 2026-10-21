# Blog und Newsletter

## Beiträge veröffentlichen

Beiträge liegen als Markdown unter `src/content/blog/`. Ein Beitrag wird nur gebaut, wenn `draft` nicht `true` ist.

1. Beitrag lokal mit `npm run dev` prüfen.
2. `npm run test` ausführen.
3. Website veröffentlichen.
4. Danach mit `npm run newsletter:draft -- <slug>` einen Resend-Entwurf erzeugen.
5. Testmail in Resend prüfen und den Broadcast dort manuell senden.

Ein Deploy versendet grundsätzlich keine E-Mail.

## Resend einrichten

- Segment für bestätigte Website-Abonnenten anlegen und als `RESEND_NEWSLETTER_SEGMENT_ID` hinterlegen.
- Optional ein öffentliches Topic anlegen. Die Standard-Einstellung muss `opt_out` sein, damit Kontakte erst nach expliziter Bestätigung mit `opt_in` eingetragen werden.
- **Kontakt-Eigenschaften – eingerichtet am 14.09.2026:** `consent_requested_at`, `consent_confirmed_at` und `consent_version` (Typ `string`) existieren im Resend-Konto. Für ein neues Konto `npm run newsletter:setup` ausführen; das Skript legt fehlende Eigenschaften an und kann gefahrlos mehrfach laufen. Fehlen sie, lehnt Resend jede Bestätigung ab und Abonnenten sehen eine Fehlermeldung.
- `NEWSLETTER_TOKEN_SECRET` als zufälligen, mindestens 32 Byte langen Wert setzen.
- `RESEND_API_KEY` und `NEWSLETTER_TOKEN_SECRET` in Vercel für Preview und Production konfigurieren.
- **Preview hat ein eigenes Segment – eingerichtet:** In Resend gibt es das Segment „BenKohler.de Blog (Preview)“ (angelegt am 14.09.2026). In Vercel sind nur für die Umgebung *Preview* `RESEND_NEWSLETTER_SEGMENT_ID` (dieses Segment) und `RESEND_NEWSLETTER_TOPIC_ID` („Blog-Updates“) gesetzt (15.09.2026). So landen Test-Anmeldungen aus Preview-Deploys nicht im echten Verteiler.
  - **Noch offen:** `RESEND_API_KEY` und ein eigenes `NEWSLETTER_TOKEN_SECRET` für *Preview*. Bis dahin antwortet die Anmeldung auf Preview-Deploys mit 503. Neue Variablen gelten erst ab dem nächsten Preview-Build.
  - Zum Testen eine eigene Adresse nehmen (z. B. mit `+preview`): Resend-Kontakte gelten kontoweit, eine bereits abonnierte Adresse würde sonst verändert.
- Versanddomain, DKIM/SPF und Absender in Resend prüfen.

Für lokale Broadcast-Entwürfe lädt `npm run newsletter:draft` die Werte aus der nicht versionierten `.env.local`. Auf Vercel wird die URL für den Bestätigungslink automatisch aus der jeweiligen Preview- oder Production-URL ermittelt; `SITE_URL` ist dort nur ein optionaler Override.

## Vercel einrichten

- **Rate-Limit für die Anmeldung – eingerichtet am 15.09.2026:** Firewall-Regel „Newsletter-Anmeldung begrenzen“. Sie greift, wenn *Request Path* gleich `/api/newsletter-subscribe` und *Method* `POST` ist, und erlaubt 5 Anfragen pro 10 Minuten je IP (Fixed Window); darüber antwortet Vercel mit 429. Angelegt über `vercel api` (`PATCH /v1/security/firewall/config`), sichtbar und änderbar im Vercel-Dashboard unter Firewall → Rules. Pro Adresse verschickt die Anmeldung ohnehin höchstens eine Bestätigungsmail pro Tag; die Regel verhindert, dass jemand massenhaft fremde Adressen einträgt. Sie fängt aber keine Bots, die verteilt über den Tag mit wechselnden Adressen anmelden – dafür gibt es den Abschnitt „Bot-Schutz“.
  - **Prüfen:** Sechsmal `POST` mit einer ungültigen Adresse an `/api/newsletter-subscribe` schicken. Die ersten fünf Antworten sind 400, danach kommt 429. Ungültige Adressen werden vor jedem Resend-Aufruf abgelehnt, es geht also keine Mail raus. Das eigene Netz ist danach bis zu 10 Minuten für Anmeldungen gesperrt.
- **Sicherheits-Header** (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) stehen in `vercel.json`. Wer neue externe Quellen einbindet (Bilder, Videos, Skripte), muss sie dort in der `Content-Security-Policy` ergänzen, sonst blockiert der Browser sie.

## Double-Opt-in

1. `POST /api/newsletter-subscribe` verschickt einen 48 Stunden gültigen, signierten Bestätigungslink. Pro Adresse geht höchstens eine Mail pro Tag (24 Stunden) raus; eine erneute Anmeldung in dieser Zeit gilt als bereits versendet.
2. `GET /api/newsletter-confirm?token=…` prüft nur den Link und zeigt einen Button „Abo bestätigen“. Das Öffnen des Links ändert nichts, damit automatische Link-Scanner in Mail-Gateways kein Abo bestätigen können.
3. Erst `POST /api/newsletter-confirm` legt den Kontakt im Newsletter-Segment an.

Als Einwilligungsnachweis werden am Resend-Kontakt `consent_requested_at`, `consent_confirmed_at` und `consent_version` gespeichert. Zusätzlich landet die Bestätigung ohne Klartextadresse mit einem SHA-256-Hash im Vercel-Log. Ändert sich der Einwilligungstext im Formular, `CONSENT_VERSION` in `lib/newsletter.js` anpassen.

## Bot-Schutz

Bots haben fremde Adressen eingetragen (etwa eine pro Stunde, wechselnde Adressen). Honeypot und Rate-Limit greifen dagegen nicht, deshalb prüft `POST /api/newsletter-subscribe` in dieser Reihenfolge: Honeypot → `Sec-Fetch-Site` → Formular-Token → Turnstile (falls aktiv) → Adresse → Resend. Jede Ablehnung und jeder Versand schreibt eine Zeile `newsletter-subscribe reason=… emailHash=… contentType=… userAgent=… secFetchSite=…` ins Vercel-Log (nie die Klartextadresse).

- **Formular-Token (immer aktiv):** Das Formular holt beim Laden der Seite per `GET /api/newsletter-token` ein signiertes Token (gleiche HMAC-Signatur wie der Bestätigungslink, `NEWSLETTER_TOKEN_SECRET`) und schickt es als `formToken` mit. Es ist nicht an eine Adresse gebunden und gilt frühestens 3 Sekunden, spätestens 2 Stunden nach Ausstellung. Das Formular wartet beim Absenden automatisch, bis die 3 Sekunden um sind, und holt nach einem Fehler ein neues Token. Wer direkt an die API postet, bekommt `400` und löst keine Mail aus.
- **`Sec-Fetch-Site`:** Steht der Header im Request und ist nicht `same-origin` oder `same-site`, antwortet die API mit `400`. Fehlt er (ältere Browser), wird nicht blockiert.
- **Cloudflare Turnstile (optional, standardmäßig aus):**
  1. In Cloudflare unter Turnstile ein Widget für `benkohler.de` anlegen (Modus *Managed*). Es gibt einen Site-Key (öffentlich) und einen Secret-Key.
  2. In Vercel für *Production* setzen: `PUBLIC_TURNSTILE_SITE_KEY` (Site-Key) und `TURNSTILE_SECRET_KEY` (Secret-Key).
  3. Neu deployen – `PUBLIC_…` wird beim Build in die Seite eingebaut.
  Ohne Site-Key lädt die Seite weder Skript noch Widget. Ist nur der Secret gesetzt, lehnt die API jede Anmeldung ab, weil die Antwort fehlt; beide Werte also immer zusammen setzen. Die CSP in `vercel.json` erlaubt `challenges.cloudflare.com` bereits.
- **Prüfen nach dem Deploy:** Nach etwa 24 Stunden in Resend (`list-emails`) kontrollieren, dass keine Mails „Bitte bestätige dein Blog-Abo“ mehr an Fremdadressen gehen. In den Vercel-Logs nach `newsletter-subscribe reason=` suchen: `invalid-form-token`, `cross-site-request`, `honeypot` und `turnstile-failed` zeigen, welchen Weg die Bots nehmen; `sent` ist ein echter Versand. Mit Turnstile: Anmeldung im Browser durchspielen und im Log `reason=sent` sehen.

## Substack-Migration

Der Substack-Export wird separat importiert, sobald er vorliegt. Bestehende Abonnenten dürfen nur übernommen werden, wenn deren bisherige Einwilligung denselben Newsletter abdeckt. Alte Beiträge müssen vor dem Import auf Slugs, Bilder und interne Links geprüft werden.
