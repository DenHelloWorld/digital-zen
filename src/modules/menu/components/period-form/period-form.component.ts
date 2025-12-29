import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injector,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  ALL_DAYS_OF_WEEK,
  arrayMinLengthValidator,
  IFocus,
  IFocusForm,
  requiredTrimmedValidator,
  timeRangeValidator,
  WEBSITE_FACEBOOK,
  WEBSITE_TIKTOK,
} from '../../../common';
import { WeekdaysSelectorComponent } from '../../../common/components/weekdays-selector/weekdays-selector.component';
import { FocusService } from '../../../focus/services';
import { DynamicInputComponent } from '../../../common/components/dynamic-input/dynamic-input.component';

@Component({
  selector: 'dz-period-form',
  templateUrl: 'period-form.component.html',
  styleUrls: ['period-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, WeekdaysSelectorComponent, DynamicInputComponent],
})
export class PeriodFormComponent implements OnInit {
  readonly #fb: FormBuilder = inject(FormBuilder);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #injector: Injector = inject(Injector);
  readonly #focusService: FocusService = inject(FocusService);

  public readonly mode: InputSignal<'create' | 'edit'> = input<'create' | 'edit'>('create');
  public readonly period: InputSignal<IFocus.Period | null> = input<IFocus.Period | null>(null);
  public readonly completed: OutputEmitterRef<void> = output<void>();

  protected form: FormGroup<IFocusForm.UpsertPeriod>;

  protected excludedSiteKeysArray: (keyof IFocus.WebSite)[] = [
    'imageUrl',
    'iconUrl',
    'isBlocked',
    'description',
    'type',
  ];

  protected selectedDays: WritableSignal<IFocus.DayOfWeek[]> = signal<IFocus.DayOfWeek[]>([]);
  protected selectedWebSites: WritableSignal<IFocus.WebSite[]> = signal<IFocus.WebSite[]>([
    WEBSITE_TIKTOK,
    WEBSITE_FACEBOOK,
  ]);

  public ngOnInit(): void {
    this.#initForm();
    this.#loadPeriodData();

    this.form.valueChanges
      .pipe(
        map(() => this.form.getRawValue()),
        distinctUntilChanged(
          (prev: IFocus.Period, next: IFocus.Period) =>
            JSON.stringify(prev) === JSON.stringify(next)
        ),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((value: IFocus.Period) => {
        console.log(value);
      });

    toObservable(this.selectedDays, { injector: this.#injector })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value: IFocus.DayOfWeek[]) => {
        this.form.controls.daysOfWeek.setValue(value.map((value: IFocus.DayOfWeek) => value.day));
      });

    toObservable(this.selectedWebSites, { injector: this.#injector })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((value: IFocus.WebSite[]) => {
        this.form.controls.webSites.setValue(value);
      });
  }

  protected savePeriod() {
    if (this.form.valid) {
      const rawValue = this.form.getRawValue();

      const webSitesWithFavicons: IFocus.WebSite[] = rawValue.webSites.map(site => {
        const imageUrl = this.#focusService.getGoogleFaviconUrl(site.url);

        return {
          ...site,
          imageUrl,
        };
      });

      const periodData: IFocus.Period = {
        id: rawValue.id,
        name: rawValue.name,
        description: rawValue.description,
        startFrom: this.#timeStringToDate(rawValue.startFrom as unknown as string),
        endTo: this.#timeStringToDate(rawValue.endTo as unknown as string),
        webSites: webSitesWithFavicons,
        daysOfWeek: rawValue.daysOfWeek,
        focusedTimes: rawValue.focusedTimes,
        isFocused: rawValue.isFocused,
        sessionStartTime: rawValue.sessionStartTime,
      };

      if (this.mode() === 'edit') {
        this.#focusService.updatePeriod(periodData);
      } else {
        this.#focusService.addPeriod(periodData);
      }

      this.completed.emit();
    }
  }

  protected cancelForm(): void {
    this.completed.emit();
  }

  /**
   * Converts a time string "HH:mm" to a Date object.
   * @param timeString The time string from the input (e.g., "14:30").
   * @returns A Date object set to the specified time.
   */
  #timeStringToDate(timeString: string): Date {
    const date = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);

    date.setHours(hours, minutes, 0, 0);

    return date;
  }

  #initForm(): void {
    this.form = this.#fb.group<IFocusForm.UpsertPeriod>(
      {
        id: this.#fb.nonNullable.control<string>(
          `${Date.now()}-${Math.floor(Math.random() * 10000)}`
        ),
        name: this.#fb.nonNullable.control('', requiredTrimmedValidator),
        description: this.#fb.nonNullable.control('', requiredTrimmedValidator),
        startFrom: this.#fb.nonNullable.control(new Date(0)),
        endTo: this.#fb.nonNullable.control(new Date(0)),
        webSites: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
        daysOfWeek: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
        focusedTimes: this.#fb.nonNullable.control([]),
        isFocused: this.#fb.nonNullable.control(false),
        sessionStartTime: this.#fb.control<Date | null>(null),
      },
      { validators: timeRangeValidator('startFrom', 'endTo') }
    );
  }

  #loadPeriodData(): void {
    const periodData = this.period();

    if (this.mode() === 'edit' && periodData) {
      // Convert Date to time string for time inputs
      const startFromTime = periodData.startFrom
        ? this.#dateToTimeString(periodData.startFrom)
        : '';
      const endToTime = periodData.endTo ? this.#dateToTimeString(periodData.endTo) : '';

      this.form.patchValue({
        id: periodData.id,
        name: periodData.name,
        description: periodData.description,
        startFrom: startFromTime as unknown as Date,
        endTo: endToTime as unknown as Date,
        focusedTimes: periodData.focusedTimes,
        isFocused: periodData.isFocused,
        sessionStartTime: periodData.sessionStartTime,
      });

      // Set selected days
      const selectedDays = ALL_DAYS_OF_WEEK.filter(day => periodData.daysOfWeek.includes(day.day));
      this.selectedDays.set(selectedDays);

      // Set selected websites
      this.selectedWebSites.set(periodData.webSites);
    }
  }

  #dateToTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
