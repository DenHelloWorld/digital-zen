import { IPomodoro } from '../models/pomodoro.model';

export const DEFAULT_POMODORO_SETTINGS: IPomodoro.Settings = {
  workDurationMin: 20,
  shortBreakMin: 5,
  longBreakMin: 15,
  cyclesBeforeLongBreak: 4,
  pauseAfterPhaseEnd: false,
  workStepConfig: {
    step: 1,
    quickStep: 5,
    min: 1,
    max: 90,
  },
  shortBreakStepConfig: {
    step: 1,
    quickStep: 5,
    min: 1,
    max: 15,
  },
  longBreakStepConfig: {
    step: 1,
    quickStep: 5,
    min: 1,
    max: 30,
  },
  cyclesBeforeLongBreakConfig: {
    step: 1,
    quickStep: 1,
    min: 1,
    max: 5,
  },
};
