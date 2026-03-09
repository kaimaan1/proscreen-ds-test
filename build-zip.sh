#!/bin/bash
# Pakkaa assets/test-dynamic/ ZIP-tiedostoksi
# Simuloi tuotantomallia: ZIP puretaan BrightSign SD-kortille

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/assets/test-dynamic"
OUT_FILE="$SCRIPT_DIR/test-dynamic.zip"

if [ ! -d "$SRC_DIR" ]; then
  echo "VIRHE: $SRC_DIR ei löydy"
  exit 1
fi

# Poista vanha ZIP jos olemassa
rm -f "$OUT_FILE"

cd "$SRC_DIR"
zip -r "$OUT_FILE" . -x "*/.*"
cd "$SCRIPT_DIR"

echo ""
echo "✓ ZIP luotu: $OUT_FILE"
echo "  Koko: $(du -h "$OUT_FILE" | cut -f1)"
echo ""
echo "Käyttö BrightSignissa:"
echo "  1. Pura ZIP SD-kortin juureen"
echo "  2. Varmista että index.html on SD-kortin juuressa"
