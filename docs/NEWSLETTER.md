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
- **Vor dem ersten Deploy:** `npm run newsletter:setup` ausführen. Das legt in Resend die Kontakt-Eigenschaften `consent_requested_at`, `consent_confirmed_at` und `consent_version` an und kann gefahrlos mehrfach laufen. Fehlen sie, lehnt Resend jede Bestätigung ab und Abonnenten sehen eine Fehlermeldung.
- `NEWSLETTER_TOKEN_SECRET` als zufälligen, mindestens 32 Byte langen Wert setzen.
- `RESEND_API_KEY` und `NEWSLETTER_TOKEN_SECRET` in Vercel für Preview und Production konfigurieren.
- **Preview bekommt ein eigenes Segment:** In Resend ein zweites Segment (und ggf. Topic) für Tests anlegen und dessen IDs in Vercel nur für die Umgebung *Preview* als `RESEND_NEWSLETTER_SEGMENT_ID` bzw. `RESEND_NEWSLETTER_TOPIC_ID` hinterlegen. Sonst landen bestätigte Test-Anmeldungen aus Preview-Deploys im echten Verteiler.
- Versanddomain, DKIM/SPF und Absender in Resend prüfen.

Für lokale Broadcast-Entwürfe lädt `npm run newsletter:draft` die Werte aus der nicht versionierten `.env.local`. Auf Vercel wird die URL für den Bestätigungslink automatisch aus der jeweiligen Preview- oder Production-URL ermittelt; `SITE_URL` ist dort nur ein optionaler Override.

## Vercel einrichten

- **Rate-Limit für die Anmeldung – eingerichtet am 15.09.2026:** Firewall-Regel „Newsletter-Anmeldung begrenzen“. Sie greift, wenn *Request Path* gleich `/api/newsletter-subscribe` und *Method* `POST` ist, und erlaubt 5 Anfragen pro 10 Minuten je IP (Fixed Window); darüber antwortet Vercel mit 429. Angelegt über `vercel api` (`PATCH /v1/security/firewall/config`), sichtbar und änderbar im Vercel-Dashboard unter Firewall → Rules. Pro Adresse verschickt die Anmeldung ohnehin höchstens eine Bestätigungsmail pro Stunde; die Regel verhindert, dass jemand massenhaft fremde Adressen einträgt.
  - **Prüfen:** Sechsmal `POST` mit einer ungültigen Adresse an `/api/newsletter-subscribe` schicken. Die ersten fünf Antworten sind 400, danach kommt 429. Ungültige Adressen werden vor jedem Resend-Aufruf abgelehnt, es geht also keine Mail raus. Das eigene Netz ist danach bis zu 10 Minuten für Anmeldungen gesperrt.
- **Sicherheits-Header** (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) stehen in `vercel.json`. Wer neue externe Quellen einbindet (Bilder, Videos, Skripte), muss sie dort in der `Content-Security-Policy` ergänzen, sonst blockiert der Browser sie.

## Double-Opt-in

1. `POST /api/newsletter-subscribe` verschickt einen 48 Stunden gültigen, signierten Bestätigungslink. Pro Adresse geht höchstens eine Mail pro Stunde raus; eine erneute Anmeldung in dieser Zeit gilt als bereits versendet.
2. `GET /api/newsletter-confirm?token=…` prüft nur den Link und zeigt einen Button „Abo bestätigen“. Das Öffnen des Links ändert nichts, damit automatische Link-Scanner in Mail-Gateways kein Abo bestätigen können.
3. Erst `POST /api/newsletter-confirm` legt den Kontakt im Newsletter-Segment an.

Als Einwilligungsnachweis werden am Resend-Kontakt `consent_requested_at`, `consent_confirmed_at` und `consent_version` gespeichert. Zusätzlich landet die Bestätigung ohne Klartextadresse mit einem SHA-256-Hash im Vercel-Log. Ändert sich der Einwilligungstext im Formular, `CONSENT_VERSION` in `lib/newsletter.js` anpassen.

## Substack-Migration

Der Substack-Export wird separat importiert, sobald er vorliegt. Bestehende Abonnenten dürfen nur übernommen werden, wenn deren bisherige Einwilligung denselben Newsletter abdeckt. Alte Beiträge müssen vor dem Import auf Slugs, Bilder und interne Links geprüft werden.
