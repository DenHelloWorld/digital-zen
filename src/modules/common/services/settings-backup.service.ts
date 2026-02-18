import { CHROME_STORAGE_KEY_ENUM } from '../enums/chrome-storage-key.enum';
import { Injectable } from '@angular/core';

const BACKUP_FORMAT_VERSION = 1;
const BACKUP_KEYS: readonly CHROME_STORAGE_KEY_ENUM[] = [
  CHROME_STORAGE_KEY_ENUM.PERIODS,
  CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
  CHROME_STORAGE_KEY_ENUM.USER_EMAIL,
  CHROME_STORAGE_KEY_ENUM.USER_ID,
  CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS,
  CHROME_STORAGE_KEY_ENUM.POMODORO_STATE,
] as const;

type BackupStorageRecord = Partial<Record<CHROME_STORAGE_KEY_ENUM, unknown>>;

interface SettingsBackupMetadata {
  exportedAt: string;
  formatVersion: number;
}

const BACKUP_ERROR_MESSAGES = {
  MISSING_PERIODS: 'Backup payload is missing periods data.',
  INVALID_JSON: 'The selected file is not valid JSON.',
  INVALID_METADATA: 'Backup metadata is missing.',
  INVALID_DATA: 'Backup data is missing.',
  INVALID_EXPORT_TIMESTAMP: 'Backup metadata export timestamp is invalid.',
} as const;

const BACKUP_FILE_FIELDS = {
  METADATA: 'metadata',
  DATA: 'data',
} as const;

const BACKUP_METADATA_FIELDS = {
  EXPORTED_AT: 'exportedAt',
  FORMAT_VERSION: 'formatVersion',
} as const;

interface SettingsBackupData {
  periods: unknown[];
  currentPeriod: unknown | null;
  userEmail?: string | null;
  userId?: string | null;
  pomodoroSettings?: unknown | null;
  pomodoroState?: unknown | null;
}

export interface SettingsBackupPayload {
  metadata: SettingsBackupMetadata;
  data: SettingsBackupData;
}

const BACKUP_DATA_KEYS = BACKUP_KEYS;

