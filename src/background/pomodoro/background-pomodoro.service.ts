import { IPomodoro } from '../../modules/common/models/pomodoro.model';
import { StorageAdapter } from '../common/storage-adapter';
import { AlarmAdapter } from '../common/alarm-adapter';
import { logger } from '../../modules/common/helpers/logger';
import { CHROME_ALARM_ENUM } from '../../modules/common/enums/chrome-alarm-name.enum';
import { FINISHED_CYCLE } from '../../modules/common/constants/finished-cycle.const';
import { ALARM_PERIOD_IN_MINUTES } from '../../modules/common/constants/alarm-period-in-mionutes.const';

export class BackgroundPomodoroService {
  readonly #logger = logger.createLogger('BackgroundPomodoroService');

  /**
   * Updates global Pomodoro settings and synchronizes the current state.
   * If a session is active, it adjusts the timer to reflect the new duration settings.
   * @param {IPomodoro.Settings} settings - The new configuration settings from the UI.
   * @returns {Promise<void>}
   */
  public async setPomodoroSettings(settings: IPomodoro.Settings): Promise<void> {
    this.#logger.info('Updating settings', settings);

    await StorageAdapter.savePomodoroSettings(settings);

    const state = await StorageAdapter.getPomodoroState();

    if (state) {
      state.totalCycles = settings.cyclesBeforeLongBreak;

      if (!state.isRunning) {
        state.timeLeftSec = settings.workDurationMin * 60;
        state.totalTimeSec = settings.workDurationMin * 60;
      }

      await StorageAdapter.savePomodoroState(state);
    }
  }

  /**
   * Forcibly updates the Pomodoro state from an external source.
   * Useful for data synchronization or resetting parameters from the UI.
   * * @param {IPomodoro.State} state - The complete state object to be persisted.
   * @returns {Promise<void>}
   * @note This is a "dumb" update: it overwrites the current state without
   * validation. Use with caution to avoid inconsistent timer behavior.
   */
  public async setPomodoroState(state: IPomodoro.State): Promise<void> {
    this.#logger.info('Manually updating state', state);
    await StorageAdapter.savePomodoroState(state);
  }

  /**
   * Initializes a new Pomodoro session by fetching the latest settings from storage.
   * Resets the state to the initial WORK phase and starts the Chrome Alarm ticker.
   *  @returns {Promise<void>} Resolves when the session is initialized and the alarm is created.
   * @throws {Error} If settings are not found in the storage.
   */
  public async start(): Promise<void> {
    this.#logger.info('Initializing Pomodoro session');

    const settings = await StorageAdapter.getPomodoroSettings();

    if (!settings) {
      this.#logger.error('Failed to start session: No settings found in storage');
      throw new Error('Pomodoro settings are missing');
    }

    const now = new Date();
    now.setMilliseconds(0);

    const initialState: IPomodoro.State = {
      isRunning: true,
      isPaused: false,
      currentCycle: 1,
      totalCycles: settings.cyclesBeforeLongBreak,
      phase: IPomodoro.EPomodoroPhase.WORK,
      timeLeftSec: settings.workDurationMin * 60,
      totalTimeSec: settings.workDurationMin * 60,
      startedAt: now,
      pausedAt: null,
    };

    await StorageAdapter.savePomodoroState(initialState);

    AlarmAdapter.create(CHROME_ALARM_ENUM.POMODORO_TICK, {
      periodInMinutes: ALARM_PERIOD_IN_MINUTES,
    });
  }

  /**
   * Updates the remaining time based on the difference between the current time
   * and the session start time. Triggered periodically by Chrome Alarm.
   * If the calculated duration exceeds total time, transitions to the next phase.
   * @returns {Promise<void>}
   */
  public async tick(): Promise<void> {
    const state = await StorageAdapter.getPomodoroState();
    const settings = await StorageAdapter.getPomodoroSettings();

    if (!state || !state.isRunning || state.isPaused || !state.startedAt || !settings) {
      return;
    }

    const now = Date.now();
    const startTime = new Date(state.startedAt).getTime();
    const elapsedSec = Math.floor((now - startTime) / 1000);

    if (elapsedSec >= state.timeLeftSec) {
      await this.#switchPhase(state, settings);
    }
  }

