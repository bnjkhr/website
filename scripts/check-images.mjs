// Bricht den Build ab, wenn ein Bild im Repo Standortdaten enthält. Das Repo ist öffentlich,
// deshalb zählt jedes Bild, nicht nur das unter public/. Werte werden nie ausgegeben.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const GPS_TAG = 0x8825; // Verweis vom ersten Verzeichnis eines EXIF-Blocks auf die Standortdaten
const CHECKED = /\.(jpe?g|jfif|png|webp|gif|svg)$/i;
const UNSUPPORTED = /\.(heic|heif|tiff?|dng|avif|mov|mp4|m4v|webm)$/i;
const SKIPPED_DIRS = new Set(["node_modules", "dist", ".git", ".astro", ".vercel", ".worktrees", ".claude", ".playwright-mcp"]);
const TIFF_START = /^(II\*\0|MM\0\*)/;
const XMP_LOCATION = /GPSLatitude|GPSLongitude/;
const LOCATION = "enthält Standortdaten";
const UNREADABLE = "enthält Metadaten, die sich nicht prüfen lassen";

function checkTiff(block) {
  const littleEndian = block.toString("latin1", 0, 2) === "II";
  const u16 = (at) => (littleEndian ? block.readUInt16LE(at) : block.readUInt16BE(at));
  const u32 = (at) => (littleEndian ? block.readUInt32LE(at) : block.readUInt32BE(at));
  try {
    const directory = u32(4);
    const entries = u16(directory);
    for (let i = 0; i < entries; i++) {
      if (u16(directory + 2 + i * 12) === GPS_TAG) return LOCATION;
    }
    return null;
  } catch {
    return UNREADABLE;
  }
}

// EXIF-Blöcke mit Kennung, wo auch immer sie liegen (auch in angehängten Vorschaubildern).
function checkBytes(bytes) {
  if (XMP_LOCATION.test(bytes.toString("latin1"))) return LOCATION;
  for (let at = bytes.indexOf("Exif\0\0"); at >= 0; at = bytes.indexOf("Exif\0\0", at + 1)) {
    const block = bytes.subarray(at + 6);
    if (!TIFF_START.test(block.toString("latin1", 0, 4))) continue;
    const problem = checkTiff(block);
    if (problem) return problem;
  }
  return null;
}

// PNG speichert Text auch komprimiert; ImageMagick legt EXIF dort hexkodiert ab.
function checkPngText(type, data) {
  try {
    return checkBytes(readPngText(type, data));
  } catch {
    return UNREADABLE;
  }
}

function readPngText(type, data) {
  const keyEnd = data.indexOf(0);
  let text;
  if (type === "tEXt") {
    text = data.subarray(keyEnd + 1);
  } else if (type === "zTXt") {
    text = inflateSync(data.subarray(keyEnd + 2));
  } else {
    // iTXt: Schlüssel, Kompressionsflag, Methode, Sprache, übersetzter Schlüssel, Text
    const compressed = data[keyEnd + 1] === 1;
    const languageEnd = data.indexOf(0, keyEnd + 3);
    text = data.subarray(data.indexOf(0, languageEnd + 1) + 1);
    if (compressed) text = inflateSync(text);
  }
  if (!data.toString("latin1", 0, keyEnd).startsWith("Raw profile type")) return text;
  const hex = text.toString("latin1").trim().split("\n").slice(2).join("");
  return Buffer.from(hex, "hex");
}

function checkPng(bytes) {
  for (let at = 8; at + 8 <= bytes.length;) {
    const length = bytes.readUInt32BE(at);
    const type = bytes.toString("latin1", at + 4, at + 8);
    const data = bytes.subarray(at + 8, at + 8 + length);
    let problem = null;
    if (type === "eXIf") problem = checkTiff(data);
    else if (type === "tEXt" || type === "zTXt" || type === "iTXt") problem = checkPngText(type, data);
    if (problem) return problem;
    at += 12 + length;
  }
  return null;
}

function checkWebp(bytes) {
  for (let at = 12; at + 8 <= bytes.length;) {
    const length = bytes.readUInt32LE(at + 4);
    const data = bytes.subarray(at + 8, at + 8 + length);
    // Mit Kennung „Exif“ findet checkBytes den Block bereits.
    if (bytes.toString("latin1", at, at + 4) === "EXIF" && TIFF_START.test(data.toString("latin1", 0, 4))) {
      const problem = checkTiff(data);
      if (problem) return problem;
    }
    at += 8 + length + (length % 2);
  }
  return null;
}

function checkSvg(bytes) {
  for (const [, type, data] of bytes.toString("utf8").matchAll(/data:image\/([\w+.-]+);base64,([A-Za-z0-9+/=\s]+)/g)) {
    const problem = findProblem(`embedded.${type === "svg+xml" ? "svg" : type}`, Buffer.from(data, "base64"));
    if (problem) return problem;
  }
  return null;
}

// Liefert den Grund, aus dem eine Datei nicht ins Repo darf, sonst null.
export function findProblem(name, bytes) {
  if (UNSUPPORTED.test(name)) return "Format lässt sich nicht prüfen, bitte als JPEG, PNG oder WebP speichern";
  if (!CHECKED.test(name)) return null;
  const problem = checkBytes(bytes);
  if (problem) return problem;
  if (bytes.toString("latin1", 1, 4) === "PNG") return checkPng(bytes);
  if (bytes.toString("latin1", 8, 12) === "WEBP") return checkWebp(bytes);
  if (/\.svg$/i.test(name)) return checkSvg(bytes);
  return null;
}

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) yield* files(join(dir, entry.name));
    } else if (CHECKED.test(entry.name) || UNSUPPORTED.test(entry.name)) {
      yield join(dir, entry.name);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ?? ".";
  let checked = 0;
  const problems = [];
  for (const path of files(root)) {
    checked++;
    const problem = findProblem(path, readFileSync(path));
    if (problem) problems.push(`  ${relative(root, path)}: ${problem}`);
  }
  if (problems.length > 0) {
    console.error(`Bildprüfung fehlgeschlagen:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log(`Bildprüfung: ${checked} Dateien ohne Standortdaten.`);
}
