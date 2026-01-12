# Cross-Browser OAuth Setup Guide

## Overview

Digital Zen now uses `chrome.identity.launchWebAuthFlow` for Google OAuth authentication, which provides **cross-browser compatibility** with Chrome, Edge, Firefox, and other browsers supporting the WebExtensions API.

Previously, the extension used `chrome.identity.getAuthToken`, which only worked in Google Chrome. The new implementation allows the extension to work in multiple browsers while maintaining security.

## Authentication Flow Comparison

### Old Method (Chrome-only)

- **API:** `chrome.identity.getAuthToken`
- **Browser Support:** Google Chrome only
- **Token Management:** Automatic by Chrome
- **Complexity:** Low

### New Method (Cross-browser)

- **API:** `chrome.identity.launchWebAuthFlow`
- **Browser Support:** Chrome, Edge, Firefox, and other WebExtensions-compatible browsers
- **Token Management:** Manual storage in `chrome.storage.local`
- **Complexity:** Medium

## Google Cloud OAuth Configuration

### 1. Create OAuth 2.0 Client ID

In the Google Cloud Console:

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Choose **Chrome App** as the application type
4. Enter a name for your OAuth client

**Note:** You may also see a newer "Chrome Extension" option. The difference:
- **Chrome Extension**: Automatic redirect URI handling (you won't see "Authorized redirect URIs" section)
- **Chrome App**: Manual redirect URI configuration (recommended for development flexibility)

For this guide, we use **Chrome App** to have full control over redirect URIs.

### 2. Configure Redirect URIs

**⚠️ CRITICAL: This is the most common source of the `redirect_uri_mismatch` error!**

**Important:** You must add the extension's redirect URI to the allowed redirect URIs list.

The redirect URI format for Chrome extensions is:

```
https://<extension-id>.chromiumapp.org/oauth2
```

#### How to Get Your Extension ID and Redirect URI

**Method 1: From Browser Console (Recommended)**

1. Load your extension in Chrome
2. Click the extension icon to open the popup
3. Right-click on the popup and select "Inspect"
4. Go to the Console tab
5. Click the Google login button
6. Look for the log message showing your redirect URI:
   ```
   OAuth redirect URL: https://xxxxx.chromiumapp.org/oauth2
   ```
7. Copy this exact URL

**Method 2: From chrome://extensions/**

1. Load your unpacked extension in Chrome
2. Go to `chrome://extensions/`
3. Enable Developer Mode (toggle in the top-right corner)
4. Find your extension and copy the ID (e.g., `abcdefghijklmnopqrstuvwxyzabcdef`)
5. Your redirect URI will be: `https://abcdefghijklmnopqrstuvwxyzabcdef.chromiumapp.org/oauth2`

#### Add to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Find your OAuth 2.0 Client ID and click the edit button (pencil icon)
4. In **Authorized redirect URIs**, click **ADD URI**
5. Paste your redirect URI (e.g., `https://abcdefghijklmnopqrstuvwxyzabcdef.chromiumapp.org/oauth2`)
6. Click **SAVE**
7. Wait 5-10 minutes for changes to propagate

#### Important Notes

**For development** (unpacked extensions):

- ⚠️ The extension ID changes each time you reload the extension
- You'll need to update the redirect URI in Google Cloud Console each time
- **Solution:** Use a fixed key in your manifest (see troubleshooting guide below)
- You can add multiple redirect URIs (one for each development environment)

**For production** (published extensions):

- The extension ID from Chrome Web Store remains constant
- Configure the redirect URI once using the published extension ID
- If you have a `key` field in your `manifest.json`, the ID will remain constant across builds

#### Troubleshooting redirect_uri_mismatch

If you get a `redirect_uri_mismatch` error, see our detailed troubleshooting guide:

📖 **[Troubleshooting OAuth redirect_uri_mismatch](./troubleshooting-oauth-redirect-uri.md)**

### 3. Configure OAuth Scopes

The extension requests the following scopes:

- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

These are configured in `src/manifest.json` and in the OAuth URL construction.

## Environment Configuration

### Development

1. Copy `.env.example` to `.env`
2. Set your OAuth client ID:

```env
OAUTH_CLIENT_ID=your_google_oauth_client_id_here.apps.googleusercontent.com
PUBLIC_KEY=your_chrome_extension_public_key
```

3. The extension will read the client ID from `manifest.json` at runtime

### Production Build

Run the production build to inject environment variables:

```bash
npm run build:prod
```

This will:

1. Build the Angular app
2. Compile the background script
3. Replace `__OAUTH_CLIENT_ID__` in `manifest.json` with your actual client ID
4. Replace `__PUBLIC_KEY__` in `manifest.json` with your public key

## Technical Implementation Details

### Architecture: Background Service Worker

**Important:** OAuth flow now runs in the **background service worker** instead of the popup. This prevents the authentication flow from being interrupted when the popup loses focus.

**Why this change was necessary:**
- When the popup opens Google's OAuth window, the browser gives focus to that window
- This causes the popup to close automatically (standard browser behavior)
- Any OAuth logic running in the popup context is destroyed
- The OAuth callback never executes, breaking the authentication flow

**New architecture:**
1. **Popup (GoogleAuthService):** Sends message to background, listens for state changes
2. **Background (GoogleAuthAdapter):** Handles OAuth flow, stores token and user info
3. **chrome.storage:** Persists auth state, enables communication between popup and background

### OAuth Flow Steps

1. **User clicks login button** → `GoogleAuthService.login()` is called in popup
2. **Message sent to background** → `{ command: 'START_GOOGLE_AUTH' }`
3. **Background receives message** → `GoogleAuthAdapter.login()` is called
4. **Client ID is loaded** from `extension-config.ts` (injected at build time)
5. **Redirect URL is generated** using `chrome.identity.getRedirectURL('oauth2')`
6. **Authorization URL is constructed** with:
   - Client ID
   - Redirect URI
   - Response type: `token` (implicit flow)
   - Scopes: email and profile
7. **Browser opens OAuth dialog** via `chrome.identity.launchWebAuthFlow()`
8. **User grants permissions** in Google's consent screen
9. **Google redirects** to the extension's redirect URI with access token in URL fragment
10. **Background extracts token** from the redirect URL
11. **Token is stored** in `chrome.storage.local` for persistence
12. **User info is fetched** from Google's userinfo API
13. **User info is stored** in `chrome.storage.local`
14. **Popup detects storage change** via `chrome.storage.onChanged` listener
15. **Popup updates UI** to reflect authenticated state

### Token Storage

Tokens and user info are stored in Chrome's local storage:
- `CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN` - Access token
- `CHROME_STORAGE_KEY_ENUM.GOOGLE_USER_INFO` - Complete user profile
- `CHROME_STORAGE_KEY_ENUM.USER_EMAIL` - User email
- `CHROME_STORAGE_KEY_ENUM.USER_ID` - User ID (Google's `sub` claim)

This allows:

- Token persistence across browser restarts
- Token persistence across popup close/open
- Cross-browser compatibility (each browser has its own storage)
- Communication between popup and background service worker
- Manual token management

### Token Validation

On application startup, `GoogleAuthService.checkExistingGoogleAuth()`:

1. Checks if user info exists in storage
2. Validates the stored token by calling Google's userinfo API
3. If invalid, clears all stored auth data
4. Updates UI state via Angular Signals

### Logout Process

When logging out:

1. Popup sends message to background: `{ command: 'LOGOUT_GOOGLE_AUTH' }`
2. Background retrieves token from storage
3. Token is revoked via Google's revocation endpoint
4. All auth data is cleared from storage:
   - `GOOGLE_AUTH_TOKEN`
   - `GOOGLE_USER_INFO`
   - `USER_EMAIL`
   - `USER_ID`
5. Popup detects storage change and updates UI

### State Management

**Popup (GoogleAuthService):**
- Uses Angular Signals for reactive state
- Listens to `chrome.storage.onChanged` events
- Automatically updates UI when auth state changes
- No direct OAuth implementation

**Background (GoogleAuthAdapter):**
- Pure TypeScript, no Angular dependencies
- Handles all OAuth operations
- Persists state to `chrome.storage`
- Survives popup close/open cycles

## Browser Compatibility

### Supported Browsers

- ✅ Google Chrome (Chromium-based)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave
- ✅ Firefox (with WebExtensions API)
- ✅ Other Chromium-based browsers

### Browser-Specific Notes

**Chrome/Edge/Brave:**

- Redirect URL: `https://<extension-id>.chromiumapp.org/oauth2`
- Uses Chrome Identity API

**Firefox:**

- Redirect URL: Uses `browser.identity.getRedirectURL()`
- May require additional configuration for loopback URIs
- API is `browser.identity.launchWebAuthFlow` (equivalent to Chrome's)

## Security Considerations

### Token Storage

- Tokens are stored in `chrome.storage.local`, which is:
  - Encrypted at rest by the browser
  - Isolated per extension
  - Not accessible to web pages
  - Cleared when extension is uninstalled

### Implicit Flow vs Authorization Code Flow

The current implementation uses the **implicit flow** (`response_type=token`), which:

- Returns the access token directly in the URL fragment
- Is suitable for client-side applications like browser extensions
- Does not provide refresh tokens
- Requires user re-authentication when token expires

**Alternative:** For enhanced security, you could implement:

- Authorization code flow with PKCE
- Backend token exchange
- Refresh token support

### Recommendations

1. **Use HTTPS** for all API calls (already implemented)
2. **Validate tokens** on each app startup (already implemented)
3. **Clear tokens** on logout (already implemented)
4. **Consider token expiration** - Google access tokens typically expire after 1 hour
5. **Implement token refresh** if needed for long-running sessions

## Troubleshooting

### "redirect_uri_mismatch" Error

**Problem:** OAuth flow fails with redirect URI mismatch.

**This is the most common issue!** See our comprehensive troubleshooting guide:

📖 **[Troubleshooting OAuth redirect_uri_mismatch](./troubleshooting-oauth-redirect-uri.md)**

**Quick Solution:**

1. Open your extension popup and inspect it (right-click → Inspect)
2. Go to Console tab and click the Google login button
3. Copy the redirect URL shown in the console (e.g., `https://xxxxx.chromiumapp.org/oauth2`)
4. Add this exact URL to your Google Cloud Console OAuth credentials under "Authorized redirect URIs"
5. Wait 5-10 minutes and try again

### Token Not Persisting

**Problem:** User needs to log in every time.

**Solution:**

1. Check browser's storage permissions
2. Verify `chrome.storage` permission in manifest
3. Check browser console for storage errors

### "OAuth client ID not configured"

**Problem:** Extension shows warning about missing client ID.

**Solution:**

1. Ensure `.env` file has `OAUTH_CLIENT_ID` set
2. Run `npm run build:prod` to inject the client ID
3. Verify `manifest.json` has the actual client ID (not `__OAUTH_CLIENT_ID__`)

## Migration from getAuthToken

If you're migrating from the old `getAuthToken` implementation:

### Code Changes

- ✅ `chrome.identity.getAuthToken` → `chrome.identity.launchWebAuthFlow`
- ✅ Automatic token caching → Manual storage in `chrome.storage.local`
- ✅ `chrome.identity.removeCachedAuthToken` → Manual storage removal

### OAuth Configuration Changes

- ✅ Add redirect URI to Google Cloud Console
- ✅ Update manifest.json to use `oauth2` section (already present)
- ✅ No changes needed to scopes

### User Experience

- Users will need to re-authenticate once after the update
- Stored tokens from the old method are not compatible
- Login flow now shows a popup window instead of using Chrome's built-in account picker

## Resources

- [Chrome Identity API Documentation](https://developer.chrome.com/docs/extensions/reference/api/identity)
- [MDN launchWebAuthFlow Reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

## Support

For issues related to OAuth setup:

1. Check browser console for detailed error messages
2. Verify Google Cloud Console configuration
3. Ensure environment variables are set correctly
4. Review the implementation in `src/modules/auth/services/google-auth.service.ts`
