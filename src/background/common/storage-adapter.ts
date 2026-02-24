import { UI_TEXT } from '../../modules/common/constants/ui-text.const';
import { WEBSITES_LIBRARY_PRESET } from '../../modules/common/constants/websites.const';
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

  static async setWebsitesLibraryState(
    state: Record<string, readonly IFocus.WebSite[]>
  ): Promise<void> {
    return this.enqueue(async () => {
      await chrome.storage.local.set({ [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: state });
    });
  }

  static async addNewFolderToLibrary(folderName: string): Promise<void> {
    return this.enqueue(async () => {
      const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY);

      const currentLibrary = (result[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
        string,
        readonly IFocus.WebSite[]
      >;

      if (!currentLibrary[folderName]) {
        const updatedLibrary = {
          ...currentLibrary,
          [folderName]: [],
        };

        await chrome.storage.local.set({
          [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: updatedLibrary,
        });
      }
    });
  }

  public static removeFolderFromLibrary(folderName: string): Promise<void> {
    return this.enqueue(async () => {
      const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY);
      const library = (result[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
        string,
        IFocus.WebSite[]
      >;

      if (!library[folderName]) {
        throw new Error(UI_TEXT.WEBSITE_LIBRARY.ERRORS.FOLDER_NOT_FOUND);
      }

      if (folderName in WEBSITES_LIBRARY_PRESET) {
        throw new Error(UI_TEXT.WEBSITE_LIBRARY.ERRORS.SYSTEM_FOLDER_DELETE);
      }

      const updatedLibrary = { ...library };
      const sitesToMove = updatedLibrary[folderName];

      delete updatedLibrary[folderName];

      const trashKey = IFocus.EWebSiteType.DELETE;

      const remappedSites = sitesToMove.map(site => ({
        ...site,
        type: trashKey,
      }));

      const existingTrash = updatedLibrary[trashKey] || [];
      const allSites = [...existingTrash, ...remappedSites];

      updatedLibrary[trashKey] = allSites.filter(
        (site, index, self) => index === self.findIndex(s => s.url === site.url)
      );

      await chrome.storage.local.set({
        [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: updatedLibrary,
      });
    });
  }

  static async addWebsiteToFolder(folderName: string, website: IFocus.WebSite): Promise<void> {
    return this.enqueue(async () => {
      const result = await chrome.storage.local.get(CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY);
      const library = (result[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
        string,
        IFocus.WebSite[]
      >;

      if (!library[folderName]) {
        throw new Error(UI_TEXT.WEBSITE_LIBRARY.ERRORS.FOLDER_NOT_FOUND);
      }

      const folderContent = [...library[folderName]];

      const exists = folderContent.some(site => site.url === website.url);

      if (!exists) {
        folderContent.push({
          ...website,
          type: folderName,
        });

        const updatedLibrary = {
          ...library,
          [folderName]: folderContent,
        };

        await chrome.storage.local.set({
          [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: updatedLibrary,
        });
      }
    });
  }

  static async addWebsiteToSystem(
    folderName: string,
    website: IFocus.WebSite,
    periodId: string
  ): Promise<void> {
    return this.enqueue(async () => {
      const keys = [
        CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY,
        CHROME_STORAGE_KEY_ENUM.PERIODS,
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
      ];
      const storage = await chrome.storage.local.get(keys);

      // 1. Обновляем библиотеку
      const library = (storage[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
        string,
        IFocus.WebSite[]
      >;
      if (!library[folderName]) library[folderName] = [];

      if (!library[folderName].some(s => s.url === website.url)) {
        library[folderName].push({ ...website, type: folderName });
      }

      // 2. Обновляем список всех периодов
      const periods = (storage[CHROME_STORAGE_KEY_ENUM.PERIODS] || []) as StoredPeriod[];
      const periodIndex = periods.findIndex(p => p.id === periodId);
      if (periodIndex !== -1) {
        const p = periods[periodIndex];
        if (!p.webSites.some(s => s.url === website.url)) {
          p.webSites.push({ ...website, type: folderName });
        }
      }

      // 3. Обновляем текущий период (если совпадает ID)
      const current = storage[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD] as StoredPeriod | null;
      if (current && current.id === periodId) {
        if (!current.webSites.some(s => s.url === website.url)) {
          current.webSites.push({ ...website, type: folderName });
        }
      }

      await chrome.storage.local.set({
        [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: library,
        [CHROME_STORAGE_KEY_ENUM.PERIODS]: periods,
        [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: current,
      });
    });
  }

  static async removeWebsiteFromFolder(folderName: string, websiteUrl: string): Promise<void> {
    return this.enqueue(async () => {
      const trashKey = IFocus.EWebSiteType.DELETE;
      const keys = [
        CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY,
        CHROME_STORAGE_KEY_ENUM.PERIODS,
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
      ];
      const storage = await chrome.storage.local.get(keys);

      // Если мы уже в корзине — вызываем физическое удаление БЕЗ вложенного enqueue
      if (folderName === trashKey) {
        await this.internalPermanentDeleteLogic(websiteUrl, storage);
        return;
      }

      const library = (storage[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
        string,
        IFocus.WebSite[]
      >;
      const folder = library[folderName] || [];
      const siteToMove = folder.find(site => site.url === websiteUrl);

      if (!siteToMove) return;

      // 1. Убираем из текущей папки
      library[folderName] = folder.filter(site => site.url !== websiteUrl);

      // 2. Добавляем в корзину
      if (!library[trashKey]) library[trashKey] = [];
      if (!library[trashKey].some(s => s.url === websiteUrl)) {
        library[trashKey].push({ ...siteToMove, type: trashKey });
      }

      // 3. Обновляем тип в периодах (чтобы в UI сайт переместился в папку корзины)
      const updateType = (sites: IFocus.WebSite[]) =>
        (sites || []).map(s => (s.url === websiteUrl ? { ...s, type: trashKey } : s));

      const periods = (storage[CHROME_STORAGE_KEY_ENUM.PERIODS] || []) as StoredPeriod[];
      const updatedPeriods = periods.map(p => ({ ...p, webSites: updateType(p.webSites) }));

      let current = storage[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD] as StoredPeriod | null;
      if (current?.webSites) {
        current = { ...current, webSites: updateType(current.webSites) };
      }

      await chrome.storage.local.set({
        [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: library,
        [CHROME_STORAGE_KEY_ENUM.PERIODS]: updatedPeriods,
        [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: current,
      });
    });
  }

  /**
   * Полное удаление сайта из базы: из корзины и из всех периодов.
   */
  static async permanentDeleteWebsite(websiteUrl: string): Promise<void> {
    return this.enqueue(async () => {
      const keys = [
        CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY,
        CHROME_STORAGE_KEY_ENUM.PERIODS,
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
      ];
      const storage = await chrome.storage.local.get(keys);
      await this.internalPermanentDeleteLogic(websiteUrl, storage);
    });
  }

  /**
   * Приватный метод с логикой полного удаления.
   * НЕ использует enqueue сам, вызывается только внутри других enqueue задач.
   */
  private static async internalPermanentDeleteLogic(
    websiteUrl: string,
    storage: Record<string, unknown>
  ): Promise<void> {
    const library = (storage[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
      string,
      IFocus.WebSite[]
    >;

    // Удаляем из всех папок библиотеки
    Object.keys(library).forEach(key => {
      library[key] = library[key].filter(s => s.url !== websiteUrl);
    });

    const filterFn = (sites: IFocus.WebSite[]) => (sites || []).filter(s => s.url !== websiteUrl);

    const periods = (storage[CHROME_STORAGE_KEY_ENUM.PERIODS] || []) as StoredPeriod[];
    const updatedPeriods = periods.map(p => ({ ...p, webSites: filterFn(p.webSites) }));

    let current = storage[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD] as StoredPeriod | null;
    if (current?.webSites) {
      current = { ...current, webSites: filterFn(current.webSites) };
    }

    await chrome.storage.local.set({
      [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: library,
      [CHROME_STORAGE_KEY_ENUM.PERIODS]: updatedPeriods,
      [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: current,
    });
  }

  static async clearTrash(): Promise<void> {
    return this.enqueue(async () => {
      const keys = [
        CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY,
        CHROME_STORAGE_KEY_ENUM.PERIODS,
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
      ];
      const storage = await chrome.storage.local.get(keys);

      const library = (storage[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
        string,
        IFocus.WebSite[]
      >;
      const trashKey = IFocus.EWebSiteType.DELETE;

      const sitesInTrash = library[trashKey] || [];
      if (sitesInTrash.length === 0) return;

      const urlsToDelete = new Set(sitesInTrash.map(s => s.url));

      library[trashKey] = [];

      const periods = (storage[CHROME_STORAGE_KEY_ENUM.PERIODS] || []) as StoredPeriod[];
      const updatedPeriods = periods.map(p => ({
        ...p,
        webSites: p.webSites.filter(s => !urlsToDelete.has(s.url)),
      }));

      let current = storage[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD] as StoredPeriod | null;
      if (current?.webSites) {
        current = {
          ...current,
          webSites: current.webSites.filter(s => !urlsToDelete.has(s.url)),
        };
      }

      await chrome.storage.local.set({
        [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: library,
        [CHROME_STORAGE_KEY_ENUM.PERIODS]: updatedPeriods,
        [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: current,
      });

      StorageAdapter.logger.info(`Trash cleared. Removed ${urlsToDelete.size} websites.`);
    });
  }

  static async moveWebsiteToFolder(
    websiteUrl: string,
    fromFolder: string,
    toFolder: string
  ): Promise<void> {
    return this.enqueue(async () => {
      const keys = [
        CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY,
        CHROME_STORAGE_KEY_ENUM.PERIODS,
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
      ];
      const storage = await chrome.storage.local.get(keys);

      const library = (storage[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {}) as Record<
        string,
        IFocus.WebSite[]
      >;

      if (!library[fromFolder] || !library[toFolder]) {
        this.logger.error('Move failed: Source or destination folder not found');
        return;
      }

      const siteToMove = library[fromFolder].find(s => s.url === websiteUrl);
      if (!siteToMove) return;

      library[fromFolder] = library[fromFolder].filter(s => s.url !== websiteUrl);

      const isAlreadyInDest = library[toFolder].some(s => s.url === websiteUrl);
      if (!isAlreadyInDest) {
        library[toFolder].push({
          ...siteToMove,
          type: toFolder,
        });
      }

      const periods = (storage[CHROME_STORAGE_KEY_ENUM.PERIODS] || []) as StoredPeriod[];
      const updatedPeriods = periods.map(period => ({
        ...period,
        webSites: period.webSites.map(site =>
          site.url === websiteUrl ? { ...site, type: toFolder } : site
        ),
      }));

      let updatedCurrentPeriod = storage[
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD
      ] as StoredPeriod | null;
      if (updatedCurrentPeriod?.webSites) {
        updatedCurrentPeriod = {
          ...updatedCurrentPeriod,
          webSites: updatedCurrentPeriod.webSites.map(site =>
            site.url === websiteUrl ? { ...site, type: toFolder } : site
          ),
        };
      }

      await chrome.storage.local.set({
        [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: library,
        [CHROME_STORAGE_KEY_ENUM.PERIODS]: updatedPeriods,
        [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: updatedCurrentPeriod,
      });

      StorageAdapter.logger.info(`Moved ${websiteUrl} from ${fromFolder} to ${toFolder}`);
    });
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
