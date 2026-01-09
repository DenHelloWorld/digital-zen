#!/usr/bin/env node

/**
 * Patch extension-config for Firefox build
 * This script injects the OAuth client ID into the bundled background.js for Firefox
 *
 * IMPORTANT: OAuth client ID must be set in .env file
 * Example: OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
 */

const fs = require('fs');
const path = require('path');

const backgroundPath = path.join(__dirname, '..', 'dist', 'browser', 'background.js');

try {
  // Check if OAuth client ID is set in environment
  if (!process.env.OAUTH_CLIENT_ID) {
    console.error('❌ OAUTH_CLIENT_ID not found in .env file');
    console.error('💡 Add OAUTH_CLIENT_ID to your .env file');
    console.error('   Example: OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    process.exit(1);
  }

  const clientId = process.env.OAUTH_CLIENT_ID;

  // Check if background.js exists (bundled by esbuild)
  if (!fs.existsSync(backgroundPath)) {
    console.error(`❌ Background script not found at: ${backgroundPath}`);
    console.error('💡 Make sure to run bundle:background first');
    process.exit(1);
  }

  // Read the bundled background script
  let backgroundContent = fs.readFileSync(backgroundPath, 'utf8');

  // Replace the placeholder with actual client ID
  if (backgroundContent.includes('__OAUTH_CLIENT_ID__')) {
    backgroundContent = backgroundContent.replaceAll('__OAUTH_CLIENT_ID__', clientId);
    fs.writeFileSync(backgroundPath, backgroundContent);
    console.log('✅ Injected OAuth Client ID from .env into Firefox background.js');
  } else {
    console.warn('⚠️  No OAuth Client ID placeholder found in background.js');
    console.warn(
      "   Make sure src/extension-config.ts contains: OAUTH_CLIENT_ID: '__OAUTH_CLIENT_ID__'"
    );
  }
} catch (error) {
  console.error('❌ Error patching background.js for Firefox:', error.message);
  process.exit(1);
}
