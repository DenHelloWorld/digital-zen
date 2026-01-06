import { inject, Injectable, Injector, DestroyRef } from '@angular/core';
import { ApiService } from './api.service';
import { API_URLS } from '../constants';
import { IFocus, IUserDataSync } from '../models';
import { map, Observable } from 'rxjs';
import { GoogleAuthService, IGoogleUserInfo } from './google-auth.service';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CHROME_COMMAND_ENUM } from '../enums/chrome-command.enum';

/**
 * User Data Sync Service
 * This service handles syncing user data with backend API
 * Synchronization is delegated to background service for reliability
 */
@Injectable({
  providedIn: 'root',
})
export class UserDataSyncService {
  readonly #injector = inject(Injector);
  readonly #apiService = inject(ApiService);
  readonly #googleAuthService = inject(GoogleAuthService);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    // Trigger sync in background when user logs in
    toObservable(this.#googleAuthService.userInfo, { injector: this.#injector })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(userInfo => {
        if (userInfo && userInfo.email && userInfo.sub) {
          this.#triggerBackgroundSync(userInfo.email, userInfo.sub);
        }
      });
  }

  /**
   * Trigger synchronization in background service
   *
   * @param userEmail User email
   * @param userId User ID
   */
  #triggerBackgroundSync(userEmail: string, userId: string): void {
    if (chrome.runtime) {
      chrome.runtime.sendMessage(
        {
          command: CHROME_COMMAND_ENUM.SYNC_USER_DATA,
          userEmail,
          userId,
        },
        response => {
          if (chrome.runtime.lastError) {
            console.error(
              '[UserDataSyncService] Background sync failed:',
              chrome.runtime.lastError
            );
          } else if (response?.success) {
            console.log('[UserDataSyncService] Background sync completed successfully');
          } else {
            console.error('[UserDataSyncService] Background sync returned error:', response);
          }
        }
      );
    }
  }

  /**
   * Get user data from API
   *
   * @param userEmail User email
   * @param userId User ID
   * @returns Observable with user data
   * @throws Error if both userEmail and userId are empty
   */
  public getUserData(userEmail: string, userId: string): Observable<IUserDataSync.Response> {
    if (!userEmail && !userId) {
      throw new Error('At least one of userEmail or userId must be provided');
    }

    const url = `${API_URLS.USER}`;
    const params: Record<string, string> = {};

    if (userEmail) {
      params['user_email'] = userEmail;
    }

    if (userId) {
      params['user_id'] = userId;
    }

    return this.#apiService
      .get<{ success: boolean; data: IUserDataSync.Response }>(url, params)
      .pipe(map(response => response.data));
  }

  /**
   * Save user data to API
   *
   * @param userEmail User email
   * @param userId User ID
   * @param periods Array of periods to save
   * @returns Observable with save result
   */
  public saveUserData(
    userEmail: string,
    userId: string,
    periods: IFocus.Period[]
  ): Observable<{ message: string; user_id: number }> {
    const url = `${API_URLS.USER}`;

    const requestBody: IUserDataSync.SaveRequest = {
      user_email: userEmail,
      user_id: userId,
      periods: periods,
    };

    return this.#apiService
      .post<{ success: boolean; data: { message: string; user_id: number } }>(url, requestBody)
      .pipe(map(response => response.data));
  }

  /**
   * Get user info from current authentication
   * Returns user email and ID if available
   *
   * @returns Object with email and userId or null
   */
  public getCurrentUserInfo(): { email: string; userId: string } | null {
    const userInfo: IGoogleUserInfo | null = this.#googleAuthService.userInfo();

    if (!userInfo || !userInfo.email) {
      return null;
    }

    return {
      email: userInfo.email,
      userId: userInfo.sub,
    };
  }

  public createUser(userInfo: IGoogleUserInfo): Observable<IUserDataSync.SaveRequest> {
    const url = `${API_URLS.USER}`;

    return this.#apiService
      .post<{ success: boolean; data: IUserDataSync.SaveRequest }>(url, {
        user_email: userInfo.email,
        user_id: userInfo.sub,
        periods: [],
      })
      .pipe(map(res => res.data));
  }
}
