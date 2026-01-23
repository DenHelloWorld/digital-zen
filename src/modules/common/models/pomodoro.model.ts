export namespace IPomodoro {
  export interface Settings {
    workDurationMin: number;
    shortBreakMin: number;
    longBreakMin: number;
    cyclesBeforeLongBreak: number;
  }

  export interface State {
    isRunning: boolean;
    isPaused: boolean;
    currentCycle: number;
    totalCycles: number;
    phase: EPomodoroPhase;
    timeLeftSec: number;
    startedAt: Date | null;
    pausedAt: Date | null;
  }

  export interface HistoryItem {
    id: string;
    startedAt: Date;
    finishedAt: Date;
    cyclesCompleted: number;
    totalWorkTimeMin: number;
  }

  export enum EPomodoroPhase {
    WORK = 'work',
    SHORT_BREAK = 'short_break',
    LONG_BREAK = 'long_break',
    IDLE = 'idle',
  }

  export type TPomodoroPhase =
    | IPomodoro.EPomodoroPhase.WORK
    | IPomodoro.EPomodoroPhase.SHORT_BREAK
    | IPomodoro.EPomodoroPhase.LONG_BREAK
    | IPomodoro.EPomodoroPhase.IDLE;
}
