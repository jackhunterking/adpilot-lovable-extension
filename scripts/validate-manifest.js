#!/usr/bin/env node
/**
 * Validate manifest.json for Chrome Web Store submission
 * Usage: node validate-manifest.js [path/to/manifest.json]
 */

const fs = require('fs');
const path = require('path');

// Accept manifest path as argument or use default
const manifestPath = process.argv[2] || path.join(__dirname, '..', 'manifest.json');
const isProduction = manifestPath.includes('production') || process.argv.includes('--production');

console.log('🔍 Validating manifest...');
console.log('📄 Path:', manifestPath);
if (isProduction) {
  console.log('🏭 Mode: Production (strict checks enabled)');
}
console.log('');

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
  
  // Production-specific checks
  if (isProduction) {
    console.log('🔒 Running production-readiness checks...\n');
    
    // Check for development URLs
    const manifestStr = JSON.stringify(manifest);
    if (manifestStr.includes('localhost')) {
      errors.push('Production manifest should not contain localhost URLs');
    }
    if (manifestStr.includes('127.0.0.1')) {
      errors.push('Production manifest should not contain 127.0.0.1 URLs');
    }
    if (manifestStr.includes('staging')) {
      warnings.push('Production manifest contains staging URLs');
    }
    
    // Check version format
    const versionMatch = manifest.version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!versionMatch) {
      errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
    }
    
    // Check that we're at least version 1.0.0 for production
    if (versionMatch) {
      const major = parseInt(versionMatch[1]);
      if (major === 0) {
        warnings.push('Consider using version 1.0.0+ for production release');
      }
    }
    
    // Check description length (Chrome Web Store requires 132 chars minimum for featured listings)
    if (manifest.description.length < 50) {
      warnings.push('Description is quite short - consider adding more detail');
    }
    
    // Check for homepage_url
    if (!manifest.homepage_url || manifest.homepage_url.includes('localhost')) {
      errors.push('Production manifest must have a valid homepage_url');
    }
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

