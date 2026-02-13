import { DEFAULT_POMODORO_SETTINGS } from '../../common/constants/default-pomodoro-settings.const';
import { CHROME_COMMAND_ENUM, ChromeCommandType } from '../../common/enums/chrome-command.enum';
import { CHROME_STORAGE_KEY_ENUM } from '../../common/enums/chrome-storage-key.enum';
import { createDefaultPomodoroStateHelper } from '../../common/helpers/create-default-pomodoro-state.helper';
import { logger } from '../../common/helpers/logger';
import { IPomodoro } from '../../common/models/pomodoro.model';
import { ChromeStorageService } from '../../common/services/chrome-storage.service';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

interface InitialStorageSchema {
  [CHROME_STORAGE_KEY_ENUM.POMODORO_STATE]: IPomodoro.State;
  [CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS]: IPomodoro.Settings;
}

/**
 * Service for managing Pomodoro sessions and settings
 * Synchronizes timer state between background processes and the UI
 *
 * @guidelines
 * - DZ_02: Dependency injection using inject() function
 * - DZ_04: Angular Signals for reactive state (signal, computed)
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_11: Universal Logger usage
 *
 * @see /docs/coding-guidelines.md
 * @see https://angular.dev/guide/signals (Signals)
 */
@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  /** @guideline DZ_08 - Private readonly field for runtime check */
  readonly #isChromeRuntime: boolean = !!chrome.runtime;
  readonly #chromeStorageService = inject(ChromeStorageService);
  /** @guideline DZ_11 - Universal Logger usage */
  readonly #logger = logger.createLogger('PomodoroService');
  readonly #destroyRef = inject(DestroyRef);

  readonly #state = signal<IPomodoro.State>(
    createDefaultPomodoroStateHelper(DEFAULT_POMODORO_SETTINGS)
  );
  readonly #settings = signal<IPomodoro.Settings>(DEFAULT_POMODORO_SETTINGS);

  public readonly state = this.#state.asReadonly();
  public readonly settings = this.#settings.asReadonly();

  readonly #timeLeftSec = computed(() => {
    const state = this.#state();

    if (state.isPaused || !state.isRunning || !state.startedAt) {
      return state.timeLeftSec;
    }

    const now = this.#currentTime();
    const nowSync = new Date(now).setMilliseconds(0);
    const startTime = new Date(state.startedAt).getTime();

    const elapsed = Math.floor((nowSync - startTime) / 1000);
    return Math.max(0, state.timeLeftSec - elapsed);
  });

  public readonly timeLeftFormatted = computed(() => {
    const totalSeconds = this.#timeLeftSec();
    const m = (totalSeconds / 60) | 0;
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  public readonly progress = computed(() => {
    const total = this.#state().totalTimeSec;
    const current = this.#timeLeftSec();
    return total > 0 ? current / total : 0;
  });

  readonly #currentTime = signal(Date.now());
  #timerIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.#syncInitialState();
    this.#listenToStorageChanges();
    this.#startTimer();
  }

  /**
   * Start a timer that updates the current time signal every second.
   * This is used to automatically update the focus elapsed time.
   */
  #startTimer(): void {
    this.#timerIntervalId = setInterval(() => {
      this.#currentTime.set(Date.now());
    }, 100);

    this.#destroyRef.onDestroy(() => {
      if (this.#timerIntervalId) {
        clearInterval(this.#timerIntervalId);
        this.#timerIntervalId = null;
      }
    });
  }

  public setSessionSettings(settings: IPomodoro.Settings) {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage<{ command: ChromeCommandType; settings: IPomodoro.Settings }>({
        command: CHROME_COMMAND_ENUM.SET_POMODORO_SETTINGS,
        settings,
      });
    }
  }

  public setSessionState(state: IPomodoro.State) {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage<{ command: ChromeCommandType; state: IPomodoro.State }>({
        command: CHROME_COMMAND_ENUM.SET_POMODORO_STATE,
        state,
      });
    }
  }

  public startSession() {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage<{ command: ChromeCommandType }>({
        command: CHROME_COMMAND_ENUM.START_POMODORO,
      });
    }
  }

  public stopSession() {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage<{ command: ChromeCommandType }>({
        command: CHROME_COMMAND_ENUM.STOP_POMODORO,
      });
    }
  }

  public pauseSession() {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage<{ command: ChromeCommandType }>({
        command: CHROME_COMMAND_ENUM.PAUSE_POMODORO,
      });
    }
  }

  public resumeSession() {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage<{ command: ChromeCommandType }>({
        command: CHROME_COMMAND_ENUM.RESUME_POMODORO,
      });
    }
  }

  public resetSession() {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage<{ command: ChromeCommandType }>({
        command: CHROME_COMMAND_ENUM.RESET_POMODORO,
      });
    }
  }

  #syncInitialState(): void {
    if (this.#isChromeRuntime) {
      this.#chromeStorageService.getMany<InitialStorageSchema>(
        [CHROME_STORAGE_KEY_ENUM.POMODORO_STATE, CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS],
        result => {
          if (!result) {
            return;
          }

          const state = result[CHROME_STORAGE_KEY_ENUM.POMODORO_STATE];
          const settings = result[CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS];

          if (settings) {
            this.#settings.set(settings);
          }
          if (state) {
            this.#state.set(state);
          }
        }
      );
    }
  }

  #listenToStorageChanges(): void {
    if (this.#isChromeRuntime) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
          if (changes[CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS]) {
            const newSettings = changes[CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS]
              .newValue as IPomodoro.Settings;
            if (newSettings) {
              this.#settings.set(newSettings);
              this.#logger.info('newSettings', newSettings);
            }
          }

          if (changes[CHROME_STORAGE_KEY_ENUM.POMODORO_STATE]) {
            const newState = changes[CHROME_STORAGE_KEY_ENUM.POMODORO_STATE]
              .newValue as IPomodoro.State;
            if (newState) {
              this.#state.set(newState);
              this.#logger.info('newState', newState);
            }
          }
        }
      });
    }
  }
}
