#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/../data/raw"
BASE="https://papers.xtremepape.rs/CAIE/AS%20and%20A%20Level/Biology%20(9700)"

CODES=(
  "m19_42" "s19_41" "s19_42" "s19_43" "w19_41" "w19_42"
  "m20_42" "s20_41" "s20_42" "s20_43" "w20_41" "w20_42"
  "m21_42" "s21_41" "s21_42" "s21_43" "w21_41" "w21_42"
)

for code in "${CODES[@]}"; do
  sess="${code%_*}"
  var="${code#*_}"
  for kind in qp ms; do
    file="9700_${sess}_${kind}_${var}.pdf"
    if [ -s "$file" ] && [ "$(wc -c < "$file")" -gt 10000 ]; then
      echo "skip $file"
      continue
    fi
    echo "fetch $file"
    curl -sL -A "Mozilla/5.0" -o "$file" "$BASE/$file"
    sleep 0.2
  done
done

echo "---"
ls -la *.pdf | wc -l
echo "files total"
