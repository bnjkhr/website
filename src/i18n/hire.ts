// Texte der Seite „App entwickeln lassen“ / „Hire an app developer“.
// Markup und Stil liegen in src/views/Hire.astro.

import type { Lang } from "./index";

export interface HireStrings {
  seo: { title: string; description: string };
  breadcrumb: { home: string; hire: string };
  areaServed: string;
  priceRange: string;
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    cta: string;
    secondary: string;
  };
  facts: { value: string; label: string }[];
  platformsSection: { title: string; text: string };
  platforms: { name: string; claim: string; text: string }[];
  offerSection: { title: string; before: string; linkText: string; after: string };
  offerLabels: { price: string; duration: string };
  offers: { name: string; claim: string; text: string; price: string; duration: string; featured?: boolean }[];
  roadlight: { title: string; before: string; linkText: string; after: string };
  exampleSection: { title: string; text: string; included: string; excluded: string; note: string };
  example: { name: string; pitch: string; included: string[]; excluded: string[] };
  proofSection: { title: string; before: string; linkText: string; after: string };
  proofs: { name: string; text: string; meta: string; href: string }[];
  stepsSection: { title: string };
  steps: { title: string; text: string }[];
  faqSection: { title: string };
  faqs: { q: string; a: string }[];
  contact: { title: string; before: string; ulmLink: string; button: string };
}

