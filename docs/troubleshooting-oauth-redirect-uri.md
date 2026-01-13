# Troubleshooting OAuth redirect_uri_mismatch Error

## Problem

When trying to log in with Google, you see an error:

```
Error 400: redirect_uri_mismatch
Details: flowName=GeneralOAuthFlow
```

## Причина / Cause

This error occurs when the redirect URI used by your extension doesn't match the redirect URIs configured in your Google Cloud Console OAuth credentials.

## Solution / Решение

### Step 1: Find Your Extension's Redirect URI

The extension logs the redirect URI in the browser console when you attempt to log in. To see it:

1. **Open the extension popup** (click the extension icon)
2. **Open Developer Tools** for the popup:
   - Right-click on the popup
   - Select "Inspect" or "Inspect Element"
3. **Go to the Console tab**
4. **Click the Google login button** in the extension
5. **Look for the log message** that shows:
   ```
   OAuth redirect URL: https://xxxxxxxxxxxxx.chromiumapp.org/oauth2
   ```

Copy this entire URL (e.g., `https://abcdefghijklmnopqrstuvwxyz.chromiumapp.org/oauth2`)

### Step 2: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services > Credentials**
4. Find your OAuth 2.0 Client ID and click **Edit** (pencil icon)
5. In the **Authorized redirect URIs** section, click **ADD URI**
6. Paste the redirect URI you copied (e.g., `https://abcdefghijklmnopqrstuvwxyz.chromiumapp.org/oauth2`)
7. Click **SAVE**

### Step 3: Test Again

1. Wait a few minutes for the changes to propagate
2. Try logging in again through the extension

## Understanding Extension IDs / Понимание ID расширения

### Development (Unpacked Extension)

When developing with an unpacked extension, the extension ID **changes every time you reload the extension**, unless you have a fixed key in your manifest.

**Problem:** You'll need to update the redirect URI in Google Cloud Console every time you reload.

**Solution:** Add a fixed key to your manifest for consistent ID during development.

### Production (Published Extension)

Once published to the Chrome Web Store, the extension ID remains constant, so you only need to configure the redirect URI once.

## Adding a Fixed Key for Development

To keep the same extension ID during development:

### Option 1: Generate a Key Pair

1. Create a private key:

```bash
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem
```

2. Generate the public key:

```bash
openssl rsa -in key.pem -pubout -outform DER | base64 -w 0
```

3. Add the public key to `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Digital Zen",
  "key": "YOUR_PUBLIC_KEY_HERE",
  ...
}
```

### Option 2: Use Existing Published Extension Key

If you've already published the extension, you can find the public key in the Chrome Web Store Developer Dashboard.

**Important:** Never commit your `key.pem` (private key) to version control!

## Quick Fix Script

You can create a simple script to get your redirect URI:

```javascript
// Run this in the extension popup console
console.log('Redirect URI:', chrome.identity.getRedirectURL('oauth2'));
```

## Common Issues / Распространенные проблемы

### Issue 1: Multiple Redirect URIs

If you're developing on multiple machines or have multiple versions:

**Solution:** Add all redirect URIs to the Google Cloud Console OAuth credentials. You can have multiple URIs listed.

### Issue 2: Wrong Application Type

If you selected "Web application" instead of "Chrome App" when creating OAuth credentials:

**Solution:** Create new OAuth 2.0 credentials with "Chrome App" as the application type.

### Issue 2.1: Chrome Extension Type - Missing "Authorized redirect URIs" Section

**Important Note:** If your OAuth client is configured with the "Chrome Extension" application type (newer option in Google Cloud Console), you may notice that the "Authorized redirect URIs" section is **NOT visible** on the configuration page.

**This is normal behavior!** For Chrome Extension OAuth clients:
- Google automatically handles redirect URIs based on the extension ID
- You don't need to manually configure redirect URIs
- The extension uses the format: `https://<extension-id>.chromiumapp.org/oauth2`

**However**, if you're getting `redirect_uri_mismatch` errors with a Chrome Extension OAuth client:

1. **Verify your extension ID** matches the one in the OAuth client
2. **Check the manifest.json** has the correct OAuth client ID
3. **Try creating a new OAuth client** with "Chrome App" type instead (this gives you manual control over redirect URIs)

**Chrome App vs Chrome Extension OAuth Client Types:**
- **Chrome Extension** (newer): Automatic redirect URI handling, less configuration needed
- **Chrome App** (older): Manual redirect URI configuration, more flexibility for development

If you need to configure specific redirect URIs (e.g., for development with changing extension IDs), use the "Chrome App" type.

