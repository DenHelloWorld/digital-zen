import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import {
  ApiService,
  API_URLS,
  logger,
  ChromeStorageService,
  CHROME_STORAGE_KEY_ENUM,
} from '../../common';
import { EXTENSION_CONFIG } from '../../../extension-config';

export interface IGoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

/**
 * Google authentication service for Chrome Extension
 * Handles Google OAuth authentication flow using launchWebAuthFlow for cross-browser compatibility
 * Supports Chrome, Edge, Firefox and other browsers with WebExtensions API
 *
 * Universal approach: OAuth client ID is read from extension-config.ts (injected at build time)
 * This works consistently across all browsers.
 *
 * @guidelines
 * - DZ_02: Dependency injection using inject() function
 * - DZ_04: Angular Signals for reactive state (signal, computed)
 * - DZ_05: RxJS in ApiService for HTTP requests (valid use case)
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_11: Universal Logger usage
 *
 * @see /docs/CODING_GUIDELINES.md
 * @see https://angular.dev/guide/signals (Signals)
 * @see https://developer.chrome.com/docs/extensions/reference/api/identity (Chrome Identity API)
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow (MDN launchWebAuthFlow)
 */
@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  /** @guideline DZ_08 - Private readonly field for runtime check */
  readonly #isChromeRuntime: boolean =
    typeof chrome !== 'undefined' &&
    !!chrome.runtime &&
    !!chrome.runtime.id &&
    !!chrome.identity &&
    typeof chrome.identity.launchWebAuthFlow === 'function' &&
    typeof chrome.identity.getRedirectURL === 'function';
  /** @guideline DZ_02, DZ_09 - Dependency injection with inject(), readonly */
  readonly #apiService = inject(ApiService);
  /** @guideline DZ_02, DZ_09 - Dependency injection with inject(), readonly */
  readonly #storageService = inject(ChromeStorageService);
  /** @guideline DZ_11 - Universal Logger usage */
  readonly #logger = logger.createLogger('GoogleAuthService');

  /** @guideline DZ_04, DZ_08 - Private writable signals for internal state */
  readonly #isGoogleAuthenticated: WritableSignal<boolean> = signal(false);
  readonly #isPending: WritableSignal<boolean> = signal(false);
  readonly #userInfo: WritableSignal<IGoogleUserInfo | null> = signal(null);

  /** @guideline DZ_04 - Public readonly computed signals for consumers */
  public isGoogleAuthenticated: Signal<boolean> = computed(() => this.#isGoogleAuthenticated());
  public isPending: Signal<boolean> = computed(() => this.#isPending());
  public userInfo: Signal<IGoogleUserInfo | null> = computed(() => this.#userInfo());

  /** @guideline DZ_08 - Private field for OAuth client ID from manifest */
  #clientId: string | null = null;

  /** @guideline DZ_08 - OAuth scopes for Google authentication */
  readonly #OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  /** @guideline DZ_08 - Placeholder value for OAuth client ID before environment variable injection */
  readonly #OAUTH_CLIENT_ID_PLACEHOLDER = '__OAUTH_CLIENT_ID__';

  constructor() {
    this.#loadClientId();
    this.checkExistingGoogleAuth();
  }

  /**
   * Loads OAuth client ID from extension config
   * Universal approach: client ID is injected at build time into extension-config.ts
   * Works consistently across all browsers (Chrome, Edge, Brave, Firefox, etc.)
   */
  #loadClientId(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    try {
      // Get client ID from extension config (injected at build time)
      this.#clientId = EXTENSION_CONFIG.OAUTH_CLIENT_ID;

      if (!this.#clientId || this.#clientId === this.#OAUTH_CLIENT_ID_PLACEHOLDER) {
        this.#logger.warn(
          'OAuth client ID not configured. Run build with OAUTH_CLIENT_ID env var.'
        );
      } else {
        this.#logger.info('OAuth client ID loaded from extension config');
      }
    } catch (error) {
      this.#logger.error('Failed to load client ID from config', error);
    }
  }

  /**
   * Initiates Google OAuth login flow using launchWebAuthFlow for cross-browser compatibility
   * Works in Chrome, Edge, Firefox and other browsers supporting WebExtensions API
   */
  public login(): void {
    if (this.#isPending() || !this.#isChromeRuntime || !this.#clientId) {
      if (!this.#clientId) {
        this.#logger.error('Cannot login: OAuth client ID not configured');
      }
      return;
    }

    this.#isPending.set(true);

    try {
      // Get the redirect URL for this extension
      const redirectUrl = chrome.identity.getRedirectURL('oauth2');

      this.#logger.info('OAuth redirect URL:', redirectUrl);
      this.#logger.info(
        'If you get redirect_uri_mismatch error, add this URL to Google Cloud Console:',
        redirectUrl
      );

      // Construct OAuth authorization URL
      const authUrl =
        `${API_URLS.GOOGLE.OAUTH_AUTH}?` +
        `client_id=${encodeURIComponent(this.#clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(this.#OAUTH_SCOPES.join(' '))}` +
        `&prompt=consent`;

      this.#logger.info('Starting OAuth flow with redirect URL:', redirectUrl);

      // Launch web auth flow
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        (responseUrl?: string) => {
          if (chrome.runtime.lastError || !responseUrl) {
            this.#logger.error('OAuth flow failed:', chrome.runtime.lastError?.message);
            this.#isGoogleAuthenticated.set(false);
            this.#isPending.set(false);
            return;
          }

          // Extract access token from response URL
          const token = this.#extractTokenFromUrl(responseUrl);

          if (token) {
            this.#logger.info('OAuth flow completed successfully');
            // Store token in Chrome storage for persistence
            this.#storageService.set(CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN, token, () => {
              this.#isGoogleAuthenticated.set(true);
              this.#getUserInfo(token);
              this.#isPending.set(false);
            });
          } else {
            this.#logger.error('Failed to extract token from response URL');
            this.#isGoogleAuthenticated.set(false);
            this.#isPending.set(false);
          }
        }
      );
    } catch (error) {
      this.#logger.error('Error during login:', error);
      this.#isGoogleAuthenticated.set(false);
      this.#isPending.set(false);
    }
  }

  /**
   * Extracts access token from OAuth redirect URL
   * Validates token format and safely parses the URL
   * @param url The redirect URL containing the access token in the fragment
   * @returns The access token or null if not found or invalid
   */
  #extractTokenFromUrl(url: string): string | null {
    try {
      // Parse the URL to safely extract the fragment
      const parsedUrl = new URL(url);
      const fragment = parsedUrl.hash.substring(1); // Remove the leading #

      // Parse the fragment as URL search params
      const params = new URLSearchParams(fragment);
      const token = params.get('access_token');

      // Basic validation - token should be a non-empty string
      // Google OAuth tokens are typically alphanumeric with some special chars
      // We trust Google's OAuth response, so validation is minimal
      if (token && token.length > 0) {
        return token;
      }

      this.#logger.warn('Invalid or missing access token in OAuth response');
      return null;
    } catch (error) {
      this.#logger.error('Error extracting token from URL:', error);
      return null;
    }
  }

  /**
   * Logs out the user by revoking the OAuth token and clearing stored data
   */
  public logout(): void {
    if (this.#isPending() || !this.#isChromeRuntime) {
      return;
    }

    this.#isPending.set(true);

    // Get the stored token
    this.#storageService.get<string>(CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN, token => {
      if (token) {
        const url = `${API_URLS.GOOGLE.REVOKE_TOKEN}${token}`;

        // Revoke the token with Google
        this.#apiService.get(url).subscribe({
          next: () => {
            this.#logger.info('Token revoked successfully');
            this.#completeLogout();
          },
          error: (error: unknown) => {
            this.#logger.error('Failed to revoke token:', error);
            // Complete logout anyway
            this.#completeLogout();
          },
        });
      } else {
        this.#completeLogout();
      }
    });
  }

  /**
   * Checks for existing authentication by looking for stored token
   * and validating it with Google's API
   */
  public checkExistingGoogleAuth(): void {
    if (this.#isPending() || !this.#isChromeRuntime) {
      return;
    }

    this.#isPending.set(true);

    // Check if we have a stored token
    this.#storageService.get<string>(CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN, token => {
      if (token) {
        // Validate token by fetching user info
        this.#getUserInfo(token, (success: boolean) => {
          this.#isGoogleAuthenticated.set(success);
          this.#isPending.set(false);

          if (!success) {
            // Token is invalid, clear it
            this.#storageService.remove(CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN);
          }
        });
      } else {
        this.#isGoogleAuthenticated.set(false);
        this.#isPending.set(false);
      }
    });
  }

  /**
   * Fetches user info from Google's userinfo endpoint
   * @param token The access token
   * @param callback Optional callback to indicate success/failure for validation
   */
  #getUserInfo(token: string | undefined, callback?: (success: boolean) => void): void {
    if (!token) {
      callback?.(false);
      return;
    }

    this.#apiService
      .get<IGoogleUserInfo>(API_URLS.GOOGLE.USER_INFO, { access_token: token })
      .subscribe({
        next: info => {
          this.#userInfo.set(info);
          callback?.(true);
        },
        error: (err: unknown) => {
          this.#logger.error('Failed to fetch user info', err);
          callback?.(false);
        },
      });
  }

  /**
   * Completes the logout process by clearing all auth-related data
   */
  #completeLogout(): void {
    // Remove stored token and user credentials
    this.#storageService.remove(CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN, () => {
      // Also clear user credentials to prevent backend sync after logout
      if (this.#isChromeRuntime) {
        const keysToRemove: string[] = [
          CHROME_STORAGE_KEY_ENUM.USER_EMAIL,
          CHROME_STORAGE_KEY_ENUM.USER_ID,
        ];
        chrome.storage.local.remove(keysToRemove, () => {
          this.#isGoogleAuthenticated.set(false);
          this.#isPending.set(false);
          this.#userInfo.set(null);
          this.#logger.info('Logout completed, user credentials cleared');
        });
      } else {
        this.#isGoogleAuthenticated.set(false);
        this.#isPending.set(false);
        this.#userInfo.set(null);
      }
    });
  }
}
