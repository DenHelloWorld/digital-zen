# Build System Documentation

This document describes the dual-build system for the Digital Zen browser extension, which supports building for both Chromium-based browsers and Firefox simultaneously.

## Overview

The Digital Zen extension uses a **dual-build system** that creates separate, optimized builds for different browser types:

- **Chromium Build** (`dist/chromium/`) - For Chrome, Edge, Brave, Opera, Vivaldi, and other Chromium-based browsers
- **Firefox Build** (`dist/firefox/`) - For Mozilla Firefox, with automatic archive creation

## Directory Structure

```
dist/
├── chromium/              # Chromium browsers build
│   ├── manifest.json      # Manifest V3 with service_worker
│   ├── background.js      # ES6 module background script
│   ├── index.html         # Extension popup
│   └── ...                # Other extension files
│
├── firefox/               # Firefox build
│   ├── manifest.json      # Manifest V3 with background.scripts
│   ├── background.js      # Bundled IIFE background script
│   ├── index.html         # Extension popup
│   ├── web-ext-artifacts/ # Firefox archives (created by web-ext)
│   │   └── digital_zen-1.0.1.zip
│   └── ...                # Other extension files
│
└── browser/               # Legacy output directory (deprecated)
    └── ...                # Only used during build process
```

## Build Scripts

### Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build for both Chromium and Firefox → Creates `dist/chromium/` + `dist/firefox/` |
| `npm run build:prod` | Production build for both browsers with environment patching |

### Script Details

#### `npm run build`

Builds the extension for **both** Chromium-based browsers and Firefox simultaneously.

**Output:** 
- `dist/chromium/` - Chromium build
- `dist/firefox/` - Firefox build with archive

**Process:**
1. Run tests (`npm run test:ci`)
2. Inject OAuth Client ID and API Secret Key from `.env`
3. Build Angular application
4. Bundle background script as IIFE (Immediately Invoked Function Expression) - **same bundled script for all browsers**
5. Build Chromium version:
   - Copy bundled files to `dist/chromium/`
   - Remove `background.type` field from manifest (using bundled IIFE, not ES6 modules)
6. Build Firefox version:
   - Copy bundled files to `dist/firefox/`
   - Patch manifest.json:
     - Convert `background.service_worker` to `background.scripts` array (Firefox MV3 requirement)
     - Remove Chrome-specific fields (`oauth2`, `key`)
   - Run `web-ext build` to create archive in `dist/firefox/web-ext-artifacts/`

**Usage:**
```bash
npm run build
```

#### `npm run build:prod`

Production build for both browsers with full environment patching.

**Output:**
- `dist/chromium/` - Production Chromium build
- `dist/firefox/` - Production Firefox build with archive

**Process:**
1. Same as `npm run build`
2. Additionally runs `patch-manifest.js` for production-specific patches

**Usage:**
```bash
npm run build:prod
```

**Note:** The build system **always builds for both browsers**. There are no separate scripts for building individual browsers. This ensures consistency and reduces the chance of configuration drift between browser versions.

## Build Script Architecture

The build system consists of several scripts:

### 1. `scripts/build-dual.js`

Main build script that orchestrates the entire build process for both browsers.

**Features:**
- Always builds for both Chromium and Firefox (hardcoded in script)
- Injects environment variables into source files before build
- Builds Angular application once
- Creates browser-specific background scripts:
  - **Chromium:** ES6 module compiled with TypeScript
  - **Firefox:** IIFE bundle created with esbuild
- Patches manifest.json for Firefox compatibility
- Copies builds to separate directories
- Runs `web-ext build` for Firefox archive creation

