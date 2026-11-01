// Texte der Seite „Was kostet eine App?“ (DE: /app-entwicklung-kosten/, EN: /en/app-development-cost/).
// In den HTML-Texten stehen {hire} als Platzhalter für den Pfad der Seite „App entwickeln lassen“ (siehe src/views/Cost.astro).
import type { Lang } from "./index";

export interface CostCopy {
  title: string;
  layoutTitle: string;
  description: string;
  inLanguage: string;
  breadcrumbs: { home: string; hire: string; current: string };
  back: string;
  intro: string;
  priceHeading: string;
  priceItems: string[];
  modelHeading: string;
  model: string;
  chargeHeading: string;
  charge: string[];
  goodHeading: string;
  goodItems: string[];
  runningHeading: string;
  running: string;
  afterHeading: string;
  after: string;
  findHeading: string;
  find: string;
  cta: { heading: string; text: string; button: string };
}

const de: CostCopy = {
  title: "Was kostet es, eine App entwickeln zu lassen?",
  layoutTitle: "Was kostet eine App?",
  description: "Was eine App kostet, hängt vom Umfang ab, nicht vom Stundensatz. Warum ich zum Festpreis ab 999 € arbeite und woran du ein gutes Angebot erkennst.",
  inLanguage: "de-DE",
  breadcrumbs: { home: "Startseite", hire: "App entwickeln lassen", current: "Kosten" },
  back: "← App entwickeln lassen",
  intro: "Auf diese Frage gibt es keine Pauschalantwort, und wer dir eine nennt, ohne deine App zu kennen, rät. Was du bezahlst, hängt davon ab, wie viel gebaut werden muss. Hier ist, woraus sich der Preis zusammensetzt und woran du ein gutes Angebot erkennst.",
  priceHeading: "Was den Preis bestimmt",
  priceItems: [
    "<strong>Bildschirme und Funktionen:</strong> Eine App mit drei Bildschirmen ist weniger Arbeit als eine mit dreißig.",
    "<strong>Konto und Datenbank:</strong> Sobald Nutzer sich anmelden oder Daten zwischen Geräten abgleichen sollen, kommt ein Server dazu.",
    "<strong>Anbindung an andere Dienste:</strong> Bezahlung, Karten, Kalender, Gesundheitsdaten oder eine bestehende Schnittstelle.",
    "<strong>Design:</strong> Eine App im Stil von Apple ist schneller gebaut als eine mit ganz eigener Gestaltung und Animationen.",
    "<strong>Plattformen:</strong> Eine App für das iPhone ist günstiger als dieselbe App für iPhone, iPad, Mac und Android.",
  ],
  modelHeading: "Stundensatz oder Festpreis",
  model: "Bei Abrechnung nach Aufwand steht der Preis erst am Ende fest. Du trägst das Risiko, wenn etwas länger dauert. Beim Festpreis steht der Betrag vorher im Angebot, zusammen mit dem, was dafür gebaut wird. Dauert es länger, trage ich das. Dafür legen wir den Umfang vorher fest, und Änderungen besprechen wir, bevor ich sie baue.",
  chargeHeading: "Was ich berechne",
  charge: [
    "Meine Festpreise für die erste Version einer App beginnen bei <strong>999&nbsp;€</strong>. Das ist das Starterpaket für klar umrissene Apps mit überschaubarem Umfang, zum Beispiel eine App ohne Anmeldung und ohne Server, mit drei Bildschirmen. <a href=\"{hire}#beispiel-title\">Hier siehst du ein Beispiel.</a> Je mehr die App können soll, desto höher das Angebot. Den genauen Betrag bekommst du nach einem ersten Gespräch schriftlich, bevor irgendetwas losgeht.",
    "Enthalten ist, was zu einer App gehört, die du veröffentlichen kannst: die Entwicklung, jede Woche ein neuer Stand per TestFlight, der Bau der Website zur App mit Datenschutzerklärung und Support-Seite, die Veröffentlichung in deinem App-Store-Konto und die Übergabe des Quellcodes. Auf Wunsch kommt <a href=\"https://roadlight.pro\" rel=\"noopener\">Roadlight</a> dazu, mein Feedback-Board für Nutzerwünsche, ohne Aufpreis.",
  ],
  goodHeading: "Woran du ein gutes Angebot erkennst",
  goodItems: [
    "Es steht schriftlich da, <strong>was</strong> gebaut wird, nicht nur wie viel es kostet.",
    "Der Preis ist ein Festpreis oder hat eine klare Obergrenze.",
    "Die App läuft in <strong>deinem</strong> App-Store-Konto, und der Quellcode gehört dir.",
    "Du siehst regelmäßig einen lauffähigen Stand, nicht erst am Ende.",
    "Der Anbieter zeigt Apps, die er selbst gebaut hat und die im Store sind.",
  ],
  runningHeading: "Laufende Kosten, die bei dir liegen",
  running: "Drei Posten laufen auf deinen Namen und werden von dir bezahlt: das Entwicklerkonto bei Apple, die Domain und der Webspace für die Website zur App. Ich richte sie dir ein und kümmere mich darum, die Rechnungen gehen aber an dich. So gehört dir später alles.",
  afterHeading: "Was nach dem Start kostet",
  after: "Eine App ist mit der Veröffentlichung nicht fertig. Apple bringt jedes Jahr ein neues iOS, Nutzer melden Fehler und wünschen sich Funktionen. Dafür gibt es bei mir die Weiterentwicklung: feste Tage im Monat, monatlich kündbar. Dazu kommen die laufenden Kosten von oben.",
  findHeading: "So findest du heraus, was deine App kostet",
  find: "Schreib mir ein paar Sätze: was die App können soll, für wen sie ist und bis wann du sie brauchst. Wir telefonieren eine halbe Stunde, das kostet nichts. Danach bekommst du ein schriftliches Angebot mit Festpreis.",
  cta: {
    heading: "Festpreis für deine App anfragen.",
    text: "Ab 999&nbsp;€. Ich antworte innerhalb von zwei Werktagen.",
    button: "Projekt anfragen",
  },
};

