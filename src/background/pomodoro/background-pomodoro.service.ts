import { FINISHED_CYCLE } from '../../modules/common/constants/finished-cycle.const';
import { CHROME_ALARM_ENUM } from '../../modules/common/enums/chrome-alarm-name.enum';
import { logger } from '../../modules/common/helpers/logger';
import { IPomodoro } from '../../modules/common/models/pomodoro.model';
import { AlarmAdapter } from '../common/alarm-adapter';
import { ExtensionIconAdapter } from '../common/extension-icon-adapter';
import { StorageAdapter } from '../common/storage-adapter';

const SECONDS_IN_MINUTE = 60;

export class BackgroundPomodoroService {
  readonly #logger = logger.createLogger('BackgroundPomodoroService');
  #badgeIntervalId: ReturnType<typeof setInterval> | null = null;

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
        state.timeLeftSec = settings.workDurationMin * SECONDS_IN_MINUTE;
        state.totalTimeSec = settings.workDurationMin * SECONDS_IN_MINUTE;
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
   * @returns {Promise<void>} Resolves when the session is initialized and the alarm is created.
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
      timeLeftSec: settings.workDurationMin * SECONDS_IN_MINUTE,
      totalTimeSec: settings.workDurationMin * SECONDS_IN_MINUTE,
      startedAt: now,
      pausedAt: null,
    };

    await StorageAdapter.savePomodoroState(initialState);

    this.runBadgeTicker();

    const alarmTime = Date.now() + initialState.timeLeftSec * 1000;
    AlarmAdapter.create(CHROME_ALARM_ENUM.POMODORO_TICK, {
      when: alarmTime,
    });
  }

  /**
   * Updates the remaining time based on the difference between the current time
   * and the session start time. Triggered periodically by Chrome Alarm.
   * If the calculated duration exceeds total time, transitions to the next phase.
   * @returns {Promise<void>}
   */
  public async handleAlarmTrigger(): Promise<void> {
    const state = await StorageAdapter.getPomodoroState();
    const settings = await StorageAdapter.getPomodoroSettings();

    if (!state || !state.isRunning || state.isPaused || !state.startedAt || !settings) {
      return;
    }

    await this.#switchPhase(state, settings);
  }

  /**
   * Fully stops the Pomodoro session, clears active alarms, and resets the state to default.
   * @returns {Promise<void>}
   */
  public async stop(isReset = false): Promise<void> {
    AlarmAdapter.clear(CHROME_ALARM_ENUM.POMODORO_TICK);

    if (this.#badgeIntervalId) {
      clearInterval(this.#badgeIntervalId);
      this.#badgeIntervalId = null;
    }

    ExtensionIconAdapter.clearBadge();

    const state = await StorageAdapter.getPomodoroState();
    const settings = await StorageAdapter.getPomodoroSettings();

    if (state && settings) {
      await StorageAdapter.savePomodoroState({
        ...state,
        isRunning: false,
        isPaused: false,
        currentCycle: isReset ? 1 : FINISHED_CYCLE,
        phase: IPomodoro.EPomodoroPhase.IDLE,
        timeLeftSec: settings.workDurationMin * SECONDS_IN_MINUTE,
        totalTimeSec: settings.workDurationMin * SECONDS_IN_MINUTE,
        totalCycles: settings.cyclesBeforeLongBreak,
        pausedAt: null,
        startedAt: null,
      });
    }
  }

  public async reset(): Promise<void> {
    return await this.stop(true);
  }

  /**
   * Pauses the timer execution.
   * Calculates and saves the exact remaining time before pausing.
   * @returns {Promise<void>}
   */
  public async pause(): Promise<void> {
    const state = await StorageAdapter.getPomodoroState();

    if (state && state.isRunning && !state.isPaused && state.startedAt) {
      AlarmAdapter.clear(CHROME_ALARM_ENUM.POMODORO_TICK);

      if (this.#badgeIntervalId) {
        clearInterval(this.#badgeIntervalId);
        this.#badgeIntervalId = null;
      }

      const now = Date.now();
      const startTime = new Date(state.startedAt).getTime();
      const elapsedSec = Math.floor((now - startTime) / 1000);

      state.timeLeftSec = Math.max(0, state.timeLeftSec - elapsedSec);
      state.isPaused = true;
      state.pausedAt = new Date();

      await StorageAdapter.savePomodoroState(state);

      const mins = Math.floor(state.timeLeftSec / SECONDS_IN_MINUTE);
      const secs = state.timeLeftSec % SECONDS_IN_MINUTE;
      ExtensionIconAdapter.setBadge(`${mins}:${secs.toString().padStart(2, '0')}`, '#00000000');
    }
  }

  /**
   * Resumes a previously paused session.
   * @returns {Promise<void>}
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

      this.runBadgeTicker();

      AlarmAdapter.create(CHROME_ALARM_ENUM.POMODORO_TICK, {
        when: Date.now() + state.timeLeftSec * 1000,
      });
    }
  }

  /**
   * Starts the interval for updating the text on the extension icon every second.
   * @private
   */
  private runBadgeTicker(): void {
    if (this.#badgeIntervalId) clearInterval(this.#badgeIntervalId);

    this.#badgeIntervalId = setInterval(async () => {
      const state = await StorageAdapter.getPomodoroState();

      if (!state || !state.isRunning || state.isPaused || !state.startedAt) {
        if (this.#badgeIntervalId) {
          clearInterval(this.#badgeIntervalId);
          this.#badgeIntervalId = null;
        }
        return;
      }

      const elapsed = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000);
      const remaining = Math.max(0, state.timeLeftSec - elapsed);

      const mins = Math.floor(remaining / SECONDS_IN_MINUTE);
      const secs = remaining % SECONDS_IN_MINUTE;
      const timeText = `${mins}:${secs.toString().padStart(2, '0')}`;

      ExtensionIconAdapter.setBadge(timeText, '#00000000');
    }, 1000);
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
    } else {
      this.runBadgeTicker();
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
    switch (state.phase) {
      case IPomodoro.EPomodoroPhase.WORK:
        if (state.currentCycle >= settings.cyclesBeforeLongBreak) {
          state.phase = IPomodoro.EPomodoroPhase.LONG_BREAK;
          state.timeLeftSec = settings.longBreakMin * SECONDS_IN_MINUTE;
          state.currentCycle = FINISHED_CYCLE;
        } else {
          state.phase = IPomodoro.EPomodoroPhase.SHORT_BREAK;
          state.timeLeftSec = settings.shortBreakMin * SECONDS_IN_MINUTE;
        }
        break;

      case IPomodoro.EPomodoroPhase.SHORT_BREAK:
        state.phase = IPomodoro.EPomodoroPhase.WORK;
        state.timeLeftSec = settings.workDurationMin * SECONDS_IN_MINUTE;
        state.currentCycle++;
        break;
    }

    state.totalTimeSec = state.timeLeftSec;
    const now = new Date();
    now.setMilliseconds(0);
    state.startedAt = now;

    AlarmAdapter.create(CHROME_ALARM_ENUM.POMODORO_TICK, {
      when: Date.now() + state.timeLeftSec * 1000,
    });
  }
}
