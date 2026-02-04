import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
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
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { WeekdaysSelectorComponent } from '../../../common/components/weekdays-selector/weekdays-selector.component';
import { FocusService } from '../../services/focus.service';
import { DynamicInputComponent } from '../../../common/components/dynamic-input/dynamic-input.component';
import { MultiSelectorComponent } from '../../../common/components/multi-selector/multi-selector.component';
import {
  BLOCK_BEHAVIOUR_ENUM,
  BlockBehaviourType,
} from '../../../common/enums/block-behaviour.enum';
import { logger } from '../../../common/helpers/logger';
import { IFocus } from '../../../common/models/focus.model';
import { UI_TEXT } from '../../../common/constants/ui-text.const';
import { IFocusForm } from '../../../common/models/focus-form.model';
import { ICONS } from '../../../common/constants/icons.const';
import { VALIDATION_ERROR_KEYS } from '../../../common/constants/validation-errors.const';
import { MANUAL_TIME_RANGE, TIME_RANGES } from '../../../common/constants/time-ranges.const';
import { WEBSITE_FACEBOOK, WEBSITE_TIKTOK } from '../../../common/constants/websites.const';
import { requiredTrimmedValidator } from '../../../common/validators/required-trimmed.validator';
import { uniquePeriodNameValidator } from '../../../common/validators/unique-period-name.validator';
import { arrayMinLengthValidator } from '../../../common/validators/array-min-length.validator';
import { noUnblockableWebsitesValidator } from '../../../common/validators/no-unblockable-websites.validator';
import { timeRangeValidator } from '../../../common/validators/time-range.validator';
import { ALL_DAYS_OF_WEEK } from '../../../common/constants/days-of-week.const';

/**
 * Period form component for creating and editing focus periods
 * Handles form validation, data binding, and period persistence
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals (InputSignal, OutputEmitterRef, signal)
 * - DZ_05: RxJS for form value changes (valid use case)
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_10: UI text constants usage
 * - DZ_11: Universal Logger usage
 * - DZ_15: Typed Reactive Forms
 * - DZ_16: Custom validators
 *
 * @see /docs/coding-guidelines.md
 * @see https://angular.dev/guide/forms/typed-forms (Typed Forms)
 * @see https://angular.dev/guide/forms/form-validation (Form Validation)
 */
@Component({
  selector: 'dz-period-form',
  templateUrl: 'period-form.component.html',
  styleUrls: ['period-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // angular modules
    CommonModule,
    ReactiveFormsModule,
    // components
    WeekdaysSelectorComponent,
    DynamicInputComponent,
    MultiSelectorComponent,
  ],
})
export class PeriodFormComponent implements OnInit {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #fb: FormBuilder = inject(FormBuilder);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #injector: Injector = inject(Injector);
  readonly #focusService: FocusService = inject(FocusService);
  /** @guideline DZ_11 - Universal Logger usage */
  readonly #logger = logger.createLogger('PeriodFormComponent');

  readonly #maxPeriodNameLength = 100;

  /** @guideline DZ_04 - InputSignal for component inputs */
  public readonly mode: InputSignal<'create' | 'edit'> = input<'create' | 'edit'>('create');
  public readonly period: InputSignal<IFocus.Period | null> = input<IFocus.Period | null>(null);
  public readonly completed: OutputEmitterRef<void> = output<void>();

  /** @guideline DZ_15 - Typed Reactive Form */
  protected form: FormGroup<IFocusForm.UpsertPeriod>;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  /** @guideline DZ_10.1 - Icon constants */
  protected readonly icons = ICONS;
  /** Validation error keys for template usage */
  protected readonly validationErrorKeys = VALIDATION_ERROR_KEYS;
  protected readonly timeRanges = [...TIME_RANGES];
  protected readonly manualTimeRangeId = MANUAL_TIME_RANGE.id;

  protected excludedSiteKeysArray: (keyof IFocus.WebSite)[] = [
    'imageUrl',
    'iconUrl',
    'isBlocked',
    'description',
    'type',
  ];

  protected blockOptions = [
    { id: BLOCK_BEHAVIOUR_ENUM.BLOCK, name: 'Block' },
    { id: BLOCK_BEHAVIOUR_ENUM.WARN, name: 'Warn' },
  ];

  protected selectedBlockBehaviours = signal<{ id: BlockBehaviourType; name: string }[]>([
    this.blockOptions[0],
  ]);
  protected selectedTimeRanges: WritableSignal<IFocus.TimeRange[]> = signal<IFocus.TimeRange[]>([]);
  protected selectedDays: WritableSignal<IFocus.DayOfWeek[]> = signal<IFocus.DayOfWeek[]>([]);
  protected selectedWebSites: WritableSignal<IFocus.WebSite[]> = signal<IFocus.WebSite[]>([
    WEBSITE_TIKTOK,
    WEBSITE_FACEBOOK,
  ]);

