import { IStepBarOption, StepBarComponent } from '../common/components/step-bar/step-bar.component';
import { ValueStepperComponent } from '../common/components/value-stepper/value-stepper.component';
import { FINISHED_CYCLE } from '../common/constants/finished-cycle.const';
import { ICONS } from '../common/constants/icons.const';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { PopupDirective } from '../common/directives/popup.directive';
import { ProgressBorderDirective } from '../common/directives/progress-border.directive';
import { COLORS_ENUM } from '../common/enums/colors.enum';
import { IPomodoro } from '../common/models/pomodoro.model';
import { PomodoroService } from './services/pomodoro.service';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

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
    PopupDirective,
  ],
})
export class PomodoroComponent implements OnInit {
  readonly #destroyRef = inject(DestroyRef);
  readonly #injector = inject(Injector);
  readonly #fb = inject(FormBuilder);
  readonly #pomodoroService = inject(PomodoroService);

  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly colors = COLORS_ENUM;

  protected readonly phaseMetadata: Record<
    IPomodoro.EPomodoroPhase,
    { icon: string; color: COLORS_ENUM }
  > = {
    [IPomodoro.EPomodoroPhase.WORK]: {
      icon: this.icons.SCHOOL,
      color: this.colors.ACCENT,
    },
    [IPomodoro.EPomodoroPhase.SHORT_BREAK]: {
      icon: this.icons.COFFEE,
      color: this.colors.SUCCESS,
    },
    [IPomodoro.EPomodoroPhase.LONG_BREAK]: {
      icon: this.icons.CHAIR,
      color: this.colors.INFO,
    },

    [IPomodoro.EPomodoroPhase.IDLE]: {
      icon: this.icons.MOON,
      color: this.colors.ON_ACCENT,
    },
  };

  protected readonly pomodoroState = this.#pomodoroService.state;
  protected readonly pomodoroSettings = this.#pomodoroService.settings;
  protected readonly progress = this.#pomodoroService.progress;
  protected readonly timeLeftFormatted = this.#pomodoroService.timeLeftFormatted;
  protected readonly isRunning = computed(() => this.pomodoroState()?.isRunning);
  protected readonly isPaused = computed(() => this.pomodoroState()?.isPaused);
  protected readonly currentPhase = computed(() => this.pomodoroState()?.phase);

  protected readonly currentPhaseIcon = computed(() => {
    const phase = this.currentPhase();

    return phase ? this.phaseMetadata[phase]?.icon : this.icons.PAUSE;
  });
  protected readonly currentProgressColor = computed(() => {
    const phase = this.currentPhase();

    return phase ? this.phaseMetadata[phase]?.color : this.colors.ON_ACCENT;
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
        : this.icons.TOMATO;

      return {
        label: `${this.uiText.POMODORO.UNITS.POMODORO} ${num}`,
        value: num,
        icon: icon,
      };
    });

    steps.push({
      label: this.uiText.POMODORO.UNITS.FINISH,
      value: FINISHED_CYCLE,
      icon: isSessionEnds ? this.icons.TROPHY : this.icons.CHAIR,
    });

    return steps;
  });

  protected readonly isResetPopupShown: WritableSignal<boolean> = signal(false);

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

  protected onOpenResetPopup(): void {
    this.isResetPopupShown.set(true);
  }

  protected onCloseResetPopup(): void {
    this.isResetPopupShown.set(false);
  }

  protected onConfirmReset(): void {
    this.#pomodoroService.resetSession();
    this.onCloseResetPopup();
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
