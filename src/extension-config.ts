/**
 * Extension configuration
 * OAuth client ID for Google authentication
 * Placeholder is replaced at build time from .env file
 *
 * For tests: The placeholder value is intentional and handled gracefully by GoogleAuthService
 */

export const EXTENSION_CONFIG = {
  /**
   * OAuth Client ID for Google authentication
   * - In production builds: Replaced with actual client ID from .env file
   * - In tests: Placeholder value is used (service handles this gracefully)
   * - Service will log a warning if placeholder is detected, but won't crash
   */
  OAUTH_CLIENT_ID: '__OAUTH_CLIENT_ID__',
} as const;
