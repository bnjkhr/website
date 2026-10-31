// Zweisprachigkeit von Hand: Deutsch liegt ohne Präfix, Englisch unter /en/.
// Astro-i18n-Routing ist bewusst aus; die Routenmap unten ist die einzige Stelle,
// die deutsche und englische Pfade verbindet. Diese Datei darf nur Typen-Syntax
// verwenden, die Node ohne Build entfernen kann (sie wird auch von Skripten geladen).

export type Lang = "de" | "en";

export const LANGS: readonly Lang[] = ["de", "en"];
export const DEFAULT_LANG: Lang = "de";

/** Routenmap: Schlüssel → Pfad je Sprache (mit führendem und abschließendem Slash). */
export const PAGES = {
  home: { de: "/", en: "/en/" },
  hire: { de: "/app-entwickeln-lassen/", en: "/en/hire-an-app-developer/" },
  ulm: { de: "/app-entwickler-ulm/", en: "/en/app-developer-ulm/" },
  cost: { de: "/app-entwicklung-kosten/", en: "/en/app-development-cost/" },
  blog: { de: "/blog/", en: "/en/blog/" },
  rss: { de: "/rss.xml", en: "/en/rss.xml" },
} as const satisfies Record<string, Record<Lang, string>>;

export type PageKey = keyof typeof PAGES;

export const pagePath = (key: PageKey, lang: Lang): string => PAGES[key][lang];

/** Pfad eines Blogbeitrags in der jeweiligen Sprache. `post` ist der Eintrag oder seine id. */
export const blogPostPath = (post: { id: string } | string, lang: Lang): string => {
  const id = typeof post === "string" ? post : post.id;
  return `${pagePath("blog", lang)}${id}/`;
};

export const otherLang = (lang: Lang): Lang => (lang === "de" ? "en" : "de");

/** Sprache anhand des Pfads: alles unter /en/ ist Englisch, der Rest Deutsch. */
export const langFromPath = (pathname: string): Lang =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : "de";

/** Normalisiert Eingaben (Formular, Query, Cookie) auf eine gültige Sprache. */
export const toLang = (value: unknown): Lang => (value === "en" ? "en" : "de");

const DATE_LOCALE: Record<Lang, string> = { de: "de-DE", en: "en-GB" };

