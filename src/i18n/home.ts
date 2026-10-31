// Alle Texte der Startseite (src/views/Home.astro), je Sprache. Navigation, Footer und
// Formulare kommen aus ui[lang] in ./index.ts.
import type { Lang } from "./index";

export interface HomeCard {
  id?: string;
  meta: string;
  name: string;
  desc: string;
  href: string;
}

export interface HomeStrings {
  seo: { title: string; description: string; rssTitle: string };
  jsonLd: { jobTitle: string; knowsAbout: string[]; inLanguage: string };
  hero: {
    title: string;
    lede: string;
    ctaProjects: string;
    ctaIdea: string;
    deviceAlt: { familymanager: string; gymbo: string };
  };
  familymanager: { eyebrow: string; claim: string; desc: string; link: string; alt: string };
  gymbo: { eyebrow: string; claim: string; desc: string; link: string; alt: string };
  maison: { eyebrow: string; claim: string; desc: string; link: string };
  credo: {
    sentence: string;
    lead: string;
    items: { title: string; text: string }[];
    outro: string;
  };
  extras: { title: string; intro: string; cards: HomeCard[] };
  journal: { title: string; allPosts: string; readPost: string };
  about: {
    portraitAlt: string;
    caption: string;
    title: string;
    text: string;
    pressLabel: string;
    pressTitle: string;
  };
}

const de: HomeStrings = {
  seo: {
    title: "Ben Kohler · iOS-Entwickler aus Ulm",
    description: "Ben Kohler aus Ulm entwickelt iPhone-Apps: FamilyManager, Track4Kids, GymBo und StarTune. Auf Anfrage baue ich auch Apps für andere.",
    rssTitle: "Ben Kohler Blog",
  },
  jsonLd: {
    jobTitle: "iOS-Entwickler",
    knowsAbout: ["iOS-App-Entwicklung", "Swift", "SwiftUI", "App Store", "TestFlight"],
    inLanguage: "de-DE",
  },
  hero: {
    title: "Apps für den Alltag.",
    lede: "Ich bin Ben, iOS-Entwickler aus Ulm. Ich baue Apps für Familien und fürs Training. Gerade kommt eine Hautpflegemarke dazu.",
    ctaProjects: "Projekte ansehen",
    ctaIdea: "Was sie verbindet",
    deviceAlt: { familymanager: "", gymbo: "" },
  },
  familymanager: {
    eyebrow: "Familie",
    claim: "Termine, Aufgaben und Einkäufe gemeinsam organisieren.",
    desc: "Mit FamilyManager arbeite ich daran, den Überblick im Familienalltag zu erleichtern. Auch dann, wenn die Familie in mehreren Haushalten lebt.",
    link: "FamilyManager ansehen",
    alt: "FamilyManager Heute-Ansicht",
  },
  gymbo: {
    eyebrow: "Training",
    claim: "Festhalten, was im Training passiert.",
    desc: "Mit GymBo entwickle ich ein Trainingstagebuch fürs iPhone: Übungen dokumentieren und beim nächsten Mal nachsehen, wo man aufgehört hat.",
    link: "GymBo ansehen",
    alt: "GymBo Aktivität mit Wochenziel und Check-in",
  },
  maison: {
    eyebrow: "Pflege · in Vorbereitung",
    claim: "Mein nächstes Projekt geht über Software hinaus.",
    desc: "Mit MAISON BENCHRIS arbeite ich an einer Hautpflegemarke. Mein Ziel ist Pflege, die sich einfach in den Alltag einbauen lässt.",
    link: "Zu MAISON BENCHRIS",
  },
  credo: {
    sentence: "Das wurde mir erst später klar: Es geht immer um den Alltag.",
    lead: "Lange habe ich vor allem gesehen, wie unterschiedlich die Projekte sind. Erst mit der Hautpflegemarke fiel mir auf, dass sie alle vom selben Ort handeln. Von dem, was wir jeden Tag tun.",
    items: [
      { title: "Zusammenleben", text: "Wie eine Familie ihren Tag organisiert. Auch dann, wenn sie in mehreren Haushalten lebt." },
      { title: "Bewegen", text: "Wie man beim Training dranbleibt, weil man sieht, was beim letzten Mal ging." },
      { title: "Sich kümmern", text: "Wie Pflege in den Tag passt, ohne zur zusätzlichen Aufgabe zu werden." },
    ],
    outro: "Deshalb stehen die drei hier zusammen.",
  },
  extras: {
    title: "Weitere Projekte",
    intro: "Daneben gibt es kleinere Projekte rund um Kinder und Ernährung, Musik, Produktfeedback und Inhalte im Netz.",
    cards: [
      { id: "track4kids", meta: "iOS · Beta", name: "Track4Kids", desc: "Kinder von 9 bis 12 lernen mit Karten und Arenen Lebensmittel kennen. Ohne Kalorienzählen.", href: "https://track4kids.de/" },
      { meta: "macOS · Live", name: "StarTune", desc: "Songs schneller favorisieren.", href: "https://startune.benkohler.de/" },
      { meta: "iOS und Web · Beta", name: "NaturSupps", desc: "Informationen zu Nahrungsergänzungsmitteln.", href: "https://natursupps.benkohler.de/" },
      { meta: "Web · Beta", name: "RoadLight", desc: "Feedback, Voting und Roadmap an einem Ort.", href: "https://roadlight.pro/" },
      { meta: "Chrome · Beta", name: "Chrome AI Filter", desc: "KI-Inhalte im Feed sichtbar machen.", href: "https://github.com/bnjkhr/Chrome_AI_filter" },
    ],
  },
  journal: { title: "Was zwischen den Releases passiert.", allPosts: "Alle Beiträge", readPost: "Beitrag lesen" },
  about: {
    portraitAlt: "Ben Kohler, Produktentwickler aus Ulm",
    caption: "Ben · Ulm",
    title: "Ein bisschen mehr über mich.",
    text: "Ich lebe in Ulm und entwickle seit vielen Jahren Software. An FamilyManager arbeite ich neben meinem Vollzeitjob. Wie das zusammenpasst und wie die App entstanden ist, erzähle ich im Podcast Happy Bootstrapping.",
    pressLabel: "Zu Gast im Podcast",
    pressTitle: "Happy Bootstrapping · FamilyManager neben dem Vollzeitjob",
  },
};

