import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef, effect,
  forwardRef,
  inject, Injector,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import {IFocus} from '../../../common/models';
import {distinctUntilChanged, filter, map} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {
  arrayMinLengthValidator,
  requiredTrimmedValidator,
  timeRangeValidator
} from '../../../common';
import {WeekdaysSelectorComponent} from '../../../common/components/weekdays-selector/weekdays-selector.component';

@Component({
  selector: "dz-add-period-form",
  templateUrl: "add-period-form.component.html",
  styleUrls: ["add-period-form.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddPeriodFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: AddPeriodFormComponent,
      multi: true,
    },
  ],
  imports: [
    ReactiveFormsModule,
    WeekdaysSelectorComponent
  ]
})
export class AddPeriodFormComponent implements OnInit {
  readonly #fb: FormBuilder = inject(FormBuilder);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #injector: Injector = inject(Injector);

  protected form: FormGroup<IFocus.Form>;

  protected selectedDays: WritableSignal<IFocus.DayOfWeek[]> = signal<IFocus.DayOfWeek[]>([]);

  #onTouched: () => void = () => { /* empty */ };
  #onChange: (value: IFocus.Period) => void = () => { /* empty */ };

  public ngOnInit(): void {
    this.#init();

    this.form.valueChanges
      .pipe(
        map(() => this.form.getRawValue()),
        distinctUntilChanged((prev: IFocus.Period, next: IFocus.Period) => JSON.stringify(prev) === JSON.stringify(next)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((value: IFocus.Period) => {
        this.#onChange(value);
        console.log(value);
      });

    this.form.statusChanges
      .pipe(
        filter(() => typeof this.#onTouched === 'function'),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((): void => {
        this.#onTouched();
      });

    toObservable(this.selectedDays, {injector: this.#injector })
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((days: IFocus.DayOfWeek[]) => {
        this.form.controls.daysOfWeek.setValue(days.map((value: IFocus.DayOfWeek) => value.day)
        )
      })
  }

  // ––––––––––––– Value Accessor –––––––––––––––

  public writeValue(value: IFocus.Period): void {
    this.form.patchValue(value, { emitEvent: false });
  }

  public registerOnChange(fn: (value: IFocus.Period) => void): void {
    this.#onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  // ––––––––-––––– Validator –––––––––––––––

  public validate(): ValidationErrors | null {
    return this.form.valid ? null : { formInvalid: true };
  }

  #init(): void {
    this.form = this.#fb.group<IFocus.Form>({
      id: this.#fb.nonNullable.control<string>(
        `${Date.now()}-${Math.floor(Math.random() * 10000)}`
      ),
      name: this.#fb.nonNullable.control('', requiredTrimmedValidator),
      description: this.#fb.nonNullable.control('', requiredTrimmedValidator),
      startFrom: this.#fb.nonNullable.control(new Date(0)),
      endTo: this.#fb.nonNullable.control(new Date(0)),
      blockedSites: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
      daysOfWeek: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
    }, { validators: timeRangeValidator('startFrom', 'endTo') });
  }
}
