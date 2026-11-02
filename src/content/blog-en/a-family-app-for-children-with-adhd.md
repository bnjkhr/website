---
title: "A family app for children with ADHD: what I built and what I do not promise"
description: "The children's mode “Jetzt” (“Now”) shows a child one step at a time. How I built it, what the research offers, why the Struktur-Hilfen for adults are private and why I do not promise any effect."
publishedAt: 2026-11-13
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: true
heroImage: "/images/blog/hero-kindermodus.webp"
heroImageAlt: "A child's hand places a colourful wooden block on a house made of blocks"
heroImageCredit: "Photo: Michał Bożek · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/RcxR1aLw8X0"
translationOf: "familienapp-fuer-kinder-mit-adhs"
---

I wanted to know what a family app can do for children with ADHD or similar challenges, and what it cannot. In this post I explain what I built, what I based it on and what I explicitly do not promise.

The most important thing first: **FamilyManager is not a therapy and does not replace medical or therapeutic care.** The children's mode is marked as a beta.

## The children's mode "Jetzt" ("Now")

"Jetzt" can be switched on per child. By default it is off. When it runs, the child sees a full-screen view with exactly one step, the one that is up now. If they like, they start an optional timer, and there is a coin as a reward.

A few deliberate decisions sit behind it:

- **One step at a time.** The child never sees the whole list, only the next step.
- **Voluntary instead of pressure.** The timer is an offer, not a requirement.
- **No "undo" after the last step.** The coin is only given when the task is really saved as done.

## What the research offers

Before building I collected and read literature: meta-analyses, guidelines and individual studies. The result is more sober than an advertisement would be:

- **Parent training and reinforcement** work on parenting behaviour and on behavioural problems, even when rated blind. On core symptoms the effects are only clear when raters are not blinded.
- **Pure training of attention or working memory** through an app mainly improves the training task itself. It hardly carries over to everyday life according to blinded measures.
- **Training in organisational skills,** by contrast, counts as a well-supported approach, even if the ratings there mostly come from parents and teachers.
- **Visible timers and breaking tasks into steps** have plausible reasons behind them, but no robust evidence of effectiveness in ADHD. The German guideline only allows digital applications as a supplement and with proof of effectiveness.

For me that means: an app is best justified as a **tool for the parents**, for reliable structure and consistent behaviour. It is not a cure for core symptoms. So I never talk about lowering ADHD symptoms, and I do not advertise "Jetzt" as a treatment.

## Recognition instead of points

The research also pointed me in a direction I am working on: a large meta-analysis found that expected, tangible rewards can undermine a person's own motivation, whereas positive verbal feedback does not. Researchers dispute this, and another meta-analysis is more relaxed about it. So I am working on weighting recognition more than plain point-collecting. I will write about how far I get once it is finished.

## Struktur-Hilfen for adults, and why they are private

A hint from testing showed me a gap: ADHD exists in adults too, including parents. So there is one switch per person that turns the help on. It is called **Struktur-Hilfen** ("structure aids") and not "Focus", because "Focus" is an iOS system feature.

The most important point is data protection. The information that someone uses these aids points to health. That is why the switch for adults sits in a separate, private table that only the person's own row can read. Partners and children do not see it, not in profiles, lists, notifications or reports. The word "ADHD" does not appear in the app interface or in the database. Children under 16 can neither switch it on nor off, from 16 they decide themselves. Before launch I carried out a data protection impact assessment.

## What is still open

The effectiveness is not proven, and I will not claim it. If you are looking for something reliable for your child, talk to your paediatrician or a counselling service. FamilyManager can structure everyday life, and that is all. If you have feedback on "Jetzt", I would be glad to hear it, because the beta lives on it.
