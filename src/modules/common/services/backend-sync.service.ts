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

  // Pending counters for each operation type
  readonly #checkHealthCounter: WritableSignal<number> = signal(0);
  readonly #pushPeriodCounter: WritableSignal<number> = signal(0);
  readonly #pullPeriodsCounter: WritableSignal<number> = signal(0);

  // Readonly signals exposed to consumers (true if counter > 0)
  public readonly isCheckingHealth: WritableSignal<boolean> = signal(false);
  public readonly isPushingPeriod: WritableSignal<boolean> = signal(false);
  public readonly isPullingPeriods: WritableSignal<boolean> = signal(false);

  // Overall pending state (true if any operation is pending)
  readonly #isPending: WritableSignal<boolean> = signal(false);
  public readonly isPending = this.#isPending.asReadonly();

  /**
   * Trigger a health check of the backend API
   * @returns Observable that emits true if healthy, false otherwise
   */
  public checkHealth(): Observable<boolean> {
    this.#incrementCounter(this.#checkHealthCounter, this.isCheckingHealth);

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
          this.#decrementCounter(this.#checkHealthCounter, this.isCheckingHealth);
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
    this.#incrementCounter(this.#pushPeriodCounter, this.isPushingPeriod);

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
          this.#decrementCounter(this.#pushPeriodCounter, this.isPushingPeriod);
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  /**
   * Trigger pulling periods from the backend
   * @returns Observable that emits the array of periods or null on error
   */
  public pullPeriods(): Observable<IFocus.Period[] | null> {
    this.#incrementCounter(this.#pullPeriodsCounter, this.isPullingPeriods);

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
          this.#decrementCounter(this.#pullPeriodsCounter, this.isPullingPeriods);
        }),
        takeUntilDestroyed(this.#destroyRef)
      );
  }

  /**
   * Increment the counter and update signals
   */
  #incrementCounter(
    counter: WritableSignal<number>,
    isPendingSignal: WritableSignal<boolean>
  ): void {
    counter.update(count => count + 1);
    isPendingSignal.set(true);
    this.#updateOverallPending();
  }

  /**
   * Decrement the counter and update signals
   */
  #decrementCounter(
    counter: WritableSignal<number>,
    isPendingSignal: WritableSignal<boolean>
  ): void {
    counter.update(count => Math.max(0, count - 1));
    isPendingSignal.set(counter() > 0);
    this.#updateOverallPending();
  }

  /**
   * Update the overall pending state based on individual operation states
   */
  #updateOverallPending(): void {
    const anyPending = this.isCheckingHealth() || this.isPushingPeriod() || this.isPullingPeriods();
    this.#isPending.set(anyPending);
  }
}
