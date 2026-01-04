import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_URLS } from '../constants';
import { IBackendResponse } from '../models';

/**
 * Interface for user data returned by the backend.
 *
 * NOTE:
 * - Property names intentionally use `snake_case` to match the backend API/DB schema.
 * - This allows us to use the interface directly with the HTTP client without additional
 *   mapping between camelCase and snake_case.
 */
export interface IUser {
  /** Unique numeric identifier of the user. */
  id: number;
  /** Google account identifier as provided by the backend (snake_case to match API). */
  google_id: string;
  /** Primary email address of the user. */
  email: string;
  /** Display name of the user. */
  name: string;
  /** URL of the user's profile picture (snake_case to match API). */
  picture_url: string;
  /** ISO 8601 timestamp when the user record was created (snake_case to match API). */
  created_at: string;
  /** ISO 8601 timestamp of the user's last login (snake_case to match API). */
  last_login_at: string;
}

/**
 * Service responsible for user-related operations with the backend API.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  readonly #apiService: ApiService = inject(ApiService);

  /**
   * Create or get existing user in the backend
   * This is called after successful Google login to ensure the user exists in our database
   * If the user already exists (identified by their Google account `google_id`), the existing user data is returned
   *
   * NOTE: The backend extracts user information (email, name, picture) from the Google OAuth token
   * sent in the Authorization header via the auth interceptor. No user data needs to be sent in the body.
   *
   * @returns Observable that emits the user data
   * @throws Will propagate HTTP errors for proper error handling by consumers
   */
  public createUser(): Observable<IUser | null> {
    return this.#apiService
      .post<IBackendResponse<IUser>>(`${API_URLS.BACKEND.BASE_URL}${API_URLS.BACKEND.USERS}`, {})
      .pipe(map(response => (response.success && response.data ? response.data : null)));
  }

  /**
   * Get current user information from the backend
   *
   * @returns Observable that emits the user data
   * @throws Will propagate HTTP errors for proper error handling by consumers
   */
  public getCurrentUser(): Observable<IUser | null> {
    return this.#apiService
      .get<IBackendResponse<IUser>>(`${API_URLS.BACKEND.BASE_URL}${API_URLS.BACKEND.ME}`)
      .pipe(map(response => (response.success && response.data ? response.data : null)));
  }
}
