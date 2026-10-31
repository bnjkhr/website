// Texte der Seite „App-Entwickler Ulm“ (DE: /app-entwickler-ulm/, EN: /en/app-developer-ulm/).
// In den HTML-Texten stehen {cost}, {blog} als Platzhalter für Seitenpfade (siehe src/views/Ulm.astro).
import type { Lang } from "./index";

export interface UlmCopy {
  title: string;
  layoutTitle: string;
  description: string;
  pageName: string;
  breadcrumbs: { home: string; hire: string; current: string };
  inLanguage: string;
  back: string;
  intro: string;
  buildHeading: string;
  build: string;
  workHeading: string;
  steps: string[];
  single: string;
  appsHeading: string;
  apps: string;
  cta: { heading: string; text: string; button: string };
}

const de: UlmCopy = {
  title: "App-Entwickler in Ulm und Neu-Ulm",
  layoutTitle: "App-Entwickler Ulm",
  description: "Ben Kohler baut iPhone-, iPad- und Mac-Apps für Kunden in Ulm, Neu-Ulm und Umgebung. Festpreis ab 999 €, persönliche Treffen möglich.",
  pageName: "App-Entwickler Ulm",
  breadcrumbs: { home: "Startseite", hire: "App entwickeln lassen", current: "App-Entwickler Ulm" },
  inLanguage: "de-DE",
  back: "← App entwickeln lassen",
  intro: "Ich bin Ben Kohler und arbeite von Ulm aus. Wenn du in Ulm, Neu-Ulm oder der Region eine App brauchst, ist der Weg zu mir kurz: Wir können uns zum ersten Gespräch persönlich treffen, statt zu telefonieren. Danach läuft das meiste über Video und Mail, so wie bei Kunden im ganzen Land.",
  buildHeading: "Was ich für dich baue",
  build: "Apps für das Apple-Ökosystem: iPhone, iPad und Mac, nativ mit Swift und SwiftUI. Zu jeder App baue ich eine Website mit Datenschutzerklärung und Support-Seite. Domain und Webspace buchst du auf deinen Namen, ich richte sie ein. Android geht auf Anfrage. Die erste Version baue ich zum Festpreis ab 999&nbsp;€, schriftlich vor dem Start. Wie sich der Preis zusammensetzt, steht im <a href=\"{cost}\">Kostenratgeber</a>.",
  workHeading: "Wie die Zusammenarbeit läuft",
  steps: [
    "Ein erstes Gespräch von einer halben Stunde, kostenlos.",
    "Ein schriftliches Angebot mit Festpreis und Zeitplan.",
    "Jede Woche ein neuer Stand der App auf deinem iPhone, über TestFlight.",
    "Veröffentlichung in deinem App-Store-Konto, Übergabe des Quellcodes.",
    "Auf Wunsch kostenlos dabei: <a href=\"https://roadlight.pro\" rel=\"noopener\">Roadlight</a>, mein Feedback-Board, auf dem deine Nutzer Wünsche einreichen und abstimmen.",
  ],
  single: "Ich arbeite immer nur an einem Projekt gleichzeitig. Du hast also eine feste Ansprechperson, die deine App kennt.",
  appsHeading: "Meine eigenen Apps",
  apps: "An ihnen siehst du, wie ich arbeite: <a href=\"https://familymanager.pro/landing\" rel=\"noopener\">FamilyManager</a> für Familien, <a href=\"https://gymbo.benkohler.de/\" rel=\"noopener\">GymBo</a> als Trainingstagebuch, <a href=\"https://track4kids.de/\" rel=\"noopener\">Track4Kids</a> für Kinder und <a href=\"https://startune.benkohler.de/\" rel=\"noopener\">StarTune</a> für den Mac. Was sich an ihnen ändert, schreibe ich <a href=\"{blog}\">im Blog</a> auf.",
  cta: {
    heading: "Erzähl mir von deiner App.",
    text: "Schreib mir, was die App können soll. Ich antworte innerhalb von zwei Werktagen.",
    button: "Projekt anfragen",
  },
};

const en: UlmCopy = {
  title: "App developer in Ulm, Germany",
  layoutTitle: "App developer in Ulm",
  description: "Ben Kohler builds iPhone, iPad and Mac apps for clients in Ulm, Neu-Ulm and the surrounding region of southern Germany. Fixed price from €999, in-person meetings possible.",
  pageName: "App developer in Ulm, Germany",
  breadcrumbs: { home: "Home", hire: "Hire an app developer", current: "App developer in Ulm" },
  inLanguage: "en",
  back: "← Hire an app developer",
  intro: "I'm Ben Kohler, and I work from Ulm in southern Germany. If you're in Ulm, Neu-Ulm or the surrounding region and need an app, I'm close by: we can meet in person for a first conversation instead of talking on the phone. After that, most of the work happens over video calls and email, as it does for clients across the country.",
  buildHeading: "What I build for you",
  build: "Apps for the Apple ecosystem: iPhone, iPad and Mac, built natively with Swift and SwiftUI. For every app I also build a website with a privacy policy and a support page. You register the domain and hosting in your own name, and I set them up. Android is possible on request. I build the first version at a fixed price from €999, in writing before we start. How the price comes together is explained in the <a href=\"{cost}\">cost guide</a>.",
  workHeading: "How we work together",
  steps: [
    "A free first conversation of about half an hour.",
    "A written proposal with a fixed price and a schedule.",
    "A new build of the app on your iPhone every week, through TestFlight.",
    "Release in your own App Store account, and handover of the source code.",
    "Optional and free: <a href=\"https://roadlight.pro\" rel=\"noopener\">Roadlight</a>, my feedback board where your users can submit and vote on requests.",
  ],
  single: "I only ever work on one project at a time. That means you have one dedicated contact who knows your app.",
  appsHeading: "My own apps",
  apps: "They show how I work: <a href=\"https://familymanager.pro/landing\" rel=\"noopener\">FamilyManager</a> for families, <a href=\"https://gymbo.benkohler.de/\" rel=\"noopener\">GymBo</a> as a workout log, <a href=\"https://track4kids.de/\" rel=\"noopener\">Track4Kids</a> for kids and <a href=\"https://startune.benkohler.de/\" rel=\"noopener\">StarTune</a> for the Mac. I write up what changes in them <a href=\"{blog}\">on the blog</a>.",
  cta: {
    heading: "Tell me about your app.",
    text: "Write to me about what the app should do. I reply within two working days.",
    button: "Start a project",
  },
};

export const ulm: Record<Lang, UlmCopy> = { de, en };
