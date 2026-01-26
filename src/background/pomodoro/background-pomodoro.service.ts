import { IPomodoro } from '../../modules/common/models/pomodoro.model';
import { StorageAdapter } from '../common/storage-adapter';
import { AlarmAdapter } from '../common/alarm-adapter';
import { logger } from '../../modules/common/helpers/logger';
import { CHROME_ALARM_ENUM } from '../../modules/common/enums/chrome-alarm-name.enum';

export class BackgroundPomodoroService {
  readonly #logger = logger.createLogger('BackgroundPomodoroService');

  /**
   * Starts the pomodoro cycle and registers the alarm via adapter
   */
  public async start(settings: IPomodoro.Settings): Promise<void> {
    this.#logger.info('Initializing Pomodoro session');

    const initialState: IPomodoro.State = {
      isRunning: true,
      isPaused: false,
      currentCycle: 1,
      totalCycles: settings.cyclesBeforeLongBreak,
      phase: IPomodoro.EPomodoroPhase.WORK,
      timeLeftSec: settings.workDurationMin * 60,
      totalTimeSec: settings.workDurationMin * 60,
      startedAt: new Date(),
      pausedAt: null,
    };

    await StorageAdapter.savePomodoroSettings(settings);
    await StorageAdapter.savePomodoroState(initialState);

    AlarmAdapter.create(CHROME_ALARM_ENUM.POMODORO_TICK, {
      periodInMinutes: 1 / 60,
    });
  }

  /**
   * Logical 'tick' called by the AlarmAdapter's dispatcher
   */
  public async tick(): Promise<void> {
    const state = await StorageAdapter.getPomodoroState();
    const settings = await StorageAdapter.getPomodoroSettings();

    if (!state || !state.isRunning || state.isPaused || !settings) return;

    if (state.timeLeftSec > 0) {
      state.timeLeftSec--;
      await StorageAdapter.savePomodoroState(state);
    } else {
      await this.#switchPhase(state, settings);
    }
  }

  /**
   * Stops the timer and clears the alarm via adapter
   */
  public async stop(): Promise<void> {
    AlarmAdapter.clear(CHROME_ALARM_ENUM.POMODORO_TICK);

    const state = await StorageAdapter.getPomodoroState();
    if (state) {
      state.isRunning = false;
      await StorageAdapter.savePomodoroState(state);
    }
    this.#logger.info('Pomodoro stopped and alarm cleared');
  }

  /**
   * Pauses the timer without clearing the alarm
   */
  public async pause(): Promise<void> {
    const state = await StorageAdapter.getPomodoroState();
    if (state) {
      state.isPaused = true;
      state.pausedAt = new Date();
      await StorageAdapter.savePomodoroState(state);
    }
  }

  /**
   * Logic for phase switching (Work -> Break etc.)
   */
  async #switchPhase(state: IPomodoro.State, settings: IPomodoro.Settings): Promise<void> {
    this.#logger.info('Phase ended, switching to next');

    let nextPhase: IPomodoro.EPomodoroPhase;
    let nextDurationMin: number;

    if (state.phase === IPomodoro.EPomodoroPhase.WORK) {
      // Finished working -> check if it's time for a long break
      if (state.currentCycle >= settings.cyclesBeforeLongBreak) {
        nextPhase = IPomodoro.EPomodoroPhase.LONG_BREAK;
        nextDurationMin = settings.longBreakMin;
        state.currentCycle = 1; // Reset cycles after long break
      } else {
        nextPhase = IPomodoro.EPomodoroPhase.SHORT_BREAK;
        nextDurationMin = settings.shortBreakMin;
        // Cycle increment happens only after full Work session
      }
    } else {
      // Finished any break -> back to work
      nextPhase = IPomodoro.EPomodoroPhase.WORK;
      nextDurationMin = settings.workDurationMin;

      // If we just finished a SHORT_BREAK, increment the cycle counter
      if (state.phase === IPomodoro.EPomodoroPhase.SHORT_BREAK) {
        state.currentCycle++;
      }
    }

    state.phase = nextPhase;
    state.timeLeftSec = nextDurationMin * 60;
    state.totalTimeSec = nextDurationMin * 60;

    // Auto-pause if user wants to manually start next session
    if (!settings.autoStartNext) {
      state.isPaused = true;
      state.pausedAt = new Date();
    }

    await StorageAdapter.savePomodoroState(state);
    this.#logger.info(`Switched to phase: ${nextPhase}, duration: ${nextDurationMin}min`);
  }
}
