import nodemailer from "nodemailer";

// SMTP-Versand über iCloud Mail (Custom Domain benkohler.de).
// Auth braucht ein App-spezifisches Passwort von appleid.apple.com,
// nicht das normale Apple-ID-Passwort.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mail.me.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // 587 nutzt STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(JSON.stringify({ success: false, message: "Method not allowed" }));
    return;
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, message: "Server configuration error" }));
    return;
  }

  const body = req.body || {};
  const honeypot = body.website || "";
  if (honeypot) {
    // Silent success: bots should think it worked.
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, message: "OK" }));
    return;
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    res.statusCode = 400;
    res.end(JSON.stringify({ success: false, message: "Bitte alle Felder ausfüllen" }));
    return;
  }

  // Keep validation simple; the browser already validates the email field.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ success: false, message: "Ungültige E-Mail-Adresse" }));
    return;
  }

  const to = "mail@benkohler.de";
  // Absender muss eine in iCloud konfigurierte Adresse der Domain sein.
  const from = process.env.SMTP_FROM || "Ben Kohler Website <mail@benkohler.de>";
  const subject = `Kontakt von Website: ${name}`;

  // Escape minimal HTML. (Message is wrapped in <pre> to preserve newlines.)
  const esc = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const html = [
    "<h2>Neue Kontaktanfrage</h2>",
    `<p><strong>Name:</strong> ${esc(name)}</p>`,
    `<p><strong>E-Mail:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`,
    "<p><strong>Nachricht:</strong></p>",
    `<pre style="white-space:pre-wrap;word-wrap:break-word;font-family:inherit">${esc(message)}</pre>`,
    "<hr>",
    `<p style="color:#666;font-size:12px">Gesendet am: ${new Date().toISOString()}</p>`,
  ].join("");

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject,
      html,
    });

    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, message: "E-Mail erfolgreich gesendet" }));
  } catch (e) {
    console.error("SMTP send failed:", e);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, message: "Fehler beim Senden der E-Mail" }));
  }
}
