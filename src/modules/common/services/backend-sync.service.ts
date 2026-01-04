import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Subject, switchMap, catchError, of, Observable, finalize, ReplaySubject } from 'rxjs';
import { ApiService } from './api.service';
import { API_URLS } from '../constants/api-urls.const';
import { IFocus, BackendResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class BackendSyncService {
  readonly #apiService = inject(ApiService);

  // Subjects for reactive operations
  readonly #checkHealthSubject = new Subject<void>();
  readonly #pushPeriodSubject = new Subject<IFocus.Period>();
  readonly #pullPeriodsSubject = new Subject<void>();

  // Results subjects to emit operation results (using ReplaySubject to avoid race conditions)
  readonly #healthCheckResult = new ReplaySubject<boolean>(1);
  readonly #pushPeriodResult = new ReplaySubject<boolean>(1);
  readonly #pullPeriodsResult = new ReplaySubject<IFocus.Period[] | null>(1);

  // Pending state signal
  readonly #isPending: WritableSignal<boolean> = signal(false);
  public readonly isPending = this.#isPending.asReadonly();

  constructor() {
    this.#setupHealthCheck();
    this.#setupPushPeriod();
    this.#setupPullPeriods();
  }

  /**
   * Trigger a health check of the backend API
   * @returns Observable that emits true if healthy, false otherwise
   */
  public checkHealth(): Observable<boolean> {
    this.#checkHealthSubject.next();
    return this.#healthCheckResult.asObservable();
  }

  /**
   * Trigger pushing a period to the backend
   * @param period The period to push
   * @returns Observable that emits true if successful, false otherwise
   */
  public pushPeriod(period: IFocus.Period): Observable<boolean> {
    this.#pushPeriodSubject.next(period);
    return this.#pushPeriodResult.asObservable();
  }

  /**
   * Trigger pulling periods from the backend
   * @returns Observable that emits the array of periods or null on error
   */
  public pullPeriods(): Observable<IFocus.Period[] | null> {
    this.#pullPeriodsSubject.next();
    return this.#pullPeriodsResult.asObservable();
  }

  /**
   * Cleanup method to complete all subjects
   */
  public destroy(): void {
    this.#checkHealthSubject.complete();
    this.#pushPeriodSubject.complete();
    this.#pullPeriodsSubject.complete();
    this.#healthCheckResult.complete();
    this.#pushPeriodResult.complete();
    this.#pullPeriodsResult.complete();
  }

  /**
   * Setup health check stream processing
   */
  #setupHealthCheck(): void {
    this.#checkHealthSubject
      .pipe(
        switchMap(() => {
          this.#isPending.set(true);
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
              finalize(() => this.#isPending.set(false))
            );
        })
      )
      .subscribe((response: BackendResponse<{ status: string }>) => {
        if (response.success) {
          console.log('Backend health check successful:', response.data);
          this.#healthCheckResult.next(true);
        } else {
          console.warn('Backend health check failed:', response.error);
          this.#healthCheckResult.next(false);
        }
      });
  }

  /**
   * Setup push period stream processing
   */
  #setupPushPeriod(): void {
    this.#pushPeriodSubject
      .pipe(
        switchMap(period => {
          this.#isPending.set(true);
          return this.#apiService
            .post<
              BackendResponse<{ message: string }>
            >(`${API_URLS.BACKEND.BASE_URL}/periods`, period)
            .pipe(
              catchError(error => {
                console.error('Push period failed:', error);
                return of<BackendResponse<{ message: string }>>({
                  success: false,
                  error: 'Push period failed',
                });
              }),
              finalize(() => this.#isPending.set(false))
            );
        })
      )
      .subscribe((response: BackendResponse<{ message: string }>) => {
        if (response.success) {
          console.log('Period pushed successfully:', response.data);
          this.#pushPeriodResult.next(true);
        } else {
          console.error('Failed to push period:', response.error);
          this.#pushPeriodResult.next(false);
        }
      });
  }

  /**
   * Setup pull periods stream processing
   */
  #setupPullPeriods(): void {
    this.#pullPeriodsSubject
      .pipe(
        switchMap(() => {
          this.#isPending.set(true);
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
              finalize(() => this.#isPending.set(false))
            );
        })
      )
      .subscribe((response: BackendResponse<IFocus.Period[]>) => {
        if (response.success && response.data) {
          console.log('Periods pulled successfully:', response.data);
          this.#pullPeriodsResult.next(response.data);
        } else {
          console.error('Failed to pull periods:', response.error);
          this.#pullPeriodsResult.next(null);
        }
      });
  }
}
