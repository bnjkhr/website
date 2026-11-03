---
title: "Eine Familien-App für Kinder mit ADHS: Was ich gebaut habe und was ich nicht verspreche"
description: "Der Kindermodus „Jetzt“ zeigt Kindern einen Schritt nach dem anderen. Wie ich ihn gebaut habe, was die Forschung hergibt, warum die Struktur-Hilfen für Erwachsene privat sind und warum ich keine Wirkung verspreche."
publishedAt: 2026-11-20
tags:
  - FamilyManager
  - Hinter den Kulissen
  - Produktentwicklung
draft: true
heroImage: "/images/blog/hero-kindermodus.webp"
heroImageAlt: "Kinderhand setzt einen bunten Holzbaustein auf ein Haus aus Klötzen"
heroImageCredit: "Foto: Michał Bożek · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/RcxR1aLw8X0"
---

Ich wollte wissen, was eine Familien-App für Kinder mit ADHS oder ähnlichen Herausforderungen tun kann und was nicht. In diesem Beitrag erzähle ich, was ich gebaut habe, worauf ich mich dabei gestützt habe und was ich ausdrücklich nicht verspreche.

Vorweg das Wichtigste: **FamilyManager ist keine Therapie und ersetzt keine ärztliche oder therapeutische Begleitung.** Der Kindermodus ist als Beta gekennzeichnet.

## Der Kindermodus „Jetzt“

„Jetzt“ lässt sich pro Kind einschalten. Standardmäßig ist er aus. Wenn er läuft, sieht das Kind einen Vollbildschirm mit genau einem Schritt, und zwar dem, der jetzt dran ist. Wer will, startet einen freiwilligen Timer, und es gibt eine Münze als Belohnung.

Dahinter stehen ein paar bewusste Entscheidungen:

- **Ein Schritt zur Zeit.** Das Kind sieht nie die ganze Liste, sondern nur den nächsten Schritt.
- **Freiwillig statt Druck.** Der Timer ist ein Angebot, kein Zwang.
- **Kein „Rückgängig“ nach dem letzten Schritt.** Die Münze gibt es nur, wenn die Aufgabe wirklich als erledigt gespeichert ist.

## Was die Forschung hergibt

Ich habe vor dem Bauen Literatur gesammelt und gelesen: Metaanalysen, Leitlinien und Einzelstudien. Das Ergebnis ist nüchterner, als ein Werbetext es wäre:

- **Elterntraining und Verstärkung** wirken auf das Erziehungsverhalten und auf Verhaltensprobleme, auch bei verblindeter Bewertung. Auf die Kernsymptome sind die Effekte nur bei unverblindeten Bewertern klar.
- **Reines Training von Aufmerksamkeit oder Arbeitsgedächtnis** per App verbessert vor allem die Trainingsaufgabe selbst. Auf den Alltag überträgt es sich nach verblindeten Maßen kaum.
- **Training von Organisationsfertigkeiten** gilt dagegen als gut gestützter Ansatz, auch wenn die Bewertung dort meist von Eltern und Lehrkräften kommt.
- **Sichtbare Zeitgeber und Schrittzerlegung** haben plausible Gründe, aber keine belastbaren Belege für Wirksamkeit bei ADHS. Die deutsche Leitlinie lässt digitale Anwendungen nur ergänzend und mit Wirksamkeitsnachweis zu.

Für mich heißt das: Eine App lässt sich am ehesten als **Werkzeug für die Eltern** begründen, für verlässliche Struktur und konsequentes Verhalten. Sie ist kein Heilmittel für Kernsymptome. Deshalb spreche ich nie davon, ADHS-Symptome zu senken, und ich bewerbe „Jetzt“ nicht als Behandlung.

## Anerkennung statt Punkte

Aus der Recherche ist auch eine Richtung entstanden, an der ich arbeite: Eine große Metaanalyse fand, dass erwartete, greifbare Belohnungen die eigene Motivation untergraben können, positives verbales Feedback dagegen nicht. Das ist unter Forschenden umstritten, eine andere Metaanalyse sieht das gelassener. Deshalb baue ich daran, Anerkennung stärker zu gewichten als reines Punktesammeln. Wie weit ich damit bin, schreibe ich, wenn es fertig ist.

## Struktur-Hilfen für Erwachsene und warum sie privat sind

Ein Hinweis aus dem Test hat mich auf eine Lücke gebracht: ADHS gibt es auch bei Erwachsenen, auch bei Eltern. Also gibt es einen Schalter pro Person, der die Hilfen einschaltet. Er heißt **Struktur-Hilfen** und nicht „Fokus“, weil „Fokus“ eine iOS-Systemfunktion ist.

Der wichtigste Punkt dabei ist der Datenschutz. Die Information, dass jemand diese Hilfen nutzt, ist ein Gesundheitsbezug. Deshalb liegt der Schalter für Erwachsene in einer eigenen, privaten Tabelle, die nur die eigene Zeile lesen kann. Partner und Kinder sehen ihn nicht, auch nicht in Profilen, Listen, Benachrichtigungen oder Auswertungen. Das Wort „ADHS“ kommt in der App-Oberfläche und in der Datenbank nicht vor. Kinder unter 16 können den Schalter weder ein- noch ausschalten, ab 16 entscheiden sie selbst. Vor dem Start habe ich eine Datenschutz-Folgenabschätzung gemacht.

## Was noch offen ist

Die Wirksamkeit ist nicht belegt, und ich werde sie nicht behaupten. Wenn du für dein Kind etwas Verlässliches suchst, sprich mit der Kinderärztin oder dem Kinderarzt oder einer Beratungsstelle. FamilyManager kann den Alltag strukturieren, das ist alles. Wenn du Rückmeldungen zu „Jetzt“ hast, freue ich mich darüber, denn die Beta lebt davon.
