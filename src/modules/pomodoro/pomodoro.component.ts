import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICONS, logger, ProgressBorderDirective, UI_TEXT } from '../common';
import { ValueStepperComponent } from '../common/components/value-stepper/value-stepper.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPomodoro } from '../common/models/pomodoro.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PomodoroService } from './services/pomodoro.service';

/**
 * Pomodoro timer component
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_10: UI text constants usage
 * - DZ_12: SCSS по БЭМ
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-pomodoro',
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // angular modules
    CommonModule,

    // components
    ValueStepperComponent,
    ReactiveFormsModule,
    ProgressBorderDirective,
  ],
})
export class PomodoroComponent implements OnInit {
  readonly #destroyRef = inject(DestroyRef);
  readonly #fb = inject(FormBuilder);
  readonly #logger = logger.createLogger('PomodoroComponent');
  readonly #pomodoroService = inject(PomodoroService);
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected form: FormGroup<IPomodoro.SettingsForm>;

  public ngOnInit(): void {
    this.#initForm();
    this.#pomodoroService.startSession();

    this.form.valueChanges.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(value => {
      this.#logger.info(value);
    });
  }

  // public startSession(): void {
  //   this.#pomodoroService.startSession();
  // }

  #initForm(): void {
    const baseStep: IPomodoro.StepConfig = {
      step: 1,
      quickStep: 5,
      min: 1,
      max: 60,
    };

    this.form = this.#fb.group<IPomodoro.SettingsForm>({
      workDurationMin: this.#fb.nonNullable.control<number>(25, [
        Validators.required,
        Validators.min(1),
        Validators.max(90),
      ]),
      shortBreakMin: this.#fb.nonNullable.control<number>(5, [
        Validators.required,
        Validators.min(1),
        Validators.max(15),
      ]),
      longBreakMin: this.#fb.nonNullable.control<number>(15, [
        Validators.required,
        Validators.min(1),
        Validators.max(30),
      ]),
      // cyclesBeforeLongBreak: this.#fb.nonNullable.control<number>(4, [
      //   Validators.required,
      //   Validators.min(1),
      // ]),

      workStepConfig: this.#fb.nonNullable.control({ ...baseStep, max: 90 }),
      shortBreakStepConfig: this.#fb.nonNullable.control({ ...baseStep, max: 15 }),
      longBreakStepConfig: this.#fb.nonNullable.control({ ...baseStep, max: 30 }),

      // autoStartNext: this.#fb.nonNullable.control<boolean>(false),
    });
  }
}
