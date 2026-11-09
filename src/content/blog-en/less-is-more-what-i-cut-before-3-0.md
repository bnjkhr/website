---
title: "Less is more: what I cut before FamilyManager 3.0"
description: "About 90 switches, 13 screens before the first task, nine words for codes: I audited FamilyManager for simplicity before 3.0. What I cut, what I deliberately kept and why."
publishedAt: 2026-11-09
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: false
heroImage: "/images/blog/hero-weniger-ist-mehr.webp"
heroImageAlt: "White wall niche with three vases"
heroImageCredit: "Photo: Allison Saeng · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/o4LMLXLI4_c"
translationOf: "weniger-ist-mehr-was-ich-vor-3-0-gestrichen-habe"
---

Before FamilyManager 3.0 came out, I asked myself an uncomfortable question: is the app really simple? Not "fairly clear", but as simple as you expect an Apple app to be. I clicked through the app, counted, and wrote the results down in an audit. The result was sobering and useful at the same time.

## What the audit showed

The core actions were already fine. Checking off a task takes one tap, creating a task or an event takes three. Everything around them was complicated:

- **The first contact:** a new user needed 13 screens to reach their first task.
- **The number of knobs:** about 90 permanent switches, three parallel systems for showing and hiding things, and 22 switches for notifications.
- **The language:** nine different words for access and security codes, credits and XP side by side, and five similar "week" terms.

These are the figures from 23 October, measured on the development build at the time. They come from the audit, which I followed through in the simulator and in the code.

My yardstick was Apple's interface guidelines. One sentence from them hit me in particular: "Minimize the number of settings you offer." In FamilyManager I had tended to answer "should this be configurable?" with yes.

## What I decided

My advice to myself was: mostly leave things out and hide things, build hardly anything new. For 3.0 I settled on this:

- **The intro tour is gone.** The start is "Let's go" (create an account) or "I already have an account".
- **"How did you find us?"** now comes after the first completed task, not before.
- **One way to hide things instead of three.** You hide blocks by pressing and holding, and a page called "Customise Today" collects them.
- **XP disappears from the interface.** The leaderboard runs on credits only and shows children for the last seven days.
- **One word per thing.** The nine words for codes became a few, for example "vault password" and "emergency code".
- **Adding a child only needs a name and a birthday.** The access is generated and offered for sharing straight away.
- **No purchase sheet for children.** A child without Premium sees "Ask your parents" instead of a purchase page.
- **Today, radically simple.** At a glance there should be only two things: "What matters now?" and "What is still on today?" The family week has left Today on the iPhone. Either Today or the calendar, not both.

## What I deliberately kept

An audit gives suggestions, but not every one belongs in the app. Two things I deliberately did not cut:

- **The module choice in onboarding.** It was on the cut list, and I kept it.
- **Quiet hours.** I could have replaced them with iOS Focus. I left them in the app.

Both decisions are now on my "do not suggest again" list. Leaving things out is only a strength if you can also say no to your own cutting suggestions.

## One sentence instead of three

The language of the app was an issue too. The app spoke in three places with three different sentences. "Your family. Organised." and "More time for what really matters." are gone. One sentence remains:

**Abhaken statt Nachhaken.** (In English: "Checked off. Not chased.")

Below it: "You don't have to think of everything alone." It should say the core of the app in one breath.

## What I take from this

Simplicity rarely comes from a beautiful design for me. It comes from counting: screens, switches, words. Once the number is on the table, cutting gets easy.