**Build Process:**
1. Validate OAuth client ID from `.env`
2. Inject OAuth Client ID into `extension-config.ts`
3. Inject API Secret Key into `api-config.const.ts` (if provided)
4. Build Angular app once
5. Bundle background script once with esbuild (IIFE format) - **same script used by all browsers**
6. **For Chromium:**
   - Copy Angular app and bundled background script to `dist/chromium/`
   - Remove `background.type` field from manifest (bundled IIFE doesn't use modules)
7. **For Firefox:**
   - Copy Angular app and bundled background script to `dist/firefox/`
   - Patch manifest: Convert `background.service_worker` to `background.scripts` array (Firefox MV3 requirement)
   - Remove Chrome-specific fields (`oauth2`, `key`) from manifest
   - Run `web-ext build` to create archive
8. Restore original source files (cleanup)

### 2. `scripts/patch-manifest.js`

Patches manifest.json files with production credentials (used by `build:prod`).

**What it does:**
- Replaces `__OAUTH_CLIENT_ID__` placeholder with actual OAuth client ID
- Replaces `__PUBLIC_KEY__` placeholder with Chrome extension public key
- Works with all build directories (`chromium/`, `firefox/`)

**Usage:**
```bash
dotenv -- node scripts/patch-manifest.js
```

### 3. `scripts/patch-api-config.js`

Patches API configuration files with production API key (used by `build:prod`).

**What it does:**
- Replaces empty `apiKey` value with actual API secret key from `.env`
- Works with all build directories (`chromium/`, `firefox/`)

**⚠️ Security Warning:** This script embeds the `API_SECRET_KEY` directly into the extension bundle, making it accessible to anyone who installs the extension. The key can be easily extracted from the built extension files. **Do not rely on this key for server-side security.** For production systems, implement proper server-side authentication using per-user tokens (OAuth/JWT) or other mechanisms where secrets remain exclusively on the server.

**Usage:**
```bash
dotenv -- node scripts/patch-api-config.js
```

### 4. `scripts/build-universal.js`

**⚠️ Legacy script** - Not currently used by npm scripts. Builds to `dist/browser/` directory.

This script is kept for backward compatibility but the dual-build system (`build-dual.js`) is now the standard.

## Browser-Specific Build Differences

### Chromium Browsers

**Manifest:**
```json
{
  "background": {
    "service_worker": "background.js"
    // No "type": "module" field - uses bundled IIFE script
  },
  "oauth2": {
    "client_id": "your-client-id.apps.googleusercontent.com",
    "scopes": [...]
  },
  "key": "your-public-key"
}
```

**Background Script:**
- Bundled as single IIFE file (Immediately Invoked Function Expression) with esbuild
- Same bundled script used by all browsers
- No `import` statements (all code bundled into one file)
- Service worker architecture

### Firefox

**Manifest:**
```json
{
  "background": {
    "scripts": ["background.js"]
    // Firefox MV3 uses scripts array instead of service_worker
  }
  // No oauth2 or key fields (Chrome-specific)
}
```

**Background Script:**
- Bundled as single IIFE file (Immediately Invoked Function Expression) with esbuild
- **Same bundled script as Chromium** - only manifest differs
- No `import` statements (all code bundled into one file)
- Background scripts architecture (using scripts array in manifest)

**Archive:**
- Automatically created by `web-ext build`
- Located in `dist/firefox/web-ext-artifacts/`
- Ready for Firefox Add-ons submission

**Important Note:**
Both Chromium and Firefox builds use the same bundled IIFE background script. The key difference is in the manifest.json:
- **Chromium**: Uses `background.service_worker` (without `type: "module"`)
- **Firefox**: Uses `background.scripts` array (Firefox MV3 requirement)

The build system creates one background bundle and adjusts the manifest for each browser's requirements.

## Environment Variables

The build system requires certain environment variables to be set in a `.env` file:

### Required

```env
OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Required for Google OAuth authentication features.

### Optional

```env
PUBLIC_KEY=your-chrome-extension-public-key
API_SECRET_KEY=your-api-secret-key
```

- `PUBLIC_KEY` - Required for production builds, ensures consistent extension ID
- `API_SECRET_KEY` - Required if using backend API synchronization

### Example .env file

```env
# Required
OAUTH_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# Optional (for production)
PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
API_SECRET_KEY=your-secret-key-here
```

**Security Note:** Never commit `.env` files to version control. The `.gitignore` file already excludes them.

## Testing Builds

### Testing Chromium Build

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome/Edge/Brave:
   - Navigate to `chrome://extensions/` (or `edge://extensions/`, `brave://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist/chromium/` folder

3. Test functionality:
   - Extension popup opens
   - Background service worker runs
   - Features work as expected

### Testing Firefox Build

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Firefox:
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select `dist/firefox/manifest.json`

3. Test functionality:
   - Extension popup opens
   - Background service worker runs
   - Features work as expected

4. Test archive (optional):
   - Use file in `dist/firefox/web-ext-artifacts/`
   - Test installation from archive

## Troubleshooting

### Build fails with "OAUTH_CLIENT_ID not found"

**Problem:** Missing `.env` file or missing `OAUTH_CLIENT_ID` variable.

**Solution:**
1. Create `.env` file in project root
2. Add `OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com`
3. Get OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/)