const de: HireStrings = {
  seo: {
    title: "App entwickeln lassen: iPhone, iPad, Mac und Web",
    description: "App entwickeln lassen zum Festpreis ab 999 €: Ben Kohler aus Ulm baut Apps fürs Apple-Ökosystem, bundesweit, mit wöchentlichen Testständen.",
  },
  breadcrumb: { home: "Startseite", hire: "App entwickeln lassen" },
  areaServed: "Deutschland",
  priceRange: "ab 999 €",
  hero: {
    eyebrow: "App-Entwicklung · Ulm · bundesweit",
    title: "App entwickeln lassen: für iPhone, iPad, Mac und Web.",
    lede: "Ich bin Ben Kohler, Entwickler aus Ulm. Ich baue Apps im Auftrag, vom ersten Entwurf bis in den App Store, zum Festpreis ab 999 €. Ich arbeite immer nur an einem Projekt gleichzeitig, du hast also eine feste Ansprechperson.",
    cta: "Festpreis anfragen",
    secondary: "Was ich anbiete",
  },
  facts: [
    { value: "ab 999 €", label: "Festpreis, vorher schriftlich" },
    { value: "Jede Woche", label: "neuer Stand auf deinem iPhone" },
    { value: "Bundesweit", label: "remote, aus Ulm" },
    { value: "1 Projekt", label: "gleichzeitig, mit voller Aufmerksamkeit" },
  ],
  platformsSection: {
    title: "Wofür ich Apps baue.",
    text: "Der Schwerpunkt liegt auf Apple. Dort kann ich die Qualität liefern, die du von meinen eigenen Apps kennst.",
  },
  platforms: [
    {
      name: "Apple-Ökosystem",
      claim: "Mein Schwerpunkt.",
      text: "iPhone, iPad und Mac, nativ mit Swift und SwiftUI. Die App fühlt sich an wie von Apple und läuft schnell, auch offline. Veröffentlicht wird sie in deinem eigenen App-Store-Konto.",
    },
    {
      name: "Web",
      claim: "Gehört immer dazu.",
      text: "Zu jeder App gehören Website, Datenschutzerklärung und Support-Seite, ohne die der App Store sie nicht annimmt. Die Seiten baue ich. Domain und Webspace laufen auf deinen Namen: Ich richte sie dir ein und kümmere mich darum, die laufenden Kosten trägst du. Wo es sinnvoll ist, baue ich auch eine Web-Oberfläche.",
    },
    {
      name: "Android",
      claim: "Geht auf Anfrage.",
      text: "Wenn deine Nutzer auch Android haben, besprechen wir im ersten Gespräch den passenden Weg. Der Schwerpunkt bleibt Apple, damit die Qualität stimmt.",
    },
  ],
  offerSection: {
    title: "Was ich anbiete.",
    before: "Zwei Pakete. Bei der ersten Version bekommst du einen Festpreis ab 999 €. Den genauen Betrag nennt dir das Angebot nach dem ersten Gespräch, bevor irgendetwas losgeht. Wie sich der Preis zusammensetzt, steht im ",
    linkText: "Kostenratgeber",
    after: ".",
  },
  offerLabels: { price: "Preis", duration: "Dauer" },
  offers: [
    {
      name: "Erste Version",
      claim: "Das Starterpaket: für eine Idee, die noch keine App ist.",
      text: "Wir legen zusammen fest, was in die erste Version muss und was warten kann. Dann baue ich sie. Jede Woche landet ein neuer Stand über TestFlight auf deinem iPhone.",
      price: "Festpreis ab 999 €",
      duration: "Termin steht im Angebot",
      featured: true,
    },
    {
      name: "Weiterentwicklung",
      claim: "Für eine App, die schon im Store ist.",
      text: "Ich reserviere dir feste Tage im Monat. Darin baue ich neue Funktionen, passe die App an neue iOS-Versionen an und kümmere mich um das, was deine Nutzer melden.",
      price: "Nach Absprache",
      duration: "monatlich kündbar",
    },
  ],
  roadlight: {
    title: "Feedback deiner Nutzer, ohne Aufpreis.",
    before: "Wer bei mir eine App entwickeln lässt, kann ",
    linkText: "Roadlight",
    after: " kostenlos mitnutzen, wenn er möchte: ein Board, auf dem deine Nutzer Wünsche einreichen und darüber abstimmen, mit öffentlicher Roadmap und Changelog. Ich habe Roadlight selbst gebaut und sammle damit das Feedback zu meinen eigenen Apps. Für dich kostet es keine zusätzliche Gebühr.",
  },
  exampleSection: {
    title: "Ein Beispiel für das Starterpaket.",
    text: "Ab 999 € bekommst du eine kleine, klar umrissene App. So kann das aussehen. Das Beispiel ist ausgedacht und zeigt den Umfang, nicht ein fertiges Produkt.",
    included: "Im Starterpaket",
    excluded: "Nicht im Starterpaket",
    note: "Brauchst du etwas davon, wird das Angebot größer. Wir besprechen es im ersten Gespräch, und du siehst den Preis, bevor ich anfange.",
  },
  example: {
    name: "Gießplan",
    pitch: "Eine App, die dich ans Gießen deiner Zimmerpflanzen erinnert.",
    included: [
      "Liste deiner Pflanzen mit Name, Foto und Gießrhythmus",
      "Erinnerung per Mitteilung, wenn eine Pflanze Wasser braucht",
      "Ein Tippen auf „gegossen“ setzt den Rhythmus neu",
      "Drei Bildschirme: Übersicht, Pflanze, Einstellungen",
      "Daten bleiben auf dem Gerät, keine Anmeldung",
      "Website mit Datenschutzerklärung und Support-Seite (Domain und Webspace laufen auf deinen Namen)",
      "Auf Wunsch Roadlight für Nutzerfeedback, ohne Aufpreis",
      "Veröffentlichung in deinem App-Store-Konto, Quellcode für dich",
    ],
    excluded: [
      "Konto und Anmeldung",
      "Abgleich zwischen mehreren Geräten oder Nutzern",
      "Bezahlfunktion oder Abo",
      "Eigene Server und Datenbank",
      "Eine Version für Android",
    ],
  },
  proofSection: {
    title: "Meine eigenen Apps.",
    before: "An ihnen kannst du sehen, wie ich arbeite. Was sich an ihnen jede Woche ändert, schreibe ich ",
    linkText: "im Blog",
    after: " auf.",
  },
  proofs: [
    { name: "FamilyManager", text: "Termine, Aufgaben und Einkäufe für Familien, auch über mehrere Haushalte hinweg.", meta: "iPhone", href: "https://familymanager.pro/landing" },
    { name: "GymBo", text: "Trainingstagebuch fürs iPhone.", meta: "iPhone", href: "https://gymbo.benkohler.de/" },
    { name: "Track4Kids", text: "Kinder entdecken Lebensmittel mit Karten und Arenen.", meta: "iPhone · Beta", href: "https://track4kids.de/" },
    { name: "StarTune", text: "Songs schneller favorisieren.", meta: "macOS · Live", href: "https://startune.benkohler.de/" },
  ],
  stepsSection: { title: "So läuft es ab." },
  steps: [
    { title: "Erstes Gespräch", text: "Wir telefonieren eine halbe Stunde. Du erzählst von deiner App, ich stelle Fragen. Das Gespräch kostet nichts." },
    { title: "Festpreis-Angebot", text: "Du bekommst schriftlich, was ich baue, was es kostet und wann es fertig ist. Der Preis steht vorher fest." },
    { title: "Entwicklung", text: "Jede Woche ein neuer Stand auf deinem iPhone. Wenn dir etwas nicht gefällt, merken wir das früh." },
    { title: "Übergabe", text: "Die App läuft in deinem App-Store-Konto. Du bekommst den Code und eine Beschreibung, wie alles zusammenhängt." },
  ],
  faqSection: { title: "Fragen und Antworten." },
  faqs: [
    { q: "Was kostet es, eine App entwickeln zu lassen?", a: "Meine Festpreise beginnen bei 999 €. Was am Ende im Angebot steht, hängt vom Umfang ab: wie viele Bildschirme, ob die App ein Konto und eine Datenbank braucht und ob sie mit anderen Diensten spricht. Nach dem ersten Gespräch bekommst du den Preis schriftlich, bevor irgendetwas losgeht." },
    { q: "Was bedeutet Festpreis?", a: "Du zahlst genau den Betrag aus dem Angebot, auch wenn die Entwicklung länger dauert als geplant. Änderungen am Umfang besprechen wir vorher und halten sie schriftlich fest." },
    { q: "Was muss ich selbst bezahlen?", a: "Die laufenden Kosten laufen auf deinen Namen: das Entwicklerkonto bei Apple sowie Domain und Webspace für die Website zur App. Ich richte das alles für dich ein und kümmere mich darum, bezahlt wird es von dir. So gehört dir später alles und du bist nicht von mir abhängig." },
    { q: "Für welche Geräte baust du Apps?", a: "Mein Schwerpunkt ist das Apple-Ökosystem: iPhone, iPad und Mac, mit Swift und SwiftUI. Eine Website zur App baue ich immer mit. Domain und Webspace dafür buchst du auf deinen Namen, die laufenden Kosten trägst du. Android geht auf Anfrage, den passenden Weg klären wir im ersten Gespräch." },
    { q: "Arbeitest du nur in Ulm?", a: "Nein, ich arbeite bundesweit. Das meiste läuft über Video und Mail. Wenn du in der Nähe von Ulm bist, können wir uns auch treffen." },
    { q: "Wann kannst du anfangen?", a: "Das hängt davon ab, ob gerade ein anderes Projekt läuft. Ich arbeite immer nur an einem gleichzeitig und sage dir im ersten Gespräch, wann es losgehen kann." },
    { q: "Wie bekomme ich Feedback von meinen Nutzern?", a: "Wenn du möchtest, nutzt du Roadlight mit, ein Feedback-Board mit Abstimmung, öffentlicher Roadmap und Changelog. Ich habe es selbst gebaut und nutze es für meine eigenen Apps. Für meine Kunden ist es kostenlos, ohne extra Gebühr." },
    { q: "Wem gehört die App und der Code?", a: "Dir. Die App läuft in deinem App-Store-Konto, und du bekommst den Quellcode mit einer Beschreibung, wie alles zusammenhängt." },
    { q: "Welche Apps passen zu dir?", a: "Apps für den Alltag: Familie, Organisation, Gesundheit, Training. An diesen Themen arbeite ich auch bei meinen eigenen Apps." },
    { q: "Was machst du nicht?", a: "Spiele. Und Projekte, die in zwei Wochen fertig sein müssen." },
  ],
  contact: {
    title: "Erzähl mir von deiner App.",
    before: "Schreib mir ein paar Sätze: was die App können soll, für wen sie ist und bis wann du sie brauchst. Ich antworte innerhalb von zwei Werktagen. Aus Ulm oder der Region? ",
    ulmLink: "Hier geht es zur Seite für Ulm und Neu-Ulm.",
    button: "Projekt anfragen",
  },
};

