---
title: "Two households, one calendar: how FamilyManager connects separated parents"
description: "When children live in two households, family organisation does not stop at the front door. How I built connected households, the custody schedule and event sharing in FamilyManager."
publishedAt: 2026-12-04
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: true
heroImage: "/images/blog/hero-zwei-haushalte.webp"
heroImageAlt: "Row of colourful houses along a street"
heroImageCredit: "Photo: João Roger Goes Pereira · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/sN0dnAWfBZE"
translationOf: "zwei-haushalte-ein-kalender"
---

Family organisation does not stop at the front door, least of all when children live in two households. Who picks up when, where the sports kit is, what is planned for Thursday: much of it concerns both households, and both sides need the same picture. For such families I built a set of features in FamilyManager. In this post I explain how they fit together.

## The start

When you create a new household, FamilyManager asks: "Who lives here?" For "We raise our children separately – two households" an assistant walks you through children, place of residence and the custody schedule. Every step can be skipped.

## The custody schedule in the calendar

The custody schedule sits right in the calendar, each person in their own colour. A countdown shows the next handover day.

## Connecting two households

So that both sides see the same picture, two households can be connected. You do that with a link that you send to the other parent. It also works with the child ID: whoever enters it connects the custody schedules in the same way as the link does. The link is the main route, the child ID is the fallback.

## What is shared

- **Sharing events** with a connected household, for example with the other parent. It is a switch, and it does not need Premium.
- **Handover notes** for the handover between the households. They are encrypted, and there is a second encrypted copy for the connection.

## What I am still checking

I test the "connect a household" flow with two test households, playing both sides myself. There are still a few points I am watching, for example whether the jump to the custody schedule on the iPhone always lands in the right place. If you live in a family like this and try FamilyManager, feedback helps me most: does the link reach the other parent, and does everything look there the way you expect?
