#!/usr/bin/env node

/**
 * Patch extension-config.js with OAuth client ID
 * This script injects the OAuth client ID into the compiled extension-config.js
 *
 * Universal approach for all browsers - reads from environment or manifest
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'dist', 'browser', 'extension-config.js');
const manifestPath = path.join(__dirname, '..', 'src', 'manifest.json');

try {
  // Read the manifest to get the OAuth client ID
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const clientIdFromManifest = manifest.oauth2?.client_id || '__OAUTH_CLIENT_ID__';

  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Extension config file not found at: ${configPath}`);
    console.error('💡 Make sure the build process compiled extension-config.ts');
    process.exit(1);
  }

  // Read the compiled config file
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Use environment variable if set, otherwise use manifest value
  const clientId = process.env.OAUTH_CLIENT_ID || clientIdFromManifest;

  // Replace the placeholder with actual client ID
  configContent = configContent.replaceAll('__OAUTH_CLIENT_ID__', clientId);

  // Write the patched content back
  fs.writeFileSync(configPath, configContent);

  if (process.env.OAUTH_CLIENT_ID) {
    console.log('✅ Injected OAuth Client ID from environment variable into extension-config.js');
  } else {
    console.log('✅ Injected OAuth Client ID from manifest into extension-config.js');
  }
} catch (error) {
  console.error('❌ Error patching extension-config.js:', error.message);
  process.exit(1);
}
