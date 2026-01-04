import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { take } from 'rxjs';
import { API_URLS, ApiService } from '../../common';
import { TokenStorageService, IJWTAuthResponse } from '../../common/services/token-storage.service';

export interface IGoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  readonly #isChromeRuntime: boolean =
    typeof chrome !== 'undefined' &&
    !!chrome.runtime &&
    !!chrome.runtime.id &&
    !!chrome.identity &&
    typeof chrome.identity.getAuthToken === 'function';
  readonly #apiService: ApiService = inject(ApiService);
  readonly #tokenStorage: TokenStorageService = inject(TokenStorageService);

  readonly #isGoogleAuthenticated: WritableSignal<boolean> = signal(false);
  readonly #isPending: WritableSignal<boolean> = signal(false);
  readonly #userInfo: WritableSignal<IGoogleUserInfo | null> = signal(null);

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
              void this.#completeLogout();
            });
          },
          error: () => void this.#completeLogout(),
        });
      } else {
        void this.#completeLogout();
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
      .pipe(take(1))
      .subscribe({
        next: info => {
          // Save user info to local state
          this.#userInfo.set(info);

          // Exchange Google token for JWT token via backend
          // The backend will create/get user and return JWT
          this.#apiService
            .post<{ success: boolean; data: IJWTAuthResponse }>(
              `${API_URLS.BACKEND.BASE_URL}${API_URLS.BACKEND.AUTH_GOOGLE}`,
              {}
            )
            .pipe(take(1))
            .subscribe({
              next: async response => {
                if (response.success && response.data?.token) {
                  // Store JWT token for future API requests
                  await this.#tokenStorage.saveToken(response.data.token);
                  console.log('[GoogleAuthService] JWT token obtained and stored');
                  console.log('[GoogleAuthService] User authenticated:', response.data.user);
                } else {
                  console.error('[GoogleAuthService] Failed to obtain JWT token');
                  // Reset authentication state since we couldn't get a JWT
                  this.#isGoogleAuthenticated.set(false);
                  this.#userInfo.set(null);
                }
              },
              error: (err: unknown) => {
                console.error('[GoogleAuthService] Failed to exchange Google token for JWT', err);
                // Reset authentication state since JWT exchange failed
                this.#isGoogleAuthenticated.set(false);
                this.#userInfo.set(null);
              },
            });
        },
        error: (err: unknown) => {
          console.error('Failed to fetch user info', err);
        },
      });
  }

  #completeLogout(): void {
    this.#isGoogleAuthenticated.set(false);
    this.#isPending.set(false);
    this.#userInfo.set(null);

    // Remove JWT token from storage asynchronously
    void this.#tokenStorage.removeToken().catch((err: unknown) => {
      console.error('[GoogleAuthService] Failed to remove JWT token on logout', err);
    });
  }
}
