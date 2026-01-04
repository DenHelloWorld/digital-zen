import { inject, Injectable, DestroyRef } from '@angular/core';
import { Subject, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { API_URLS } from '../constants/api-urls.const';
import { IFocus } from '../models/focus.model';

interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class BackendSyncService {
  readonly #apiService = inject(ApiService);
  readonly #destroyRef = inject(DestroyRef);

  // Subjects for reactive operations
  readonly #checkHealthSubject = new Subject<void>();
  readonly #pushPeriodSubject = new Subject<IFocus.Period>();
  readonly #pullPeriodsSubject = new Subject<void>();

  constructor() {
    this.#setupHealthCheck();
    this.#setupPushPeriod();
    this.#setupPullPeriods();
  }

  /**
   * Trigger a health check of the backend API
   */
  checkHealth(): void {
    this.#checkHealthSubject.next();
  }

  /**
   * Trigger pushing a period to the backend
   */
  pushPeriod(period: IFocus.Period): void {
    this.#pushPeriodSubject.next(period);
  }

  /**
   * Trigger pulling periods from the backend
   */
  pullPeriods(): void {
    this.#pullPeriodsSubject.next();
  }

  /**
   * Setup health check stream processing
   */
  #setupHealthCheck(): void {
    this.#checkHealthSubject
      .pipe(
        switchMap(() =>
          this.#apiService.get<BackendResponse<{ status: string }>>(
            `${API_URLS.BACKEND.BASE_URL}/health`
          )
        ),
        catchError(error => {
          console.error('Health check failed:', error);
          return of({ success: false, error: 'Health check failed' } as BackendResponse<{
            status: string;
          }>);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((response: BackendResponse<{ status: string }>) => {
        if (response.success) {
          console.log('Backend health check successful:', response.data);
        } else {
          console.warn('Backend health check failed:', response.error);
        }
      });
  }

  /**
   * Setup push period stream processing
   */
  #setupPushPeriod(): void {
    this.#pushPeriodSubject
      .pipe(
        switchMap(period =>
          this.#apiService.post<BackendResponse<{ message: string }>>(
            `${API_URLS.BACKEND.BASE_URL}/periods`,
            period
          )
        ),
        catchError(error => {
          console.error('Push period failed:', error);
          return of({ success: false, error: 'Push period failed' } as BackendResponse<{
            message: string;
          }>);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((response: BackendResponse<{ message: string }>) => {
        if (response.success) {
          console.log('Period pushed successfully:', response.data);
        } else {
          console.error('Failed to push period:', response.error);
        }
      });
  }

  /**
   * Setup pull periods stream processing
   */
  #setupPullPeriods(): void {
    this.#pullPeriodsSubject
      .pipe(
        switchMap(() =>
          this.#apiService.get<BackendResponse<IFocus.Period[]>>(
            `${API_URLS.BACKEND.BASE_URL}/periods`
          )
        ),
        catchError(error => {
          console.error('Pull periods failed:', error);
          return of({ success: false, error: 'Pull periods failed' } as BackendResponse<
            IFocus.Period[]
          >);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((response: BackendResponse<IFocus.Period[]>) => {
        if (response.success && response.data) {
          console.log('Periods pulled successfully:', response.data);
          // Here you could emit the data or update a signal if needed
        } else {
          console.error('Failed to pull periods:', response.error);
        }
      });
  }
}
