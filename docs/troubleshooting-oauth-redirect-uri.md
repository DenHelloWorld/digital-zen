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

## Getting Help / Получение помощи

If you need further assistance:

1. Check the [GitHub Issues](https://github.com/DenHelloWorld/digital-zen/issues)
2. Create a new issue with:
   - The exact error message
   - Your extension ID (visible in `chrome://extensions/`)
   - Screenshots of your Google Cloud Console OAuth configuration
   - Browser and extension version
