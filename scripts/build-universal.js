#!/usr/bin/env node

/**
 * Universal build script for Digital Zen extension
 * Supports ALL browsers: Chrome, Edge, Brave, Opera, Vivaldi, Firefox
 * 
 * Usage:
 *   npm run build          - Build for Chrome/Edge/Brave (standard build)
 *   npm run build:firefox  - Build for Firefox (bundled background)
 * 
 * Requirements:
 *   - .env file with OAUTH_CLIENT_ID
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FIREFOX = process.argv.includes('--firefox');
const extensionConfigPath = path.join(__dirname, '..', 'src', 'extension-config.ts');
const apiConfigPath = path.join(__dirname, '..', 'src', 'modules', 'common', 'constants', 'api-config.const.ts');
const manifestPath = path.join(__dirname, '..', 'dist', 'browser', 'manifest.json');

// Store original configs for restoration
let originalExtensionConfig = '';
let originalApiConfig = '';

function cleanup() {
  if (originalExtensionConfig) {
    fs.writeFileSync(extensionConfigPath, originalExtensionConfig);
    console.log('✅ Restored original extension-config.ts');
  }
  if (originalApiConfig) {
    fs.writeFileSync(apiConfigPath, originalApiConfig);
    console.log('✅ Restored original api-config.const.ts');
  }
}

// Ensure cleanup on exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(143);
});

try {
  console.log('🚀 Building Digital Zen Extension');
  console.log(`📦 Target: ${FIREFOX ? 'Firefox' : 'Chrome/Edge/Brave/Opera/Vivaldi'}`);
  console.log('');

  // Step 1: Validate OAuth client ID
  if (!process.env.OAUTH_CLIENT_ID) {
    console.error('❌ OAUTH_CLIENT_ID not found in .env file');
    console.error('');
    console.error('💡 Create a .env file with:');
    console.error('   OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com');
    console.error('');
    process.exit(1);
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  console.log('✅ OAuth Client ID found in .env');

  // Step 2: Patch extension-config.ts BEFORE build
  originalExtensionConfig = fs.readFileSync(extensionConfigPath, 'utf8');
  let extensionConfigContent = originalExtensionConfig;

  if (extensionConfigContent.includes("'__OAUTH_CLIENT_ID__'")) {
    // Escape single quotes in client ID to prevent breaking the JavaScript string
    const escapedClientId = clientId.replace(/'/g, "\\'");
    extensionConfigContent = extensionConfigContent.replaceAll("'__OAUTH_CLIENT_ID__'", `'${escapedClientId}'`);
    fs.writeFileSync(extensionConfigPath, extensionConfigContent);
    console.log('✅ Injected OAuth Client ID into extension-config.ts');
  }

  // Step 2.5: Patch api-config.const.ts with API_SECRET_KEY if provided
  if (process.env.API_SECRET_KEY) {
    console.log('✅ API_SECRET_KEY found in .env');
    originalApiConfig = fs.readFileSync(apiConfigPath, 'utf8');
    let apiConfigContent = originalApiConfig;

    // Replace empty apiKey with actual value
    // The pattern looks for apiKey: '', in the API_CONFIG object
    if (apiConfigContent.includes("apiKey: '',") || apiConfigContent.includes('apiKey: "",')) {
      // Escape single quotes in API key
      const escapedApiKey = process.env.API_SECRET_KEY.replace(/'/g, "\\'");
      apiConfigContent = apiConfigContent.replace(
        /(apiKey:\s*)(['"])(['"])/,
        `$1$2${escapedApiKey}$3`
      );
      fs.writeFileSync(apiConfigPath, apiConfigContent);
      console.log('✅ Injected API_SECRET_KEY into api-config.const.ts');
    }
  } else {
    console.warn('⚠️  API_SECRET_KEY not set - backend sync will be disabled');
    console.log('💡 Set API_SECRET_KEY in .env file to enable backend synchronization');
  }

  // Step 3: Build Angular app
  console.log('');
  console.log('📦 Building Angular app...');
  execSync('ng build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // Step 4: Build background script
  if (FIREFOX) {
    console.log('');
    console.log('📦 Bundling background script for Firefox (IIFE format)...');
    execSync(
      'esbuild src/background.ts --bundle --outfile=dist/browser/background.js --format=iife --target=es2020 --platform=browser --external:chrome',
      { stdio: 'inherit', cwd: path.join(__dirname, '..') }
    );
  } else {
    console.log('');
    console.log('📦 Compiling background script for Chrome/Edge/Brave...');
    execSync('tsc -p tsconfig.background.json', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    execSync('tsc-alias -p tsconfig.background.json', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }

  // Step 5: Patch manifest for Firefox
  if (FIREFOX) {
    console.log('');
    console.log('🔧 Patching manifest.json for Firefox...');
    
    let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Convert service_worker to scripts
    if (manifest.background?.service_worker) {
      manifest.background = {
        scripts: [manifest.background.service_worker],
      };
      console.log('✅ Converted background.service_worker → background.scripts');
    }

    // Remove Chrome-specific fields
    if (manifest.oauth2) {
      delete manifest.oauth2;
      console.log('✅ Removed oauth2 field (Chrome-specific)');
    }

    if (manifest.key) {
      delete manifest.key;
      console.log('✅ Removed key field (Chrome-specific)');
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  // Step 6: Success!
  console.log('');
  console.log('✨ Build completed successfully!');
  console.log('📁 Output: dist/browser/');
  console.log('');
  
  if (FIREFOX) {
    console.log('🦊 Firefox: Load extension from about:debugging');
    console.log('   → "This Firefox" → "Load Temporary Add-on"');
    console.log('   → Select dist/browser/manifest.json');
  } else {
    console.log('🌐 Chrome/Edge/Brave: Load extension from chrome://extensions/');
    console.log('   → Enable "Developer mode"');
    console.log('   → Click "Load unpacked"');
    console.log('   → Select dist/browser/ folder');
  }
  console.log('');

} catch (error) {
  console.error('');
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
