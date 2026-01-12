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

| Script | Command | Description |
|--------|---------|-------------|
| `npm run build` | Build for Chromium only | Creates `dist/chromium/` |
| `npm run build:all` | Build for both browsers | Creates both `dist/chromium/` and `dist/firefox/` |
| `npm run build:chromium` | Build for Chromium only | Same as `npm run build` |
| `npm run build:firefox` | Build for Firefox only | Creates `dist/firefox/` with archive |
| `npm run build:prod` | Production build for both | Includes patching and optimization |

### Script Details

#### `npm run build` / `npm run build:chromium`

Builds the extension for Chromium-based browsers only.

**Output:** `dist/chromium/`

**Process:**
1. Run tests (`npm run test:ci`)
2. Inject OAuth Client ID from `.env`
3. Build Angular application
4. Compile background script as ES6 module
5. Copy to `dist/chromium/`

**Usage:**
```bash
npm run build
```

#### `npm run build:firefox`

Builds the extension for Firefox only, including automatic archive creation.

**Output:** 
- `dist/firefox/` - Unpacked extension
- `dist/firefox/web-ext-artifacts/*.zip` - Archive for distribution

**Process:**
1. Run tests (`npm run test:ci`)
2. Inject OAuth Client ID from `.env`
3. Build Angular application
4. Bundle background script as IIFE (Immediately Invoked Function Expression)
5. Patch manifest.json:
   - Convert `background.service_worker` → `background.scripts`
   - Remove Chrome-specific fields (`oauth2`, `key`)
6. Copy to `dist/firefox/`
7. Run `web-ext build` to create archive

**Usage:**
```bash
npm run build:firefox
```

#### `npm run build:all`

Builds the extension for both Chromium and Firefox simultaneously.

**Output:**
- `dist/chromium/` - Chromium build
- `dist/firefox/` - Firefox build with archive

**Process:**
1. Run tests (`npm run test:ci`)
2. Inject OAuth Client ID and API Secret Key from `.env`
3. Build for Chromium (see above)
4. Build for Firefox (see above)

**Usage:**
```bash
npm run build:all
```

This is the recommended command for creating production-ready builds for all supported browsers.

#### `npm run build:prod`

Production build with additional patching for deployment.

**Output:**
- `dist/chromium/` - Chromium build with production patches
- `dist/firefox/` - Firefox build with production patches

**Process:**
1. Run all build steps from `npm run build:all`
2. Patch API configuration files with production credentials
3. Patch manifest files with production OAuth and extension keys

**Usage:**
```bash
npm run build:prod
```

**Requirements:**
- `.env` file with all production credentials:
  - `OAUTH_CLIENT_ID`
  - `PUBLIC_KEY`
  - `API_SECRET_KEY` (optional)

## Build Script Architecture

The build system consists of three main scripts:

### 1. `scripts/build-dual.js`

Main build script that orchestrates the entire build process.

**Features:**
- Supports `--chromium`, `--firefox`, and `--all` flags
- Injects environment variables into source files
- Builds Angular application
- Compiles/bundles background scripts differently for each browser
- Patches manifest.json for Firefox compatibility
- Copies builds to separate directories
- Runs `web-ext build` for Firefox

**New build script** (`scripts/build-dual.js`)
- Supports `--chromium`, `--firefox`, `--all` flags
- Outputs to separate directories: `dist/chromium/` and `dist/firefox/`
- **Single bundled IIFE background script for all browsers** - no browser-specific compilation
- Manifest patching for Firefox (removes `oauth2`, `key`, converts `service_worker` to `scripts`)

**Build Process:**
1. Build Angular app once
2. **Bundle background script ONCE with esbuild (IIFE format)** - used by all browsers
3. Copy to `dist/chromium/` - remove `type: "module"` from manifest
4. Copy to `dist/firefox/` - convert `service_worker` to `scripts` array, remove `oauth2` and `key`
5. Run `web-ext build` for Firefox archive

**Key Features:**
- **Unified approach:** Both browsers use the same bundled IIFE background script
- **Simplified maintenance:** No browser-specific background compilation
- **Faster builds:** Single bundling step instead of separate compilations
- Automatic manifest conversion for Firefox (service worker → scripts array)

### 2. `scripts/patch-manifest.js`

Patches manifest.json files with production credentials.

**What it does:**
- Replaces `__OAUTH_CLIENT_ID__` placeholder with actual OAuth client ID
- Replaces `__PUBLIC_KEY__` placeholder with Chrome extension public key
- Works with all build directories (`chromium/`, `firefox/`, `browser/`)

**Usage:**
```bash
dotenv -- node scripts/patch-manifest.js
```

### 3. `scripts/patch-api-config.js`

Patches API configuration files with production API key.

**What it does:**
- Replaces empty `apiKey` value with actual API secret key
- Works with all build directories (`chromium/`, `firefox/`, `browser/`)

**Usage:**
```bash
dotenv -- node scripts/patch-api-config.js
```

## Browser-Specific Differences

### Chromium Browsers

**Manifest:**
```json
{
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "oauth2": {
    "client_id": "your-client-id.apps.googleusercontent.com",
    "scopes": [...]
  },
  "key": "your-public-key"
}
```

**Background Script:**
- Compiled as ES6 module
- Uses `import` statements
- Service worker architecture

### Firefox

**Manifest:**
```json
{
  "background": {
    "scripts": ["background.js"]
  }
  // No oauth2 or key fields
  // No service_worker - Firefox Manifest V3 uses event pages
}
```

**Background Script:**
- Bundled as single IIFE file (Immediately Invoked Function Expression)
- No `import` statements (all code bundled with esbuild)
- **Event pages architecture** (Manifest V3 with background.scripts)
- Firefox Manifest V3 does NOT support `background.service_worker`, uses `background.scripts` array instead

**Archive:**
- Automatically created by `web-ext build`
- Located in `dist/firefox/web-ext-artifacts/`
- Ready for Firefox Add-ons submission

**Important Note:**
Firefox Manifest V3 uses `background.scripts` array (event pages) instead of `background.service_worker`. The build system automatically converts the service worker configuration to scripts array for Firefox compatibility.

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
   npm run build:firefox
   ```

2. Load in Firefox:
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select `dist/firefox/manifest.json`

3. Test functionality:
   - Extension popup opens
   - Background scripts run
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
