#!/usr/bin/env node

/**
 * Patch manifest.json for Firefox compatibility
 * - Converts service_worker to scripts format for Firefox
 * - Removes Chrome-specific fields (oauth2, key) that Firefox doesn't support
 *
 * Note: OAuth functionality is preserved via extension-config.ts which is patched
 * by patch-extension-config.js to include the OAuth client ID.
 * This universal approach works for all browsers.
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'dist', 'browser', 'manifest.json');

try {
  // Check if manifest file exists
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Manifest file not found at: ${manifestPath}`);
    console.error('💡 Make sure to run "npm run build" first');
    process.exit(1);
  }

  // Read the manifest file
  let manifestContent = fs.readFileSync(manifestPath, 'utf8');
  let manifest = JSON.parse(manifestContent);

  // Convert service_worker to scripts for Firefox compatibility
  if (manifest.background && manifest.background.service_worker) {
    manifest.background = {
      scripts: [manifest.background.service_worker],
    };
    console.log('✅ Converted background.service_worker to background.scripts for Firefox');
  }

  // Remove Chrome-specific fields that Firefox doesn't support
  if (manifest.oauth2) {
    delete manifest.oauth2;
    console.log('✅ Removed oauth2 field (Chrome-specific, not supported in Firefox)');
    console.log('   ℹ️  OAuth client ID provided via extension-config.js instead');
  }

  if (manifest.key) {
    delete manifest.key;
    console.log('✅ Removed key field (Chrome-specific, not supported in Firefox)');
  }

  // Write the patched content back
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('✅ manifest.json patched successfully for Firefox');
  console.log('📦 Firefox build ready in dist/browser/');
  console.log('');
  console.log('✨ OAuth authentication will work in Firefox using extension-config.js');
} catch (error) {
  console.error('❌ Error patching manifest.json:', error.message);
  process.exit(1);
}
