import { CHROME_STORAGE_KEY_ENUM } from '../../modules/common/enums/chrome-storage-key.enum';
import { logger } from '../../modules/common/helpers/logger';
import { toWallTimeISO, fromWallTimeISO } from '../../modules/common/helpers/time.helper';
import { IFocus } from '../../modules/common/models/focus.model';
import { IPomodoro } from '../../modules/common/models/pomodoro.model';

/**
 * The type of data that is actually stored in storage (ISO strings instead of Date)
 */
interface StoredPeriod extends Omit<
  IFocus.Period,
  'startFrom' | 'endTo' | 'focusedTimes' | 'sessionStartTime'
> {
  startFrom: string | null;
  endTo: string | null;
  sessionStartTime: string | null;
  focusedTimes: StoredFocusedTime[];
}

interface StoredFocusedTime extends Omit<IFocus.FocusedTime, 'startFrom' | 'endTo'> {
  startFrom: string | null;
  endTo: string | null;
}

/**
 * Internal storage format for Pomodoro State (Date -> string)
 */
interface StoredPomodoroState extends Omit<IPomodoro.State, 'startedAt' | 'pausedAt'> {
  startedAt: string | null;
  pausedAt: string | null;
}

export class StorageAdapter {
  private static readonly logger = logger.createLogger('StorageAdapter');
  private static writeQueue: Promise<unknown> = Promise.resolve();

  // === Focus API ===
  static async savePeriod(period: IFocus.Period): Promise<void> {
    return this.enqueue(async () => {
      const stored = this.toStorageFormat(period);
      const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.PERIODS);
      const periods: StoredPeriod[] = Array.isArray(result[CHROME_STORAGE_KEY_ENUM.PERIODS])
        ? result[CHROME_STORAGE_KEY_ENUM.PERIODS]
        : [];

      const index = periods.findIndex(p => p.id === period.id);
      if (index !== -1) {
        periods[index] = stored;
      } else {
        periods.push(stored);
      }

      await chrome.storage.local.set({ periods });
    });
  }

  static async saveCurrentPeriod(period: IFocus.Period): Promise<void> {
    return this.enqueue(async () => {
      await chrome.storage.local.set({
        currentPeriod: this.toStorageFormat(period),
      });
    });
  }

  static async replaceAllPeriods(periods: IFocus.Period[]): Promise<void> {
    return this.enqueue(async () => {
      const storedPeriods = periods.map(p => this.toStorageFormat(p));
      await chrome.storage.local.set({
        [CHROME_STORAGE_KEY_ENUM.PERIODS]: storedPeriods,
      });
      StorageAdapter.logger.info('Replaced all periods, count:', periods.length);
    });
  }

  static async removePeriod(periodId: string): Promise<void> {
    return this.enqueue(async () => {
      const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.PERIODS);
      const periods: StoredPeriod[] = Array.isArray(result[CHROME_STORAGE_KEY_ENUM.PERIODS])
        ? result[CHROME_STORAGE_KEY_ENUM.PERIODS]
        : [];

      const newPeriods = periods.filter(p => p.id !== periodId);
      await chrome.storage.local.set({ periods: newPeriods });
    });
  }

  static async getPeriods(): Promise<IFocus.Period[]> {
    const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.PERIODS);
    const raw: StoredPeriod[] = Array.isArray(result[CHROME_STORAGE_KEY_ENUM.PERIODS])
      ? result[CHROME_STORAGE_KEY_ENUM.PERIODS]
      : [];
    return raw.map(this.fromStorageFormat);
  }

  static async getCurrentPeriod(): Promise<IFocus.Period | null> {
    const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD);
    const rawObj = result[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD];

    if (!rawObj || typeof rawObj !== 'object') return null;

    const raw = rawObj as StoredPeriod;

    return this.fromStorageFormat(raw);
  }

  // === Pomodoro API ===

  static async savePomodoroSettings(settings: IPomodoro.Settings): Promise<void> {
    return this.enqueue(async () => {
      await chrome.storage.local.set({ [CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS]: settings });
    });
  }

  static async getPomodoroSettings(): Promise<IPomodoro.Settings | null> {
    const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS);
    const settings = result[CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS] as
      | IPomodoro.Settings
      | undefined;
    return settings || null;
  }

  static async savePomodoroState(state: IPomodoro.State): Promise<void> {
    return this.enqueue(async () => {
      const stored: StoredPomodoroState = {
        ...state,
        startedAt: toWallTimeISO(state.startedAt),
        pausedAt: toWallTimeISO(state.pausedAt),
      };
      await chrome.storage.local.set({ [CHROME_STORAGE_KEY_ENUM.POMODORO_STATE]: stored });
    });
  }

  static async getPomodoroState(): Promise<IPomodoro.State | null> {
    const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.POMODORO_STATE);
    const raw = result[CHROME_STORAGE_KEY_ENUM.POMODORO_STATE] as StoredPomodoroState;

    if (!raw) return null;

    return {
      ...raw,
      startedAt: fromWallTimeISO(raw.startedAt),
      pausedAt: fromWallTimeISO(raw.pausedAt),
    };
  }

  // === Private helpers ===

  private static async enqueue<T>(task: () => Promise<T>): Promise<T> {
    const nextTask = this.writeQueue.then(() => task());
    this.writeQueue = nextTask;
    return nextTask;
  }

  private static toStorageFormat(period: IFocus.Period): StoredPeriod {
    return {
      ...period,
      startFrom: toWallTimeISO(period.startFrom),
      endTo: toWallTimeISO(period.endTo),
      sessionStartTime: toWallTimeISO(period.sessionStartTime),
      focusedTimes: (period.focusedTimes || []).map(ft => ({
        ...ft,
        startFrom: toWallTimeISO(ft.startFrom),
        endTo: toWallTimeISO(ft.endTo),
      })),
    };
  }

  private static fromStorageFormat(stored: StoredPeriod): IFocus.Period {
    return {
      ...stored,
      startFrom: fromWallTimeISO(stored.startFrom),
      endTo: fromWallTimeISO(stored.endTo),
      sessionStartTime: fromWallTimeISO(stored.sessionStartTime),
      focusedTimes: (stored.focusedTimes || []).map(ft => ({
        ...ft,
        startFrom: fromWallTimeISO(ft.startFrom),
        endTo: fromWallTimeISO(ft.endTo),
      })),
    };
  }
}
