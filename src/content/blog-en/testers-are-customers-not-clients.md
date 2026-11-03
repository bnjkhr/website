---
title: "My best critic is a tester, and still they do not decide what I build"
description: "The best feedback on FamilyManager comes from my test team. Why I still do not build every wish, how I separate bugs from wishes and which wishes I turned down."
publishedAt: 2026-12-04
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: true
heroImage: "/images/blog/hero-tester-feedback.webp"
heroImageAlt: "Pinboard full of colourful sticky notes"
heroImageCredit: "Photo: Kevin Yudhistira Alloni · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/7Nu_TageB3U"
translationOf: "tester-sind-kunden-keine-auftraggeber"
---

My test team includes someone who tries out FamilyManager very thoroughly. This person sends feedback regularly: bugs, questions, wishes. It is often the best feedback I get. Still, I follow a rule that I wrote down in October: **A tester is a customer, not a client.**

## Why this rule

A single tester is one voice, not a product owner. If I simply build every wish, the product grows without control, and it gets harder for everyone else. What prompted the rule was a recommendation I had justified only by saying that a tester had explicitly asked for something. That is not a good argument.

## Two kinds of feedback

I keep them strictly apart:

**Bugs** are wrong behaviour, data loss and contradictions. I fix those, and quickly. An example from October: the statistics showed "61 credits in 90 days" for a child, while the leaderboard on another screen showed a smaller number for the same child. The cause was simple: one calculation counted only positive entries, the other calculated the net amount. That was a mistake, and it is fixed. An info sheet that cut off its first paragraph belonged in the same category.

**Wishes** I examine. I ask myself four things:

1. **Does it help many households?** Or just one?
2. **How big are the effort and the risk?** Anything that means new encrypted data or a migration weighs more.
3. **Does it fit a native Apple app?**
4. **Does it contradict a decision I have already made?**

I do not justify anything with "the tester wants it". The reason has to come from the product.

## What I built

Some wishes passed the test. The child logbook was missing "Sleeping"; now there is an entry with a duration, in the app and on the web. I needed a database change for it. The wishes to sort entries by frequency or to create custom entry types I deliberately did not build.

Another point involved a product decision: a submitted cleaning task could only be approved, not sent back. That was on purpose, but the app did not explain it. Now sending it back means it returns to open, without credits.

## What I turned down

- **Renaming credits,** for example to "gummy points". That would look nice, but it is big: a household setting and every text in the app. I dropped it.
- **Height and weight with a history in the profile.** That would be a new table with encrypted data and a migration, so a lot of effort at high risk. I dropped it.
- **A quiet-time timer.** I dropped that one too.

A no is not criticism of the suggestion. The idea behind it is often reasonable, and it still does not fit into an app that is meant to stay simple for very different families.

## Why this is good for everyone

The test team stays valuable because it looks closely. I stay able to act because I do not have to run in every direction at once. And anyone who only looks at the app now and then gets a product that does not get heavier with every update.
