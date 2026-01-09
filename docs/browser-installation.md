# Browser Installation Guide

This guide explains how to install the Digital Zen extension in different browsers during development. The extension is built with Manifest V3 and is compatible with all Chromium-based browsers.

**For Production Users:** Once published, users can install Digital Zen directly from their browser's extension store. This guide is primarily for developers and testers.

## Supported Browsers

Digital Zen works on all Chromium-based browsers and Firefox:

- ✅ **Google Chrome** (Chromium-based) - **Fully supported**
- ✅ **Microsoft Edge** (Chromium-based) - **Fully supported**
- ✅ **Brave** - **Fully supported**
- ✅ **Opera** - **Fully supported**
- ✅ **Vivaldi** - **Fully supported**
- ✅ **Mozilla Firefox** (WebExtensions API) - **Fully supported** (use `npm run build:firefox`)
- ✅ **Other Chromium-based browsers** - **Fully supported**

## Prerequisites

Before installing the extension, ensure you have:

1. **Set up OAuth Client ID** (for Google authentication):
   - Option 1: Set `OAUTH_CLIENT_ID` in your `.env` file (copy from `.env.example`)
   - Option 2: Directly edit `src/extension-config.ts` and replace `'__OAUTH_CLIENT_ID__'` with your actual Google OAuth client ID
   - Get your OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/)

2. Built the extension using `npm run build` or `npm run build:prod`
3. The `dist/browser` folder exists in your project directory

**Note:** If you edit `src/extension-config.ts` directly with your OAuth client ID, it will work immediately without needing environment variables. Just make sure not to commit your OAuth client ID to git!

## Installation Instructions

### Google Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the menu (⋮) → **Extensions** → **Manage Extensions**

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click the **"Load unpacked"** button
   - Navigate to your project directory
   - Select the `dist/browser` folder
   - Click **"Select Folder"** (or "Open" on Mac)

4. **Verify Installation**
   - The Digital Zen extension should appear in your extensions list
   - The extension icon should appear in your Chrome toolbar
   - If you don't see the icon, click the puzzle piece icon (🧩) in the toolbar and pin Digital Zen

### Microsoft Edge

1. **Open Edge Extensions Page**
   - Navigate to `edge://extensions/`
   - Or click the menu (⋯) → **Extensions** → **Manage extensions**

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the bottom-left corner

3. **Load the Extension**
   - Click the **"Load unpacked"** button
   - Navigate to your project directory
   - Select the `dist/browser` folder
   - Click **"Select Folder"** (or "Open" on Mac)

4. **Verify Installation**
   - The Digital Zen extension should appear in your extensions list
   - The extension icon should appear in your Edge toolbar
   - If you don't see the icon, click the puzzle piece icon (🧩) in the toolbar and pin Digital Zen

### Brave Browser

1. **Open Brave Extensions Page**
   - Navigate to `brave://extensions/`
   - Or click the menu (☰) → **Extensions** → **Manage extensions**

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click the **"Load unpacked"** button
   - Navigate to your project directory
   - Select the `dist/browser` folder
   - Click **"Select Folder"** (or "Open" on Mac)

4. **Verify Installation**
   - The Digital Zen extension should appear in your extensions list
   - The extension icon should appear in your Brave toolbar
   - If you don't see the icon, click the puzzle piece icon (🧩) in the toolbar and pin Digital Zen

### Opera Browser

1. **Open Opera Extensions Page**
   - Navigate to `opera://extensions/`
   - Or click the menu → **Extensions** → **Extensions**

2. **Enable Developer Mode**
   - Click the **"Developer mode"** button in the top-right corner

3. **Load the Extension**
   - Click the **"Load unpacked"** button
   - Navigate to your project directory
   - Select the `dist/browser` folder
   - Click **"Select Folder"** (or "Open" on Mac)

4. **Verify Installation**
   - The Digital Zen extension should appear in your extensions list
   - The extension icon should appear in your Opera toolbar
   - If you don't see the icon, you may need to pin it from the extensions menu

### Vivaldi Browser

1. **Open Vivaldi Extensions Page**
   - Navigate to `vivaldi://extensions/`
   - Or go to **Tools** → **Extensions**

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click the **"Load unpacked"** button
   - Navigate to your project directory
   - Select the `dist/browser` folder
   - Click **"Select Folder"** (or "Open" on Mac)

