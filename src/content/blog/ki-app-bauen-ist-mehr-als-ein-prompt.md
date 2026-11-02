---
title: "Eine App mit KI bauen: Warum ein Prompt nicht reicht"
description: "Tools wie Lovable versprechen: Prompt rein, fertige App raus. Warum das bei einem echten Produkt nicht reicht und welches Handwerk dazugehört, auch wenn KI mitprogrammiert."
publishedAt: 2026-11-02
tags:
  - Produktentwicklung
  - Hinter den Kulissen
draft: false
heroImage: "/images/blog/hero-ki-prompt.webp"
heroImageAlt: "Blaues Netz aus leuchtenden Linien und Punkten"
heroImageCredit: "Foto: Conny Schneider · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/xuTJZ7uD7PI"
---

„Beschreibe deine App, und wir bauen sie für dich.“ So ähnlich klingt das Versprechen vieler KI-Werkzeuge, Lovable zum Beispiel. Und ein Teil davon stimmt: Ein Prototyp, der aussieht wie eine App und sich klicken lässt, ist heute in einer Stunde da. Ich arbeite selbst jeden Tag mit KI und möchte darauf nicht mehr verzichten.

Nur ist ein Prototyp noch kein Produkt. Zwischen „es läuft auf meinem Bildschirm“ und „Fremde können sich darauf verlassen“ liegt der größte Teil der Arbeit. In diesem Beitrag geht es darum, was da alles dazugehört und warum ein Prompt allein nicht reicht.

## Der Prototyp ist der leichte Teil

KI ist beim Anfangen unschlagbar. Eine leere Seite gibt es nicht mehr, die erste Version steht schnell. Schwierig wird es danach: beim zehnten Wunsch, der den neunten kaputt macht, bei Daten, die plötzlich nicht mehr zusammenpassen, bei einem Fehler, der nur bei manchen Nutzern auftritt.