### Issue 3: Redirect URI with Extra Characters

Make sure you copy the **exact** redirect URI including:
- `https://` at the start
- `.chromiumapp.org/oauth2` at the end
- The exact extension ID in the middle

**Example of correct format:**
```
https://abcdefghijklmnopqrstuvwxyzabcdef.chromiumapp.org/oauth2
```

### Issue 4: Changes Not Propagating

After updating redirect URIs in Google Cloud Console:

**Solution:** 
1. Wait 5-10 minutes for changes to propagate
2. Clear your browser cache
3. Try logging in again

## Detailed Setup Instructions

For complete OAuth setup instructions, see:
- [OAuth Cross-Browser Setup Guide](./oauth-setup-cross-browser.md)
- [README.md](../README.md) - Environment setup section

## Still Having Issues?

If you continue to experience problems:

1. **Check the browser console** for detailed error messages
2. **Verify your OAuth client ID** is correctly configured in `.env` file
3. **Ensure manifest.json** has the correct client ID (run `npm run build:prod`)
4. **Check that you're using the correct Google Cloud project**
5. **Verify the OAuth client type** is "Chrome App" not "Web application"

## Example Configuration

Here's what your Google Cloud Console OAuth client should look like:

**Application type:** Chrome App

**Authorized redirect URIs:**
```
https://abcdefghijklmnopqrstuvwxyzabcdef.chromiumapp.org/oauth2
```

**Authorized JavaScript origins:** (leave empty for Chrome extensions)

**Note:** Replace `abcdefghijklmnopqrstuvwxyzabcdef` with your actual extension ID.

## Firefox-Specific Issues

### Firefox Extension ID Changes

**Problem:** Firefox temporary extensions get a new ID every time Firefox restarts.

**Why:** Unlike Chrome, Firefox doesn't support the `key` field in manifest for unpacked extensions, so the extension ID is regenerated on each restart.

**Solutions:**

#### Option 1: Create a .xpi File (Recommended for Development)

1. **Build for Firefox:**
   ```bash
   npm run build:firefox
   ```

2. **Create .xpi file:**
   ```bash
   cd dist/firefox
   zip -r ../digital-zen-firefox.xpi . -x "*.DS_Store"
   ```

   **Note:** The build process already creates a .xpi file in `dist/firefox/web-ext-artifacts/` automatically.

3. **Install .xpi in Firefox:**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `.xpi` file
   
4. **Get Extension ID:**
   - The extension ID will still be temporary (changes on restart)
   - Copy the redirect URI from browser console: `https://xxxxx.extensions.allizom.org/oauth2`

5. **Add redirect URI to Google Cloud Console**

**Note:** Even with .xpi, Firefox temporary extensions get new IDs on restart. You'll need to update the redirect URI in Google Cloud Console after each restart.

#### Option 2: Sign the Extension (For Permanent Installation)

For a permanent installation with a fixed extension ID:

1. Sign the extension through [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Install the signed .xpi file
3. The extension ID will remain constant
4. Add the redirect URI once to Google Cloud Console

### Firefox Redirect URI Format

Firefox uses a different redirect URI format than Chrome:

**Chrome format:**
```
https://abcdefghijklmnopqrstuvwxyz.chromiumapp.org/oauth2
```

**Firefox format:**
```
https://abcdefghijklmnopqrstuvwxyz.extensions.allizom.org/oauth2
```

**Important:** Make sure to add the Firefox redirect URI to your Google Cloud Console OAuth credentials!

### Quick Fix for Firefox Development

Since Firefox temporary extension IDs change on every restart:

1. **Keep the Google Cloud Console page open**
2. **After each Firefox restart:**
   - Get the new redirect URI from browser console
   - Update it in Google Cloud Console (replace old URI)
   - Wait 1-2 minutes
   - Try OAuth login again

### Multiple Browser Support

If you're developing for both Chrome and Firefox, you'll need **both redirect URI formats** in Google Cloud Console:

```
https://your-chrome-extension-id.chromiumapp.org/oauth2
https://your-firefox-extension-id.extensions.allizom.org/oauth2
```

Google Cloud Console allows multiple redirect URIs - add both!

## Getting Help / Получение помощи

If you need further assistance:

1. Check the [GitHub Issues](https://github.com/DenHelloWorld/digital-zen/issues)
2. Create a new issue with:
   - The exact error message
   - Your extension ID (visible in `chrome://extensions/` or `about:debugging`)
   - Browser name and version (Chrome, Firefox, etc.)
   - Screenshots of your Google Cloud Console OAuth configuration
   - Browser and extension version
