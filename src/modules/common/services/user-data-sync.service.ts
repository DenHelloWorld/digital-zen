import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { API_CONFIG } from '../constants';
import { IFocus } from '../models';
import { map, Observable } from 'rxjs';
import { GoogleAuthService, IGoogleUserInfo } from './google-auth.service';

/**
 * Response from user data API
 */
export interface UserDataResponse {
  user: {
    id: number;
    email: string;
    user_id: string;
  } | null;
  periods: IFocus.Period[];
}

/**
 * Request to save user data
 */
export interface SaveUserDataRequest {
  user_email: string;
  user_id: string;
  periods: IFocus.Period[];
}

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
   */
  getUserData(userEmail: string, userId: string): Observable<UserDataResponse> {
    const url = `${API_CONFIG.apiUrl}/user-data.php`;
    const params: Record<string, string> = {};

    if (userEmail) {
      params['user_email'] = userEmail;
    }

    if (userId) {
      params['user_id'] = userId;
    }

    return this.#apiService
      .get<{ success: boolean; data: UserDataResponse }>(url, params)
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
  saveUserData(
    userEmail: string,
    userId: string,
    periods: IFocus.Period[]
  ): Observable<{ message: string; user_id: number }> {
    const url = `${API_CONFIG.apiUrl}/user-data.php`;

    const requestBody: SaveUserDataRequest = {
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
  getCurrentUserInfo(): { email: string; userId: string } | null {
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