4. **Verify Installation**
   - The Digital Zen extension should appear in your extensions list
   - The extension icon should appear in your Vivaldi toolbar

### Mozilla Firefox

### Mozilla Firefox

**✅ Firefox Support Now Available!**

Digital Zen now includes a Firefox-specific build that bundles the background script into a single file, making it compatible with Firefox's `background.scripts` implementation.

**Two Installation Methods:**

#### Method 1: Using Firefox Build Script (Recommended)

1. **Build for Firefox:**
   ```bash
   npm run build:firefox:skip-tests
   ```
   
   Or with tests:
   ```bash
   npm run build:firefox
   ```
   
   This will:
   - Build the Angular application
   - Bundle the background script into a single IIFE (Immediately Invoked Function Expression)
   - Automatically patch the manifest.json for Firefox compatibility
   - Convert `background.service_worker` to `background.scripts`
   - Remove Chrome-specific fields (`oauth2`, `key`) that cause warnings in Firefox

2. **Load in Firefox:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Or type `about:debugging` in the address bar, then click **"This Firefox"** in the left sidebar
   - Click the **"Load Temporary Add-on..."** button
   - Navigate to your project's `dist/browser` folder
   - Select the `manifest.json` file
   - Click **"Open"**

3. **Verify Installation:**
   - The Digital Zen extension should appear in the list of temporary extensions
   - The extension icon should appear in your Firefox toolbar
   - Background functionality should now work properly!
   - No manifest warnings should appear

**⚠️ Firefox Limitations:**
- **Extension Key:** The permanent extension ID feature (via `key` field) is Chrome-specific and removed in Firefox builds.

**✅ OAuth Authentication:** Works in Firefox! OAuth client ID is provided via `extension-config.ts` (universal approach for all browsers).

#### Method 2: Manual Build (For Advanced Users)

If you prefer to use the standard build and manually modify the manifest:

**Note:** Firefox does not yet support service workers for background scripts in Manifest V3. You'll need to modify the manifest.json before loading in Firefox.

1. **Build the extension:**
   ```bash
   npm run build:skip-tests
   ```

2. **Manually modify manifest.json for Firefox compatibility:**
   
   Firefox requires `background.scripts` instead of `background.service_worker`, and the background script must be bundled:
   
   - Open `dist/browser/manifest.json` in a text editor
   - Find the `"background"` section (around line 37-40)
   - Replace:
     ```json
     "background": {
       "service_worker": "background.js",
       "type": "module"
     },
     ```
   - With:
     ```json
     "background": {
       "scripts": ["background.js"]
     },
     ```
   - Save the file
   
   **⚠️ Important:** The standard build creates modular background scripts that won't work with this manual approach. Use Method 1 (Firefox build script) for proper Firefox compatibility.

3. **Load in Firefox:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click **"Load Temporary Add-on..."**
   - Select the `manifest.json` file from `dist/browser`
   - Click **"Open"**