Dazu passt eine Studie der Organisation METR aus dem Jahr 2025. Sie ließ 16 erfahrene Entwickler an ihren eigenen, langjährig gepflegten Open-Source-Projekten arbeiten, mal mit und mal ohne KI-Hilfe. Mit KI brauchten sie [19 Prozent länger](https://getcoai.com/news/study-ai-coding-tools-slow-down-experienced-developers-by-19/), hielten sich aber selbst für schneller. Die Studie ist klein und stammt von früheren Werkzeugen, die Autoren selbst betonen das. Als Warnung taugt sie trotzdem: Das Gefühl von Tempo und tatsächlich getaner Arbeit sind zwei verschiedene Dinge.

## Architektur: Das Fundament sieht man nicht

Eine App besteht nicht aus Bildschirmen, sondern aus Entscheidungen. Wo liegen die Daten? Was passiert, wenn das Netz weg ist? Wie wächst die App, ohne dass jede Änderung alles andere ins Wanken bringt? Wie spielt man ein Update ein, wenn alte Versionen noch auf Geräten laufen?

KI beantwortet solche Fragen gern, aber meist für den Fall, den du gerade beschreibst. Sie baut ohne Nachfrage ein Stück, das heute funktioniert. Ob es in einem halben Jahr noch trägt, ist eine Frage an die Person, die das Ganze im Kopf hat. Wer die Struktur nicht beurteilen kann, merkt es erst, wenn jede Änderung teurer wird als die davor.

## Sicherheit: Das Risiko trägst du

Hier sind die Folgen am härtesten. Der Sicherheitsanbieter Veracode hat 2025 über 100 KI-Modelle an 80 Programmieraufgaben getestet. [In 45 Prozent der Fälle](https://levelup.gitconnected.com/developers-have-been-shipping-ai-generated-vulnerabilities-since-2021-d1c93c3787b9) enthielt der erzeugte Code Schwachstellen aus den bekannten OWASP-Top-10-Kategorien. Das heißt nicht, dass KI-Code immer unsicher ist. Es heißt, dass er nicht automatisch sicher ist, und dass man ihm das nicht ansieht.

Ein konkretes Beispiel: 2025 meldete ein Sicherheitsforscher, dass in mit Lovable gebauten Projekten häufig die Zugriffsregeln der Datenbank („Row Level Security“) fehlten oder falsch gesetzt waren. In seinem Scan fehlten sie bei [303 Endpunkten in 170 Projekten](https://superblocks.com/blog/lovable-vulnerabilities). Wer die Adresse kannte, konnte Daten abrufen, ohne angemeldet zu sein. Die Lücke bekam eine eigene Nummer (CVE-2025-48757). Die App sah in all diesen Fällen völlig normal aus.

Und es geht um mehr als Datenbanken: Geheimnisse wie API-Schlüssel gehören nicht in die App. Eingaben von Nutzern muss man prüfen. Anmeldung und Rechte müssen auf dem Server geprüft werden, nicht nur im Bildschirm. Wer das nicht weiß, kann die Frage nicht stellen, und die KI beantwortet nur, was gefragt wird.

## Daten und Betrieb: Was passiert, wenn etwas schiefgeht?

Im Sommer 2025 löschte der KI-Agent von Replit während eines öffentlichen Experiments [eine echte Produktionsdatenbank](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure), obwohl der Gründer Jason Lemkin ausdrücklich einen „Code Freeze“ angeordnet hatte. Replit kündigte danach an, Entwicklungs- und Produktionsdatenbank automatisch zu trennen.

Der Fall zeigt keinen bösen Willen, sondern ein fehlendes Handwerk: getrennte Umgebungen, Backups, die man schon einmal zurückgespielt hat, Rechte, die einem Werkzeug nur das erlauben, was es braucht. Dazu kommen Fragen, die mit der ersten Version noch nicht auftauchen: Wer merkt, dass die App abstürzt? Wo sieht man Fehler? Was kostet es, wenn tausend statt zehn Leute sie nutzen?

## Datenschutz und Regeln des App Stores

Sobald Fremde Daten eingeben, gelten Regeln. In Europa die DSGVO: Du brauchst eine Rechtsgrundlage, eine Datenschutzerklärung, Auftragsverarbeitungsverträge mit den Diensten, die du einbindest, und einen Weg, Daten wieder zu löschen.

Apple prüft jede App vor der Veröffentlichung. Seit 2022 muss eine App, die Konten anlegen lässt, auch das Löschen des Kontos [in der App selbst](https://developer.apple.com/news/?id=mdkbobfo) anbieten. Dazu kommen Angaben zum Datenschutz im App Store, Altersfreigabe, Prüfungshinweise, Regeln zu Abos und Käufen. Eine abgelehnte App kostet Tage, manchmal Wochen. Dafür braucht es jemanden, der die Regeln kennt, bevor die Ablehnung kommt.

## UX: Wie sich eine App benutzt

Eine App ist nicht gut, weil alle Funktionen da sind. Sie ist gut, wenn Menschen sie ohne Erklärung verstehen. Das ist ein eigenes Fach: Was sieht jemand beim allerersten Start? Was passiert bei leeren Listen, bei Fehlern, bei langsamer Verbindung? Wie viele Schritte braucht die wichtigste Aufgabe?

KI baut dir genau die Bildschirme, die du beschreibst. Ob das der richtige Ablauf ist, sagt sie dir nicht. Dafür hilft nur, mit echten Menschen zu sprechen und zuzusehen, wo sie hängen bleiben.

## UI: Details, die man spürt

Auch ein hübsches Layout ist mehr als Farben. Dazu gehören Dynamic Type (Nutzer stellen die Schrift größer), der Dunkelmodus, VoiceOver für blinde und sehbehinderte Nutzer, ausreichende Kontraste, Touch-Flächen, die man mit dem Daumen trifft, und Verhalten auf iPhone, iPad und kleinen Bildschirmen. Auf Apple-Geräten erwartet man außerdem, dass sich eine App wie eine Apple-App anfühlt. Solche Dinge fallen im Prototyp nicht auf und beim Nutzer sofort.

## Bildprozesse: Icon, Screenshots, Grafiken

Ein Bereich, den kaum jemand auf dem Zettel hat: Bilder. Ein App-Icon muss in vielen Größen und auch im Dunkelmodus funktionieren. Für den App Store brauchst du Screenshots in den geforderten Formaten und passende Texte dazu, für die Website Grafiken in sinnvoller Größe und im passenden Format, mit Alternativtext. Grafiken im Programm selbst sollen scharf sein, ohne die App aufzublähen.

Das sind keine Nebensachen. Das Icon und die Screenshots sind das Erste, was jemand von deiner App sieht, und oft der Grund, sie zu laden oder wegzuklicken.

## Marketing: Gebaut heißt nicht gefunden

Auch eine gute App findet sich nicht von allein. Der App Store hat Millionen Einträge. Wie heißt die App? Welche Suchbegriffe stehen im Titel und in der Beschreibung? Gibt es eine Website, die bei Google erscheint? Wer erfährt davon, und warum sollte jemand sie installieren, statt weiterzuscrollen? Dazu gehören ein klares Versprechen, ein Preis, den man erklären kann, und der Weg danach: Rückmeldungen einsammeln, Bewertungen, Updates.

Wer all das dem Zufall überlässt, hat eine fertige App, die niemand sieht.

## Pflege: Nach dem Start geht es weiter

Apple bringt jedes Jahr ein neues iOS heraus. Dienste ändern ihre Schnittstellen, Bibliotheken bekommen Sicherheitsupdates, Nutzer melden Fehler und wünschen Neues. Eine App ist kein Gegenstand, den man baut und stehen lässt, sondern etwas, das man betreibt. Wer sie mit KI gebaut hat, ohne sie zu verstehen, steht bei der ersten Störung vor einem Berg Code, den niemand kennt.

## Was KI wirklich verändert

Ich will das nicht gegen KI ausspielen. Im Gegenteil: Mit ihr geht vieles schneller, was früher Wochen gedauert hat, und sie nimmt viel Fleißarbeit ab. Aber sie arbeitet am besten dort, wo jemand führt: Aufgaben sauber zuschneiden, Ergebnisse prüfen, Tests schreiben lassen, Sicherheitsnetze einbauen. Wie das bei mir konkret aussieht, beschreibe ich in [Mein Setup: Wie ich Apps mit Claude Code baue](/blog/mein-setup-claude-code/).

Anders gesagt: KI senkt die Kosten fürs Tippen, nicht die für Wissen und Verantwortung. Wer beides mitbringt, wird mit ihr deutlich schneller. Wer beides nicht mitbringt, wird auch schneller, nur in die falsche Richtung.

## Was das für dich heißt

- **Für Ideen und erste Tests** sind KI-Baukästen großartig. Probiere aus, zeige es Menschen, lerne.
- **Sobald echte Nutzer, echte Daten oder Geld im Spiel sind**, brauchst du jemanden, der Architektur, Sicherheit, Datenschutz und den App Store im Blick hat.
- **Frag nach dem Handwerk**, nicht nur nach dem Ergebnis: Wo liegen die Daten? Wer darf was sehen? Was passiert, wenn etwas ausfällt? Wer kümmert sich in einem Jahr darum?

Wenn du eine App-Idee hast und wissen willst, welcher Weg zu ihr passt: Wie ein Projekt bei mir abläuft, steht in [Wie läuft eine App-Entwicklung ab?](/blog/wie-laeuft-eine-app-entwicklung-ab/), was es kostet im [Kostenratgeber](/app-entwicklung-kosten/), und auf der Seite [App entwickeln lassen](/app-entwickeln-lassen/) kannst du dich melden.
