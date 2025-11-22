#!/bin/bash
# Package extension for Chrome Web Store
# Usage: ./scripts/package.sh [production|staging|development]

set -e

# Environment detection
ENV=${1:-production}

echo "📦 Packaging AdPilot for Lovable extension..."
echo "🌍 Environment: $ENV"
echo ""

# Get version from manifest.json
VERSION=$(node -p "require('./manifest.json').version")

# Create temp and dist directories
mkdir -p dist
mkdir -p dist/temp

# Copy base files to temp directory
echo "📋 Copying extension files..."
cp -r background dist/temp/
cp -r content dist/temp/
cp -r ui dist/temp/
cp -r assets dist/temp/
cp -r types dist/temp/
[ -d services ] && cp -r services dist/temp/ || true

# Handle manifest based on environment
if [ "$ENV" = "production" ]; then
  echo "🏭 Production build - using clean manifest (no dev URLs)"
  if [ -f "manifest.production.json" ]; then
    cp manifest.production.json dist/temp/manifest.json
  else
    echo "⚠️  Warning: manifest.production.json not found, using default manifest.json"
    cp manifest.json dist/temp/manifest.json
  fi
  ZIP_NAME="adpilot-lovable-extension-v${VERSION}.zip"
elif [ "$ENV" = "staging" ]; then
  echo "🧪 Staging build - including staging URLs"
  cp manifest.json dist/temp/manifest.json
  ZIP_NAME="adpilot-lovable-extension-v${VERSION}-staging.zip"
else
  echo "🔧 Development build - including all URLs"
  cp manifest.json dist/temp/manifest.json
  ZIP_NAME="adpilot-lovable-extension-v${VERSION}-dev.zip"
fi

# Validate manifest
echo "✅ Validating manifest..."
node scripts/validate-manifest.js dist/temp/manifest.json

# Create zip file from temp directory
echo "📦 Creating ${ZIP_NAME}..."
cd dist/temp
zip -r "../${ZIP_NAME}" . -x "*.git*" "*.DS_Store" "*.svg" "*.md"
cd ../..

# Clean up temp directory
rm -rf dist/temp

echo ""
echo "✅ Package created: dist/${ZIP_NAME}"
echo ""
echo "📊 Package info:"
ls -lh "dist/${ZIP_NAME}"
echo ""

if [ "$ENV" = "production" ]; then
  echo "🚀 Production package ready for Chrome Web Store!"
  echo ""
  echo "Next steps:"
  echo "1. Go to https://chrome.google.com/webstore/devconsole"
  echo "2. Click 'New Item' (or 'Upload Updated Package')"
  echo "3. Upload dist/${ZIP_NAME}"
  echo ""
  echo "⚠️  Before uploading, ensure:"
  echo "   - Production backend is deployed and tested"
  echo "   - All features are working correctly"
  echo "   - Privacy policy and terms are accessible"
  echo "   - Screenshots and promotional images are ready"
elif [ "$ENV" = "staging" ]; then
  echo "🧪 Staging package ready for testing!"
  echo ""
  echo "To test:"
  echo "1. Go to chrome://extensions"
  echo "2. Enable Developer mode"
  echo "3. Extract dist/${ZIP_NAME}"
  echo "4. Click 'Load unpacked' and select the extracted folder"
else
  echo "🔧 Development package ready!"
  echo ""
  echo "To test:"
  echo "1. Go to chrome://extensions"
  echo "2. Enable Developer mode"
  echo "3. Extract dist/${ZIP_NAME}"
  echo "4. Click 'Load unpacked' and select the extracted folder"
fi

