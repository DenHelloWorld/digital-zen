#!/usr/bin/env node

/**
 * Patch manifest.json with environment variables
 * Replaces __OAUTH_CLIENT_ID__ and __PUBLIC_KEY__ placeholders
 * Works with the new dual-build system (dist/chromium/ and dist/firefox/)
 */

const fs = require('fs');
const path = require('path');

/**
 * Patch a single manifest file
 */
function patchManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return false;
  }

  // Read the manifest file
  let content = fs.readFileSync(manifestPath, 'utf8');

  // Replace all occurrences of placeholders with environment variables
  content = content
    .replaceAll('__OAUTH_CLIENT_ID__', process.env.OAUTH_CLIENT_ID)
    .replaceAll('__PUBLIC_KEY__', process.env.PUBLIC_KEY);

  // Write the patched content back
  fs.writeFileSync(manifestPath, content);

  return true;
}

try {
  // Check if required environment variables are set
  if (!process.env.OAUTH_CLIENT_ID || !process.env.PUBLIC_KEY) {
    console.error('❌ Missing required environment variables: OAUTH_CLIENT_ID and/or PUBLIC_KEY');
    process.exit(1);
  }

  const distDir = path.join(__dirname, '..', 'dist');
  let patchedCount = 0;

  // Try to patch Chromium build
  const chromiumManifest = path.join(distDir, 'chromium', 'manifest.json');
  if (patchManifest(chromiumManifest)) {
    console.log('✅ dist/chromium/manifest.json patched successfully');
    patchedCount++;
  }

  // Try to patch Firefox build (though Firefox doesn't use these fields)
  const firefoxManifest = path.join(distDir, 'firefox', 'manifest.json');
  if (patchManifest(firefoxManifest)) {
    console.log('✅ dist/firefox/manifest.json patched successfully');
    patchedCount++;
  }

  // Try to patch legacy browser build (for backward compatibility)
  const browserManifest = path.join(distDir, 'browser', 'manifest.json');
  if (patchManifest(browserManifest)) {
    console.log('✅ dist/browser/manifest.json patched successfully');
    patchedCount++;
  }

  if (patchedCount === 0) {
    console.error('❌ No manifest.json files found in dist/ directory');
    console.error('💡 Make sure to run "npm run build" first');
    process.exit(1);
  }

  console.log(`✅ Patched ${patchedCount} manifest file(s)`);
} catch (error) {
  console.error('❌ Error patching manifest.json:', error.message);
  process.exit(1);
}
