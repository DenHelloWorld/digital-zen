import { IFocus } from '../modules/common/models/focus.model';
import { CHROME_STORAGE_KEY_ENUM } from '../modules/common/enums/chrome-storage-key.enum';
import { logger } from '../modules/common/helpers/logger';

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

export class StorageAdapter {
  private static readonly logger = logger.createLogger('StorageAdapter');
  private static writeQueue: Promise<unknown> = Promise.resolve();

  // === Public API ===

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

  // === Private helpers ===

  private static async enqueue<T>(task: () => Promise<T>): Promise<T> {
    const nextTask = this.writeQueue.then(() => task());
    this.writeQueue = nextTask;
    return nextTask;
  }

  private static toStorageFormat(period: IFocus.Period): StoredPeriod {
    const toISOStringSafe = (d: Date | string | null) => {
      if (!d) return null;
      if (d instanceof Date) {
        // Check if the Date is valid before converting to ISO string
        if (isNaN(d.getTime())) {
          StorageAdapter.logger.warn('Invalid Date detected in period, skipping:', d);
          return null;
        }
        return d.toISOString();
      }
      return String(d);
    };

    return {
      ...period,
      startFrom: toISOStringSafe(period.startFrom),
      endTo: toISOStringSafe(period.endTo),
      sessionStartTime: toISOStringSafe(period.sessionStartTime),
      focusedTimes: (period.focusedTimes || []).map(ft => ({
        ...ft,
        startFrom: toISOStringSafe(ft.startFrom),
        endTo: toISOStringSafe(ft.endTo),
      })),
    };
  }

  private static fromStorageFormat(stored: StoredPeriod): IFocus.Period {
    const toDateSafe = (s: string | null): Date | null => {
      if (!s) return null;
      const date = new Date(s);
      // Return null if the date is invalid
      if (isNaN(date.getTime())) {
        StorageAdapter.logger.warn('Invalid date string detected in storage, skipping:', s);
        return null;
      }
      return date;
    };

    return {
      ...stored,
      startFrom: toDateSafe(stored.startFrom),
      endTo: toDateSafe(stored.endTo),
      sessionStartTime: toDateSafe(stored.sessionStartTime),
      focusedTimes: (stored.focusedTimes || []).map(ft => ({
        ...ft,
        startFrom: toDateSafe(ft.startFrom),
        endTo: toDateSafe(ft.endTo),
      })),
    };
  }
}
