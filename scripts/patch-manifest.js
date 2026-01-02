#!/usr/bin/env node

/**
 * Patch manifest.json with environment variables
 * Replaces __OAUTH_CLIENT_ID__ and __PUBLIC_KEY__ placeholders
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'dist', 'browser', 'manifest.json');

try {
  // Check if required environment variables are set
  if (!process.env.OAUTH_CLIENT_ID || !process.env.PUBLIC_KEY) {
    console.error('❌ Missing required environment variables: OAUTH_CLIENT_ID and/or PUBLIC_KEY');
    process.exit(1);
  }

  // Check if manifest file exists
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ Manifest file not found at: ${manifestPath}`);
    console.error('💡 Make sure to run "npm run build" first');
    process.exit(1);
  }

  // Read the manifest file
  let content = fs.readFileSync(manifestPath, 'utf8');

  // Replace all occurrences of placeholders with environment variables
  content = content
    .replaceAll('__OAUTH_CLIENT_ID__', process.env.OAUTH_CLIENT_ID)
    .replaceAll('__PUBLIC_KEY__', process.env.PUBLIC_KEY);

  // Write the patched content back
  fs.writeFileSync(manifestPath, content);

  console.log('✅ manifest.json patched successfully');
} catch (error) {
  console.error('❌ Error patching manifest.json:', error.message);
  process.exit(1);
}
