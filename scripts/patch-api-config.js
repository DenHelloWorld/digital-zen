#!/usr/bin/env node

/**
 * Patch api-config.const.ts with environment variables
 * Replaces empty apiKey with API_SECRET_KEY from environment
 * Works with the new dual-build system (dist/chromium/ and dist/firefox/)
 */

const fs = require('fs');
const path = require('path');

/**
 * Patch a single api-config file
 */
function patchApiConfig(apiConfigPath) {
  if (!fs.existsSync(apiConfigPath)) {
    return false;
  }

  // Read the api-config file
  let content = fs.readFileSync(apiConfigPath, 'utf8');

  // Escape special characters in the API key for use in String.replace() replacement strings
  // In replacement strings, $ has special meaning (e.g. $1, $2 are backreferences)
  // To insert a literal $ from the API key, we must escape it by replacing $ with $$
  // This ensures the API key is inserted literally in the replacement string, not interpreted as replacement syntax
  const escapedApiKey = process.env.API_SECRET_KEY.replace(/\$/g, '$$$$');

  // Replace empty apiKey with actual value
  // The pattern matches apiKey inside the exported API_CONFIG object
  content = content.replace(
    /(export\s+const\s+API_CONFIG[\s\S]*?apiKey:\s*['"])(['"])/,
    `$1${escapedApiKey}$2`
  );

  // Write the patched content back
  fs.writeFileSync(apiConfigPath, content);

  return true;
}

try {
  // Check if API_SECRET_KEY is set
  if (!process.env.API_SECRET_KEY) {
    console.warn('⚠️  API_SECRET_KEY not set - API requests will fail');
    console.log('💡 Set API_SECRET_KEY in .env file to enable API communication');
    process.exit(0);
  }

  const distDir = path.join(__dirname, '..', 'dist');
  let patchedCount = 0;

  // Try to patch Chromium build
  const chromiumConfig = path.join(
    distDir,
    'chromium',
    'modules',
    'common',
    'constants',
    'api-config.const.js'
  );
  if (patchApiConfig(chromiumConfig)) {
    console.log('✅ dist/chromium/.../api-config.const.js patched with API_SECRET_KEY');
    patchedCount++;
  }

  // Try to patch Firefox build
  const firefoxConfig = path.join(
    distDir,
    'firefox',
    'modules',
    'common',
    'constants',
    'api-config.const.js'
  );
  if (patchApiConfig(firefoxConfig)) {
    console.log('✅ dist/firefox/.../api-config.const.js patched with API_SECRET_KEY');
    patchedCount++;
  }

  // Try to patch legacy browser build (for backward compatibility)
  const browserConfig = path.join(
    distDir,
    'browser',
    'modules',
    'common',
    'constants',
    'api-config.const.js'
  );
  if (patchApiConfig(browserConfig)) {
    console.log('✅ dist/browser/.../api-config.const.js patched with API_SECRET_KEY');
    patchedCount++;
  }

  if (patchedCount === 0) {
    console.error('❌ No api-config.const.js files found in dist/ directory');
    console.error('💡 Make sure to run "npm run build" first');
    process.exit(1);
  }

  console.log(`✅ Patched ${patchedCount} api-config file(s)`);
} catch (error) {
  console.error('❌ Error patching api-config.const.js:', error.message);
  process.exit(1);
}
