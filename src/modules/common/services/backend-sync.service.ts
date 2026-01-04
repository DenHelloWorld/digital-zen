import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { API_URLS } from '../constants/api-urls.const';
import { IFocus, IBackendResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class BackendSyncService {
  readonly #apiService = inject(ApiService);

  /**
   * Trigger a health check of the backend API
   * @returns Observable that emits true if healthy, false otherwise
   */
  public checkHealth(): Observable<boolean> {
    return this.#apiService
      .get<IBackendResponse<{ status: string }>>(`${API_URLS.BACKEND.BASE_URL}/health`)
      .pipe(
        catchError(error => {
          console.error('Health check failed:', error);
          return of<IBackendResponse<{ status: string }>>({
            success: false,
            error: 'Health check failed',
          });
        }),
        tap(response => {
          if (response.success) {
            console.log('Backend health check successful:', response.data);
          } else {
            console.warn('Backend health check failed:', response.error);
          }
        }),
        map(response => response.success)
      );
  }

  /**
   * Trigger pushing a period to the backend
   * @param period The period to push
   * @returns Observable that emits true if successful, false otherwise
   */
  public pushPeriod(period: IFocus.Period): Observable<boolean> {
    return this.#apiService
      .post<IBackendResponse<{ message: string }>>(`${API_URLS.BACKEND.BASE_URL}/periods`, period)
      .pipe(
        catchError(error => {
          console.error('Push period failed:', error);
          return of<IBackendResponse<{ message: string }>>({
            success: false,
            error: 'Push period failed',
          });
        }),
        tap(response => {
          if (response.success) {
            console.log('Period pushed successfully:', response.data);
          } else {
            console.error('Failed to push period:', response.error);
          }
        }),
        map(response => response.success)
      );
  }

  /**
   * Trigger pulling periods from the backend
   * @returns Observable that emits the array of periods or null on error
   */
  public pullPeriods(): Observable<IFocus.Period[] | null> {
    return this.#apiService
      .get<IBackendResponse<IFocus.Period[]>>(`${API_URLS.BACKEND.BASE_URL}/periods`)
      .pipe(
        catchError(error => {
          console.error('Pull periods failed:', error);
          return of<IBackendResponse<IFocus.Period[]>>({
            success: false,
            error: 'Pull periods failed',
          });
        }),
        tap(response => {
          if (response.success && response.data) {
            console.log('Periods pulled successfully:', response.data);
          } else {
            console.error('Failed to pull periods:', response.error);
          }
        }),
        map(response => (response.success && response.data ? response.data : null))
      );
  }
}
