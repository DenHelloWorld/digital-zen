import { IPomodoro } from '../models/pomodoro.model';

export const createDefaultPomodoroStateHelper = (
  settings: IPomodoro.Settings
): IPomodoro.State => ({
  isRunning: false,
  isPaused: false,
  currentCycle: 1,
  totalCycles: settings.cyclesBeforeLongBreak,
  phase: IPomodoro.EPomodoroPhase.WORK,
  timeLeftSec: settings.workDurationMin * 60,
  totalTimeSec: settings.workDurationMin * 60,
  startedAt: null,
  pausedAt: null,
});
