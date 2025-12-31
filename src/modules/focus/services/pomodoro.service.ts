import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { IFocus, CHROME_COMMAND_ENUM } from '../../common';

export const DEFAULT_POMODORO_SETTINGS: IFocus.PomodoroSettings = {
  enabled: false,
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundVolume: 70,
};

@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  readonly #isChromeRuntime: boolean = !!chrome.runtime;
  readonly #destroyRef = inject(DestroyRef);

  readonly #currentSession = signal<IFocus.PomodoroSession | null>(null);
  readonly #settings = signal<IFocus.PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  readonly #currentTime = signal(Date.now());
  #timerIntervalId: ReturnType<typeof setInterval> | null = null;

  public readonly currentSession = computed(() => this.#currentSession());
  public readonly settings = computed(() => this.#settings());

  /**
   * Computed signal that returns the time remaining in milliseconds
   */
  public readonly timeRemaining = computed(() => {
    const session = this.#currentSession();
    const currentTime = this.#currentTime();

    if (!session?.cycleEndTime || session.isPaused) {
      return session?.remainingTime ?? 0;
    }

    const end = session.cycleEndTime.getTime();
    return Math.max(0, end - currentTime);
  });

  /**
   * Formatted time remaining as MM:SS
   */
  public readonly timeRemainingFormatted = computed(() => {
    const ms = this.timeRemaining();
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  /**
   * Progress percentage (0-100)
   */
  public readonly progressPercentage = computed(() => {
    const session = this.#currentSession();
    const settings = this.#settings();

    if (!session) {
      return 0;
    }

    let duration = 0;
    if (session.state === 'work') {
      duration = settings.workDuration * 60 * 1000;
    } else if (session.state === 'short-break') {
      duration = settings.shortBreakDuration * 60 * 1000;
    } else if (session.state === 'long-break') {
      duration = settings.longBreakDuration * 60 * 1000;
    }

    const elapsed = duration - this.timeRemaining();
    return duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
  });

  constructor() {
    this.#startTimer();
    this.#listenToStorageChanges();
  }

  /**
   * Start a timer that updates the current time signal every second
   */
  #startTimer(): void {
    this.#timerIntervalId = setInterval(() => {
      this.#currentTime.set(Date.now());
    }, 1000);

    this.#destroyRef.onDestroy(() => {
      if (this.#timerIntervalId) {
        clearInterval(this.#timerIntervalId);
        this.#timerIntervalId = null;
      }
    });
  }

  /**
   * Listen to storage changes for current period updates
   */
  #listenToStorageChanges(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes['currentPeriod']) {
        const period = changes['currentPeriod'].newValue as IFocus.Period | null;
        if (period?.pomodoroSettings) {
          this.#settings.set(period.pomodoroSettings);
        }
        if (period?.currentPomodoro) {
          this.#currentSession.set(this.#convertSessionFromStorage(period.currentPomodoro));
        } else {
          this.#currentSession.set(null);
        }
      }
    });
  }

  /**
   * Convert session from storage (with ISO string dates) to runtime format (with Date objects)
   */
  #convertSessionFromStorage(session: IFocus.PomodoroSession): IFocus.PomodoroSession {
    return {
      ...session,
      cycleStartTime: session.cycleStartTime ? new Date(session.cycleStartTime) : null,
      cycleEndTime: session.cycleEndTime ? new Date(session.cycleEndTime) : null,
    };
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<IFocus.PomodoroSettings>): void {
    const newSettings = { ...this.#settings(), ...settings };
    this.#settings.set(newSettings);
  }

  /**
   * Starts a new Pomodoro work session
   */
  public startPomodoro(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.runtime.sendMessage({
      command: CHROME_COMMAND_ENUM.START_POMODORO,
    });
  }

  /**
   * Pauses the current Pomodoro session
   */
  public pausePomodoro(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.runtime.sendMessage({
      command: CHROME_COMMAND_ENUM.PAUSE_POMODORO,
    });
  }

  /**
   * Resumes a paused Pomodoro session
   */
  public resumePomodoro(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.runtime.sendMessage({
      command: CHROME_COMMAND_ENUM.RESUME_POMODORO,
    });
  }

  /**
   * Skips current session and starts the next one (work -> break or break -> work)
   */
  public skipPomodoro(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.runtime.sendMessage({
      command: CHROME_COMMAND_ENUM.SKIP_POMODORO,
    });
  }

  /**
   * Resets the entire Pomodoro cycle
   */
  public resetPomodoro(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.runtime.sendMessage({
      command: CHROME_COMMAND_ENUM.RESET_POMODORO,
    });
  }
}
