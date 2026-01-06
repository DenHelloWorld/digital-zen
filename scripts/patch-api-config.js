#!/usr/bin/env node

/**
 * Patch api-config.const.ts with environment variables
 * Replaces empty apiKey with API_SECRET_KEY from environment
 */

const fs = require('fs');
const path = require('path');

const apiConfigPath = path.join(
  __dirname,
  '..',
  'dist',
  'browser',
  'modules',
  'common',
  'constants',
  'api-config.const.js'
);

try {
  // Check if API_SECRET_KEY is set
  if (!process.env.API_SECRET_KEY) {
    console.warn('⚠️  API_SECRET_KEY not set - API requests will fail');
    console.log('💡 Set API_SECRET_KEY in .env file to enable API communication');
    process.exit(0);
  }

  // Check if api-config file exists
  if (!fs.existsSync(apiConfigPath)) {
    console.error(`❌ API config file not found at: ${apiConfigPath}`);
    console.error('💡 Make sure to run "npm run build" first');
    process.exit(1);
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

  console.log('✅ api-config.const.js patched with API_SECRET_KEY');
} catch (error) {
  console.error('❌ Error patching api-config.const.js:', error.message);
  process.exit(1);
}
