import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
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
   * @returns Observable that emits the user data or null on error
   */
  public createUser(): Observable<IUser | null> {
    return this.#apiService
      .post<IBackendResponse<IUser>>(`${API_URLS.BACKEND.BASE_URL}${API_URLS.BACKEND.USERS}`, {})
      .pipe(
        catchError(error => {
          console.error('User creation failed:', error);
          return of<IBackendResponse<IUser>>({
            success: false,
            error: 'User creation failed',
          });
        }),
        tap(response => {
          if (response.success && response.data) {
            console.log('User created/retrieved successfully:', response.data);
          } else {
            console.error('Failed to create/retrieve user:', response.error);
          }
        }),
        map(response => (response.success && response.data ? response.data : null))
      );
  }

  /**
   * Get current user information from the backend
   *
   * @returns Observable that emits the user data or null on error
   */
  public getCurrentUser(): Observable<IUser | null> {
    return this.#apiService
      .get<IBackendResponse<IUser>>(`${API_URLS.BACKEND.BASE_URL}${API_URLS.BACKEND.ME}`)
      .pipe(
        catchError(error => {
          console.error('Get current user failed:', error);
          return of<IBackendResponse<IUser>>({
            success: false,
            error: 'Get current user failed',
          });
        }),
        tap(response => {
          if (response.success && response.data) {
            console.log('Current user retrieved successfully:', response.data);
          } else {
            console.error('Failed to retrieve current user:', response.error);
          }
        }),
        map(response => (response.success && response.data ? response.data : null))
      );
  }
}