### Build fails with "ng: not found"

**Problem:** Angular CLI not installed or not in PATH.

**Solution:**
```bash
npm install
```

This will install all dependencies including Angular CLI.

### Firefox build: "web-ext build failed"

**Problem:** `web-ext` package not installed or failed to create archive.

**Solution:**
1. Extension files are still usable in `dist/firefox/`
2. You can manually create an archive:
   ```bash
   cd dist/firefox
   zip -r -FS ../digital-zen-firefox.zip * --exclude '*.git*' '*.DS_Store'
   ```

### Manifest errors when loading extension

**Problem:** Manifest format incorrect for browser.

**Solution:**
- Use `dist/chromium/` for Chromium browsers
- Use `dist/firefox/` for Firefox
- Never mix the two

### Changes not reflected after rebuild

**Problem:** Browser cached old version.

**Solution:**
1. Go to browser's extensions page
2. Find Digital Zen
3. Click reload/refresh icon (🔄)
4. If issues persist, remove and reload the extension

## Migration from Old Build System

The old build system used `dist/browser/` as output directory. The new system uses separate directories.

### Changes

**Old System:**
```bash
npm run build              # → dist/browser/
npm run build:firefox      # → dist/browser/ (Firefox-patched)
```

**New System:**
```bash
npm run build              # → dist/chromium/
npm run build:firefox      # → dist/firefox/
npm run build:all          # → dist/chromium/ + dist/firefox/
```

### Updating Your Workflow

If you previously used:
```bash
npm run build
# Load dist/browser/ in Chrome
```

Now use:
```bash
npm run build
# Load dist/chromium/ in Chrome
```

### Legacy Support

The old `build-universal.js` script is still available but deprecated. It's recommended to use the new dual-build system.

## Best Practices

### Development

1. **Use `npm run build`** for quick Chromium-only builds during development
2. **Test in one browser** initially (Chrome/Edge)
3. **Use `npm run build:all`** before committing to test both browsers

### Pre-Commit

1. **Run linter:** `npm run lint`
2. **Run tests:** `npm run test:ci`
3. **Build all:** `npm run build:all`
4. **Test in both browsers** to ensure compatibility

### Production/Release

1. **Update version** in `manifest.json`
2. **Set all environment variables** in `.env`
3. **Run production build:** `npm run build:prod`
4. **Test both builds** thoroughly
5. **Submit to stores:**
   - Chrome Web Store: `dist/chromium/` (zipped)
   - Firefox Add-ons: `dist/firefox/web-ext-artifacts/*.zip`

## Dependencies

The build system requires the following npm packages:

**Build Tools:**
- `@angular/cli` - Angular build system
- `typescript` - TypeScript compiler
- `tsc-alias` - TypeScript path alias resolver
- `esbuild` - Fast JavaScript bundler (for Firefox)
- `web-ext` - Firefox extension development tool
- `dotenv-cli` - Environment variable injection

**All dependencies are already listed in `package.json`.**

## Additional Resources

- [Angular Documentation](https://angular.dev/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [web-ext Documentation](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)
- [Browser Installation Guide](./browser-installation.md)

---

**Last Updated:** January 12, 2026
