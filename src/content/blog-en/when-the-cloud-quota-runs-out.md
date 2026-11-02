---
title: "When the cloud quota is empty and no run turns red"
description: "In September all Xcode Cloud runs were cancelled instantly for two weeks, and everything looked green on GitHub. How I recognised it, why a missing test is more dangerous than a red one and what I changed."
publishedAt: 2026-11-23
tags:
  - Behind the scenes
  - Product development
draft: true
heroImage: "/images/blog/hero-xcode-kontingent.webp"
heroImageAlt: "Fuel gauge in a dashboard pointing at empty"
heroImageCredit: "Photo: Erik Mclean · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/a6PsEdOyjQM"
translationOf: "xcode-cloud-kontingent-leer-kein-lauf-rot"
---

Xcode Cloud builds and tests my iOS apps at Apple instead of on my own Mac. The quota for it is tied to my Apple account, and all my iOS apps share it. On 11 September 2026 it ran out. Until the reset on 25 September every run was cancelled. The tricky part: it did not look like an error.

## How I recognised it

A run was created, produced not a single action and stood at "cancelled" after about five seconds. It affected all workflows at the same time, with a sharp cut-off. That looks like an outage, but it is not one.

It was hard to prove that the quota was the cause:

- The API gives no reason for the cancellation.
- My command-line tool for App Store Connect has no endpoint for usage.
- Apple's status page said "operational".
- The only place to look was App Store Connect, under Xcode Cloud, Usage.

## Why no run turned red

This is the actual point. A cancelled run does not show up in the GitHub checklist as red, but **not at all**. The list kept showing "successful" and "can be merged" while the proof for the iOS app was missing.

Since then my rule is: **A green pull request without the iOS lines is not a green pull request.** Before every merge I check the run against the exact commit, from the command line at App Store Connect, and not by what GitHub displays.

## What drove the usage

Not the release builds but the pull requests. Between 26 August and 11 September there were 140 runs of about 12 minutes each for FamilyManager, about 24 of 25 hours in total. On top of that came 26 further default runs.

## What I changed

- **The full suite now runs in the cloud only where it counts before a release:** for pull requests to `staging` and `main`. Pull requests to `dev` no longer start a run. I check feature changes locally.
- **The BUILD action is gone.** Next to the TEST action it built the same thing a second time. I evaluated 128 runs, 101 of them with both actions: BUILD was never red while TEST was green. Dropping it saves about a quarter of the quota.
- **The default run now only starts for changes to the iOS app,** no longer for a pure web change.

## What I take from this

A red test tells you that something is broken. A missing test tells you nothing, and that is exactly why it is more dangerous. Measure instead of trusting: if the proof is not there, the answer is "unknown", not "green".
