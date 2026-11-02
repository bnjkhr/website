---
title: "Mein bester Kritiker ist ein Tester, und trotzdem bestimmt er nicht, was ich baue"
description: "Aus dem Testteam kommen die besten Rückmeldungen zu FamilyManager. Warum ich trotzdem nicht jeden Wunsch baue, wie ich Bugs von Wünschen trenne und welche Wünsche ich abgelehnt habe."
publishedAt: 2026-11-06
tags:
  - FamilyManager
  - Hinter den Kulissen
  - Produktentwicklung
draft: true
heroImage: "/images/blog/hero-tester-feedback.webp"
heroImageAlt: "Pinnwand voller bunter Haftnotizen"
heroImageCredit: "Foto: Kevin Yudhistira Alloni · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/7Nu_TageB3U"
---

Zu meinem Testteam gehört jemand, der FamilyManager sehr gründlich ausprobiert. Diese Person schickt regelmäßig Rückmeldungen: Fehler, Fragen, Wünsche. Es sind oft die besten, die ich bekomme. Trotzdem gilt bei mir eine Regel, die ich mir im Oktober aufgeschrieben habe: **Ein Tester ist ein Kunde, kein Auftraggeber.**

## Warum diese Regel

Ein einzelner Tester ist eine Stimme, kein Produktverantwortlicher. Wenn ich jeden Wunsch einfach umsetze, wächst das Produkt unkontrolliert, und es wird für alle anderen schwerer. Den Anstoß gab eine Empfehlung, die ich nur damit begründet hatte, dass ein Tester sich etwas ausdrücklich gewünscht hat. Das ist kein gutes Argument.

## Zwei Arten von Rückmeldungen

Ich trenne sie strikt:

**Bugs** sind Fehlverhalten, Datenverlust und Widersprüche. Die behebe ich, und zwar zügig. Ein Beispiel aus dem Oktober: In der Statistik stand bei einem Kind „61 Credits in 90 Tagen“, in der Rangliste auf einem anderen Bildschirm stand für dasselbe Kind eine kleinere Zahl. Die Ursache war einfach: Die eine Rechnung zählte nur positive Buchungen, die andere rechnete netto. Das war ein Fehler, und er ist behoben. Auch ein Info-Blatt, das den ersten Absatz abschnitt, gehörte dazu.

**Wünsche** prüfe ich. Ich frage mich vier Dinge:

1. **Nutzt es vielen Haushalten?** Oder nur einem?
2. **Wie groß sind Aufwand und Risiko?** Alles, was neue verschlüsselte Daten oder eine Migration bedeutet, wiegt schwerer.
3. **Passt es zu einer nativen Apple-App?**
4. **Widerspricht es einer Entscheidung, die ich schon getroffen habe?**

Mit dem Satz „Der Tester will das“ begründe ich nichts. Die Begründung muss aus dem Produkt kommen.

## Was ich gebaut habe

Manche Wünsche haben die Prüfung bestanden. Im Kinder-Logbuch fehlte „Schlafen“, jetzt gibt es einen Eintrag mit Dauer, in der App und im Web. Dafür brauchte ich eine Datenbankänderung. Die Wünsche, die Einträge nach Häufigkeit zu sortieren oder eigene Eintragstypen anzulegen, habe ich dagegen bewusst nicht umgesetzt.

Bei einem anderen Punkt gab es eine Produktentscheidung: Eine eingereichte Putzaufgabe konnte man nur freigeben, nicht zurückweisen. Das war Absicht, aber erklärt hat es die App nicht. Jetzt gilt: Zurückweisen heißt zurück auf offen, ohne Credits.

## Was ich abgelehnt habe

- **Credits umbenennen,** zum Beispiel in „Gummipunkte“. Das sähe nett aus, ist aber groß: eine Haushaltseinstellung und jeder Text in der App. Ich habe es verworfen.
- **Größe und Gewicht mit Verlauf im Steckbrief.** Das wäre eine neue Tabelle mit verschlüsselten Daten und einer Migration, also großer Aufwand bei hohem Risiko. Ich habe es verworfen.
- **Ein Ruhe-Timer.** Auch den habe ich verworfen.

Eine Absage ist keine Kritik am Vorschlag. Oft ist der Gedanke dahinter vernünftig, und er passt trotzdem nicht in eine App, die für sehr unterschiedliche Familien einfach bleiben soll.

## Warum das gut für alle ist

Das Testteam bleibt wertvoll, weil es genau hinsieht. Ich bleibe handlungsfähig, weil ich nicht in jede Richtung gleichzeitig laufen muss. Und wer nur ab und zu in die App schaut, bekommt ein Produkt, das nicht mit jedem Update schwerer wird.
