---
title: "What FamilyManager taught me: one stop, one sentence"
description: "From a task list to the Wednesday rhythm: the most important stops with FamilyManager, each with the one sentence I take away from it."
publishedAt: 2027-01-29
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: true
heroImage: "/images/blog/hero-gelehrt.webp"
heroImageAlt: "Row of round tree slices used as stepping stones in the grass"
heroImageCredit: "Photo: photonblast · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/DXRP2PKlsFQ"
translationOf: "was-familymanager-mich-gelehrt-hat"
---

I have been building FamilyManager since 3 February 2026. Along the way I made mistakes I would rather have avoided, and decisions I am proud of. Most of the lessons are scattered across individual posts. Here I put them in order: one stop, one sentence.

## 3 February: the first code

The idea was simple: a family has tasks, events, shopping and documents in one place. It only got hard once everything was in.

**Bundling everything in one place means deciding again and again what does not belong.**

## 16 July: the emails that never arrived

A good third of my users sign in with Apple's "Hide My Email". Almost no email got through to those addresses, because I had not registered my sending domain with Apple. I only found it when I broke the bounces down by recipient domain.

**Sent does not mean delivered, and a total hides the cause.** More in [Why every email to a good third of my users never arrived](/en/blog/apple-private-relay-emails-never-arrived/).

## September: the empty quota

For two weeks all Xcode Cloud runs were cancelled instantly. On GitHub everything still looked green, because a cancelled run does not show up as red there, but not at all.

**A missing test is more dangerous than a red one.** More in [When the cloud quota is empty and no run turns red](/en/blog/when-the-cloud-quota-runs-out/).

## 24 September: the database was too small

FamilyManager was unreachable for a good 20 minutes. It was not a programming error but memory that had been too tight for hours, and I had not seen it.

**"Still enough" turns into an outage as soon as the daily peak grows.** More in [The day my database was too small](/en/blog/the-day-my-database-ran-out-of-capacity/).

## October: the simplicity audit

Before version 3.0 I clicked through the app and counted: 13 screens to the first task, about 90 permanent switches, nine words for codes.

**Simplicity comes from counting, not from a beautiful design.** More in [Less is more: what I cut before FamilyManager 3.0](/en/blog/less-is-more-what-i-cut-before-3-0/).

## Autumn: the test team

The best feedback comes from the test team. Still, a wish does not decide what I build. I ask how many households it helps, how big the effort and risk are, whether it fits a native Apple app and whether it contradicts an earlier decision.

**A tester is a customer, not a client.** More in [My best critic is a tester, and still they do not decide what I build](/en/blog/testers-are-customers-not-clients/).

## October: the child mode "Jetzt"

For the child mode I read studies beforehand. The result was more sober than any advertising text, and afterwards it was clear what I must not write.

**What I cannot prove, I do not promise.** More in [A family app for children with ADHD: what I built and what I do not promise](/en/blog/a-family-app-for-children-with-adhd/).

## 1 November: version 3.0 and the Wednesday rhythm

Version 3.0 came as one big drop, and afterwards I changed the rhythm. Since 3.0.2 FamilyManager ships every Wednesday. If nothing is finished, there is no update.

**A fixed rhythm beats one big drop.** More in [An update every Wednesday: my new release rhythm for FamilyManager](/en/blog/every-wednesday-an-update-my-new-release-rhythm/).

## What remains

Almost every one of these lessons follows the same pattern: I did not measure something and took it for granted. My first step is now almost always the same: count, look, measure before I guess.

If a sentence here sounds familiar from your own work, write to me.
