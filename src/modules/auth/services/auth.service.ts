import { effect, inject, Injectable, Signal } from '@angular/core';
import { GoogleAuthService } from './google-auth.service';
import { CHROME_COMMAND_ENUM, logger } from '../../common';

/**
 * Main authentication service
 * Coordinates Google authentication and triggers background data synchronization
 * 
 * @guidelines
 * - DZ_02: Dependency injection using inject() function
 * - DZ_04: Angular Signals for reactive state
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_11: Universal Logger usage
 * 
 * @see /docs/CODING_GUIDELINES.md
 * @see https://angular.dev/guide/signals (Signals)
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #googleAuthService = inject(GoogleAuthService);
  /** @guideline DZ_11 - Universal Logger usage */
  readonly #logger = logger.createLogger('AuthService');
  /** @guideline DZ_08 - Private readonly field for runtime check */
  readonly #isChromeRuntime: boolean = typeof chrome !== 'undefined' && !!chrome.runtime;

  /** @guideline DZ_04 - Public signals exposing auth state */
  public isGoogleAuthenticated: Signal<boolean> = this.#googleAuthService.isGoogleAuthenticated;
  public isGoogleAuthPending: Signal<boolean> = this.#googleAuthService.isPending;

  constructor() {
    // Trigger background sync when user info changes
    effect(() => {
      const userInfo = this.#googleAuthService.userInfo();
      if (userInfo && userInfo.email && userInfo.sub) {
        this.#triggerBackgroundSync(userInfo.email, userInfo.sub);
      }
    });
  }

  public loginWithGoogle(): void {
    this.#googleAuthService.login();
  }

  public logoutFromGoogle(): void {
    this.#googleAuthService.logout();
  }

  /**
   * Trigger synchronization in background service
   *
   * @param userEmail User email
   * @param userId User ID
   */
  #triggerBackgroundSync(userEmail: string, userId: string): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage(
        {
          command: CHROME_COMMAND_ENUM.SYNC_USER_DATA,
          userEmail,
          userId,
        },
        response => {
          if (chrome.runtime.lastError) {
            this.#logger.error('Background sync failed:', chrome.runtime.lastError);
          } else if (response?.success) {
            this.#logger.info('Background sync completed successfully');
          } else {
            const errorMessage = response?.error ?? 'Unknown error during background sync';
            this.#logger.error('Background sync returned error:', errorMessage);
          }
        }
      );
    }
  }
}
