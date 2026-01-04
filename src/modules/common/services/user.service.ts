import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_URLS } from '../constants';
import { IBackendResponse } from '../models';

/**
 * Interface for user data from backend
 */
export interface IUser {
  id: number;
  google_id: string;
  email: string;
  name: string;
  picture_url: string;
  created_at: string;
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
   * If the user already exists (identified by email), the existing user data is returned
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
