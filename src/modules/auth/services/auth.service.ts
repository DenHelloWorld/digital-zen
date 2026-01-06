import { effect, inject, Injectable, Signal } from '@angular/core';
import { GoogleAuthService } from './google-auth.service';
import { CHROME_COMMAND_ENUM, LoggerService } from '../../common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #googleAuthService = inject(GoogleAuthService);
  readonly #logger = inject(LoggerService);
  readonly #isChromeRuntime: boolean = typeof chrome !== 'undefined' && !!chrome.runtime;

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
            this.#logger.error('AuthService', 'Background sync failed:', chrome.runtime.lastError);
          } else if (response?.success) {
            this.#logger.info('AuthService', 'Background sync completed successfully');
          } else {
            const errorMessage = response?.error ?? 'Unknown error during background sync';
            this.#logger.error('AuthService', 'Background sync returned error:', errorMessage);
          }
        }
      );
    }
  }
}
