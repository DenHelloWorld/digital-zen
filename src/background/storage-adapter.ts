export namespace IFocus {
  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date | null;
    endTo: Date | null;
    webSites: WebSite[];
    daysOfWeek?: number[];
    focusedTimes: IFocus.FocusedTime[];
    isFocused: boolean;
  }

  export interface WebSite {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    isBlocked: boolean;
  }

  export interface FocusedTime {
    id: string;
    periodId: string;
    startFrom: Date | null;
    endTo: Date | null;
  }
}

/**
 * Тип данных, который реально хранится в storage (ISO строки вместо Date)
 */
interface StoredPeriod extends Omit<IFocus.Period, 'startFrom' | 'endTo' | 'focusedTimes'> {
  startFrom: string | null;
  endTo: string | null;
  focusedTimes: StoredFocusedTime[];
}

interface StoredFocusedTime extends Omit<IFocus.FocusedTime, 'startFrom' | 'endTo'> {
  startFrom: string | null;
  endTo: string | null;
}

export class StorageAdapter {
  private static writeQueue: Promise<unknown> = Promise.resolve();

  // === Public API ===

  static async savePeriod(period: IFocus.Period): Promise<void> {
    return this.enqueue(async () => {
      const stored = this.toStorageFormat(period);
      const result = await chrome.storage.local.get('periods');
      const periods: StoredPeriod[] = Array.isArray(result['periods']) ? result['periods'] : [];

      const index = periods.findIndex((p) => p.id === period.id);
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

  static async getPeriods(): Promise<IFocus.Period[]> {
    const result = await chrome.storage.local.get('periods');
    const raw: StoredPeriod[] = Array.isArray(result['periods']) ? result['periods'] : [];
    return raw.map(this.fromStorageFormat);
  }

  static async getCurrentPeriod(): Promise<IFocus.Period | null> {
    const result = await chrome.storage.local.get('currentPeriod');
    const rawObj = result['currentPeriod'];

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
      return d instanceof Date ? d.toISOString() : String(d);
    };

    return {
      ...period,
      startFrom: toISOStringSafe(period.startFrom),
      endTo: toISOStringSafe(period.endTo),
      focusedTimes: (period.focusedTimes || []).map((ft) => ({
        ...ft,
        startFrom: toISOStringSafe(ft.startFrom),
        endTo: toISOStringSafe(ft.endTo),
      })),
    };
  }

  private static fromStorageFormat(stored: StoredPeriod): IFocus.Period {
    return {
      ...stored,
      startFrom: stored.startFrom ? new Date(stored.startFrom) : null,
      endTo: stored.endTo ? new Date(stored.endTo) : null,
      focusedTimes: (stored.focusedTimes || []).map((ft) => ({
        ...ft,
        startFrom: ft.startFrom ? new Date(ft.startFrom) : null,
        endTo: ft.endTo ? new Date(ft.endTo) : null,
      })),
    };
  }
}
