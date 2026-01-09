#!/usr/bin/env node

/**
 * Patch src/extension-config.ts with OAuth client ID from .env file BEFORE build
 * This script replaces the placeholder in SOURCE file, then restores it after build
 *
 * IMPORTANT: OAuth client ID must be set in .env file
 * Example: OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'src', 'extension-config.ts');

try {
  // Check if OAuth client ID is set in environment
  if (!process.env.OAUTH_CLIENT_ID) {
    console.error('❌ OAUTH_CLIENT_ID not found in .env file');
    console.error('💡 Add OAUTH_CLIENT_ID to your .env file');
    console.error('   Example: OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    process.exit(1);
  }

  const clientId = process.env.OAUTH_CLIENT_ID;

  // Read the source config file
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Replace the placeholder with actual client ID
  if (configContent.includes("'__OAUTH_CLIENT_ID__'")) {
    configContent = configContent.replaceAll("'__OAUTH_CLIENT_ID__'", `'${clientId}'`);
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Injected OAuth Client ID from .env into src/extension-config.ts');
  } else {
    console.log('⚠️  OAuth Client ID already set or placeholder not found');
  }
} catch (error) {
  console.error('❌ Error patching extension-config.ts:', error.message);
  process.exit(1);
}
