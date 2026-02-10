import { FormControl } from '@angular/forms';
import { IStepConfig } from './step-config.model';

export namespace IPomodoro {
  /** Global application settings managed by the user */
  export interface Settings {
    /** Current work session duration in minutes */
    workDurationMin: number;
    /** Current short break duration in minutes */
    shortBreakMin: number;
    /** Current long break duration in minutes */
    longBreakMin: number;
    /** Number of work cycles required to trigger a long break */
    cyclesBeforeLongBreak: 2 | 3 | 4 | 5;

    /** Stepper constraints for work session settings */
    workStepConfig: IStepConfig;
    /** Stepper constraints for short break settings */
    shortBreakStepConfig: IStepConfig;
    /** Stepper constraints for long break settings */
    longBreakStepConfig: IStepConfig;
    cyclesBeforeLongBreakConfig: IStepConfig;

    /** Whether to automatically transition to the next phase */
    pauseAfterPhaseEnd: boolean;
  }

  export interface SettingsForm {
    workDurationMin: FormControl<number>;
    shortBreakMin: FormControl<number>;
    longBreakMin: FormControl<number>;
    cyclesBeforeLongBreak: FormControl<2 | 3 | 4 | 5>;
    pauseAfterPhaseEnd: FormControl<boolean>;
  }

  /** Current real-time state of the timer */
  export interface State {
    /** Whether the timer is currently active */
    isRunning: boolean;
    /** Whether the active timer is temporarily suspended */
    isPaused: boolean;

    /** Current cycle index (used for progress dots at the bottom) */
    currentCycle: number;
    /** Total number of cycles in the current session sequence */
    totalCycles: number;

    /** Current active phase of the Pomodoro (Work, Break, etc.) */
    phase: IPomodoroPhase;

    /** Remaining time in seconds for the current phase */
    timeLeftSec: number;
    /** Initial total duration in seconds (used to calculate progress %) */
    totalTimeSec: number;

    /** Timestamp when the current phase started */
    startedAt: Date | null;
    /** Timestamp when the timer was last paused */
    pausedAt: Date | null;
  }

  /** Record of a completed pomodoro session for statistics */
  export interface HistoryItem {
    /** Unique identifier for the history record */
    id: string;
    /** When the session officially started */
    startedAt: Date;
    /** When the session was finished or stopped */
    finishedAt: Date;
    /** Total number of work cycles completed in this session */
    cyclesCompleted: number;
    /** Sum of all work time in minutes across cycles */
    totalWorkTimeMin: number;
  }

  /** Available phases for the Pomodoro timer */
  export enum EPomodoroPhase {
    WORK = 'work',
    SHORT_BREAK = 'short_break',
    LONG_BREAK = 'long_break',
    IDLE = 'idle',
  }

  /** Union type representing valid Pomodoro phases */
  export type IPomodoroPhase =
    | EPomodoroPhase.WORK
    | EPomodoroPhase.SHORT_BREAK
    | EPomodoroPhase.LONG_BREAK
    | EPomodoroPhase.IDLE;
}
