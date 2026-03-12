#!/bin/sh
set -eu

assert_contains() {
  file="$1"
  pattern="$2"
  message="$3"

  if ! rg -q "$pattern" "$file"; then
    echo "FAIL: $message"
    exit 1
  fi
}

assert_contains "index.html" 'class="apps-highlight-grid"' "apps highlight grid is missing"
assert_contains "index.html" 'app-card app-card--featured app-card--featured-family' "FamilyManager featured card class is missing"
assert_contains "index.html" 'iOS, Android, Web' "FamilyManager platform labels should list iOS, Android, Web"
assert_contains "index.html" 'app-card__status app-card__status--beta">Beta' "FamilyManager status should be Beta"
assert_contains "css/style.css" '^\.apps-highlight-grid \{' "apps highlight grid styles are missing"
assert_contains "css/style.css" 'grid-template-columns: repeat\(2, 1fr\);' "highlight grid should use two equal columns"
assert_contains "css/style.css" '^\.app-card--featured-family \{' "FamilyManager featured style is missing"
assert_contains "css/style.css" '#3D5BE0' "FamilyManager accent color should match landing page blue"

echo "PASS: featured app cards layout is configured"
