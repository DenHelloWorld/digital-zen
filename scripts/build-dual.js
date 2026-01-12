#!/usr/bin/env node

/**
 * Dual build script for Digital Zen extension
 * Builds for BOTH Chromium browsers and Firefox in separate directories
 *
 * Usage:
 *   npm run build:all      - Build for both Chromium and Firefox
 *   npm run build          - Build for Chromium only (dist/chromium/)
 *   npm run build:chromium - Build for Chromium only (dist/chromium/)
 *   npm run build:firefox  - Build for Firefox only (dist/firefox/)
 *
 * Output:
 *   dist/chromium/         - Ready for Chrome/Edge/Brave/Opera/Vivaldi
 *   dist/firefox/          - Ready for Firefox
 *   dist/firefox/web-ext-artifacts/*.zip - Firefox archive (created by web-ext)
 *
 * Requirements:
 *   - .env file with OAUTH_CLIENT_ID
 *   - web-ext package installed (for Firefox archive creation)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const BUILD_ALL = args.includes('--all');
const BUILD_CHROMIUM = args.includes('--chromium') || (!BUILD_ALL && !args.includes('--firefox'));
const BUILD_FIREFOX = args.includes('--firefox') || BUILD_ALL;

const extensionConfigPath = path.join(__dirname, '..', 'src', 'extension-config.ts');
const apiConfigPath = path.join(
  __dirname,
  '..',
  'src',
  'modules',
  'common',
  'constants',
  'api-config.const.ts'
);

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

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Build for a specific browser target
 */
function buildForBrowser(browserType) {
  const isFirefox = browserType === 'firefox';
  const targetDir = path.join(__dirname, '..', 'dist', browserType);
  const tempBuildDir = path.join(__dirname, '..', 'dist', 'browser');
  const manifestPath = path.join(tempBuildDir, 'manifest.json');

  console.log('');
  console.log('━'.repeat(60));
  console.log(`🚀 Building for ${isFirefox ? 'Firefox' : 'Chromium browsers'}`);
  console.log('━'.repeat(60));
  console.log('');

  // Step 1: Build Angular app
  console.log('📦 Building Angular app...');
  execSync('ng build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  // Step 2: Build background script
  if (isFirefox) {
    console.log('');
    console.log('📦 Bundling background script for Firefox (IIFE format)...');
    execSync(
      'esbuild src/background.ts --bundle --outfile=dist/browser/background.js --format=iife --target=es2020 --platform=browser --external:chrome',
      { stdio: 'inherit', cwd: path.join(__dirname, '..') }
    );
  } else {
    console.log('');
    console.log('📦 Compiling background script for Chromium...');
    execSync('tsc -p tsconfig.background.json', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    execSync('tsc-alias -p tsconfig.background.json', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  }

  // Step 3: Patch manifest for Firefox
  if (isFirefox) {
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

  // Step 4: Copy to target directory
  console.log('');
  console.log(`📁 Copying build to dist/${browserType}/...`);
  
  // Remove old target directory if exists
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  // Copy from temp build dir to target dir
  copyDir(tempBuildDir, targetDir);
  console.log(`✅ Copied to dist/${browserType}/`);

  // Step 5: For Firefox, run web-ext build
  if (isFirefox) {
    console.log('');
    console.log('📦 Creating Firefox archive with web-ext...');
    try {
      execSync('npx web-ext build --overwrite-dest', {
        stdio: 'inherit',
        cwd: targetDir,
      });
      console.log('✅ Firefox archive created in dist/firefox/web-ext-artifacts/');
    } catch (error) {
      console.warn('⚠️  web-ext build failed, but extension files are ready');
      console.warn('   Error:', error.message);
      console.warn('   You can manually create an archive or load the extension as-is');
      console.warn('   💡 Try: cd dist/firefox && npx web-ext build');
    }
  }

  // Step 6: Success message
  console.log('');
  console.log('✨ Build completed successfully!');
  console.log(`📁 Output: dist/${browserType}/`);
  console.log('');

  if (isFirefox) {
    console.log('🦊 Firefox installation options:');
    console.log('   1. Load unpacked from about:debugging');
    console.log('      → "This Firefox" → "Load Temporary Add-on"');
    console.log(`      → Select dist/${browserType}/manifest.json`);
    console.log('   2. Install archive:');
    console.log(`      → Use dist/${browserType}/web-ext-artifacts/*.zip`);
  } else {
    console.log('🌐 Chromium browsers installation:');
    console.log('   → Navigate to chrome://extensions/ (or edge://extensions/, brave://extensions/, etc.)');
    console.log('   → Enable "Developer mode"');
    console.log('   → Click "Load unpacked"');
    console.log(`   → Select dist/${browserType}/ folder`);
  }
  console.log('');
}

// Main execution
try {
  console.log('');
  console.log('━'.repeat(60));
  console.log('🏗️  Digital Zen Extension - Dual Build System');
  console.log('━'.repeat(60));
  console.log('');
  
  if (BUILD_ALL) {
    console.log('📦 Building for: Chromium + Firefox');
  } else if (BUILD_CHROMIUM) {
    console.log('📦 Building for: Chromium browsers only');
  } else if (BUILD_FIREFOX) {
    console.log('📦 Building for: Firefox only');
  }

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
    // Use JSON.stringify for proper escaping, then remove surrounding quotes
    const escapedClientId = JSON.stringify(clientId).slice(1, -1);
    extensionConfigContent = extensionConfigContent.replaceAll(
      "'__OAUTH_CLIENT_ID__'",
      `'${escapedClientId}'`
    );
    fs.writeFileSync(extensionConfigPath, extensionConfigContent);
    console.log('✅ Injected OAuth Client ID into extension-config.ts');
  }

  // Step 3: Patch api-config.const.ts with API_SECRET_KEY if provided
  if (process.env.API_SECRET_KEY) {
    console.log('✅ API_SECRET_KEY found in .env');
    originalApiConfig = fs.readFileSync(apiConfigPath, 'utf8');
    let apiConfigContent = originalApiConfig;

    if (apiConfigContent.includes("apiKey: '',") || apiConfigContent.includes('apiKey: "",')) {
      // Use JSON.stringify for proper escaping, then remove surrounding quotes
      const escapedApiKey = JSON.stringify(process.env.API_SECRET_KEY).slice(1, -1);
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

  // Step 4: Build for each target
  if (BUILD_CHROMIUM) {
    buildForBrowser('chromium');
  }

  if (BUILD_FIREFOX) {
    buildForBrowser('firefox');
  }

  // Final summary
  console.log('');
  console.log('━'.repeat(60));
  console.log('🎉 All builds completed successfully!');
  console.log('━'.repeat(60));
  console.log('');
  console.log('📦 Build outputs:');
  if (BUILD_CHROMIUM) {
    console.log('   ✅ dist/chromium/ - Chromium browsers (Chrome, Edge, Brave, Opera, Vivaldi)');
  }
  if (BUILD_FIREFOX) {
    console.log('   ✅ dist/firefox/ - Firefox (unpacked)');
    console.log('   ✅ dist/firefox/web-ext-artifacts/*.zip - Firefox (archive)');
  }
  console.log('');

} catch (error) {
  console.error('');
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
