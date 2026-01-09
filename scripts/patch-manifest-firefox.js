#!/usr/bin/env node

/**
 * Patch manifest.json for Firefox compatibility
 * - Replaces __OAUTH_CLIENT_ID__ and __PUBLIC_KEY__ placeholders (if env vars are set)
 * - Converts service_worker to scripts format for Firefox
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

  // Patch OAuth client ID and public key if environment variables are set
  if (process.env.OAUTH_CLIENT_ID) {
    manifestContent = manifestContent.replaceAll(
      '__OAUTH_CLIENT_ID__',
      process.env.OAUTH_CLIENT_ID
    );
    manifest.oauth2.client_id = process.env.OAUTH_CLIENT_ID;
    console.log('✅ OAuth Client ID patched');
  }

  if (process.env.PUBLIC_KEY) {
    manifestContent = manifestContent.replaceAll('__PUBLIC_KEY__', process.env.PUBLIC_KEY);
    manifest.key = process.env.PUBLIC_KEY;
    console.log('✅ Public Key patched');
  }

  // Re-parse after patching
  manifest = JSON.parse(manifestContent);

  // Convert service_worker to scripts for Firefox compatibility
  if (manifest.background && manifest.background.service_worker) {
    manifest.background = {
      scripts: [manifest.background.service_worker],
    };
    console.log('✅ Converted background.service_worker to background.scripts for Firefox');
  }

  // Write the patched content back
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('✅ manifest.json patched successfully for Firefox');
  console.log('📦 Firefox build ready in dist/browser/');
} catch (error) {
  console.error('❌ Error patching manifest.json:', error.message);
  process.exit(1);
}