const en: HireStrings = {
  seo: {
    title: "Hire an app developer: iPhone, iPad, Mac and web",
    description: "Hire an app developer at a fixed price from €999: Ben Kohler, based in Ulm, Germany, builds apps for the Apple ecosystem, working remotely, with weekly test builds.",
  },
  breadcrumb: { home: "Home", hire: "Hire an app developer" },
  areaServed: "Germany",
  priceRange: "from €999",
  hero: {
    eyebrow: "App development · Ulm, Germany · remote",
    title: "Hire an app developer: for iPhone, iPad, Mac and web.",
    lede: "I'm Ben Kohler, a developer based in Ulm, Germany. I build apps for clients, from the first sketch to the App Store, at a fixed price from €999. I only work on one project at a time, so you always have the same person to talk to.",
    cta: "Ask for a fixed price",
    secondary: "What I offer",
  },
  facts: [
    { value: "from €999", label: "fixed price, in writing up front" },
    { value: "Every week", label: "a new build on your iPhone" },
    { value: "Remote", label: "across Germany, from Ulm" },
    { value: "1 project", label: "at a time, with my full attention" },
  ],
  platformsSection: {
    title: "What I build apps for.",
    text: "My focus is Apple. That is where I can deliver the quality you know from my own apps.",
  },
  platforms: [
    {
      name: "Apple ecosystem",
      claim: "My focus.",
      text: "iPhone, iPad and Mac, native with Swift and SwiftUI. The app feels like it came from Apple and runs fast, even offline. It is published in your own App Store account.",
    },
    {
      name: "Web",
      claim: "Always part of it.",
      text: "Every app needs a website, a privacy policy and a support page, or the App Store won't accept it. I build those pages. Domain and hosting are registered in your name: I set them up and take care of them, you pay the running costs. Where it makes sense, I also build a web interface.",
    },
    {
      name: "Android",
      claim: "On request.",
      text: "If your users are on Android too, we'll talk through the right approach in the first call. My focus stays on Apple so the quality holds up.",
    },
  ],
  offerSection: {
    title: "What I offer.",
    before: "Two packages. For the first version you get a fixed price from €999. The exact amount comes in the quote after our first call, before anything starts. How the price is made up is explained in the ",
    linkText: "cost guide",
    after: ".",
  },
  offerLabels: { price: "Price", duration: "Duration" },
  offers: [
    {
      name: "First version",
      claim: "The starter package: for an idea that isn't an app yet.",
      text: "Together we decide what has to be in the first version and what can wait. Then I build it. Every week a new build lands on your iPhone through TestFlight.",
      price: "Fixed price from €999",
      duration: "Date stated in the quote",
      featured: true,
    },
    {
      name: "Ongoing development",
      claim: "For an app that is already in the store.",
      text: "I reserve set days each month for you. In that time I build new features, adapt the app to new iOS versions and deal with what your users report.",
      price: "By arrangement",
      duration: "cancel monthly",
    },
  ],
  roadlight: {
    title: "Feedback from your users, at no extra cost.",
    before: "If you have me build your app, you can use ",
    linkText: "Roadlight",
    after: " for free if you like: a board where your users submit requests and vote on them, with a public roadmap and changelog. I built Roadlight myself and use it to collect feedback on my own apps. For you it costs no additional fee.",
  },
  exampleSection: {
    title: "An example of the starter package.",
    text: "From €999 you get a small, clearly defined app. This is what that can look like. The example is made up and shows the scope, not a finished product.",
    included: "In the starter package",
    excluded: "Not in the starter package",
    note: "If you need any of these, the quote gets bigger. We'll talk it through in the first call, and you see the price before I start.",
  },
  example: {
    name: "Watering Plan",
    pitch: "An app that reminds you to water your houseplants.",
    included: [
      "List of your plants with name, photo and watering interval",
      "Notification when a plant needs water",
      "One tap on “watered” resets the interval",
      "Three screens: overview, plant, settings",
      "Data stays on the device, no sign-in",
      "Website with privacy policy and support page (domain and hosting registered in your name)",
      "Roadlight for user feedback on request, at no extra cost",
      "Published in your App Store account, source code handed over to you",
    ],
    excluded: [
      "Account and sign-in",
      "Syncing between several devices or users",
      "Payments or subscriptions",
      "Your own servers and database",
      "An Android version",
    ],
  },
  proofSection: {
    title: "My own apps.",
    before: "They show how I work. What changes in them each week, I write up ",
    linkText: "on the blog",
    after: ".",
  },
  proofs: [
    { name: "FamilyManager", text: "Appointments, tasks and shopping for families, across several households.", meta: "iPhone", href: "https://familymanager.pro/landing" },
    { name: "GymBo", text: "A workout log for iPhone.", meta: "iPhone", href: "https://gymbo.benkohler.de/" },
    { name: "Track4Kids", text: "Kids discover food with cards and arenas.", meta: "iPhone · Beta", href: "https://track4kids.de/" },
    { name: "StarTune", text: "Favorite songs faster.", meta: "macOS · Live", href: "https://startune.benkohler.de/" },
  ],
  stepsSection: { title: "How it works." },
  steps: [
    { title: "First call", text: "We talk for half an hour. You tell me about your app, I ask questions. The call is free." },
    { title: "Fixed-price quote", text: "You get in writing what I'll build, what it costs and when it will be ready. The price is fixed up front." },
    { title: "Development", text: "A new build on your iPhone every week. If something isn't right, we notice early." },
    { title: "Handover", text: "The app runs in your App Store account. You get the code and a description of how everything fits together." },
  ],
  faqSection: { title: "Questions and answers." },
  faqs: [
    { q: "What does it cost to have an app developed?", a: "My fixed prices start at €999. What ends up in the quote depends on the scope: how many screens, whether the app needs an account and a database, and whether it talks to other services. After the first call you get the price in writing, before anything starts." },
    { q: "What does fixed price mean?", a: "You pay exactly the amount in the quote, even if development takes longer than planned. We discuss any change in scope beforehand and put it in writing." },
    { q: "What do I have to pay for myself?", a: "The running costs are registered in your name: the Apple developer account, plus domain and hosting for the app's website. I set it all up and take care of it, but you pay for it. That way you own everything later and don't depend on me." },
    { q: "Which devices do you build apps for?", a: "My focus is the Apple ecosystem: iPhone, iPad and Mac, with Swift and SwiftUI. I always build a website for the app as well. You register the domain and hosting in your name and pay the running costs. Android is possible on request; we'll work out the right approach in the first call." },
    { q: "Do you only work in Ulm?", a: "No, I work with clients across Germany. Most of it happens over video and email. If you are near Ulm, we can also meet in person." },
    { q: "When can you start?", a: "That depends on whether another project is running at the moment. I only work on one at a time, and I'll tell you in the first call when I can begin." },
    { q: "How do I get feedback from my users?", a: "If you like, you can use Roadlight, a feedback board with voting, a public roadmap and a changelog. I built it myself and use it for my own apps. For my clients it is free, with no extra fee." },
    { q: "Who owns the app and the code?", a: "You do. The app runs in your App Store account, and you get the source code with a description of how everything fits together." },
    { q: "Which apps suit you?", a: "Everyday apps: family, organization, health, training. These are the same topics I work on in my own apps." },
    { q: "What don't you do?", a: "Games. And projects that have to be finished in two weeks." },
  ],
  contact: {
    title: "Tell me about your app.",
    before: "Write me a few sentences: what the app should do, who it is for and when you need it. I reply within two working days. From Ulm or the surrounding area? ",
    ulmLink: "Here is the page for Ulm and Neu-Ulm.",
    button: "Start a project",
  },
};

export const hire: Record<Lang, HireStrings> = { de, en };
