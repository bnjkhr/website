---
title: "Warum jede Mail an gut ein Drittel meiner Nutzer nicht ankam"
description: "Wer sich mit Apple anmeldet und „E-Mail verbergen“ wählt, bekam von FamilyManager keine einzige Mail. Wie ich das gefunden habe, was es bedeutete und welche Einstellung bei Apple gefehlt hat."
publishedAt: 2026-11-16
tags:
  - FamilyManager
  - Hinter den Kulissen
  - Produktentwicklung
draft: true
heroImage: "/images/blog/hero-private-relay.webp"
heroImageAlt: "Reihe bunter Briefkästen an einem Pfosten"
heroImageCredit: "Foto: Philippe Murray-Pietsch · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/xiqCrk6LvTg"
---

Bei FamilyManager kannst du dich mit Apple anmelden. Dabei bietet Apple an, deine echte E-Mail-Adresse zu verbergen. Dann bekommt die App nur eine Weiterleitungsadresse, die auf `@privaterelay.appleid.com` endet. Das nutzen erstaunlich viele: Im Juli waren es 401 von 1.175 Profilen, also gut ein Drittel (34 %). Und genau diese Nutzer haben bis Mitte Juli praktisch keine Mail von mir bekommen.

## Wie ich es gemerkt habe

Aufgefallen ist es mir an den Zahlen. Die Bounce-Rate, also der Anteil der Mails, die nicht zugestellt werden, lag bei 28 %. Das ist katastrophal und kann dem Ruf der Absender-Domain bei den Mailanbietern schaden.

Gefunden habe ich die Ursache erst, als ich die Bounces nach Empfänger-Domain aufgeschlüsselt habe. Fast alle kamen aus einer einzigen Quelle: den Weiterleitungsadressen von Apple. Von 261 Mails an solche Adressen in 30 Tagen sind 260 zurückgekommen (99,6 %). Ohne sie lag die Bounce-Rate bei rund 1,7 %, also völlig gesund. Es gab nie ein allgemeines Problem, nur dieses eine.

## Was dahintersteckte

Apple wirft Mails an diese Weiterleitungsadressen weg, wenn die **Absender-Domain bei Apple nicht registriert** ist. Die Mail kommt dann als Bounce zurück. Ich hatte die Registrierung schlicht nicht gemacht.

## Was das für die Betroffenen bedeutete

Das war nicht nur ein Problem für Marketing-Mails:

- **Passwort zurücksetzen** ging nicht. Wer sein Passwort vergaß, bekam die Mail dazu nie.
- **Die E-Mail-Adresse ändern** ging nicht. Die Bestätigungsmail kam bei der Hälfte der Versuche nicht an.
- **Einladungen** in einen Haushalt und Kampagnen kamen nicht an.

## Der Fix

Am 16. Juli habe ich die Domains `familymanager.pro` und `benkohler.de` samt den verwendeten Absenderadressen bei Apple eingetragen. Das geht im Apple-Entwicklerkonto unter „Certificates, Identifiers & Profiles“, im Bereich „Services“, bei „Sign in with Apple for Email Communication“. Alle Einträge stehen auf grün, auch die SPF-Prüfung.

Geprüft habe ich es mit einem echten Nachversand: 34 Mails, davon 21 an Weiterleitungsadressen. Bei allen 21 stand danach „Zugestellt“ statt „Bounce“. Die Klasse, die vorher fast vollständig zurückkam, wird seitdem zugestellt. Bei einer weiteren Absenderadresse, die ich später für die Nutzerumfrage verwendet habe, habe ich die Eintragung im September nachgezogen.

## Zwei Fallen, die ich mitnehme

- **„Gesendet“ heißt nicht „zugestellt“.** Mein Versanddienst nimmt eine Mail an und meldet Erfolg. Der Bounce kommt erst danach. Wer nur den ersten Status liest, hält gebouncte Mails für verschickt.
- **Eine Gesamtzahl verschleiert.** „28 % Bounce“ sah nach einem Problem überall aus. Erst die Aufschlüsselung zeigte, dass fast alles aus einer Quelle kam.

Meine Empfehlung, falls du „Mit Apple anmelden“ einbaust: Registriere deine Absender-Domain bei Apple, bevor du die erste Mail verschickst, und schlüssele Bounces immer nach Empfänger-Domain auf.
