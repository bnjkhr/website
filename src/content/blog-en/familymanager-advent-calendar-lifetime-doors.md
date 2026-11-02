---
title: "The FamilyManager advent calendar: 23 lifetimes, a chance every day"
description: "From 1 to 24 December, one door opens each day at an unknown time. Behind doors 1 to 23 there is one lifetime each for €39. Why I built it this way and how it works."
publishedAt: 2026-11-27
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: true
translationOf: "familymanager-adventskalender-lifetime-tuerchen"
---

From 1 to 24 December there is an advent calendar at [familymanager.pro/advent](https://familymanager.pro/advent). Every day one door opens, at a time nobody knows in advance. It falls somewhere between 8 am and 9 pm. Behind doors 1 to 23 there is exactly **one lifetime for €39** instead of the regular €89.99. That saves you €50.99. First come, first served.

In this post I explain how it works and why I built it this way instead of a permanent discount.

## How it works

- **One door per day.** It opens at a random time between 8 am and 9 pm that nobody knows beforehand.
- **Exactly one lifetime per door.** Once it is gone, it is gone. The next day brings the next one.
- **You pay on the web through Stripe.** The lifetime then also applies in the iPhone app.
- **You can take part if you are signed in,** your email address is confirmed and your account is older than 24 hours.
- **If you have an Apple subscription,** you cancel it yourself. I end Stripe subscriptions automatically and refund the remainder pro rata.

The full terms are at [familymanager.pro/advent/bedingungen](https://familymanager.pro/advent/bedingungen) (in German).

## Worth a look even without a lifetime

Every day there is a small piece of family content for everyone, whether or not you win a door:

- **Ready-made lists,** for example for a cookie-baking day, a wish list or planning the Christmas dinner.
- **Tips,** such as a stress-free St. Nicholas Day, swapping chores over the holidays or a calm Christmas Eve.
- **Event ideas with a calendar file:** a crafts afternoon on Saturday 5 December, the Christmas market on Friday 11 December and a movie night on Saturday 19 December.
- **Printables:** a family advent plan, credits vouchers to colour in and a gift card.

## Why 23 lifetimes and not a permanent discount

For me the lifetime is the price anchor. If I made it cheaper for good, the regular price of €89.99 would soon be just a number on paper. So I chose a quantity I know in advance: 23, one per door, and then it is over. The regular price stays what it is, and anyone who takes part in December gets a real advantage instead of a permanent discount.

The time is random so that it is not always the same early birds or bots who win. If you drop by at some point during the day, you have just as much of a chance.

## Planned: a draw behind door 24

<!-- DRAFT: Publish only once Ben has confirmed. Otherwise delete this section. -->

Behind door 24 I plan to raffle **3 lifetimes**. You can enter from 1 December until 24 December before 6 pm. It is free, independent of any purchase, with one entry per household. The draw runs automatically on 24 December at 6 pm. The draw is still being built and not yet final; the terms will be on the advent page.

## Gifting to other families

From 1 December, you can give up to three other families one month of Premium in the iPhone app under **More → Gift a family** (German UI: Mehr → Familie beschenken).

## Take part

Visit [familymanager.pro/advent](https://familymanager.pro/advent) on 1 December. The page has a share button if you want to tell someone about it.

To be there for the first door you need an account with a confirmed email address that is older than 24 hours. If you do not have one yet, create it the week before.
