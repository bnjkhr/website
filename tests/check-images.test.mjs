import assert from "node:assert/strict";
import test from "node:test";
import { deflateSync } from "node:zlib";
import { findProblem } from "../scripts/check-images.mjs";

// Winzige, selbst gebaute Dateien: ein EXIF-Block mit genau einem Eintrag. Tag 0x8825 ist der
// Verweis auf die Standortdaten, 0x0112 die Ausrichtung. Echte Koordinaten kommen nicht vor.
function tiff(tag, littleEndian = true) {
  const block = Buffer.alloc(26);
  const u16 = (value, at) => (littleEndian ? block.writeUInt16LE(value, at) : block.writeUInt16BE(value, at));
  const u32 = (value, at) => (littleEndian ? block.writeUInt32LE(value, at) : block.writeUInt32BE(value, at));
  block.write(littleEndian ? "II" : "MM", 0, "latin1");
  u16(42, 2);
  u32(8, 4);
  u16(1, 8);
  u16(tag, 10);
  u16(4, 12);
  u32(1, 14);
  return block;
}
const GPS = 0x8825;
const ORIENTATION = 0x0112;

function jpeg(...segments) {
  const parts = segments.map((data) => {
    const head = Buffer.from([0xff, 0xe1, 0, 0]);
    head.writeUInt16BE(data.length + 2, 2);
    return Buffer.concat([head, data]);
  });
  return Buffer.concat([Buffer.from([0xff, 0xd8]), ...parts, Buffer.from([0xff, 0xd9])]);
}
const exif = (block) => Buffer.concat([Buffer.from("Exif\0\0", "latin1"), block]);

function png(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "latin1");
  return Buffer.concat([Buffer.from("\x89PNG\r\n\x1a\n", "latin1"), head, data, Buffer.alloc(4)]);
}

function webp(type, data) {
  const head = Buffer.alloc(20);
  head.write("RIFF", 0);
  head.writeUInt32LE(data.length + 12, 4);
  head.write("WEBP", 8);
  head.write(type, 12, "latin1");
  head.writeUInt32LE(data.length, 16);
  return Buffer.concat([head, data]);
}

const xmp = '<x:xmpmeta><rdf:Description exif:GPSLatitude="0,0N"/></x:xmpmeta>';

test("accepts images without location data", () => {
  assert.equal(findProblem("a.jpg", jpeg()), null);
  assert.equal(findProblem("a.jpg", jpeg(exif(tiff(ORIENTATION)))), null);
  assert.equal(findProblem("a.png", png("eXIf", tiff(ORIENTATION, false))), null);
  assert.equal(findProblem("a.webp", webp("EXIF", tiff(ORIENTATION))), null);
  assert.equal(findProblem("a.svg", Buffer.from("<svg/>")), null);
});

test("rejects a JPEG with a location entry in either byte order", () => {
  for (const littleEndian of [true, false]) {
    assert.ok(findProblem("a.jpg", jpeg(exif(tiff(GPS, littleEndian)))));
  }
});

test("rejects a second embedded block, as in appended preview images", () => {
  assert.ok(findProblem("a.JPEG", Buffer.concat([jpeg(), jpeg(exif(tiff(GPS)))])));
});

test("rejects PNG and WebP with a location entry", () => {
  assert.ok(findProblem("a.png", png("eXIf", tiff(GPS))));
  assert.ok(findProblem("a.webp", webp("EXIF", tiff(GPS))));
  assert.ok(findProblem("a.webp", webp("EXIF", exif(tiff(GPS)))));
});

test("rejects location data in XMP, also when compressed inside a PNG", () => {
  assert.ok(findProblem("a.jpg", jpeg(Buffer.from(`http://ns.adobe.com/xap/1.0/\0${xmp}`))));
  const compressed = Buffer.concat([Buffer.from("XML:com.adobe.xmp\0\x01\0\0\0", "latin1"), deflateSync(xmp)]);
  assert.ok(findProblem("a.png", png("iTXt", compressed)));
});

test("rejects location data in a hex-encoded PNG profile", () => {
  const profile = `\nexif\n      32\n${exif(tiff(GPS)).toString("hex")}\n`;
  const chunk = Buffer.concat([Buffer.from("Raw profile type exif\0\0", "latin1"), deflateSync(profile)]);
  assert.ok(findProblem("a.png", png("zTXt", chunk)));
});

test("rejects location data in an image embedded in an SVG", () => {
  const data = jpeg(exif(tiff(GPS))).toString("base64");
  assert.ok(findProblem("a.svg", Buffer.from(`<svg><image href="data:image/jpeg;base64,${data}"/></svg>`)));
});

test("rejects blocks it cannot read and formats it cannot check", () => {
  assert.ok(findProblem("a.png", png("eXIf", Buffer.from("II*\0\xff\xff\0\0", "latin1"))));
  for (const name of ["a.heic", "a.tiff", "a.avif", "a.mov", "a.mp4"]) {
    assert.ok(findProblem(name, Buffer.alloc(8)), name);
  }
});

test("ignores files that are not images", () => {
  assert.equal(findProblem("a.md", Buffer.from("exif:GPSLatitude")), null);
});
