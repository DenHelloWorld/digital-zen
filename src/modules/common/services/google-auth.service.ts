import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, catchError, tap, of } from 'rxjs';
import { ApiService } from './api.service';
import { BackendSyncService } from './backend-sync.service';
import { API_URLS } from '../constants';

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
  readonly #backendSyncService: BackendSyncService = inject(BackendSyncService);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);

  readonly #isGoogleAuthenticated: WritableSignal<boolean> = signal(false);
  readonly #isPending: WritableSignal<boolean> = signal(false);
  readonly #userInfo: WritableSignal<IGoogleUserInfo | null> = signal(null);
  readonly #isSyncing: WritableSignal<boolean> = signal(false);

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
          this.#triggerBackendSync();
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
  }

  /**
   * Trigger backend synchronization after successful authentication
   * This method performs health check and pulls periods from the backend
   * Prevents concurrent sync operations
   */
  #triggerBackendSync(): void {
    // Prevent concurrent sync operations
    if (this.#isSyncing()) {
      console.log('[GoogleAuthService] Sync already in progress, skipping');
      return;
    }

    this.#isSyncing.set(true);

    this.#backendSyncService
      .checkHealth()
      .pipe(
        switchMap(isHealthy => {
          if (isHealthy) {
            console.log('[GoogleAuthService] Backend is healthy, pulling periods...');
            return this.#backendSyncService.pullPeriods();
          } else {
            console.warn('[GoogleAuthService] Backend health check failed, skipping sync');
            return of(null);
          }
        }),
        tap(periods => {
          if (periods) {
            console.log('[GoogleAuthService] Successfully pulled periods:', periods.length);
          }
          this.#isSyncing.set(false);
        }),
        catchError((err: unknown) => {
          console.error('[GoogleAuthService] Backend sync error:', err);
          this.#isSyncing.set(false);
          return of(null);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
