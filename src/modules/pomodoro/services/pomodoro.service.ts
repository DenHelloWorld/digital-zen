import { inject, Injectable, signal } from '@angular/core';
import {
  CHROME_COMMAND_ENUM,
  CHROME_STORAGE_KEY_ENUM,
  ChromeCommandType,
  ChromeStorageService,
  logger,
} from '../../common';
import { IPomodoro } from '../../common/models/pomodoro.model';

interface InitialStorageSchema {
  [CHROME_STORAGE_KEY_ENUM.POMODORO_STATE]: IPomodoro.State;
  [CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS]: IPomodoro.Settings;
}

const initialSettings: IPomodoro.Settings = {
  workDurationMin: 20,
  shortBreakMin: 5,
  longBreakMin: 15,
  cyclesBeforeLongBreak: 2,
  autoStartNext: false,
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
};

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

  readonly #state = signal<IPomodoro.State | null>(null);
  readonly #settings = signal<IPomodoro.Settings>(initialSettings);

  public readonly state = this.#state.asReadonly();
  public readonly settings = this.#settings.asReadonly();

  constructor() {
    this.#syncInitialState();
    this.#listenToStorageChanges();
  }

  public startSession() {
    if (this.#isChromeRuntime) {
      const settings: IPomodoro.Settings = this.settings();
      chrome.runtime.sendMessage<{ command: ChromeCommandType; settings: IPomodoro.Settings }>({
        command: CHROME_COMMAND_ENUM.START_POMODORO,
        settings,
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
            this.#logger.info('settings', settings);
          }
          if (state) {
            this.#state.set(state);
            this.#logger.info('state', state);
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
