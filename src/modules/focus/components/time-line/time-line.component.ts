import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { UI_TEXT } from '../../../common/constants';

@Component({
  selector: 'dz-time-line',
  templateUrl: 'time-line.component.html',
  styleUrls: ['time-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
})
export class TimeLineComponent implements OnInit, OnDestroy {
  #intervalId!: number;

  readonly #now: WritableSignal<number> = signal(Date.now());
  readonly #currentDay: WritableSignal<string> = signal(this.#getTodayDateString());

  protected readonly nowPercent: Signal<number> = computed(() => {
    this.#currentDay();

    const now: number = this.#now();

    // Extract time-only values (hours, minutes, seconds) for comparison
    const nowTime = this.#getTimeInMilliseconds(new Date(now));
    const startTime = this.#getTimeInMilliseconds(new Date(this.startFrom()));
    const endTime = this.#getTimeInMilliseconds(new Date(this.endTo()));

    if (nowTime <= startTime) {
      return 0;
    }
    if (nowTime >= endTime) {
      return 100;
    }

    return ((nowTime - startTime) / (endTime - startTime)) * 100;
  });
  readonly nowTime: Signal<Date> = computed(() => new Date(this.#now()));
  protected readonly uiText = UI_TEXT;

  public readonly startFrom: InputSignal<Date> = input.required<Date>();
  public readonly endTo: InputSignal<Date> = input.required<Date>();

  public ngOnInit(): void {
    this.#intervalId = setInterval(() => {
      const currentTime = Date.now();
      const todayDateString = this.#getTodayDateString();

      if (this.#currentDay() !== todayDateString) {
        this.#currentDay.set(todayDateString);
      }

      this.#now.set(currentTime);
    }, 60_000);
  }

  public ngOnDestroy(): void {
    clearInterval(this.#intervalId);
  }

  #getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Extracts time-only value from a Date object.
   * Returns milliseconds since midnight (ignoring the date portion).
   * This allows for time-only comparisons regardless of the actual date.
   */
  #getTimeInMilliseconds(date: Date): number {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds;
  }
}
