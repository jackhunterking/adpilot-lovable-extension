#!/usr/bin/env node
/**
 * Validate manifest.json for Chrome Web Store submission
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'manifest.json');

console.log('🔍 Validating manifest.json...\n');

try {
  // Read and parse manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  let errors = [];
  let warnings = [];
  
  // Required fields
  if (!manifest.manifest_version) {
    errors.push('Missing manifest_version');
  } else if (manifest.manifest_version !== 3) {
    warnings.push('Manifest version 2 is deprecated, use version 3');
  }
  
  if (!manifest.name) {
    errors.push('Missing name');
  }
  
  if (!manifest.version) {
    errors.push('Missing version');
  }
  
  if (!manifest.description) {
    errors.push('Missing description');
  }
  
  // Check icons
  if (!manifest.icons) {
    errors.push('Missing icons');
  } else {
    const requiredSizes = [16, 48, 128];
    requiredSizes.forEach(size => {
      if (!manifest.icons[size]) {
        errors.push(`Missing icon for size ${size}`);
      } else {
        const iconPath = path.join(__dirname, '..', manifest.icons[size]);
        if (!fs.existsSync(iconPath)) {
          errors.push(`Icon file not found: ${manifest.icons[size]}`);
        }
      }
    });
  }
  
  // Check required files
  if (manifest.background && manifest.background.service_worker) {
    const swPath = path.join(__dirname, '..', manifest.background.service_worker);
    if (!fs.existsSync(swPath)) {
      errors.push(`Service worker not found: ${manifest.background.service_worker}`);
    }
  }
  
  if (manifest.content_scripts) {
    manifest.content_scripts.forEach((script, index) => {
      if (script.js) {
        script.js.forEach(jsFile => {
          const jsPath = path.join(__dirname, '..', jsFile);
          if (!fs.existsSync(jsPath)) {
            errors.push(`Content script not found: ${jsFile}`);
          }
        });
      }
    });
  }
  
  // Warnings for best practices
  if (!manifest.homepage_url) {
    warnings.push('Consider adding homepage_url');
  }
  
  if (manifest.permissions && manifest.permissions.length > 5) {
    warnings.push('Large number of permissions may raise review flags');
  }
  
  // Print results
  console.log('Manifest Version:', manifest.manifest_version);
  console.log('Name:', manifest.name);
  console.log('Version:', manifest.version);
  console.log('Description:', manifest.description);
  console.log('');
  
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(err => console.log(`  - ${err}`));
    console.log('');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warn => console.log(`  - ${warn}`));
    console.log('');
  }
  
  console.log('✅ Manifest is valid!');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Error reading manifest.json:', error.message);
  process.exit(1);
}

