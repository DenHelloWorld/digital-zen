#!/usr/bin/env node

/**
 * Patch extension-config.js with OAuth client ID from .env file
 * This script injects the OAuth client ID into the compiled extension-config.js
 *
 * IMPORTANT: OAuth client ID must be set in .env file
 * Example: OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'dist', 'browser', 'extension-config.js');

try {
  // Check if OAuth client ID is set in environment
  if (!process.env.OAUTH_CLIENT_ID) {
    console.error('❌ OAUTH_CLIENT_ID not found in .env file');
    console.error('💡 Add OAUTH_CLIENT_ID to your .env file');
    console.error('   Example: OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    process.exit(1);
  }

  const clientId = process.env.OAUTH_CLIENT_ID;

  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  Extension config file not found at: ${configPath}`);
    console.warn('💡 This is expected if Angular bundled it into the main bundle');
    console.log('✅ Skipping extension-config.js patching');
    process.exit(0); // Exit successfully - this is not a fatal error
  }

  // Read the compiled config file
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Replace the placeholder with actual client ID
  if (configContent.includes('__OAUTH_CLIENT_ID__')) {
    configContent = configContent.replaceAll('__OAUTH_CLIENT_ID__', clientId);
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Injected OAuth Client ID from .env into extension-config.js');
  } else {
    console.warn('⚠️  No OAuth Client ID placeholder found in extension-config.js');
    console.warn(
      "   Make sure src/extension-config.ts contains: OAUTH_CLIENT_ID: '__OAUTH_CLIENT_ID__'"
    );
  }
} catch (error) {
  console.error('❌ Error patching extension-config.js:', error.message);
  process.exit(1);
}
