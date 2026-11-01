// Sprache und Antworttexte der API. Spiegelt src/i18n bewusst nicht: Die Vercel-
// Funktionen laden nur lib/ und api/, nicht den Astro-Quelltext.

export const LANGS = ["de", "en"];

// Nur "en" und "de" sind erlaubt; alles andere gilt als Deutsch.
export function toLang(value) {
  return value === "en" ? "en" : "de";
}

// Sprache einer Anfrage: Body (Formular), sonst Query (`?lang=` in Links und GET-Aufrufen).
export function requestLang(req, body = {}) {
  if (body?.lang) return toLang(body.lang);
  const query = req.query?.lang
    ?? (req.url ? new URL(req.url, "http://localhost").searchParams.get("lang") : undefined);
  return toLang(query);
}

export const messages = {
  de: {
    refresh: "Bitte lade die Seite neu und versuche es noch einmal.",
    turnstile: "Die Sicherheitsprüfung ist fehlgeschlagen. Bitte versuche es noch einmal.",
    invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
    status: {
      okTitle: "Fast geschafft.",
      failTitle: "Das hat nicht geklappt.",
      confirmButton: "Abo bestätigen",
      toBlog: "Zum Blog",
    },
    subscribe: {
      methodNotAllowed: "Diese Adresse akzeptiert nur Anmeldungen.",
      checkInbox: "Bitte bestätige die Anmeldung über die E-Mail in deinem Postfach.",
      unavailable: "Die Anmeldung ist gerade nicht verfügbar. Bitte versuche es später noch einmal.",
      sendFailed: "Die Bestätigungsmail konnte nicht gesendet werden. Bitte versuche es später noch einmal.",
      mail: {
        subject: "Bitte bestätige dein Blog-Abo",
        text: (url) => `Bestätige dein Abo für Updates von Ben Kohler:\n\n${url}\n\nDer Link ist 48 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.`,
        heading: "Bitte bestätige dein Abo",
        intro: "Ein Klick fehlt noch. Danach erhältst du neue Beiträge zu meinen Produkten und ihrer Entwicklung per E-Mail.",
        button: "Abo bestätigen",
        footnote: "Der Link ist 48 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.",
      },
    },
    confirm: {
      invalidLink: "Dieser Bestätigungslink ist ungültig.",
      unavailable: "Die Bestätigung ist gerade nicht verfügbar. Bitte versuche es später noch einmal.",
      expiredTitle: "Link nicht mehr gültig.",
      expiredMessage: "Der Bestätigungslink ist ungültig oder älter als 48 Stunden. Bitte melde dich erneut an.",
      askTitle: "Abo bestätigen?",
      ask: (email) => `Ein Klick noch: Bestätige, dass ${email} neue Beiträge per E-Mail erhalten soll.`,
      failed: "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es später noch einmal.",
      doneTitle: "Abo bestätigt.",
      doneMessage: "Du erhältst künftig neue Beiträge per E-Mail. Abmelden kannst du dich mit einem Klick in jeder Nachricht.",
    },
    token: {
      methodNotAllowed: "Diese Adresse akzeptiert nur GET-Anfragen.",
      unavailable: "Die Anmeldung ist gerade nicht verfügbar. Bitte versuche es später noch einmal.",
    },
    contact: {
      methodNotAllowed: "Diese Adresse akzeptiert nur Nachrichten per Formular.",
      thanks: "Danke, deine Nachricht ist angekommen.",
      unavailable: "Das Formular ist gerade nicht verfügbar. Bitte versuche es später noch einmal.",
      nameAndMessage: "Bitte gib Name und Nachricht an.",
      tooLong: "Name oder Nachricht sind zu lang.",
      sendFailed: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es später noch einmal.",
      doneTitle: "Danke!",
      doneMessage: "Deine Nachricht ist angekommen. Ich melde mich bei dir.",
    },
  },
  en: {
    refresh: "Please reload the page and try again.",
    turnstile: "The security check failed. Please try again.",
    invalidEmail: "Please enter a valid email address.",
    status: {
      okTitle: "Almost done.",
      failTitle: "That didn't work.",
      confirmButton: "Confirm subscription",
      toBlog: "Go to the blog",
    },
    subscribe: {
      methodNotAllowed: "This address only accepts newsletter signups.",
      checkInbox: "Please confirm your subscription using the email in your inbox.",
      unavailable: "Signing up isn't available right now. Please try again later.",
      sendFailed: "We couldn't send the confirmation email. Please try again later.",
      mail: {
        subject: "Please confirm your blog subscription",
        text: (url) => `Confirm your subscription to updates from Ben Kohler:\n\n${url}\n\nThe link is valid for 48 hours. If you didn't sign up, you can ignore this email.`,
        heading: "Please confirm your subscription",
        intro: "One more click. After that you'll receive new posts about my products and how they're built by email.",
        button: "Confirm subscription",
        footnote: "The link is valid for 48 hours. If you didn't sign up, you can ignore this email.",
      },
    },
    confirm: {
      invalidLink: "This confirmation link is invalid.",
      unavailable: "Confirming isn't available right now. Please try again later.",
      expiredTitle: "This link is no longer valid.",
      expiredMessage: "The confirmation link is invalid or older than 48 hours. Please sign up again.",
      askTitle: "Confirm your subscription?",
      ask: (email) => `One more click: please confirm that ${email} should receive new posts by email.`,
      failed: "We couldn't confirm your subscription. Please try again later.",
      doneTitle: "Subscription confirmed.",
      doneMessage: "You'll now receive new posts by email. You can unsubscribe with one click in any message.",
    },
    token: {
      methodNotAllowed: "This address only accepts GET requests.",
      unavailable: "Signing up isn't available right now. Please try again later.",
    },
    contact: {
      methodNotAllowed: "This address only accepts messages sent through the form.",
      thanks: "Thanks, your message has arrived.",
      unavailable: "The form isn't available right now. Please try again later.",
      nameAndMessage: "Please enter your name and a message.",
      tooLong: "Your name or message is too long.",
      sendFailed: "Your message couldn't be sent. Please try again later.",
      doneTitle: "Thank you!",
      doneMessage: "Your message has arrived. I'll get back to you.",
    },
  },
};
