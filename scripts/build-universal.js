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
const configPath = path.join(__dirname, '..', 'src', 'extension-config.ts');
const manifestPath = path.join(__dirname, '..', 'dist', 'browser', 'manifest.json');
const backgroundPath = path.join(__dirname, '..', 'dist', 'browser', 'background.js');

// Store original config for restoration
let originalConfig = '';

function cleanup() {
  if (originalConfig) {
    fs.writeFileSync(configPath, originalConfig);
    console.log('✅ Restored original extension-config.ts');
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
  originalConfig = fs.readFileSync(configPath, 'utf8');
  let configContent = originalConfig;

  if (configContent.includes("'__OAUTH_CLIENT_ID__'")) {
    configContent = configContent.replaceAll("'__OAUTH_CLIENT_ID__'", `'${clientId}'`);
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Injected OAuth Client ID into extension-config.ts');
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
