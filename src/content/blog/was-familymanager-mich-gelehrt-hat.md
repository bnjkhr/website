---
title: "Was FamilyManager mich gelehrt hat: Eine Station, ein Satz"
description: "Von der Aufgabenliste bis zum Mittwochs-Takt: die wichtigsten Stationen mit FamilyManager, jeweils mit dem einen Satz, den ich daraus mitnehme."
publishedAt: 2027-01-29
tags:
  - FamilyManager
  - Hinter den Kulissen
  - Produktentwicklung
draft: true
heroImage: "/images/blog/hero-gelehrt.webp"
heroImageAlt: "Reihe runder Baumscheiben als Trittsteine im Gras"
heroImageCredit: "Foto: photonblast · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/DXRP2PKlsFQ"
---

Seit dem 3. Februar 2026 baue ich an FamilyManager. Dabei sind mir Fehler passiert, die ich mir lieber erspart hätte, und Entscheidungen, auf die ich stolz bin. Die meisten Lehren stehen verstreut in einzelnen Beiträgen. Hier ordne ich sie: eine Station, ein Satz.

## 3. Februar: Der erste Code

Die Idee war einfach: Eine Familie hat Aufgaben, Termine, Einkauf und Dokumente an einem Ort. Schwierig wurde es erst, als alles drin war.

**Alles an einem Ort zu bündeln heißt, immer wieder zu entscheiden, was nicht hineingehört.**

## 16. Juli: Die E-Mails, die nie ankamen

Ein gutes Drittel meiner Nutzer meldet sich mit „E-Mail verbergen“ von Apple an. An diese Adressen kam fast keine Mail durch, weil ich meine Absender-Domain nicht bei Apple registriert hatte. Gefunden habe ich das erst, als ich die Rückläufer nach Empfänger-Domain aufgeschlüsselt habe.

**Gesendet heißt nicht zugestellt, und eine Gesamtzahl versteckt die Ursache.** Mehr dazu in [Warum jede Mail an gut ein Drittel meiner Nutzer nicht ankam](/blog/apple-private-relay-mails-kamen-nicht-an/).

## September: Das leere Kontingent

Zwei Wochen lang wurden alle Xcode-Cloud-Läufe sofort abgebrochen. In GitHub sah trotzdem alles grün aus, weil ein abgebrochener Lauf dort nicht rot erscheint, sondern gar nicht.

**Ein fehlender Test ist gefährlicher als ein roter.** Mehr dazu in [Wenn das Cloud-Kontingent leer ist und kein Lauf mehr rot wird](/blog/xcode-cloud-kontingent-leer-kein-lauf-rot/).

## 24. September: Die Datenbank war zu klein

Gut 20 Minuten war FamilyManager nicht erreichbar. Es war kein Programmierfehler, sondern ein Arbeitsspeicher, der über Stunden zu knapp war, und ich hatte es nicht gesehen.

**Aus „reicht noch“ wird ein Ausfall, sobald die Tagesspitze wächst.** Mehr dazu in [Der Tag, an dem meine Datenbank zu klein war](/blog/datenbank-kapazitaet-reichte-nicht/).

## Oktober: Das Einfachheits-Audit

Vor Version 3.0 habe ich die App durchgeklickt und gezählt: 13 Bildschirme bis zur ersten Aufgabe, rund 90 dauerhafte Schalter, neun Wörter für Codes.

**Einfachheit entsteht durch Zählen, nicht durch einen schönen Entwurf.** Mehr dazu in [Weniger ist mehr: Was ich vor FamilyManager 3.0 gestrichen habe](/blog/weniger-ist-mehr-was-ich-vor-3-0-gestrichen-habe/).

## Herbst: Das Testteam

Aus dem Testteam kommen die besten Rückmeldungen. Trotzdem bestimmt ein Wunsch nicht, was ich baue. Ich frage, wie vielen Haushalten es nützt, wie groß Aufwand und Risiko sind, ob es zu einer nativen Apple-App passt und ob es einer früheren Entscheidung widerspricht.

**Ein Tester ist Kunde, kein Auftraggeber.** Mehr dazu in [Mein bester Kritiker ist ein Tester, und trotzdem bestimmt er nicht, was ich baue](/blog/tester-sind-kunden-keine-auftraggeber/).

## Oktober: Der Kindermodus „Jetzt“

Beim Kindermodus habe ich vorher Studien gelesen. Das Ergebnis war nüchterner als jeder Werbetext, und danach war klar, was ich nicht schreiben darf.

**Was ich nicht belegen kann, verspreche ich nicht.** Mehr dazu in [Eine Familien-App für Kinder mit ADHS: Was ich gebaut habe und was ich nicht verspreche](/blog/familienapp-fuer-kinder-mit-adhs/).

## 1. November: Version 3.0 und der Mittwochs-Takt

Version 3.0 kam als großer Wurf, und danach habe ich den Rhythmus geändert. Seit 3.0.2 erscheint FamilyManager jeden Mittwoch. Gibt es nichts, das fertig ist, gibt es kein Update.

**Ein fester Takt ist besser als ein großer Wurf.** Mehr dazu in [Jeden Mittwoch ein Update: Mein neuer Release-Rhythmus für FamilyManager](/blog/jeden-mittwoch-ein-update-mein-neuer-release-rhythmus/).

## Was bleibt

Fast jede dieser Lehren hat dasselbe Muster: Ich habe etwas nicht gemessen und es für gegeben gehalten. Der erste Schritt ist inzwischen fast immer derselbe: nachzählen, nachsehen, nachmessen, bevor ich etwas vermute.

Wenn dir ein Satz hier auch aus deiner eigenen Arbeit bekannt vorkommt, schreib mir gern.
