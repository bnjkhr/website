---
title: "Weniger ist mehr: Was ich vor FamilyManager 3.0 gestrichen habe"
description: "Rund 90 Schalter, 13 Bildschirme bis zur ersten Aufgabe, neun Wörter für Codes: Ich habe FamilyManager vor 3.0 auf Einfachheit geprüft. Was ich gestrichen habe, was ich bewusst behalten habe und warum."
publishedAt: 2026-11-06
tags:
  - FamilyManager
  - Hinter den Kulissen
  - Produktentwicklung
draft: true
heroImage: "/images/blog/hero-weniger-ist-mehr.webp"
heroImageAlt: "Weiße Wandnische mit drei Vasen"
heroImageCredit: "Foto: Allison Saeng · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/o4LMLXLI4_c"
---

Bevor FamilyManager 3.0 erschien, habe ich mir eine unbequeme Frage gestellt: Ist die App wirklich einfach? Nicht „ziemlich übersichtlich“, sondern so einfach, wie man es von einer Apple-App erwartet. Ich habe die App durchgeklickt, gezählt und die Ergebnisse in einem Audit festgehalten. Das Ergebnis war ernüchternd und hilfreich zugleich.

## Was das Audit gezeigt hat

Die Kernhandlungen waren schon in Ordnung. Eine Aufgabe abhaken braucht einen Tipp, eine Aufgabe oder einen Termin anlegen drei. Kompliziert war alles drumherum:

- **Der erste Kontakt:** Ein neuer Nutzer brauchte bis zur ersten Aufgabe 13 Bildschirme.
- **Die Menge an Stellschrauben:** Rund 90 dauerhafte Schalter, drei parallele Systeme zum Ein- und Ausblenden und 22 Schalter für Benachrichtigungen.
- **Die Sprache:** Neun verschiedene Wörter für Zugangs- und Sicherheitscodes, Credits und XP nebeneinander und fünf ähnliche „Wochen“-Begriffe.

Das sind die Stand-Zahlen vom 23. Oktober, gemessen am damaligen Entwicklungsstand. Sie stammen aus dem Audit, das ich im Simulator und im Code nachvollzogen habe.

Als Maßstab dienten mir Apples Richtlinien für Oberflächen. Ein Satz daraus hat mich besonders getroffen: „Minimize the number of settings you offer.“ Ich hatte bei FamilyManager bei jeder Frage „soll das einstellbar sein?“ eher mit Ja geantwortet.

## Was ich entschieden habe

Meine Empfehlung an mich selbst lautete: vor allem weglassen und verstecken, kaum Neues bauen. Das habe ich für 3.0 festgelegt:

- **Die Tour am Anfang entfällt.** Der Start besteht aus „Los geht’s“ (Konto anlegen) oder „Ich habe schon ein Konto“.
- **„Wie hast du uns gefunden?“** kommt erst nach der ersten erledigten Aufgabe, nicht mehr davor.
- **Ein Weg zum Ausblenden statt drei.** Bausteine blendest du mit Gedrückthalten aus, und eine Seite „Heute anpassen“ sammelt sie.
- **XP verschwinden aus der Oberfläche.** Die Rangliste läuft nur noch über Credits, und sie zeigt Kinder der letzten sieben Tage.
- **Ein Wort pro Sache.** Aus den neun Wörtern für Codes sind wenige geworden, zum Beispiel „Tresor-Passwort“ und „Notfall-Code“.
- **Ein Kind anlegen braucht nur noch Name und Geburtstag.** Der Zugang wird erzeugt und direkt zum Teilen angeboten.
- **Kein Kauf-Blatt für Kinder.** Ein Kind ohne Premium sieht „Frag deine Eltern“ statt einer Kaufseite.
- **Heute radikal einfach.** Auf einen Blick soll es nur zwei Dinge geben: „Was ist jetzt wichtig?“ und „Was steht heute noch an?“ Die Familienwoche ist aus Heute auf dem iPhone herausgeflogen. Entweder Heute oder Kalender, nicht beides.

## Was ich bewusst behalten habe

Ein Audit liefert Vorschläge, aber nicht jeder gehört in die App. Zwei Dinge habe ich bewusst nicht gestrichen:

- **Die Modulauswahl im Onboarding.** Sie stand auf der Streichliste, und ich habe sie behalten.
- **Die Ruhezeiten.** Ich hätte sie durch die Fokus-Funktion von iOS ersetzen können. Ich habe sie in der App gelassen.

Beide Entscheidungen stehen jetzt in meiner Liste „nicht erneut vorschlagen“. Weglassen ist nur dann eine Stärke, wenn man auch Nein zu den eigenen Streichvorschlägen sagen kann.

## Ein Satz statt drei

Auch die Sprache der App war ein Thema. Die App sprach an drei Stellen mit drei verschiedenen Sätzen. „Deine Familie. Organisiert.“ und „Mehr Zeit für das, was wirklich zählt.“ sind gestrichen. Geblieben ist ein einziger Satz:

**Abhaken statt Nachhaken.**

Darunter steht: „Du musst nicht allein an alles denken.“ Er soll den Kern der App in einem Atemzug sagen.

## Was ich daraus mitnehme

Einfachheit entsteht bei mir selten durch einen schönen Entwurf. Sie entsteht durch Zählen: Bildschirme, Schalter, Wörter. Erst wenn die Zahl dasteht, fällt das Streichen leicht.
