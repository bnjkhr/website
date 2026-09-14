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
- `NEWSLETTER_TOKEN_SECRET` als zufälligen, mindestens 32 Byte langen Wert setzen.
- `RESEND_API_KEY`, `NEWSLETTER_TOKEN_SECRET` und die IDs in Vercel für Preview und Production konfigurieren.
- Versanddomain, DKIM/SPF und Absender in Resend prüfen.

Für lokale Broadcast-Entwürfe lädt `npm run newsletter:draft` die Werte aus der nicht versionierten `.env.local`. Auf Vercel wird die URL für den Bestätigungslink automatisch aus der jeweiligen Preview- oder Production-URL ermittelt; `SITE_URL` ist dort nur ein optionaler Override.

## Double-Opt-in

`POST /api/newsletter-subscribe` verschickt einen 48 Stunden gültigen, signierten Bestätigungslink. Erst `GET /api/newsletter-confirm` legt den Kontakt im Newsletter-Segment an. Bestätigungen werden ohne Klartextadresse mit einem SHA-256-Hash im Vercel-Log protokolliert.

Für eine dauerhafte, exportierbare Einwilligungshistorie sollte später ein eigener Consent-Store ergänzt werden. Die derzeitige Protokollierung hängt von der Aufbewahrungsdauer der Vercel-Logs ab.

## Substack-Migration

Der Substack-Export wird separat importiert, sobald er vorliegt. Bestehende Abonnenten dürfen nur übernommen werden, wenn deren bisherige Einwilligung denselben Newsletter abdeckt. Alte Beiträge müssen vor dem Import auf Slugs, Bilder und interne Links geprüft werden.
