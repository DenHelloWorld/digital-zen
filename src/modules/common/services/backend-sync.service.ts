import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { API_URLS } from '../constants/api-urls.const';
import { IFocus, BackendResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class BackendSyncService {
  readonly #apiService = inject(ApiService);
  readonly #destroyRef = inject(DestroyRef);

  // Pending state signals for each operation
  readonly #isCheckingHealth: WritableSignal<boolean> = signal(false);
  readonly #isPushingPeriod: WritableSignal<boolean> = signal(false);
  readonly #isPullingPeriods: WritableSignal<boolean> = signal(false);

  // Readonly signals exposed to consumers
  public readonly isCheckingHealth = this.#isCheckingHealth.asReadonly();
  public readonly isPushingPeriod = this.#isPushingPeriod.asReadonly();
  public readonly isPullingPeriods = this.#isPullingPeriods.asReadonly();

  // Overall pending state (true if any operation is pending)
  readonly #isPending: WritableSignal<boolean> = signal(false);
  public readonly isPending = this.#isPending.asReadonly();

  /**
   * Trigger a health check of the backend API
   * @returns Observable that emits true if healthy, false otherwise
   */
  public checkHealth(): Observable<boolean> {
    this.#isCheckingHealth.set(true);
    this.#updateOverallPending();

    return this.#apiService
      .get<BackendResponse<{ status: string }>>(`${API_URLS.BACKEND.BASE_URL}/health`)
      .pipe(
        catchError(error => {
          console.error('Health check failed:', error);
          return of<BackendResponse<{ status: string }>>({
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
        map(response => response.success),
        finalize(() => {
          this.#isCheckingHealth.set(false);
          this.#updateOverallPending();
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  /**
   * Trigger pushing a period to the backend
   * @param period The period to push
   * @returns Observable that emits true if successful, false otherwise
   */
  public pushPeriod(period: IFocus.Period): Observable<boolean> {
    this.#isPushingPeriod.set(true);
    this.#updateOverallPending();

    return this.#apiService
      .post<BackendResponse<{ message: string }>>(`${API_URLS.BACKEND.BASE_URL}/periods`, period)
      .pipe(
        catchError(error => {
          console.error('Push period failed:', error);
          return of<BackendResponse<{ message: string }>>({
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
        map(response => response.success),
        finalize(() => {
          this.#isPushingPeriod.set(false);
          this.#updateOverallPending();
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  /**
   * Trigger pulling periods from the backend
   * @returns Observable that emits the array of periods or null on error
   */
  public pullPeriods(): Observable<IFocus.Period[] | null> {
    this.#isPullingPeriods.set(true);
    this.#updateOverallPending();

    return this.#apiService
      .get<BackendResponse<IFocus.Period[]>>(`${API_URLS.BACKEND.BASE_URL}/periods`)
      .pipe(
        catchError(error => {
          console.error('Pull periods failed:', error);
          return of<BackendResponse<IFocus.Period[]>>({
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
        map(response => (response.success && response.data ? response.data : null)),
        finalize(() => {
          this.#isPullingPeriods.set(false);
          this.#updateOverallPending();
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  /**
   * Update the overall pending state based on individual operation states
   */
  #updateOverallPending(): void {
    const anyPending =
      this.#isCheckingHealth() || this.#isPushingPeriod() || this.#isPullingPeriods();
    this.#isPending.set(anyPending);
  }
}
