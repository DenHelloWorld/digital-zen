import { inject, Injectable } from '@angular/core';
import {
  CHROME_COMMAND_ENUM,
  CHROME_STORAGE_KEY_ENUM,
  ChromeStorageService,
  logger,
} from '../../common';
import { IPomodoro } from '../../common/models/pomodoro.model';

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

  constructor() {
    this.#syncInitialState();
    this.#listenToStorageChanges();
  }

  public startSession() {
    if (this.#isChromeRuntime) {
      const settings = {
        workDurationMin: 1,
        /** Current short break duration in minutes */
        shortBreakMin: 1,
        /** Current long break duration in minutes */
        longBreakMin: 5,
        /** Number of work cycles required to trigger a long break */
        cyclesBeforeLongBreak: 2,

        /** Stepper constraints for work session settings */
        // workStepConfig: StepConfig;
        // /** Stepper constraints for short break settings */
        // shortBreakStepConfig: StepConfig;
        // /** Stepper constraints for long break settings */
        // longBreakStepConfig: StepConfig;
        //
        // /** Whether to automatically transition to the next phase */
        // autoStartNext: boolean;
      };
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.START_POMODORO, settings });
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

          this.#logger.info('state', state);
          this.#logger.info('settings', settings);
        }
      );
    }
  }

  #listenToStorageChanges(): void {
    if (this.#isChromeRuntime) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
          if (changes[CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS]) {
            const newSettings = changes[CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS];
            if (newSettings) {
              this.#logger.info('newSettings', newSettings);
            }
          }

          if (changes[CHROME_STORAGE_KEY_ENUM.POMODORO_STATE]) {
            const newState = changes[CHROME_STORAGE_KEY_ENUM.POMODORO_STATE];
            if (newState) {
              this.#logger.info('newState', newState);
            }
          }
        }
      });
    }
  }
}
