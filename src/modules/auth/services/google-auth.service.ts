import { API_URLS } from '../../common/constants/api-urls.const';
import { CHROME_COMMAND_ENUM } from '../../common/enums/chrome-command.enum';
import { CHROME_STORAGE_KEY_ENUM } from '../../common/enums/chrome-storage-key.enum';
import { logger } from '../../common/helpers/logger';
import { IGoogleUserInfo } from '../../common/models/google-user-info.model';
import { ApiService } from '../../common/services/api.service';
import { ChromeStorageService } from '../../common/services/chrome-storage.service';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

/**
 * Google authentication service for Chrome Extension
 * Coordinates with background service worker for OAuth authentication
 *
 * Architecture:
 * - Popup sends START_GOOGLE_AUTH message to background service worker
 * - Background handles OAuth flow (doesn't close when popup loses focus)
 * - Background stores token and user info in chrome.storage
 * - Popup listens to storage changes and updates state accordingly
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
 */
@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  /** @guideline DZ_08 - Private readonly field for runtime check */
  readonly #isChromeRuntime: boolean =
    typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
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

  constructor() {
    this.checkExistingGoogleAuth();
    this.#listenToStorageChanges();
  }

  /**
   * Initiates Google OAuth login flow by sending message to background service worker
   * Background handles the OAuth flow which won't be interrupted when popup closes
   */
  public login(): void {
    if (this.#isPending() || !this.#isChromeRuntime) {
      return;
    }

    this.#isPending.set(true);
    this.#logger.info('Sending START_GOOGLE_AUTH message to background...');

    chrome.runtime.sendMessage(
      { command: CHROME_COMMAND_ENUM.START_GOOGLE_AUTH },
      (response: { success: boolean; error?: string }) => {
        if (chrome.runtime.lastError) {
          this.#logger.error('Failed to communicate with background:', chrome.runtime.lastError);
          this.#isPending.set(false);
          return;
        }

        if (response?.success) {
          this.#logger.info('Background OAuth flow completed successfully');
          // Auth state will be updated via storage change listener
          // Check immediately to update UI faster
          this.checkExistingGoogleAuth();
        } else {
          this.#logger.error('Background OAuth flow failed:', response?.error);
          this.#isPending.set(false);
        }
      }
    );
  }

  /**
   * Logs out the user by sending message to background service worker
   * Background handles token revocation and data cleanup
   */
  public logout(): void {
    if (this.#isPending() || !this.#isChromeRuntime) {
      return;
    }

    this.#isPending.set(true);

    chrome.runtime.sendMessage(
      { command: CHROME_COMMAND_ENUM.LOGOUT_GOOGLE_AUTH },
      (response: { success: boolean; error?: string }) => {
        if (chrome.runtime.lastError) {
          this.#logger.error('Failed to communicate with background:', chrome.runtime.lastError);
          this.#isPending.set(false);
          return;
        }

        if (response?.success) {
          this.#logger.info('Logout completed successfully');
          // Auth state will be updated via storage change listener
        } else {
          this.#logger.error('Logout failed:', response?.error);
        }

        this.#isPending.set(false);
      }
    );
  }

  /**
   * Checks for existing authentication by looking for stored token and user info
   * Called on service initialization and after login completes
   */
  public checkExistingGoogleAuth(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    // Check if we have stored user info (indicates successful auth)
    this.#storageService.get<IGoogleUserInfo>(
      CHROME_STORAGE_KEY_ENUM.GOOGLE_USER_INFO,
      userInfo => {
        if (userInfo) {
          // We have user info, validate it's still good by checking token
          this.#storageService.get<string>(CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN, token => {
            if (token) {
              // Validate token by fetching user info
              this.#getUserInfo(token, (success: boolean) => {
                if (success) {
                  this.#isGoogleAuthenticated.set(true);
                  this.#isPending.set(false);
                } else {
                  // Token is invalid, clear it
                  this.#clearAuthData();
                  this.#isGoogleAuthenticated.set(false);
                  this.#isPending.set(false);
                }
              });
            } else {
              // No token, but have user info - inconsistent state, clear all
              this.#clearAuthData();
              this.#isGoogleAuthenticated.set(false);
              this.#isPending.set(false);
            }
          });
        } else {
          this.#isGoogleAuthenticated.set(false);
          this.#isPending.set(false);
        }
      }
    );
  }

  /**
   * Listens to chrome.storage changes to update auth state
   * This allows popup to react to auth changes made by background service worker
   */
  #listenToStorageChanges(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') {
        return;
      }

      // Handle auth state changes (both login and logout)
      // Check for user info changes first as it's the primary indicator
      const userInfoChange = changes[CHROME_STORAGE_KEY_ENUM.GOOGLE_USER_INFO];
      const tokenChange = changes[CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN];

      if (userInfoChange || (tokenChange && !tokenChange.newValue)) {
        const newUserInfo = userInfoChange?.newValue as IGoogleUserInfo | null;

        if (newUserInfo) {
          this.#logger.info('User info updated in storage, updating state');
          this.#userInfo.set(newUserInfo);
          this.#isGoogleAuthenticated.set(true);
          this.#isPending.set(false);
        } else if (userInfoChange || !tokenChange?.newValue) {
          // User info removed or token removed - clear auth state
          this.#logger.info('Auth data cleared from storage, clearing auth state');
          this.#userInfo.set(null);
          this.#isGoogleAuthenticated.set(false);
          this.#isPending.set(false);
        }
      }
    });
  }

  /**
   * Fetches user info from Google's userinfo endpoint to validate token
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
   * Clears auth-related data from storage
   */
  #clearAuthData(): void {
    if (this.#isChromeRuntime) {
      const keysToRemove: string[] = [
        CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN,
        CHROME_STORAGE_KEY_ENUM.GOOGLE_USER_INFO,
        CHROME_STORAGE_KEY_ENUM.USER_EMAIL,
        CHROME_STORAGE_KEY_ENUM.USER_ID,
      ];
      chrome.storage.local.remove(keysToRemove);
    }
  }
}
