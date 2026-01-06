import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ApiService, API_URLS, logger } from '../../common';

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
 * Handles Google OAuth authentication flow and user info retrieval
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
    typeof chrome !== 'undefined' &&
    !!chrome.runtime &&
    !!chrome.runtime.id &&
    !!chrome.identity &&
    typeof chrome.identity.getAuthToken === 'function';
  /** @guideline DZ_02, DZ_09 - Dependency injection with inject(), readonly */
  readonly #apiService = inject(ApiService);
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
  }

  public login(): void {
    if (this.#isPending() || !this.#isChromeRuntime) {
      return;
    }

    this.#isPending.set(true);

    chrome.identity
      /**
       * interactive: true - prompts the user to select a Google account and grant permissions if not already granted.
       * */
      .getAuthToken({ interactive: true })
      .then((result: chrome.identity.GetAuthTokenResult) => {
        this.#isGoogleAuthenticated.set(!!result?.token);
        this.#getUserInfo(result?.token);
      })
      .catch(() => {
        this.#isGoogleAuthenticated.set(false);
      })
      .finally(() => {
        this.#isPending.set(false);
      });
  }

  public logout(): void {
    if (this.#isPending() || !this.#isChromeRuntime) {
      return;
    }

    this.#isPending.set(true);

    chrome.identity.getAuthToken({ interactive: false }).then(result => {
      if (result?.token) {
        const url = `${API_URLS.GOOGLE.REVOKE_TOKEN}${result.token}`;

        this.#apiService.get(url).subscribe({
          next: () => {
            chrome.identity.removeCachedAuthToken({ token: result.token! }, () => {
              this.#completeLogout();
            });
          },
          error: () => this.#completeLogout(),
        });
      } else {
        this.#completeLogout();
      }
    });
  }

  public checkExistingGoogleAuth(): void {
    if (this.#isPending() || !this.#isChromeRuntime) {
      return;
    }

    this.#isPending.set(true);

    chrome.identity
      .getAuthToken({ interactive: false })
      .then(result => {
        this.#isGoogleAuthenticated.set(!!result?.token);
        this.#getUserInfo(result?.token);
      })
      .catch(() => this.#isGoogleAuthenticated.set(false))
      .finally(() => this.#isPending.set(false));
  }

  #getUserInfo(token: string | undefined): void {
    if (!token) {
      return;
    }

    this.#apiService
      .get<IGoogleUserInfo>(API_URLS.GOOGLE.USER_INFO, { access_token: token })
      .subscribe({
        next: info => {
          // TODO: We can use this info later
          // also we can save it in chrome storage
          this.#userInfo.set(info);
        },
        error: (err: unknown) => {
          this.#logger.error('Failed to fetch user info', err);
        },
      });
  }

  #completeLogout(): void {
    this.#isGoogleAuthenticated.set(false);
    this.#isPending.set(false);
    this.#userInfo.set(null);
  }
}
