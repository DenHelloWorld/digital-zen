import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICONS, ProgressBorderDirective, UI_TEXT } from '../common';
import { ValueStepperComponent } from '../common/components/value-stepper/value-stepper.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPomodoro } from '../common/models/pomodoro.model';
import { PomodoroService } from './services/pomodoro.service';
import { MultiSelectorComponent } from '../common/components/multi-selector/multi-selector.component';
import { IStepBarOption, StepBarComponent } from '../common/components/step-bar/step-bar.component';

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
  imports: [
    // angular modules
    CommonModule,
    ReactiveFormsModule,

    // components
    ValueStepperComponent,
    MultiSelectorComponent,
    StepBarComponent,

    // directives
    ProgressBorderDirective,
  ],
})
export class PomodoroComponent implements OnInit {
  readonly #injector = inject(Injector);
  readonly #fb = inject(FormBuilder);
  readonly #pomodoroService = inject(PomodoroService);

  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly allPhases: {
    phase: IPomodoro.IPomodoroPhase;
    icon: string | null;
  }[] = [
    {
      phase: IPomodoro.EPomodoroPhase.IDLE,
      icon: this.icons.PAUSE,
    },
    {
      phase: IPomodoro.EPomodoroPhase.LONG_BREAK,
      icon: this.icons.PILLOW,
    },
    {
      phase: IPomodoro.EPomodoroPhase.WORK,
      icon: this.icons.SCHOOL,
    },
    {
      phase: IPomodoro.EPomodoroPhase.SHORT_BREAK,
      icon: this.icons.COFFEE,
    },
  ];

  protected readonly pomodoroState = this.#pomodoroService.state;
  protected readonly pomodoroSettings = this.#pomodoroService.settings;

  protected readonly timeLeftSec = computed(() => this.pomodoroState()?.timeLeftSec);
  protected readonly isRunning = computed(() => this.pomodoroState()?.isRunning);
  protected readonly isPaused = computed(() => this.pomodoroState()?.isPaused);
  protected readonly currentPhase = computed(() => {
    return [
      {
        phase: this.pomodoroState()?.phase ?? IPomodoro.EPomodoroPhase.IDLE,
        icon: null,
      },
    ];
  });
  protected currentCycleBarOption = computed(() => {
    const options = this.cyclesBarOptions();
    const currentIndex = (this.pomodoroState()?.currentCycle ?? 1) - 1;

    return options[currentIndex] ?? null;
  });
  protected readonly cyclesBarOptions = computed<IStepBarOption[]>(() => {
    const { totalCycles: total = 0 } = this.pomodoroState() ?? {};

    return Array.from({ length: total }, (_, i) => {
      const isLast = i === total - 1;

      return {
        label: isLast ? 'Finish' : `Study ${i + 1}`,
        value: i + 1,
        icon: isLast ? this.icons.CHECK : this.icons.SCHOOL,
      };
    });
  });

  protected form: FormGroup<IPomodoro.SettingsForm>;

  public ngOnInit(): void {
    if (this.pomodoroSettings()) {
      this.#initForm();
    }

    /**
     * @guideline DZ_04
     * Reactive effect to synchronize form interactivity with timer state.
     * Prevents configuration changes while a Pomodoro session is active.
     */
    effect(
      () => {
        const isRunning = this.isRunning();
        const method = isRunning ? 'disable' : 'enable';

        this.form.controls.workDurationMin[method]();
        this.form.controls.shortBreakMin[method]();
        this.form.controls.longBreakMin[method]();
      },
      { injector: this.#injector }
    );
  }

  public startSession(): void {
    this.#pomodoroService.startSession();
  }

  #initForm(): void {
    const initSettings = this.pomodoroSettings();

    this.form = this.#fb.group<IPomodoro.SettingsForm>({
      workDurationMin: this.#fb.nonNullable.control<number>(initSettings.workDurationMin, [
        Validators.required,
        Validators.min(initSettings.workStepConfig.min),
        Validators.max(initSettings.workStepConfig.max),
      ]),
      shortBreakMin: this.#fb.nonNullable.control<number>(initSettings.shortBreakMin, [
        Validators.required,
        Validators.min(initSettings.shortBreakStepConfig.min),
        Validators.max(initSettings.shortBreakStepConfig.max),
      ]),
      longBreakMin: this.#fb.nonNullable.control<number>(initSettings.longBreakMin, [
        Validators.required,
        Validators.min(initSettings.longBreakStepConfig.min),
        Validators.max(initSettings.longBreakStepConfig.max),
      ]),

      cyclesBeforeLongBreak: this.#fb.nonNullable.control<number>(4, [
        Validators.required,
        Validators.min(1),
      ]),
      autoStartNext: this.#fb.nonNullable.control<boolean>(initSettings.autoStartNext),

      workStepConfig: this.#fb.nonNullable.control(initSettings.workStepConfig),
      shortBreakStepConfig: this.#fb.nonNullable.control(initSettings.shortBreakStepConfig),
      longBreakStepConfig: this.#fb.nonNullable.control(initSettings.longBreakStepConfig),
    });
  }
}
