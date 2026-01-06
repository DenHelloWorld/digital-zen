import { inject, Injectable, Injector, signal } from '@angular/core';
import { ApiService } from './api.service';
import { API_URLS, SYNC_DELAY_MS } from '../constants';
import { IFocus, IUserDataSync } from '../models';
import { delay, EMPTY, filter, finalize, map, Observable, switchMap, tap } from 'rxjs';
import { GoogleAuthService, IGoogleUserInfo } from './google-auth.service';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * User Data Sync Service
 * This service handles syncing user data with backend API
 */
@Injectable({
  providedIn: 'root',
})
export class UserDataSyncService {
  readonly #injector = inject(Injector);
  readonly #apiService = inject(ApiService);
  readonly #googleAuthService = inject(GoogleAuthService);

  readonly #isPending = signal(false);
  public readonly isPending = this.#isPending.asReadonly();

  constructor() {
    toObservable(this.#googleAuthService.userInfo, { injector: this.#injector })
      .pipe(
        filter((u): u is IGoogleUserInfo => !!u),
        tap(() => this.#isPending.set(true)),
        switchMap(userInfo =>
          this.getUserData(userInfo.email, userInfo.sub).pipe(
            /**
             * Simulate network delay for better UX
             * */
            delay(SYNC_DELAY_MS),
            /**
             * If user does not exist, create new user
             * */
            switchMap(userData => (userData.user ? EMPTY : this.createUser(userInfo))),
            finalize(() => this.#isPending.set(false))
          )
        )
      )
      .subscribe();
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
