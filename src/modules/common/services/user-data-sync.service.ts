import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { API_CONFIG } from '../constants';
import { IFocus, IUserDataResponse, ISaveUserDataRequest } from '../models';
import { map, Observable } from 'rxjs';
import { GoogleAuthService, IGoogleUserInfo } from './google-auth.service';

/**
 * User Data Sync Service
 * This service handles syncing user data with backend API
 */
@Injectable({
  providedIn: 'root',
})
export class UserDataSyncService {
  readonly #apiService = inject(ApiService);
  readonly #googleAuthService = inject(GoogleAuthService);

  /**
   * Get user data from API
   *
   * @param userEmail User email
   * @param userId User ID
   * @returns Observable with user data
   * @throws Error if both userEmail and userId are empty
   */
  public getUserData(userEmail: string, userId: string): Observable<IUserDataResponse> {
    // Validate that at least one parameter is provided
    if (!userEmail && !userId) {
      throw new Error('At least one of userEmail or userId must be provided');
    }

    const url = `${API_CONFIG.apiUrl}/user`;
    const params: Record<string, string> = {};

    if (userEmail) {
      params['user_email'] = userEmail;
    }

    if (userId) {
      params['user_id'] = userId;
    }

    return this.#apiService
      .get<{ success: boolean; data: IUserDataResponse }>(url, params)
      .pipe(map(response => response.data));
  }

  /**
   * Get user data from API using request body instead of query parameters
   *
   * @param userEmail User email
   * @param userId User ID
   * @returns Observable with user data
   * @throws Error if both userEmail and userId are empty
   */
  public getUserDataWithBody(userEmail: string, userId: string): Observable<IUserDataResponse> {
    // Validate that at least one parameter is provided
    if (!userEmail && !userId) {
      throw new Error('At least one of userEmail or userId must be provided');
    }

    const url = `${API_CONFIG.apiUrl}/user`;
    const body: Record<string, string> = {};

    if (userEmail) {
      body['user_email'] = userEmail;
    }

    if (userId) {
      body['user_id'] = userId;
    }

    return this.#apiService
      .get<{ success: boolean; data: IUserDataResponse }>(url, {}, body)
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
    const url = `${API_CONFIG.apiUrl}/user`;

    const requestBody: ISaveUserDataRequest = {
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
      userId: userInfo.sub, // Using 'sub' (subject) as user ID
    };
  }
}
