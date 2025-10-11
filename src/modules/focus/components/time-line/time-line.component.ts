import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal, OnDestroy,
  OnInit,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'dz-time-line',
  templateUrl: 'time-line.component.html',
  styleUrls: ['time-line.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe
  ]
})
export class TimeLineComponent implements OnInit, OnDestroy {
  // TODO: mark focused time in line
  #intervalId!: number;

  readonly #now: WritableSignal<number> = signal(Date.now());

  protected readonly nowPercent: Signal<number> = computed(() => {
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
      this.#now.set(Date.now());
    }, 60_000);
  }

  public ngOnDestroy(): void {
    clearInterval(this.#intervalId);
  }
}
