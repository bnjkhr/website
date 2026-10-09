---
title: "App-Überblick: 2.–9. Oktober 2026"
description: "FamilyManager bekommt eine neue Navigation, eine Suche für alles und den Wechselplan im Kalender, GymBo rechnet Supersätze und Zirkel richtig – und ein Blick in meinen Arbeitsalltag."
publishedAt: 2026-10-09
tags:
  - Wochenrückblick
  - Produktentwicklung
draft: false
---

Diese Woche war die größte seit Langem. Der rote Faden beim FamilyManager: Du sollst schneller finden, was du suchst, und Web und App sollen sich gleich anfühlen. GymBo hat Supersätze und Zirkel auf Vordermann gebracht. Und am Ende zeige ich dir, wie ich das alles neben meinem Vollzeitjob schaffe.

## FamilyManager: Eine Woche Aufräumen, Angleichen und Neues

Alles, was hier steht, steckt in **Version 2.2.7**. Die läuft gerade im Test (TestFlight, Build 611) und ist noch nicht im App Store. Sobald sie live ist, melde ich mich hier.

### Leichter zurechtfinden

- **Neue Navigation:** Feste Tabs, die Organisation ist neu geordnet, und Module, die du nicht brauchst, lassen sich ausblenden.
- **Dein Profil oben links:** Der Avatar öffnet dein Profil, die Einstellungen sind dort die erste Zeile.
- **Eine Suche statt drei:** Die globale Suche findet Aufgaben, Termine, Dokumente und mehr und springt bei Terminen direkt zum Datum.
- **Hilfeseite:** Neu dazu gekommen, mit Wegangaben direkt in der App.

### Heute und Aufgaben

- **„Heute“** zeigt in Web und App dieselben Aufgaben. Überfälliges steht oben, Aufgaben von morgen sind weg, und „Diese Woche“ ist jetzt standardmäßig sichtbar.
- **Einheitliche Aufgabenzeile:** Sie sieht überall gleich aus. Das Haken-Symbol links ist entfallen.
- **Sammelaktionen:** Mehrere Aufgaben auf einmal erledigen, archivieren oder löschen. Eltern können mehrere eingereichte Aufgaben direkt auf „Heute“ freigeben.
- **Titelvorschläge** beim Anlegen von Aufgaben und Terminen.
- **Aufgaben ohne Credits** sind möglich.
- **Unteraufgaben** lassen sich am Familien-Board abhaken. Der letzte Schritt schließt die Aufgabe ab.
- **Weniger Benachrichtigungen:** Der Aufgaben-Push geht nur noch an die Betroffenen statt an den ganzen Haushalt.

### Kalender und Wechselplan

- **Wechselplan direkt im Kalender**, jede Person in ihrer eigenen Farbe. Der Countdown zeigt den Übergabetag.
- **Termine mit einem verbundenen Haushalt teilen**, zum Beispiel mit dem anderen Elternteil. Das ist ein Schalter, der erst mit dem Store-Build wirksam wird.
- **Geburtstage** erscheinen jetzt auch im iPhone-Kalender. Mehrtägige Termine mit Uhrzeit gehen im Web.
- **Monatliche Termine** („jeden 15.“) lassen sich speichern.

### Familie, Credits, Sicherheit

- **Credit-Übersicht** mit Kontoständen und einer Rangliste. Die Rangliste auf „Heute“ zeigt die XP der Woche.
- **Mitglieds-Profil:** Profilbilder, Visitenkarte und eine grobe Anwesenheitsanzeige. Wer in der Organisation auf ein Familienmitglied tippt, sieht seine Karte.
- **Passwörter:** Auch wenn der Eltern-Tresor gesperrt ist, bleiben geteilte Passwörter sichtbar. Die Suche im Safe beachtet jetzt die Kinder-Filter.
- **Checklisten** sind standardmäßig geteilt, beim Notizbuch lassen sich die Rechte wählen.
- **Anmeldung:** „Mit Google anmelden“ ist in der iPhone-App eingebaut.
- Viele kleinere Angleichungen betreffen Einkauf, Speiseplan, Notizen, Ausgaben, Pflege-Logbuch und Texte.

### Noch in Arbeit

Diese Dinge sind noch nicht im Test:

- **Familie beschenken:** einen Monat Premium per Apple-Angebotscode verschenken. Das ist gebaut, aber noch nicht freigeschaltet.
- Weitere Angleichungen zwischen Web und App, eine größere Auswahl an Aufgaben-Zeichen und ein Board-Dialog, der sich bei einem Tipp daneben schließt.

## GymBo: Supersätze und Zirkel laufen rund

Wer mit Supersätzen oder Zirkeln trainiert, hat jetzt eine klarere Ansicht. Die Gruppen sind markiert, und du kannst sie als Block verschieben. Pläne starten in der richtigen Reihenfolge und bleiben beim Speichern erhalten.

Die Statistiken (Mesozyklus, Verlauf, Vergleich) zählen alle Übungen mit, auch wenn eine mehrfach im Training vorkommt. Auf der Apple Watch wechseln links und rechts auch ohne iCloud-Sync ab. Ein kaputter Plan bricht den Abgleich nicht mehr ab.

## Roadlight und TrackForKids

Diese Woche ruhig, in beiden Projekten gab es keine neuen Änderungen.

## Wie das nebenher geht

Die Frage bekomme ich oft: „Wie schaffst du das eigentlich?“ Neben meinem Vollzeitjob baue ich FamilyManager. Die ehrliche Antwort: nicht, indem ich mehr arbeite, sondern indem ich viel Zeit in den Ablauf gesteckt habe und kaum noch in einzelne Handgriffe.

![Ein Tag, zwei Rollen: Claude baut, ich entscheide. Zeitleiste von „Laufend“ bis „Abends“: Claude sammelt und sortiert, ich wähle aus, Agents bauen, ich prüfe und gebe frei.](/images/blog/ein-tag-zwei-rollen.png)

So sieht ein normaler Tag aus:

1. Claude sammelt automatisch ein, was reinkommt: Wünsche aus unserem Voting-Tool, Issues auf GitHub, Nachrichten aus Slack, Feedback aus TestFlight.
2. Morgens liegt alles aufbereitet vor mir: sortiert, priorisiert, mit einer Einschätzung.
3. Ich wähle aus, was heute gebaut wird. Alles andere bleibt bewusst liegen.
4. Tagsüber, während ich im Job bin, arbeiten KI-Agents die Aufgaben ab: planen, umsetzen, testen, sich gegenseitig prüfen.
5. Abends schaue ich mir die Ergebnisse an, probiere aus und gebe frei. Dann geht ein neuer Testbuild raus.

Das klappt nur, weil ich an drei Stellen selbst gefragt bin: **Priorisieren** (was bringt Familien wirklich etwas?), **Pläne lesen** (stimmt das technisch?) und **Prüfen** (grüne Tests heißen noch nicht, dass es sich richtig anfühlt).

Man kann nebenher richtig gute Sachen bauen, aber nicht, indem man einer KI einen Wunsch zuruft. Sondern indem man automatisiert, was sich wiederholt, und die Entscheidungen selbst behält.

**Was hast du schon automatisiert, das dir jeden Tag Zeit zurückgibt? Und was fehlt dir im FamilyManager noch?** Schreib es mir.
