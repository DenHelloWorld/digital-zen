#!/usr/bin/env node

/**
 * Patch manifest.json with environment variables
 * Replaces __OAUTH_CLIENT_ID__ and __PUBLIC_KEY__ placeholders
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'dist', 'browser', 'manifest.json');

try {
  // Read the manifest file
  let content = fs.readFileSync(manifestPath, 'utf8');

  // Replace placeholders with environment variables
  content = content
    .replace('__OAUTH_CLIENT_ID__', process.env.OAUTH_CLIENT_ID || '__OAUTH_CLIENT_ID__')
    .replace('__PUBLIC_KEY__', process.env.PUBLIC_KEY || '__PUBLIC_KEY__');

  // Write the patched content back
  fs.writeFileSync(manifestPath, content);

  console.log('✅ manifest.json patched successfully');
} catch (error) {
  console.error('❌ Error patching manifest.json:', error.message);
  process.exit(1);
}