const STORAGE_KEY_TO_DATA_KEY: Partial<Record<CHROME_STORAGE_KEY_ENUM, keyof SettingsBackupData>> =
  {
    [CHROME_STORAGE_KEY_ENUM.PERIODS]: 'periods',
    [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: 'currentPeriod',
    [CHROME_STORAGE_KEY_ENUM.USER_EMAIL]: 'userEmail',
    [CHROME_STORAGE_KEY_ENUM.USER_ID]: 'userId',
    [CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS]: 'pomodoroSettings',
    [CHROME_STORAGE_KEY_ENUM.POMODORO_STATE]: 'pomodoroState',
  };

@Injectable({
  providedIn: 'root',
})
export class SettingsBackupService {
  readonly #backupKeys = BACKUP_KEYS;

  public async exportSettings(): Promise<SettingsBackupPayload> {
    const storage = await this.#readStorage();

    const storedPeriods = storage[CHROME_STORAGE_KEY_ENUM.PERIODS];
    const data: SettingsBackupData = {
      periods: Array.isArray(storedPeriods) ? storedPeriods : [],
      currentPeriod:
        storage[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD] === undefined
          ? null
          : storage[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD],
      userEmail: this.#castStringOrNull(storage[CHROME_STORAGE_KEY_ENUM.USER_EMAIL]),
      userId: this.#castStringOrNull(storage[CHROME_STORAGE_KEY_ENUM.USER_ID]),
      pomodoroSettings: storage[CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS] ?? null,
      pomodoroState: storage[CHROME_STORAGE_KEY_ENUM.POMODORO_STATE] ?? null,
    };

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        formatVersion: BACKUP_FORMAT_VERSION,
      },
      data,
    };
  }

  public async importBackup(payload: SettingsBackupPayload): Promise<void> {
    this.#ensureSupportedVersion(payload.metadata);

    if (!Array.isArray(payload.data.periods)) {
      throw new Error(BACKUP_ERROR_MESSAGES.MISSING_PERIODS);
    }

    const entries: Record<string, unknown> = {
      [CHROME_STORAGE_KEY_ENUM.PERIODS]: payload.data.periods,
      [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: payload.data.currentPeriod ?? null,
    };

    this.#assignIfProvided(entries, CHROME_STORAGE_KEY_ENUM.USER_EMAIL, payload.data.userEmail);
    this.#assignIfProvided(entries, CHROME_STORAGE_KEY_ENUM.USER_ID, payload.data.userId);
    this.#assignIfProvided(
      entries,
      CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS,
      payload.data.pomodoroSettings
    );
    this.#assignIfProvided(
      entries,
      CHROME_STORAGE_KEY_ENUM.POMODORO_STATE,
      payload.data.pomodoroState
    );

    await this.#writeStorage(entries);
  }

  public parseBackupFromJson(content: string): SettingsBackupPayload {
    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(BACKUP_ERROR_MESSAGES.INVALID_JSON);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid backup format.');
    }

    const parsedRecord = parsed as Record<string, unknown>;
    const metadata = parsedRecord[BACKUP_FILE_FIELDS.METADATA] as
      | Record<string, unknown>
      | undefined;
    const data = parsedRecord[BACKUP_FILE_FIELDS.DATA] as Record<string, unknown> | undefined;

    if (!metadata || typeof metadata !== 'object') {
      throw new Error(BACKUP_ERROR_MESSAGES.INVALID_METADATA);
    }

    if (!data || typeof data !== 'object') {
      throw new Error(BACKUP_ERROR_MESSAGES.INVALID_DATA);
    }

    const metadataPayload: SettingsBackupMetadata = {
      exportedAt: this.#requireString(
        metadata,
        BACKUP_METADATA_FIELDS.EXPORTED_AT,
        BACKUP_ERROR_MESSAGES.INVALID_EXPORT_TIMESTAMP
      ),
      formatVersion: this.#requireNumber(
        metadata,
        BACKUP_METADATA_FIELDS.FORMAT_VERSION,
        BACKUP_ERROR_MESSAGES.INVALID_DATA
      ),
    };

    this.#ensureSupportedVersion(metadataPayload);

    if (!Array.isArray(data[CHROME_STORAGE_KEY_ENUM.PERIODS])) {
      throw new Error(BACKUP_ERROR_MESSAGES.MISSING_PERIODS);
    }

    const sanitizedData: SettingsBackupData = {
      periods: [],
      currentPeriod: null,
    };

    for (const key of BACKUP_DATA_KEYS) {
      const targetKey = STORAGE_KEY_TO_DATA_KEY[key];
      if (!targetKey || !this.#hasOwnKey(data, targetKey)) {
        continue;
      }

      const parsedValue = this.#parseBackupValue(key, data[targetKey]);
      if (parsedValue === undefined) {
        continue;
      }

      sanitizedData[targetKey] = parsedValue as never;
    }

    return {
      metadata: metadataPayload,
      data: sanitizedData,
    };
  }

  #readStorage(): Promise<BackupStorageRecord> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(this.#backupKeys as string[], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(result);
      });
    });
  }

  #writeStorage(data: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  }

  #assignIfProvided(
    entries: Record<string, unknown>,
    key: CHROME_STORAGE_KEY_ENUM,
    value: unknown
  ): void {
    if (value === undefined) {
      return;
    }

    entries[key] = value;
  }

  #ensureSupportedVersion(metadata: SettingsBackupMetadata): void {
    if (metadata.formatVersion !== BACKUP_FORMAT_VERSION) {
      throw new Error(
        `Unsupported backup format version: ${metadata.formatVersion}. Expected ${BACKUP_FORMAT_VERSION}.`
      );
    }

    if (!metadata.exportedAt) {
      throw new Error(BACKUP_ERROR_MESSAGES.INVALID_EXPORT_TIMESTAMP);
    }
  }

  #requireString(source: Record<string, unknown>, key: string, errorMessage: string): string {
    const value = source[key];

    if (typeof value !== 'string') {
      throw new Error(errorMessage);
    }

    return value;
  }

  #requireNumber(source: Record<string, unknown>, key: string, errorMessage: string): number {
    const value = source[key];

    if (typeof value !== 'number') {
      throw new Error(errorMessage);
    }

    return value;
  }

  #castStringOrNull(value: unknown): string | null {
    if (typeof value === 'string') {
      return value;
    }
    if (value === null || value === undefined) {
      return null;
    }
    return null;
  }

  #hasOwnKey(source: Record<string, unknown>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(source, key);
  }

  #parseBackupValue(key: CHROME_STORAGE_KEY_ENUM, value: unknown): unknown {
    switch (key) {
      case CHROME_STORAGE_KEY_ENUM.PERIODS:
        return Array.isArray(value) ? value : [];
      case CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD:
        return value ?? null;
      case CHROME_STORAGE_KEY_ENUM.USER_EMAIL:
      case CHROME_STORAGE_KEY_ENUM.USER_ID:
        return this.#castStringOrNull(value);
      case CHROME_STORAGE_KEY_ENUM.POMODORO_SETTINGS:
      case CHROME_STORAGE_KEY_ENUM.POMODORO_STATE:
        return value ?? null;
      default:
        return value;
    }
  }
}