const en: CostCopy = {
  title: "What does it cost to have an app developed?",
  layoutTitle: "What does an app cost?",
  description: "What an app costs depends on its scope, not on an hourly rate. Why I work at a fixed price from €999, and how to recognise a good proposal.",
  inLanguage: "en",
  breadcrumbs: { home: "Home", hire: "Hire an app developer", current: "Cost" },
  back: "← Hire an app developer",
  intro: "There is no flat answer to this question, and anyone who gives you one without knowing your app is guessing. What you pay depends on how much has to be built. Here is what the price is made of and how to recognise a good proposal.",
  priceHeading: "What determines the price",
  priceItems: [
    "<strong>Screens and features:</strong> An app with three screens is less work than one with thirty.",
    "<strong>Accounts and database:</strong> As soon as users need to sign in or data has to sync between devices, a server comes into play.",
    "<strong>Connections to other services:</strong> Payments, maps, calendars, health data or an existing API.",
    "<strong>Design:</strong> An app in Apple's own style is quicker to build than one with a fully custom look and animations.",
    "<strong>Platforms:</strong> An app for the iPhone costs less than the same app for iPhone, iPad, Mac and Android.",
  ],
  modelHeading: "Hourly rate or fixed price",
  model: "When billing by effort, the price is only known at the end. You carry the risk if something takes longer. With a fixed price, the amount is in the proposal up front, together with what will be built for it. If it takes longer, that's on me. In return we agree the scope beforehand, and we discuss any changes before I build them.",
  chargeHeading: "What I charge",
  charge: [
    "My fixed prices for the first version of an app start at <strong>€999</strong>. That is the starter package for clearly defined apps of manageable scope, for example an app with three screens and no sign-in or server. <a href=\"{hire}#beispiel-title\">Here is an example.</a> The more the app needs to do, the higher the quote. You get the exact amount in writing after a first conversation, before anything begins.",
    "It includes everything that goes with an app you can publish: the development, a new build every week through TestFlight, a website for the app with a privacy policy and a support page, the release in your own App Store account and the handover of the source code. On request, <a href=\"https://roadlight.pro\" rel=\"noopener\">Roadlight</a> comes with it at no extra charge, my feedback board for user requests.",
  ],
  goodHeading: "How to recognise a good proposal",
  goodItems: [
    "It states in writing <strong>what</strong> will be built, not only how much it costs.",
    "The price is a fixed price or has a clear upper limit.",
    "The app runs in <strong>your</strong> App Store account, and the source code belongs to you.",
    "You regularly see a working build, not only at the end.",
    "The provider can show apps they built themselves that are in the store.",
  ],
  runningHeading: "Running costs that are yours",
  running: "Three items run in your name and are paid by you: the Apple developer account, the domain and the hosting for the app's website. I set them up for you and take care of them, but the invoices go to you. That way you own everything in the end.",
  afterHeading: "What costs money after launch",
  after: "An app isn't finished once it's released. Apple ships a new iOS every year, and users report bugs and ask for features. For that I offer ongoing development: fixed days each month, cancellable monthly. On top of that come the running costs above.",
  findHeading: "How to find out what your app costs",
  find: "Send me a few sentences: what the app should do, who it's for and when you need it. We talk for half an hour, at no cost. After that you receive a written proposal with a fixed price.",
  cta: {
    heading: "Ask for a fixed price for your app.",
    text: "From €999. I reply within two working days.",
    button: "Start a project",
  },
};

export const cost: Record<Lang, CostCopy> = { de, en };
