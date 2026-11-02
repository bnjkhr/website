---
title: "Der Tag, an dem meine Datenbank zu klein war"
description: "Am 24. September 2026 war FamilyManager gut 20 Minuten nicht erreichbar. Die Ursache war kein Programmierfehler, sondern ein Speicher, der nicht mehr reichte. Wie ich es gefunden habe und was ich daraus mitnehme."
publishedAt: 2026-12-18
tags:
  - FamilyManager
  - Hinter den Kulissen
  - Produktentwicklung
draft: true
heroImage: "/images/blog/hero-datenbank.webp"
heroImageAlt: "Server-Regal in einem dunklen Raum mit grün beleuchteten Kabeln"
heroImageCredit: "Foto: Tyler · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/OnI_TNcIv9U"
---

Am Donnerstag, dem 24. September 2026, war FamilyManager für gut 20 Minuten nicht erreichbar. Anmelden und Daten laden schlugen fehl, die Fehlermeldungen kamen als Timeout. Ich habe die Datenbank neu gestartet, danach lief alles wieder. Aber ein Neustart ist keine Erklärung. In diesem Beitrag steht, was ich gefunden habe.

## Das Muster

Die Fehler begannen kurz vor 15 Uhr und endeten gegen 15:16 Uhr. Die Antworten der Schnittstellen und der Anmeldung liefen in Timeouts. Auf den ersten Blick sah es nach einem Programmierfehler oder einer einzelnen schweren Abfrage aus. Dafür gab es aber keine Spur: Selbst einfache Abfragen brauchten so lange, dass sie abgebrochen wurden, und mehrere Hintergrundjobs kamen nicht mehr in Gang. Das passt nicht zu einem einzelnen Fehler. Es passt zu einem System, das irgendwo am Limit ist.

## Die Ursache

In der Auswertung der Datenbank sah ich es dann: Der Arbeitsspeicher war über Stunden zu knapp. Die Datenbank hatte rund 550 MB auf die Festplatte ausgelagert, das sogenannte Swapping, bei gleichzeitig hoher Auslastung des Arbeitsspeichers. Wenn Daten ständig zwischen Speicher und Festplatte hin- und hergeschoben werden, wird jede Abfrage zäh. Beim Ausfall sprang die Wartezeit auf die Festplatte auf rund 60 Prozent.

Die Stunde des Ausfalls war zugleich die Tagesspitze mit 3.563 Anfragen in der Stunde. Kurz gesagt: Die Kapazität der Datenbank reichte nicht mehr, und ich hatte es nicht gemerkt.

Dazu kamen Anfragen, die gar nicht nötig waren. Beim Nachsehen habe ich einige Stellen in App und Web gefunden, an denen eine einzige Aktion mehrere Anfragen auslöste. Dafür habe ich Korrekturen gebaut.

## Was ich getan habe

Noch am selben Tag habe ich die Datenbank auf eine größere Instanz umgestellt, mit 1 GB Arbeitsspeicher, und die Speichereinstellungen angepasst. Dazu habe ich mir eine Regel notiert: Bei Timeout-Wellen schaue ich zuerst auf Swap und die Wartezeit auf die Festplatte, bevor ich im Code suche.

Ein Neustart leert den Swap nur kurz. Der Speicher läuft danach wieder voll, wenn sich an der Ursache nichts ändert. Ob die größere Instanz reicht, messe ich deshalb an den Tagesspitzen nach. Bleibt der Swap hoch, gehe ich eine Stufe weiter.

## Was ich daraus mitnehme

Die Ursache war nicht spektakulär. Sie war ein Grenzwert, den ich nicht im Blick hatte. Der Ausfall hat mir gezeigt, dass ich die Auslastung der Datenbank nicht erst ansehen darf, wenn etwas kaputt ist. Aus „reicht noch“ wird schnell ein Ausfall, sobald die Tagesspitze wächst.
