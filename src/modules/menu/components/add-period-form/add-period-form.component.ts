import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Injector,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,

} from '@angular/forms';
import {IFocus} from '../../../common/models';
import {distinctUntilChanged, map} from 'rxjs';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {
  arrayMinLengthValidator,
  requiredTrimmedValidator,
  timeRangeValidator,
  WEBSITE_FACEBOOK,
  WEBSITE_TIKTOK,
} from '../../../common';
import {WeekdaysSelectorComponent} from '../../../common/components/weekdays-selector/weekdays-selector.component';
import {FocusService} from '../../../focus/services';
import {DynamicInputComponent} from '../../../common/components/dynamic-input/dynamic-input.component';

@Component({
  selector: "dz-add-period-form",
  templateUrl: "add-period-form.component.html",
  styleUrls: ["add-period-form.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    WeekdaysSelectorComponent,
    DynamicInputComponent
  ]
})
export class AddPeriodFormComponent implements OnInit {
  readonly #fb: FormBuilder = inject(FormBuilder);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #injector: Injector = inject(Injector);
  readonly #focusService: FocusService = inject(FocusService);

  protected form: FormGroup<IFocus.Form.UpsertPeriod>;

  protected selectedDays: WritableSignal<IFocus.DayOfWeek[]> = signal<IFocus.DayOfWeek[]>([]);
  protected selectedWebSites: WritableSignal<IFocus.BlockedWebSite[]> = signal<IFocus.BlockedWebSite[]>([WEBSITE_TIKTOK, WEBSITE_FACEBOOK]);

  public ngOnInit(): void {
    this.#initForm();

    this.form.valueChanges
      .pipe(
        map(() => this.form.getRawValue()),
        distinctUntilChanged((prev: IFocus.Period, next: IFocus.Period) => JSON.stringify(prev) === JSON.stringify(next)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((value: IFocus.Period) => {
        console.log(value);
      });

    toObservable(this.selectedDays, {injector: this.#injector })
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((value: IFocus.DayOfWeek[]) => {
        this.form.controls.daysOfWeek.setValue(value.map((value: IFocus.DayOfWeek) => value.day)
        )
      })

    toObservable(this.selectedWebSites, {injector: this.#injector })
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((value: IFocus.BlockedWebSite[]) => {
        this.form.controls.blockedSites.setValue(value);
      })
  }

  protected addPeriod() {
    if (this.form.valid) {
      this.#focusService.addPeriod({
        id: this.form.controls.id.value,
        name: this.form.controls.name.value,
        description: this.form.controls.description.value,
        startFrom: this.form.controls.startFrom.value,
        endTo: this.form.controls.endTo.value,
        blockedSites: this.form.controls.blockedSites.value,
        daysOfWeek: this.form.controls.daysOfWeek.value,
        focusedTimes: []
      })
    }
  }

  #initForm(): void {
    this.form = this.#fb.group<IFocus.Form.UpsertPeriod>({
      id: this.#fb.nonNullable.control<string>(
        `${Date.now()}-${Math.floor(Math.random() * 10000)}`
      ),
      name: this.#fb.nonNullable.control('', requiredTrimmedValidator),
      description: this.#fb.nonNullable.control('', requiredTrimmedValidator),
      startFrom: this.#fb.nonNullable.control(new Date(0)),
      endTo: this.#fb.nonNullable.control(new Date(0)),
      blockedSites: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
      daysOfWeek: this.#fb.nonNullable.control([], arrayMinLengthValidator()),
      focusedTimes: this.#fb.nonNullable.control([]),
    }, { validators: timeRangeValidator('startFrom', 'endTo') });
  }
}
