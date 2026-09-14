#!/bin/sh
set -eu

assert_file() {
  if [ ! -f "$1" ]; then
    echo "FAIL: missing $1"
    exit 1
  fi
}

assert_contains() {
  if ! rg -q "$2" "$1"; then
    echo "FAIL: $3"
    exit 1
  fi
}

assert_file "dist/index.html"
assert_file "dist/blog/index.html"
assert_file "dist/blog/ein-eigener-ort-fuer-updates/index.html"
assert_file "dist/rss.xml"
assert_file "dist/sitemap-index.xml"
assert_file "dist/fonts/Inter-latin.woff2"
assert_file "dist/images/indie-preview/familymanager-heute.png"

assert_contains "dist/index.html" 'href="/blog/"' "homepage does not link to the blog"
assert_contains "dist/index.html" 'Was zwischen den Releases passiert' "homepage blog section is missing"
assert_contains "dist/blog/index.html" 'data-newsletter-form' "newsletter form is missing"
assert_contains "dist/blog/index.html" 'ein-eigener-ort-fuer-updates' "published article is missing from the blog index"
assert_contains "dist/blog/ein-eigener-ort-fuer-updates/index.html" 'Ein eigener Ort für Updates' "article content is missing"
assert_contains "dist/rss.xml" 'ein-eigener-ort-fuer-updates' "article is missing from RSS"
assert_contains "api/newsletter-subscribe.js" 'createConfirmationToken' "double-opt-in start is missing"
assert_contains "api/newsletter-confirm.js" 'subscription: "opt_in"' "confirmed subscribers are not opted in"
assert_contains "scripts/create-newsletter-draft.mjs" 'send: false' "broadcast drafts must not send automatically"

echo "PASS: Astro blog, RSS and newsletter safeguards are configured"
