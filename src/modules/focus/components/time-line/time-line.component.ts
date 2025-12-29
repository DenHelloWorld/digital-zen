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

@Component({
  selector: 'dz-time-line',
  templateUrl: 'time-line.component.html',
  styleUrls: ['time-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
})
export class TimeLineComponent implements OnInit, OnDestroy {
  // TODO: mark focused time in line
  #intervalId!: number;

  readonly #now: WritableSignal<number> = signal(Date.now());
  readonly #currentDay: WritableSignal<string> = signal(this.#getTodayDateString());

  protected readonly nowPercent: Signal<number> = computed(() => {
    // Read currentDay to ensure recalculation on day change
    this.#currentDay();

    const now: number = this.#now();
    const start: number = new Date(this.startFrom()).getTime();
    const end: number = new Date(this.endTo()).getTime();

    if (now <= start) {
      return 0;
    }
    if (now >= end) {
      return 100;
    }

    return ((now - start) / (end - start)) * 100;
  });
  readonly nowTime: Signal<Date> = computed(() => new Date(this.#now()));

  public readonly startFrom: InputSignal<Date> = input.required<Date>();
  public readonly endTo: InputSignal<Date> = input.required<Date>();

  public ngOnInit(): void {
    this.#intervalId = setInterval(() => {
      const currentTime = Date.now();
      const todayDateString = this.#getTodayDateString();

      // Check if day has changed
      if (this.#currentDay() !== todayDateString) {
        // Day changed - update currentDay to trigger recalculation
        this.#currentDay.set(todayDateString);
      }

      // Update current time
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
}
