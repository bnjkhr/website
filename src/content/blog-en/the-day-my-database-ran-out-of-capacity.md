---
title: "The day my database was too small"
description: "On 24 September 2026 FamilyManager was unreachable for a good 20 minutes. The cause was not a programming mistake but memory that no longer sufficed. How I found it and what I take from it."
publishedAt: 2027-01-15
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: true
heroImage: "/images/blog/hero-datenbank.webp"
heroImageAlt: "Server rack in a dark room with green-lit cables"
heroImageCredit: "Photo: Tyler · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/OnI_TNcIv9U"
translationOf: "datenbank-kapazitaet-reichte-nicht"
---

On Thursday, 24 September 2026, FamilyManager was unreachable for a good 20 minutes. Signing in and loading data failed, and the errors came back as timeouts. I restarted the database, and afterwards everything worked again. But a restart is not an explanation.

## The pattern

The errors began shortly before 3 pm and ended around 3:16 pm. The responses of the interfaces and of sign-in ran into timeouts. At first glance it looked like a programming mistake or a single heavy query. But there was no trace of that: even simple queries took so long that they were cancelled, and several background jobs no longer got started. That does not fit a single mistake. It fits a system that is at its limit somewhere.

## The cause

In the database's monitoring I then saw it: the working memory had been too tight for hours. The database had moved around 550 MB out to disk, so-called swapping, while memory usage stayed high. When data is constantly shuffled between memory and disk, every query gets sluggish. At the moment of the outage the wait for the disk jumped to around 60 percent.

The hour of the outage was also the daily peak, with 3,563 requests per hour. In short: the capacity of the database no longer sufficed, and I had not noticed.

On top of that there were requests that were not needed at all. While looking, I found several places in the app and on the web where a single action triggered several requests. I built fixes for those.

## What I did

The same day I moved the database to a larger instance with 1 GB of memory and adjusted the memory settings. I also noted a rule for myself: when timeouts roll in, I first look at swap and disk wait before searching the code.

A restart only empties the swap briefly. The memory fills up again if nothing changes at the cause. So I will measure at the daily peaks whether the larger instance is enough. If swap stays high, I go up another step.
