---
title: "Wenn das Cloud-Kontingent leer ist und kein Lauf mehr rot wird"
description: "Im September brachen alle Xcode-Cloud-Läufe zwei Wochen lang sofort ab, und in GitHub sah alles grün aus. Woran ich es erkannt habe, warum ein fehlender Test gefährlicher ist als ein roter und was ich geändert habe."
publishedAt: 2027-01-08
tags:
  - Hinter den Kulissen
  - Produktentwicklung
draft: true
heroImage: "/images/blog/hero-xcode-kontingent.webp"
heroImageAlt: "Kraftstoffanzeige im Armaturenbrett, die auf leer steht"
heroImageCredit: "Foto: Erik Mclean · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/a6PsEdOyjQM"
---

Xcode Cloud baut und testet meine iOS-Apps bei Apple, statt auf meinem eigenen Mac. Das Kontingent dafür hängt an meinem Apple-Konto, und alle meine iOS-Apps teilen es sich. Am 11. September 2026 war es aufgebraucht. Bis zum Reset am 25. September ist jeder Lauf abgebrochen. Das Tückische daran: Es sah nicht aus wie ein Fehler.

## Woran ich es erkannt habe

Ein Lauf wurde angelegt, erzeugte keine einzige Aktion und stand nach rund fünf Sekunden auf „abgebrochen“. Das betraf alle Workflows gleichzeitig, mit einem scharfen Zeitschnitt. Das sieht aus wie eine Störung, ist aber keine.

Dass es das Kontingent war, ließ sich schwer belegen:

- Die Schnittstelle nennt keinen Abbruchgrund.
- Mein Kommandozeilenwerkzeug für App Store Connect hat keinen Endpunkt für den Verbrauch.
- Die Statusseite von Apple meldete „läuft“.
- Nachsehen konnte ich nur in App Store Connect, unter Xcode Cloud, Nutzung.

## Warum kein Lauf rot wurde

Das ist der eigentliche Punkt. Ein abgebrochener Lauf erscheint in der GitHub-Prüfliste nicht als rot, sondern **gar nicht**. Die Liste zeigte durchgehend „erfolgreich“ und „kann gemergt werden“, während der Nachweis für die iOS-App fehlte.

Seitdem gilt für mich: **Ein grüner Pull Request ohne die iOS-Zeilen ist kein grüner Pull Request.** Vor jedem Merge prüfe ich den Lauf gegen den genauen Commit, per Kommandozeile bei App Store Connect, und nicht an dem, was GitHub anzeigt.

## Was den Verbrauch getrieben hat

Nicht die Release-Builds, sondern die Pull Requests. Zwischen dem 26. August und dem 11. September waren es bei FamilyManager 140 Läufe à rund 12 Minuten, zusammen etwa 24 von 25 Stunden. Dazu kamen 26 weitere Standardläufe.

## Was ich geändert habe

- **Die volle Suite läuft in der Cloud nur noch dort, wo sie vor einem Release zählt:** bei Pull Requests nach `staging` und `main`. Pull Requests nach `dev` lösen keinen Lauf mehr aus. Feature-Änderungen prüfe ich lokal.
- **Die BUILD-Aktion ist raus.** Neben der TEST-Aktion baute sie dasselbe ein zweites Mal. Ich habe 128 Läufe ausgewertet, 101 davon mit beiden Aktionen: Nie war BUILD rot, während TEST grün war. Der Wegfall spart rund ein Viertel des Kontingents.
- **Der Standardlauf startet nur noch bei Änderungen an der iOS-App,** nicht mehr bei einer reinen Web-Änderung.

## Was ich daraus mitnehme

Ein roter Test sagt dir, dass etwas kaputt ist. Ein fehlender Test sagt gar nichts, und genau deshalb ist er gefährlicher. Messen statt vertrauen: Wenn der Nachweis nicht dasteht, ist die Antwort „unbekannt“, nicht „grün“.
