/**
 * Extension configuration
 * This file provides configuration values that are injected at build time
 *
 * Universal approach for all browsers:
 * - Chrome/Edge/Brave: OAuth client ID injected here (removed from manifest)
 * - Firefox: OAuth client ID injected here (Firefox doesn't support manifest oauth2 field)
 *
 * The __OAUTH_CLIENT_ID__ placeholder is replaced during build by:
 * - patch-config.js for standard builds
 * - patch-firefox-config.js for Firefox builds
 */

export const EXTENSION_CONFIG = {
  OAUTH_CLIENT_ID: '__OAUTH_CLIENT_ID__',
} as const;