  public ngOnInit(): void {
    this.#initForm();
    this.#loadPeriodData();
    this.#setupValidatorUpdates();

    this.form.valueChanges
      .pipe(
        map(() => this.form.getRawValue()),
        distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(value => {
        this.#logger.debug('Form value changed:', value);
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

    toObservable(this.selectedBlockBehaviours, { injector: this.#injector })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(value => {
        this.form.controls.blockBehaviour.setValue(value[0].id);
        console.log('Block behaviour set to:', value[0].id);
      });

    effect(
      () => {
        const timeRange: IFocus.TimeRange | null = this.selectedTimeRanges()?.[0] ?? null;

        if (timeRange === null) {
          return;
        }

        this.form.controls.startFrom.enable();
        this.form.controls.endTo.enable();

        if (timeRange.id !== this.manualTimeRangeId) {
          this.form.controls.startFrom.disable();
          this.form.controls.endTo.disable();
        }

        this.form.controls.startFrom.setValue(timeRange.startFrom);
        this.form.controls.endTo.setValue(timeRange.endTo);
      },
      { injector: this.#injector }
    );
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
        startFrom: this.#timeStringToDate(rawValue.startFrom),
        endTo: this.#timeStringToDate(rawValue.endTo),
        webSites: webSitesWithFavicons,
        blockBehaviour: rawValue.blockBehaviour,
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
   * @returns A Date object set to the specified time, or null if invalid.
   */
  #timeStringToDate(timeString: string | null): Date | null {
    if (timeString == null || !timeString.includes(':')) {
      this.#logger.warn('Invalid time string provided to timeStringToDate:', timeString);
      return null;
    }

    const [hoursStr, minutesStr] = timeString.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (isNaN(hours) || isNaN(minutes)) {
      this.#logger.warn('Invalid hours/minutes in time string:', timeString);
      return null;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    // Verify the date is valid after setting
    if (isNaN(date.getTime())) {
      this.#logger.warn('Created invalid date from time string:', timeString);
      return null;
    }

    return date;
  }

  /**
   * Updates the validators for the name field.
   * Extracted to avoid code duplication between #setupValidatorUpdates effect and #initForm.
   */
  #updateNameValidators(periods: IFocus.Period[] | null, currentPeriodId?: string): void {
    this.form.controls.name.clearValidators();
    this.form.controls.name.setValidators([
      requiredTrimmedValidator,
      uniquePeriodNameValidator(periods, currentPeriodId),
      Validators.maxLength(this.#maxPeriodNameLength),
    ]);
    this.form.controls.name.updateValueAndValidity();
  }

  /**
   * Sets up reactive validator updates whenever the periods list changes.
   * Uses effect to automatically update validators when periods or current period changes.
   */
  #setupValidatorUpdates(): void {
    effect(
      () => {
        const periods = this.#focusService.periods();
        const currentPeriodId = this.period()?.id;

        this.#updateNameValidators(periods, currentPeriodId);
      },
      { injector: this.#injector }
    );
  }

  #initForm(): void {
    const periods = this.#focusService.periods();
    const currentPeriodId = this.period()?.id;

    this.form = this.#fb.group<IFocusForm.UpsertPeriod>(
      {
        id: this.#fb.nonNullable.control<string>(
          `${Date.now()}-${Math.floor(Math.random() * 10000)}`
        ),
        name: this.#fb.nonNullable.control('', [
          requiredTrimmedValidator,
          uniquePeriodNameValidator(periods, currentPeriodId),
          Validators.maxLength(this.#maxPeriodNameLength),
        ]),
        description: this.#fb.nonNullable.control('', requiredTrimmedValidator),
        startFrom: this.#fb.control<string | null>(null),
        endTo: this.#fb.control<string | null>(null),
        webSites: this.#fb.nonNullable.control(
          [],
          [arrayMinLengthValidator(), noUnblockableWebsitesValidator]
        ),
        daysOfWeek: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
        focusedTimes: this.#fb.nonNullable.control([]),
        isFocused: this.#fb.nonNullable.control(false),
        sessionStartTime: this.#fb.control<Date | null>(null),
        blockBehaviour: this.#fb.nonNullable.control<BlockBehaviourType>(
          BLOCK_BEHAVIOUR_ENUM.BLOCK
        ),
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
        startFrom: startFromTime,
        endTo: endToTime,
        focusedTimes: periodData.focusedTimes,
        isFocused: periodData.isFocused,
        sessionStartTime: periodData.sessionStartTime,
        blockBehaviour: periodData.blockBehaviour,
      });

      // Set selected days
      const selectedDays = ALL_DAYS_OF_WEEK.filter(day => periodData.daysOfWeek.includes(day.day));
      this.selectedDays.set(selectedDays);

      // Set selected websites
      this.selectedWebSites.set(periodData.webSites);

      if (periodData.blockBehaviour) {
        const found = this.blockOptions.find(opt => opt.id === periodData.blockBehaviour);
        if (found) {
          this.selectedBlockBehaviours.set([found]);
        }
      }
    }
  }

  #dateToTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