export const formatDate = (date: Date, lang: Lang): string =>
  new Intl.DateTimeFormat(DATE_LOCALE[lang], {
    day: lang === "de" ? "2-digit" : "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

/** Locale-Tag für og:locale. */
export const OG_LOCALE: Record<Lang, string> = { de: "de_DE", en: "en_US" };
/** Tag für <language> im RSS-Feed. */
export const FEED_LANGUAGE: Record<Lang, string> = { de: "de-DE", en: "en-GB" };

const de = {
  skip: "Zum Inhalt",
  nav: {
    label: "Hauptnavigation",
    projects: "Projekte",
    idea: "Die Idee dahinter",
    blog: "Blog",
    hire: "App entwickeln lassen",
    hireShort: "Projekt anfragen",
    about: "Über mich",
    contact: "Schreib mir",
  },
  langSwitch: { label: "Sprache wählen", de: "Deutsch", en: "English" },
  footer: {
    copyright: "© 2026 Ben Kohler Digital Services · Ulm",
    blog: "Blog",
    cost: "Was kostet eine App?",
    ulm: "App-Entwickler Ulm",
    imprint: "Impressum",
    privacy: "Datenschutz",
    rss: "RSS",
    threads: "Threads",
  },
  blog: {
    title: "Blog",
    description: "Updates zu den Produkten von Ben Kohler und Einblicke in ihre Entwicklung.",
    heroTitle: "Was zwischen den Releases passiert.",
    heroText: "Updates, Entscheidungen und Dinge, die ich beim Entwickeln meiner Produkte lerne.",
    subscribe: "Per E-Mail abonnieren",
    rssFeed: "RSS-Feed",
    listLabel: "Blogbeiträge",
    empty: "Der erste Beitrag ist in Arbeit.",
    allPosts: "← Alle Beiträge",
    nextPost: "Den nächsten Beitrag nicht verpassen",
    rssTitle: "Ben Kohler Blog",
    rssDescription: "Updates zu meinen Produkten und Einblicke in ihre Entwicklung.",
  },
  notFound: {
    title: "Seite nicht gefunden",
    description: "Die angeforderte Seite wurde nicht gefunden.",
    heading: "Hier ist nichts.",
    text: "Die Seite wurde verschoben oder hat nie existiert.",
    home: "Zur Startseite",
    blog: "Zum Blog",
  },
  newsletter: {
    heading: "Neue Beiträge per E-Mail",
    copy: "Unregelmäßige Updates zu meinen Produkten und dem, was beim Entwickeln dahinter passiert.",
    emailLabel: "E-Mail-Adresse",
    placeholder: "du@beispiel.de",
    submit: "Updates abonnieren",
    legalBefore: "Nach der Anmeldung erhältst du eine Bestätigungsmail. Klicks auf Links in den E-Mails werden ausgewertet. Abmeldung jederzeit. Details im ",
    legalLink: "Datenschutz",
    legalAfter: ".",
    honeypot: "Website",
    pending: "Anmeldung wird gesendet …",
    success: "Fast geschafft: Bitte bestätige die Anmeldung über die E-Mail in deinem Postfach.",
    error: "Die Anmeldung konnte nicht gesendet werden.",
  },
  contact: {
    heading: "Schreib mir.",
    intro: "Du nutzt eines meiner Projekte, hast eine Frage oder Feedback dazu? Ich freue mich über jede Nachricht.",
    hireBefore: "Du brauchst eine App? ",
    hireLink: "Ich nehme auch Aufträge an →",
    topicLabel: "Worum geht es?",
    topicFeedback: "Frage oder Feedback zu einer App",
    topicProject: "App-Projekt anfragen",
    topicOther: "Sonstiges",
    nameLabel: "Name",
    emailLabel: "E-Mail-Adresse",
    messageLabel: "Nachricht",
    honeypot: "Website",
    submit: "Nachricht senden",
    legalBefore: "Ich verwende deine Angaben nur, um dir zu antworten. Details im ",
    legalLink: "Datenschutz",
    legalAfter: ".",
    pending: "Nachricht wird gesendet …",
    unavailable: "Das Formular ist gerade nicht verfügbar. Bitte versuche es später noch einmal.",
    error: "Die Nachricht konnte nicht gesendet werden.",
  },
};

export type UiStrings = typeof de;

const en: UiStrings = {
  skip: "Skip to content",
  nav: {
    label: "Main navigation",
    projects: "Projects",
    idea: "The idea behind it",
    blog: "Blog",
    hire: "Hire an app developer",
    hireShort: "Start a project",
    about: "About",
    contact: "Get in touch",
  },
  langSwitch: { label: "Choose language", de: "Deutsch", en: "English" },
  footer: {
    copyright: "© 2026 Ben Kohler Digital Services · Ulm, Germany",
    blog: "Blog",
    cost: "What does an app cost?",
    ulm: "App developer in Ulm",
    imprint: "Imprint (German)",
    privacy: "Privacy policy (German)",
    rss: "RSS",
    threads: "Threads",
  },
  blog: {
    title: "Blog",
    description: "Updates on Ben Kohler's products and a look at how they are built.",
    heroTitle: "What happens between releases.",
    heroText: "Updates, decisions and the things I learn while building my products.",
    subscribe: "Subscribe by email",
    rssFeed: "RSS feed",
    listLabel: "Blog posts",
    empty: "The first post is on its way.",
    allPosts: "← All posts",
    nextPost: "Don't miss the next post",
    rssTitle: "Ben Kohler Blog",
    rssDescription: "Updates on my products and a look at how they are built.",
  },
  notFound: {
    title: "Page not found",
    description: "The page you requested could not be found.",
    heading: "Nothing here.",
    text: "The page has moved or never existed.",
    home: "Back to the homepage",
    blog: "Go to the blog",
  },
  newsletter: {
    heading: "New posts by email",
    copy: "Occasional updates on my products and what goes on behind the scenes while I build them.",
    emailLabel: "Email address",
    placeholder: "you@example.com",
    submit: "Subscribe to updates",
    legalBefore: "After signing up you will get a confirmation email. Clicks on links in the emails are tracked. You can unsubscribe at any time. Details in the ",
    legalLink: "privacy policy (German)",
    legalAfter: ".",
    honeypot: "Website",
    pending: "Signing you up …",
    success: "Almost done: please confirm your subscription using the email in your inbox.",
    error: "We couldn't sign you up.",
  },
  contact: {
    heading: "Get in touch.",
    intro: "Do you use one of my projects, or have a question or some feedback? I'm happy to hear from you.",
    hireBefore: "Need an app? ",
    hireLink: "I also take on client work →",
    topicLabel: "What's it about?",
    topicFeedback: "Question or feedback about an app",
    topicProject: "Start an app project",
    topicOther: "Something else",
    nameLabel: "Name",
    emailLabel: "Email address",
    messageLabel: "Message",
    honeypot: "Website",
    submit: "Send message",
    legalBefore: "I only use your details to reply to you. More in the ",
    legalLink: "privacy policy (German)",
    legalAfter: ".",
    pending: "Sending your message …",
    unavailable: "The form isn't available right now. Please try again later.",
    error: "Your message couldn't be sent.",
  },
};

export const ui: Record<Lang, UiStrings> = { de, en };