const en: HomeStrings = {
  seo: {
    title: "Ben Kohler · iOS developer from Ulm, Germany",
    description: "Ben Kohler from Ulm, Germany, builds iPhone apps: FamilyManager, Track4Kids, GymBo and StarTune. I also build apps for other people on request.",
    rssTitle: "Ben Kohler Blog",
  },
  jsonLd: {
    jobTitle: "iOS developer",
    knowsAbout: ["iOS app development", "Swift", "SwiftUI", "App Store", "TestFlight"],
    inLanguage: "en",
  },
  hero: {
    title: "Apps for everyday life.",
    lede: "I'm Ben, an iOS developer from Ulm, Germany. I build apps for families and for training. A skincare brand is joining them now.",
    ctaProjects: "See the projects",
    ctaIdea: "What connects them",
    deviceAlt: { familymanager: "", gymbo: "" },
  },
  familymanager: {
    eyebrow: "Family",
    claim: "Organise appointments, tasks and shopping together.",
    desc: "With FamilyManager I'm working on making it easier to keep track of family life, even when the family lives in more than one household.",
    link: "See FamilyManager",
    alt: "FamilyManager Today view",
  },
  gymbo: {
    eyebrow: "Training",
    claim: "Keep track of what happens in your workouts.",
    desc: "GymBo is a workout journal for the iPhone: log your exercises and see where you left off the next time.",
    link: "See GymBo",
    alt: "GymBo activity with weekly goal and check-in",
  },
  maison: {
    eyebrow: "Skincare · coming soon",
    claim: "My next project goes beyond software.",
    desc: "With MAISON BENCHRIS I'm working on a skincare brand. My goal is skincare that fits easily into everyday life.",
    link: "Go to MAISON BENCHRIS",
  },
  credo: {
    sentence: "It only became clear to me later: it's always about everyday life.",
    lead: "For a long time I mostly saw how different the projects are. Only with the skincare brand did I notice that they all come from the same place. From what we do every day.",
    items: [
      { title: "Living together", text: "How a family organises its day, even when it lives in more than one household." },
      { title: "Moving", text: "How you stick with training because you can see what worked last time." },
      { title: "Taking care", text: "How skincare fits into the day without turning into one more chore." },
    ],
    outro: "That's why these three belong together here.",
  },
  extras: {
    title: "More projects",
    intro: "There are also smaller projects around kids and nutrition, music, product feedback and content on the web.",
    cards: [
      { id: "track4kids", meta: "iOS · Beta", name: "Track4Kids", desc: "Kids aged 9 to 12 get to know food through cards and arenas. No calorie counting.", href: "https://track4kids.de/" },
      { meta: "macOS · Live", name: "StarTune", desc: "Favourite songs faster.", href: "https://startune.benkohler.de/" },
      { meta: "iOS and web · Beta", name: "NaturSupps", desc: "Information about dietary supplements.", href: "https://natursupps.benkohler.de/" },
      { meta: "Web · Beta", name: "RoadLight", desc: "Feedback, voting and roadmap in one place.", href: "https://roadlight.pro/" },
      { meta: "Chrome · Beta", name: "Chrome AI Filter", desc: "Make AI-generated content visible in your feed.", href: "https://github.com/bnjkhr/Chrome_AI_filter" },
    ],
  },
  journal: { title: "What happens between releases.", allPosts: "All posts", readPost: "Read the post" },
  about: {
    portraitAlt: "Ben Kohler, product developer from Ulm, Germany",
    caption: "Ben · Ulm, Germany",
    title: "A little more about me.",
    text: "I live in Ulm and have been building software for many years. I work on FamilyManager alongside my full-time job. How that fits together and how the app came about, I talk about on the podcast Happy Bootstrapping (in German).",
    pressLabel: "Guest on the podcast",
    pressTitle: "Happy Bootstrapping · FamilyManager alongside a full-time job",
  },
};

export const homeStrings: Record<Lang, HomeStrings> = { de, en };
