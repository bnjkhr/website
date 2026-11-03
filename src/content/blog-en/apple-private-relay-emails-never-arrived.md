---
title: "Why every email to a good third of my users never arrived"
description: "If you signed in with Apple and chose “Hide My Email”, you got no email from FamilyManager at all. How I found it, what it meant and which setting at Apple was missing."
publishedAt: 2026-12-18
tags:
  - FamilyManager
  - Behind the scenes
  - Product development
draft: true
heroImage: "/images/blog/hero-private-relay.webp"
heroImageAlt: "Row of colourful mailboxes on a post"
heroImageCredit: "Photo: Philippe Murray-Pietsch · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/xiqCrk6LvTg"
translationOf: "apple-private-relay-mails-kamen-nicht-an"
---

In FamilyManager you can sign in with Apple. Apple offers to hide your real email address in that case. The app then only gets a forwarding address ending in `@privaterelay.appleid.com`. Surprisingly many people use it: in July it was 401 of 1,175 profiles, a good third (34%). And exactly these users received practically no email from me until mid-July.

## How I noticed

I noticed it in the numbers. The bounce rate, the share of emails that are not delivered, was 28%. That is dreadful and can damage the sending domain's reputation with mail providers.

I only found the cause when I broke the bounces down by recipient domain. Almost all of them came from a single source: Apple's forwarding addresses. Of 261 emails to such addresses in 30 days, 260 came back (99.6%). Without them the bounce rate was around 1.7%, perfectly healthy. There was never a general problem, only this one.

## What was behind it

Apple discards emails to these forwarding addresses when the **sending domain is not registered with Apple**. The email then comes back as a bounce. I had simply not done the registration.

## What it meant for those affected

This was not only a problem for marketing emails:

- **Resetting a password** did not work. If you forgot your password, you never got the email.
- **Changing your email address** did not work. The confirmation email did not arrive in half of the attempts.
- **Invitations** to a household and campaigns did not arrive.

## The fix

On 16 July I registered the domains `familymanager.pro` and `benkohler.de` together with the sender addresses I use at Apple. You do it in the Apple Developer account under “Certificates, Identifiers & Profiles”, in the “Services” section, at “Sign in with Apple for Email Communication”. All entries are green, including the SPF check. I added a further sender address, which I later used for the user survey, in September.

I verified it with a real resend: 34 emails, 21 of them to forwarding addresses. All 21 showed “Delivered” instead of “Bounced”. The group that previously came back almost entirely is delivered since then.

## Two traps I take away

- **“Sent” does not mean “delivered”.** My sending service accepts an email and reports success. The bounce comes afterwards. If you only read the first status, you treat bounced emails as sent.
- **A total hides things.** “28% bounce” looked like a problem everywhere. Only the breakdown showed that almost everything came from one source.

My advice if you build in “Sign in with Apple”: register your sending domain with Apple before you send the first email, and always break bounces down by recipient domain.