#### Important Notes for Firefox:
   - **Temporary Extensions:** Extensions loaded this way are temporary and will be removed when Firefox is restarted
   - **Permanent Installation:** For permanent installation during development, you need to:
     - Package the extension as a `.xpi` file (see "Creating a .xpi File for Firefox" section below)
     - Sign it through [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
     - Or use Firefox Developer Edition/Nightly with `xpinstall.signatures.required` set to `false` in `about:config`
   - **Extension ID:** Firefox may generate a different extension ID than Chromium browsers, which affects OAuth configuration
   - **OAuth Setup:** See [OAuth Cross-Browser Setup Guide](./oauth-setup-cross-browser.md) for Firefox-specific OAuth configuration

### Creating a .xpi File for Firefox

A `.xpi` file is a ZIP archive containing your extension files. Here's how to create one:

**Method 1: Using web-ext (Recommended)**

1. **Install web-ext** (Mozilla's official command-line tool):
   ```bash
   npm install -g web-ext
   ```

2. **Build your extension** (if not already built):
   ```bash
   npm run build
   ```

3. **Navigate to the build directory and create the .xpi**:
   ```bash
   cd dist/browser
   web-ext build
   ```

4. The `.xpi` file will be created in `dist/browser/web-ext-artifacts/`

**Method 2: Manual ZIP Creation**

1. **Build your extension**:
   ```bash
   npm run build
   ```

2. **Navigate to the build directory**:
   ```bash
   cd dist/browser
   ```

3. **Create a .xpi file** (the extension MUST be zipped from within the folder, not the folder itself):
   
   On Linux/Mac:
   ```bash
   zip -r -FS ../digital-zen.xpi * --exclude '*.git*' '*.DS_Store' 'node_modules/*' '*.log'
   ```
   
   On Windows (PowerShell):
   ```powershell
   Compress-Archive -Path * -DestinationPath ..\digital-zen.xpi
   ```
   
   **Note:** The `dist/browser` folder from `npm run build` should already be clean and only contain necessary extension files. The exclusions above are extra precautions.

4. The `.xpi` file will be in the `dist/` folder

**Installing the .xpi File:**

- For **unsigned** .xpi (development only):
  - Use Firefox Developer Edition or Nightly
  - Go to `about:config` and set `xpinstall.signatures.required` to `false`
  - Go to `about:addons`, click the gear icon, select "Install Add-on From File"
  - Select your `.xpi` file

- For **signed** .xpi (production):
  - Submit to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
  - Once approved, users can install directly from addons.mozilla.org

## Quick Reference Table

| Browser | Extensions URL | Developer Mode Location | Load Button | Notes |
|---------|----------------|------------------------|-------------|-------|
| Chrome | `chrome://extensions/` | Top-right toggle | Load unpacked | - |
| Edge | `edge://extensions/` | Bottom-left toggle | Load unpacked | - |
| Brave | `brave://extensions/` | Top-right toggle | Load unpacked | - |
| Opera | `opera://extensions/` | Top-right button | Load unpacked | - |
| Vivaldi | `vivaldi://extensions/` | Top-right toggle | Load unpacked | - |
| Firefox | `about:debugging#/runtime/this-firefox` | Not needed | Load Temporary Add-on... | Use `npm run build:firefox` for full support |

## Common Issues and Troubleshooting

### Extension ID Changes

**Problem:** Extension ID changes every time you reload the extension in development mode.

**Solution:**
- This is normal for unpacked extensions
- For a consistent extension ID, add a `key` field to your `manifest.json`
- See [OAuth Setup Guide](./oauth-setup-cross-browser.md) for details on managing extension IDs
- For production, publish the extension to get a permanent ID

### Manifest Errors

**Problem:** Browser shows "Manifest file is missing or unreadable"

**Solution:**
1. Ensure you've run `npm run build` first
2. Verify the `dist/browser` folder exists and contains `manifest.json`
3. Check that `manifest.json` is valid JSON (the build process validates this)

### Firefox: "background.service_worker is currently disabled"

**Problem:** When loading the extension in Firefox, you get the error: "background.service_worker is currently disabled. Add background.scripts."

**Solution:**

Firefox does not yet support service workers for background scripts in Manifest V3. You must modify the manifest.json for Firefox:

1. Open `dist/browser/manifest.json` in a text editor
2. Find the `"background"` section:
   ```json
   "background": {
     "service_worker": "background.js",
     "type": "module"
   },
   ```
3. Replace it with:
   ```json
   "background": {
     "scripts": ["background.js"]
   },
   ```
4. Save the file and try loading the extension again

**Note:** This is a temporary Firefox limitation. Keep this modification only in your `dist/browser` folder for testing - don't commit it to git. For production Firefox deployment, you'll need to create a Firefox-specific build.

**Why this happens:** Firefox's Manifest V3 implementation doesn't support service workers yet and requires the older `background.scripts` format. Chrome and other Chromium browsers require `service_worker`. This means you need different manifest configurations for different browsers during development.

### Firefox: "Failed to communicate with background service"

**Problem:** After modifying the manifest for Firefox, you get errors like "Failed to communicate with background service" or "Error sending message to background" in the browser console.

**Solution:**

✅ **Use the Firefox build script:**

```bash
npm run build:firefox:skip-tests
```

This automatically:
- Bundles the background script into a single IIFE file
- Patches the manifest for Firefox compatibility
- Creates a fully working Firefox build

The standard build creates modular ES6 scripts that don't work with Firefox's `background.scripts`. The Firefox build script solves this by bundling everything into one file.

**Alternative (Manual):**

If you're manually building, you need to bundle the background script yourself using esbuild:

```bash
npm run build:skip-tests
npm run bundle:background
```

Then manually edit the manifest.json to use `background.scripts` instead of `background.service_worker`.

**Why this happens:** Firefox's `background.scripts` doesn't support ES6 modules the same way Chrome's service worker does. The bundled build creates a single IIFE (Immediately Invoked Function Expression) that works in both environments.

### Extension Not Appearing in Toolbar

**Problem:** Extension installed successfully but icon doesn't appear

**Solution:**
1. Click the extensions/puzzle piece icon (🧩) in your browser toolbar
2. Find Digital Zen in the list
3. Click the pin icon to pin it to the toolbar

**Firefox-specific:**
- In Firefox, you may need to customize the toolbar
- Right-click on the toolbar → **Customize Toolbar**
- Drag the Digital Zen icon from the customization panel to the toolbar

### Firefox Temporary Extension Removed

**Problem:** Extension disappears after restarting Firefox

**Solution:**
- This is expected behavior for temporary extensions in Firefox
- You need to reload the extension each time you restart Firefox
- For permanent installation during development:
  1. Use Firefox Developer Edition or Nightly
  2. Go to `about:config`
  3. Set `xpinstall.signatures.required` to `false`
  4. Package and self-sign your extension
- For production, publish to [Firefox Add-ons](https://addons.mozilla.org/)

### Permission Warnings

**Problem:** Browser shows warnings about extension permissions

**Solution:**
- This is expected behavior for extensions requesting permissions
- Digital Zen requires:
  - `alarms` - For focus session timers
  - `declarativeNetRequest` - For blocking distracting websites
  - `storage` - For saving settings and data
  - `activeTab` - For blocking the current tab
  - `identity` - For Google OAuth authentication
  - `host_permissions` - For accessing blocked websites
- All permissions are necessary for the extension to function properly

### OAuth Authentication Issues

**Problem:** Google authentication doesn't work or shows errors

**Solution:**
- See the [OAuth Cross-Browser Setup Guide](./oauth-setup-cross-browser.md) for detailed configuration
- See [Troubleshooting OAuth redirect_uri_mismatch](./troubleshooting-oauth-redirect-uri.md) for the most common OAuth error
- Each browser (and sometimes each installation) may have a different extension ID
- You may need to add multiple redirect URIs in Google Cloud Console for different browsers/installations

### Reloading After Changes

**Problem:** Changes to code don't appear in the extension

**Solution:**
1. Run `npm run build` or `npm run build:prod` to rebuild the extension
2. Go to your browser's extensions page
3. Find Digital Zen and click the reload/refresh icon (🔄)
4. If issues persist, remove the extension and load it again

## Testing Across Multiple Browsers

For comprehensive testing:

1. **Build the extension once:**
   ```bash
   npm run build
   ```

2. **Load in each browser** following the instructions above

3. **Test core functionality:**
   - Creating and managing blocked websites
   - Starting and stopping focus sessions
   - Timer functionality
   - Google authentication (requires OAuth setup)
   - Website blocking during active sessions

4. **Note browser-specific issues** and report them

## Production Installation

Once Digital Zen is published to browser extension stores, users can install it directly:

### Chrome Web Store
- Users can install from the Chrome Web Store
- Works for Chrome, Edge, Brave, Opera, and other Chromium browsers

### Microsoft Edge Add-ons
- Edge users can also install from Microsoft Edge Add-ons store
- May have additional review requirements

### Firefox Add-ons
- Firefox users can install from [addons.mozilla.org](https://addons.mozilla.org/)
- Requires separate submission and review process
- Extensions must be signed by Mozilla

### Other Stores
- Some browsers have their own extension stores (e.g., Opera Add-ons)
- Extensions from Chrome Web Store typically work across all Chromium browsers

## Resources

- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [Microsoft Edge Extensions](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/)
- [Firefox Extension Workshop](https://extensionworkshop.com/)
- [Firefox WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [OAuth Cross-Browser Setup](./oauth-setup-cross-browser.md)

## Support

For installation issues:

1. Check the browser console for error messages
2. Verify the extension was built correctly
3. Review this troubleshooting guide
4. Check the [main README](../README.md) for additional help
5. Open an issue on [GitHub](https://github.com/DenHelloWorld/digital-zen/issues)

---

**Last Updated:** January 9, 2026
