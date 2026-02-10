import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValueStepperComponent } from '../common/components/value-stepper/value-stepper.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IPomodoro } from '../common/models/pomodoro.model';
import { PomodoroService } from './services/pomodoro.service';
import { IStepBarOption, StepBarComponent } from '../common/components/step-bar/step-bar.component';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgressBorderDirective } from '../common/directives/progress-border.directive';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { ICONS, IconType } from '../common/constants/icons.const';
import { FINISHED_CYCLE } from '../common/constants/finished-cycle.const';
import { DZ_COLORS } from '../common/enums/colors.enum';

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
    StepBarComponent,

    // directives
    ProgressBorderDirective,
  ],
})
export class PomodoroComponent implements OnInit {
  readonly #destroyRef = inject(DestroyRef);
  readonly #injector = inject(Injector);
  readonly #fb = inject(FormBuilder);
  readonly #pomodoroService = inject(PomodoroService);

  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly colors = DZ_COLORS;
  protected readonly phase = IPomodoro.EPomodoroPhase;
  protected readonly allPhases: {
    phase: IPomodoro.IPomodoroPhase;
    icon: string;
  }[] = [
    {
      phase: IPomodoro.EPomodoroPhase.WORK,
      icon: this.icons.SCHOOL,
    },
    {
      phase: IPomodoro.EPomodoroPhase.SHORT_BREAK,
      icon: this.icons.COFFEE,
    },
    {
      phase: IPomodoro.EPomodoroPhase.LONG_BREAK,
      icon: this.icons.CHAIR,
    },
  ];

  protected readonly pomodoroState = this.#pomodoroService.state;
  protected readonly pomodoroSettings = this.#pomodoroService.settings;
  protected readonly progress = this.#pomodoroService.progress;
  protected readonly timeLeftFormatted = this.#pomodoroService.timeLeftFormatted;
  protected readonly isRunning = computed(() => this.pomodoroState()?.isRunning);
  protected readonly isPaused = computed(() => this.pomodoroState()?.isPaused);
  protected readonly currentPhase = computed(() => this.pomodoroState()?.phase);

  protected readonly currentProgressColor = computed(() => {
    switch (this.currentPhase()) {
      case IPomodoro.EPomodoroPhase.WORK: {
        return this.colors.ACCENT;
      }
      case IPomodoro.EPomodoroPhase.SHORT_BREAK: {
        return this.colors.SUCCESS;
      }
      case IPomodoro.EPomodoroPhase.LONG_BREAK: {
        return this.colors.INFO;
      }
      default:
        return this.colors.ON_ACCENT;
    }
  });

  protected currentCycleBarOption = computed(() => {
    const state = this.pomodoroState();
    const options = this.cyclesBarOptions();

    if (!state) {
      return null;
    }

    return options.find(opt => opt.value === state.currentCycle) ?? null;
  });
  protected readonly cyclesBarOptions = computed<IStepBarOption[]>(() => {
    const state = this.pomodoroState();
    if (!state) return [];

    const { currentCycle, phase, totalCycles, isRunning } = state;
    const isSessionEnds = currentCycle === FINISHED_CYCLE && !isRunning;

    const steps: IStepBarOption[] = Array.from({ length: totalCycles }, (_, i) => {
      const num = i + 1;
      const isCurrent = currentCycle === num;
      const isBreak = phase === IPomodoro.EPomodoroPhase.SHORT_BREAK;

      const icon = isCurrent
        ? isBreak
          ? this.icons.COFFEE
          : this.icons.SCHOOL
        : this.icons.WORKSPACE_PREMIUM;

      return {
        label: `Study ${num}`,
        value: num,
        icon: icon as IconType,
      };
    });

    steps.push({
      label: 'Finish',
      value: FINISHED_CYCLE,
      icon: isSessionEnds ? this.icons.TROPHY : this.icons.CHAIR,
    });

    return steps;
  });

  protected form: FormGroup<IPomodoro.SettingsForm>;

  public ngOnInit(): void {
    this.#initForm();

    /**
     * @guideline DZ_04
     * Reactive effect to synchronize form interactivity with timer state.
     * Prevents configuration changes while a Pomodoro session is active.
     */
    effect(
      () => {
        const isRunning = this.isRunning();
        const options = { emitEvent: false };
        const method = isRunning ? 'disable' : 'enable';

        this.form.controls.workDurationMin[method](options);
        this.form.controls.shortBreakMin[method](options);
        this.form.controls.longBreakMin[method](options);
        this.form.controls.cyclesBeforeLongBreak[method](options);
      },
      { injector: this.#injector }
    );

    effect(
      () => {
        const latestSettings = this.pomodoroSettings();
        if (latestSettings) {
          this.form.patchValue(latestSettings, { emitEvent: false });
        }
      },
      { injector: this.#injector }
    );

    this.form.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => this.form.valid),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(newSettings => {
        this.#pomodoroService.setSessionSettings({
          ...this.pomodoroSettings(),
          ...newSettings,
        });
      });
  }

  protected startSession(): void {
    this.#pomodoroService.startSession();
  }

  protected resetSession(): void {
    this.#pomodoroService.resetSession();
  }

  protected pauseSession(): void {
    this.#pomodoroService.pauseSession();
  }

  protected resumeSession(): void {
    this.#pomodoroService.resumeSession();
  }

  #initForm(): void {
    const initSettings = this.pomodoroSettings();

    this.form = this.#fb.group<IPomodoro.SettingsForm>({
      workDurationMin: this.#fb.nonNullable.control(initSettings.workDurationMin, [
        Validators.required,
        Validators.min(initSettings.workStepConfig.min),
        Validators.max(initSettings.workStepConfig.max),
      ]),
      shortBreakMin: this.#fb.nonNullable.control(initSettings.shortBreakMin, [
        Validators.required,
        Validators.min(initSettings.shortBreakStepConfig.min),
        Validators.max(initSettings.shortBreakStepConfig.max),
      ]),
      longBreakMin: this.#fb.nonNullable.control(initSettings.longBreakMin, [
        Validators.required,
        Validators.min(initSettings.longBreakStepConfig.min),
        Validators.max(initSettings.longBreakStepConfig.max),
      ]),

      cyclesBeforeLongBreak: this.#fb.nonNullable.control(initSettings.cyclesBeforeLongBreak, [
        Validators.required,
        Validators.min(2),
        Validators.max(5),
      ]),
      pauseAfterPhaseEnd: this.#fb.nonNullable.control(initSettings.pauseAfterPhaseEnd),
    });
  }
}
