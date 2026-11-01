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

assert_not_contains() {
  if rg -qF "$2" "$1"; then
    echo "FAIL: $3"
    exit 1
  fi
}

assert_file "dist/index.html"
assert_file "dist/blog/index.html"
assert_file "dist/blog/ein-eigener-ort-fuer-updates/index.html"
assert_file "dist/app-entwickeln-lassen/index.html"
assert_file "dist/rss.xml"
assert_file "dist/robots.txt"
assert_file "dist/images/og-default.png"
assert_file "dist/sitemap-index.xml"
assert_file "dist/fonts/Inter-latin.woff2"
assert_file "dist/images/indie-preview/familymanager-heute.png"

assert_contains "dist/index.html" 'href="/blog/"' "homepage does not link to the blog"
assert_contains "dist/index.html" 'Was zwischen den Releases passiert' "homepage blog section is missing"
assert_contains "dist/index.html" 'href="/app-entwickeln-lassen/"' "homepage does not link to the client page"
assert_contains "dist/app-entwickeln-lassen/index.html" 'aria-current="page"><span class="nav__long">App entwickeln' "client page does not mark its nav link as current"
assert_not_contains "dist/blog/index.html" 'aria-current="page"><span class="nav__long">App entwickeln' "blog must not mark the client page as current"
assert_not_contains "dist/404.html" 'aria-current="page"' "404 page must not mark a nav link as current"
assert_contains "dist/blog/index.html" 'data-newsletter-form' "newsletter form is missing"
assert_contains "dist/blog/index.html" 'ein-eigener-ort-fuer-updates' "published article is missing from the blog index"
assert_contains "dist/blog/ein-eigener-ort-fuer-updates/index.html" 'Ein eigener Ort für Updates' "article content is missing"
assert_contains "dist/rss.xml" 'ein-eigener-ort-fuer-updates' "article is missing from RSS"
assert_contains "api/newsletter-subscribe.js" 'createConfirmationToken' "double-opt-in start is missing"
assert_contains "api/newsletter-confirm.js" 'subscription: "opt_in"' "confirmed subscribers are not opted in"
assert_contains "api/contact.js" 'verifyFormToken' "contact form does not check its form token"
assert_contains "dist/index.html" 'data-contact-form' "contact form is missing on the homepage"
assert_not_contains "dist/index.html" 'mailto:' "homepage still exposes a mailto link"
assert_contains "scripts/create-newsletter-draft.mjs" 'send: false' "broadcast drafts must not send automatically"

assert_contains "dist/robots.txt" "sitemap-index.xml" "robots.txt does not point to the sitemap"
assert_contains "dist/index.html" 'application/ld\+json' "homepage has no structured data"
assert_contains "dist/app-entwickeln-lassen/index.html" '"@type":"FAQPage"' "client page has no FAQ structured data"
assert_contains "dist/app-entwickeln-lassen/index.html" 'og:image' "client page has no social image"
assert_contains "dist/app-entwickeln-lassen/index.html" 'Festpreis ab 999' "client page does not show the fixed price"
assert_contains "dist/app-entwickeln-lassen/index.html" '"minPrice":999' "client page has no price in structured data"
assert_file "dist/app-entwicklung-kosten/index.html"
assert_file "dist/app-entwickler-ulm/index.html"
assert_contains "dist/app-entwickeln-lassen/index.html" 'href="/app-entwicklung-kosten/"' "client page does not link to the cost guide"
assert_contains "dist/app-entwickeln-lassen/index.html" 'href="/app-entwickler-ulm/"' "client page does not link to the Ulm page"
assert_contains "dist/sitemap-0.xml" 'app-entwicklung-kosten' "cost guide is missing from the sitemap"
assert_contains "dist/sitemap-0.xml" 'app-entwickler-ulm' "Ulm page is missing from the sitemap"
assert_file "dist/blog/wie-laeuft-eine-app-entwicklung-ab/index.html"
assert_file "dist/blog/native-ios-app-oder-cross-plattform/index.html"
assert_contains "dist/app-entwickeln-lassen/index.html" 'id="beispiel-title"' "client page has no example app section"
assert_contains "dist/app-entwickeln-lassen/index.html" 'roadlight.pro' "client page does not mention Roadlight"
assert_file "dist/en/blog/index.html"
assert_file "dist/en/rss.xml"
assert_contains "dist/en/blog/index.html" '<html lang="en">' "English blog index has no lang=en"
assert_contains "dist/en/blog/index.html" 'What happens between releases' "English blog index has no English heading"
assert_contains "dist/en/blog/index.html" 'og:locale" content="en_US"' "English blog index has no en_US locale"
assert_contains "dist/en/blog/index.html" 'hreflang="de" href="https://benkohler.de/blog/"' "English blog index has no German alternate"
assert_contains "dist/en/blog/index.html" 'href="/en/rss.xml"' "English blog index does not link to the English feed"
assert_contains "dist/en/blog/index.html" 'href="/impressum.html" hreflang="de">Imprint \(German\)' "English footer does not mark the imprint as German"
assert_contains "dist/blog/index.html" 'hreflang="en" href="https://benkohler.de/en/blog/"' "German blog index has no English alternate"
assert_contains "dist/blog/index.html" 'hreflang="x-default" href="https://benkohler.de/blog/"' "German blog index has no x-default"
assert_contains "dist/blog/index.html" 'class="nav__lang"' "language switcher is missing on the blog"
assert_contains "dist/blog/index.html" 'data-lang="de" aria-current="true"' "language switcher does not mark German as active"
assert_contains "dist/blog/index.html" 'name="lang" value="de"' "newsletter form does not send its language"
assert_contains "dist/index.html" 'class="nav__lang"' "language switcher is missing on the homepage"
assert_contains "dist/index.html" 'hreflang="en" href="https://benkohler.de/en/"' "homepage has no English alternate"
assert_contains "dist/index.html" 'name="lang" value="de"' "contact form does not send its language"
assert_contains "dist/404.html" 'lang="en"' "404 page has no English text"
assert_contains "dist/sitemap-0.xml" 'hreflang="en-US" href="https://benkohler.de/en/blog/"' "sitemap has no hreflang alternates"
assert_file "dist/favicon.svg"
assert_file "dist/apple-touch-icon.png"
assert_file "dist/logo/logo.svg"
assert_contains "dist/index.html" 'rel="icon" href="/favicon.svg"' "homepage has no favicon link"
assert_contains "dist/index.html" 'google-site-verification' "homepage has no Search Console verification tag"
assert_contains "dist/impressum.html" 'DDG' "impressum still cites the TMG"

assert_contains "vercel.json" "frame-ancestors" "security headers are missing"
assert_contains "vercel.json" '"accept-language"' "language redirects are missing"
node scripts/gen-lang-redirects.mjs --check >/dev/null || { echo "FAIL: vercel.json redirects are out of date (npm run gen:redirects)"; exit 1; }
assert_not_contains "dist" "fonts.googleapis.com" "pages must not load Google Fonts"

echo "PASS: Astro blog, RSS and newsletter safeguards are configured"