  /**
   * Fully stops the Pomodoro session, clears active alarms, and resets the state to default.
   *  @returns {Promise<void>}
   */
  public async stop(): Promise<void> {
    AlarmAdapter.clear(CHROME_ALARM_ENUM.POMODORO_TICK);

    const state = await StorageAdapter.getPomodoroState();
    const settings = await StorageAdapter.getPomodoroSettings();

    if (state && settings) {
      await StorageAdapter.savePomodoroState({
        ...state,
        isRunning: false,
        isPaused: false,
        currentCycle: 1,
        phase: IPomodoro.EPomodoroPhase.WORK,
        timeLeftSec: settings.workDurationMin * 60,
        totalTimeSec: settings.workDurationMin * 60,
        totalCycles: settings.cyclesBeforeLongBreak,
        pausedAt: null,
      });
    }
  }
  /**
   * Pauses the timer execution.
   * Calculates and saves the exact remaining time before pausing.
   * @returns {Promise<void>}
   */
  public async pause(): Promise<void> {
    const state = await StorageAdapter.getPomodoroState();

    if (state && state.isRunning && !state.isPaused && state.startedAt) {
      const now = Date.now();
      const startTime = new Date(state.startedAt).getTime();
      const elapsedSec = Math.floor((now - startTime) / 1000);

      state.timeLeftSec = Math.max(0, state.timeLeftSec - elapsedSec);
      state.isPaused = true;
      state.pausedAt = new Date();

      await StorageAdapter.savePomodoroState(state);
    }
  }
  /**
   * Resumes a previously paused session.
   *  @returns {Promise<void>}
   */
  public async resume(): Promise<void> {
    const state = await StorageAdapter.getPomodoroState();

    if (state && state.isPaused) {
      const now = new Date();
      now.setMilliseconds(0);

      state.isPaused = false;
      state.pausedAt = null;
      state.startedAt = now;

      await StorageAdapter.savePomodoroState(state);
    }
  }
  /**
   * Handles the logic after a phase is finished.
   * Ends session if LONG_BREAK is done, otherwise updates to the next phase.
   * @param {IPomodoro.State} state - Current state to update.
   * @param {IPomodoro.Settings} settings - Configuration for durations.
   * @returns {Promise<void>}
   * @private
   */
  async #switchPhase(state: IPomodoro.State, settings: IPomodoro.Settings): Promise<void> {
    if (state.phase === IPomodoro.EPomodoroPhase.LONG_BREAK) {
      return await this.stop();
    }

    this.#updateStateToNextPhase(state, settings);

    await StorageAdapter.savePomodoroState(state);

    if (settings.pauseAfterPhaseEnd) {
      await this.pause();
    }

    this.#logger.info(`Switched to phase: ${state.phase}`);
  }
  /**
   * Mutates the state object to the next logical phase and sets corresponding durations.
   * - From BREAK (any) to WORK.
   * - From WORK to SHORT_BREAK (incrementing cycle) or LONG_BREAK (if limit reached).
   * @param {IPomodoro.State} state - The state object to mutate.
   * @param {IPomodoro.Settings} settings - Duration and cycle limits configuration.
   * @returns {void}
   * @private
   */
  #updateStateToNextPhase(state: IPomodoro.State, settings: IPomodoro.Settings): void {
    if (state.phase !== IPomodoro.EPomodoroPhase.WORK) {
      state.phase = IPomodoro.EPomodoroPhase.WORK;
      state.timeLeftSec = settings.workDurationMin * 60;
    } else {
      state.phase = IPomodoro.EPomodoroPhase.SHORT_BREAK;
      state.timeLeftSec = settings.shortBreakMin * 60;
      state.currentCycle++;

      if (state.currentCycle > settings.cyclesBeforeLongBreak) {
        state.phase = IPomodoro.EPomodoroPhase.LONG_BREAK;
        state.timeLeftSec = settings.longBreakMin * 60;
        state.currentCycle = FINISHED_CYCLE;
      }
    }

    state.totalTimeSec = state.timeLeftSec;
    const now = new Date();
    now.setMilliseconds(0);
    state.startedAt = now;
  }
}
