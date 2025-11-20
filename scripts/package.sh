#!/bin/bash
# Package extension for Chrome Web Store

set -e

echo "📦 Packaging AdPilot for Lovable extension..."

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Create dist directory
mkdir -p dist

# Create zip file
ZIP_NAME="adpilot-lovable-extension-v${VERSION}.zip"

echo "Creating ${ZIP_NAME}..."

zip -r "dist/${ZIP_NAME}" \
  manifest.json \
  background/ \
  content/ \
  services/ \
  ui/ \
  assets/*.png \
  types/ \
  -x "*.git*" "*.DS_Store" "*.svg" "*.md"

echo "✅ Package created: dist/${ZIP_NAME}"
echo ""
echo "Next steps:"
echo "1. Go to https://chrome.google.com/webstore/devconsole"
echo "2. Click 'New Item'"
echo "3. Upload dist/${ZIP_NAME}"

