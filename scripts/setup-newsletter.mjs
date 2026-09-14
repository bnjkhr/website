import process from "node:process";
import { Resend } from "resend";

// Contact properties that api/newsletter-confirm.js stores as proof of consent.
// Resend rejects unknown properties, so they must exist before the first signup.
// Safe to run repeatedly: existing properties are left untouched.
const CONSENT_PROPERTIES = ["consent_requested_at", "consent_confirmed_at", "consent_version"];

if (!process.env.RESEND_API_KEY) {
  console.error("Fehlende Umgebungsvariable: RESEND_API_KEY");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const { data, error } = await resend.contactProperties.list();
if (error) {
  console.error("Resend konnte die Kontakt-Eigenschaften nicht laden:", error.message);
  process.exit(1);
}
if (data.has_more) {
  console.warn("Es gibt mehr Kontakt-Eigenschaften, als eine Seite liefert; bereits vorhandene werden eventuell erneut angelegt.");
}

const existing = new Set(data.data.map((property) => property.key));
for (const key of CONSENT_PROPERTIES) {
  if (existing.has(key)) {
    console.log(`Vorhanden: ${key}`);
    continue;
  }
  const created = await resend.contactProperties.create({ key, type: "string" });
  if (created.error) {
    console.error(`Resend konnte ${key} nicht anlegen:`, created.error.message);
    process.exit(1);
  }
  console.log(`Angelegt: ${key}`);
}
