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
    console.warn(`⚠️  Extension config file not found at: ${configPath}`);
    console.warn(
      '💡 This is expected if Angular bundled it into the main bundle or if running Firefox build'
    );
    console.warn('   OAuth will be configured from the bundled Angular app or skipped');
    console.log('✅ Skipping extension-config.js patching (file will be created by Angular build)');
    process.exit(0); // Exit successfully - this is not a fatal error
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
