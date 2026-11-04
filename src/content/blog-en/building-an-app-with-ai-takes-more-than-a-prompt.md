---
title: "Building an app with AI: why a prompt isn't enough"
description: "Tools like Lovable promise a finished app from a prompt. Why that falls short for a real product, and which craft is still needed even when AI writes the code."
publishedAt: 2026-11-02
tags:
  - Product development
  - Behind the scenes
draft: false
heroImage: "/images/blog/hero-ki-prompt.webp"
heroImageAlt: "Blue network of glowing lines and dots"
heroImageCredit: "Photo: Conny Schneider · Unsplash"
heroImageCreditUrl: "https://unsplash.com/photos/xuTJZ7uD7PI"
translationOf: "ki-app-bauen-ist-mehr-als-ein-prompt"
---

"Describe your app and we'll build it for you." That is roughly the promise of many AI tools, Lovable among them. Part of it is true: a prototype that looks like an app and can be clicked through is ready within an hour today. I work with AI every day myself and wouldn't want to give it up.

But a prototype is not a product. Between "it runs on my screen" and "strangers can rely on it" lies most of the work. This post is about what that includes, and why a prompt alone doesn't get you there.

## The prototype is the easy part

AI is unbeatable at getting started. There is no blank page any more, and the first version appears quickly. The hard part comes afterwards: the tenth request that breaks the ninth, data that suddenly no longer fits together, a bug that only affects some users.

A 2025 study by the organisation METR fits here. It had 16 experienced developers work on their own long-maintained open-source projects, sometimes with AI help and sometimes without. With AI they needed [19 percent longer](https://getcoai.com/news/study-ai-coding-tools-slow-down-experienced-developers-by-19/), yet believed they had been faster. The study is small and used earlier tools, and the authors say so themselves. It still works as a warning: the feeling of speed and the work actually done are two different things.

## Architecture: you can't see the foundation

An app doesn't consist of screens but of decisions. Where does the data live? What happens when the network is gone? How does the app grow without every change shaking everything else? How do you ship an update while old versions are still running on devices?

AI answers such questions happily, but usually for the case you are describing right now. It builds a piece that works today without asking. Whether it still works in six months, once the app has grown, is a question for the person who has the whole thing in their head. If you can't judge the structure, you only notice when every change gets more expensive than the one before.

## Security: the risk is yours

This is where the consequences are harshest. In 2025 the security vendor Veracode tested over 100 AI models on 80 programming tasks. [In 45 percent of cases](https://levelup.gitconnected.com/developers-have-been-shipping-ai-generated-vulnerabilities-since-2021-d1c93c3787b9) the generated code contained vulnerabilities from the well-known OWASP Top 10 categories. That doesn't mean AI code is always insecure. It means it isn't automatically secure, and you can't tell by looking.

A concrete example: in 2025 a security researcher reported that projects built with Lovable often lacked database access rules ("Row Level Security") or had them set wrongly. In his scan they were missing on [303 endpoints across 170 projects](https://superblocks.com/blog/lovable-vulnerabilities). Anyone who knew the address could retrieve data without being logged in. The flaw received its own identifier (CVE-2025-48757). In all of these cases, the app looked perfectly normal.

And it goes beyond databases: secrets such as API keys don't belong in the app. User input has to be validated. Sign-in and permissions must be checked on the server, not just on the screen. If you don't know this, you can't ask the question, and the AI only answers what it is asked.

## Data and operations: what happens when something goes wrong?

In summer 2025, Replit's AI agent [deleted a real production database](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure) during a public experiment, even though founder Jason Lemkin had explicitly ordered a code freeze. Replit afterwards announced it would automatically separate development and production databases.

The case shows no ill will but missing craft: separate environments, backups you have restored at least once, permissions that allow a tool only what it needs. Then come questions that don't show up with the first version: who notices when the app crashes? Where do you see errors? What does it cost when a thousand people use it instead of ten?

## Privacy and App Store rules

As soon as strangers enter data, rules apply. In Europe that is the GDPR: you need a legal basis, a privacy policy, data processing agreements with the services you integrate, and a way to delete data again.

Apple reviews every app before release. Since 2022, an app that lets people create accounts must also offer account deletion [inside the app itself](https://developer.apple.com/news/?id=mdkbobfo). On top come privacy details in the App Store, age ratings, review notes, and rules for subscriptions and purchases. A rejected app costs days, sometimes weeks. That takes someone who knows the rules before the rejection arrives.

## UX: how an app is used

An app isn't good because all the features are there. It is good when people understand it without explanation. That is a discipline of its own: what does someone see on first launch? What happens with empty lists, with errors, with a slow connection? How many steps does the most important task take?

AI builds exactly the screens you describe. It doesn't tell you whether that is the right flow. The only remedy is talking to real people and watching where they get stuck.

## UI: details you can feel

A pretty layout is more than colours, too. It includes Dynamic Type (users make the text larger), dark mode, VoiceOver for blind and visually impaired users, enough contrast, touch targets you can hit with a thumb, and behaviour on iPhone, iPad and small screens. On Apple devices people also expect an app to feel like an Apple app. Such things go unnoticed in a prototype and are noticed immediately by users.

## Image workflows: icon, screenshots, graphics

An area hardly anyone has on their list: images. An app icon has to work in many sizes and in dark mode. For the App Store you need screenshots in the required formats with matching text; for the website, graphics at a sensible size and format, with alt text. Graphics inside the app should be sharp without bloating it.

These are not side issues. The icon and the screenshots are the first thing anyone sees of your app, and often the reason to download it or swipe away.

## Marketing: built doesn't mean found

Even a good app doesn't find its audience on its own. The App Store has millions of listings. What is the app called? Which search terms are in the title and description? Is there a website that shows up on Google? Who hears about it, and why should anyone install it instead of scrolling on? That takes a clear promise, a price you can explain, and the path afterwards: collecting feedback, ratings, updates.

If you leave all of that to chance, you end up with a finished app nobody sees.

## Maintenance: the launch is not the end

Apple releases a new iOS every year. Services change their interfaces, libraries get security updates, users report bugs and ask for new things. An app is not an object you build and leave standing, but something you operate. If you built it with AI without understanding it, you face a mountain of code nobody knows at the first outage.

## What AI really changes

I don't want to play this off against AI. Quite the opposite: it makes much faster what used to take weeks, and it takes over a lot of legwork. But it works best where someone leads: scoping tasks cleanly, checking results, having tests written, building safety nets. How that looks in practice for me is described in [My setup: how I build apps with Claude Code](/en/blog/how-i-build-apps-with-claude-code/).

Put differently: AI lowers the cost of typing, not the cost of knowledge and responsibility. If you bring both, you get much faster with it. If you bring neither, you get faster too, just in the wrong direction.

## What this means for you

- **For ideas and first tests**, AI builders are great. Try things out, show them to people, learn.
- **As soon as real users, real data or money are involved**, you need someone who keeps architecture, security, privacy and the App Store in view.
- **Ask about the craft**, not just the result: where does the data live? Who may see what? What happens when something fails? Who looks after it in a year?

If you have an app idea and want to know which route suits it: how a project works with me is in [How does an app development project work?](/en/blog/how-an-app-development-project-works/), what it costs is in the [cost guide](/en/app-development-cost/), and on the page [Hire an app developer](/en/hire-an-app-developer/) you can get in touch.
