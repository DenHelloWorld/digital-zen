import { DzToastService } from '../../common/components';
import { ICONS } from '../../common/constants/icons.const';
import { QUICK_FOCUS_ID } from '../../common/constants/quick-focus-id.const';
import { WEBSITES_UNBLOCKABLE } from '../../common/constants/websites.const';
import { CHROME_COMMAND_ENUM } from '../../common/enums/chrome-command.enum';
import { CHROME_STORAGE_KEY_ENUM } from '../../common/enums/chrome-storage-key.enum';
import { FOCUS_ERROR_ENUM } from '../../common/enums/focus-error.enum';
import { PERMISSION_LVL_ENUM } from '../../common/enums/permission-lvl.enum';
import { TOAST_MESSAGES_ENUM } from '../../common/enums/toast-messages.enum';
import { TOAST_TYPE_ENUM } from '../../common/enums/toast-type.enum';
import { cleanUrlHelper } from '../../common/helpers/clean-url.helper';
import { createDefaultPeriodHelper } from '../../common/helpers/create-default-period.helper';
import { FaviconHelper } from '../../common/helpers/favicon.helper';
import { isImageIcon } from '../../common/helpers/is-image-icon.helper';
import { isSvgIcon } from '../../common/helpers/is-svg-icon.helper';
import { logger } from '../../common/helpers/logger';
import { getTimeInMilliseconds, isCurrentTimeInRange } from '../../common/helpers/time.helper';
import { IFocus } from '../../common/models/focus.model';
import { ChromeStorageService } from '../../common/services/chrome-storage.service';
import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

interface InitialStorageSchema {
  [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: IFocus.Period;
  [CHROME_STORAGE_KEY_ENUM.PERIODS]: IFocus.Period[];
  [CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY]: Record<string, readonly IFocus.WebSite[]>;
}

/**
 * Focus service for managing focus periods and blocked websites
 * Handles focus session state, Chrome tab tracking, and period management
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
export class FocusService {
  /** @guideline DZ_08 - Private readonly field for runtime check */
  readonly #isChromeRuntime: boolean = !!chrome.runtime;
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #toastService = inject(DzToastService);
  readonly #storage = inject(ChromeStorageService);
  readonly #destroyRef = inject(DestroyRef);
  /** @guideline DZ_11 - Universal Logger usage */
  readonly #logger = logger.createLogger('FocusService');

  /** @guideline DZ_04, DZ_08 - Private writable signals for internal state */
  readonly #currentPeriod: WritableSignal<IFocus.Period | null> = signal<IFocus.Period | null>(
    null
  );
  readonly #periods: WritableSignal<IFocus.Period[] | null> = signal(null);
  readonly #activeTab: WritableSignal<chrome.tabs.Tab | undefined> = signal(undefined);
  readonly #currentTime: WritableSignal<number> = signal(Date.now());
  readonly #allLibraryWebsites: WritableSignal<Record<string, readonly IFocus.WebSite[]>> = signal(
    {}
  );
  /** @guideline DZ_08 - Private field */
  #timerIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly #focusRemainingTime: Signal<number> = computed(() => {
    const period = this.#currentPeriod();
    const nowTimestamp = this.#currentTime();
    const now = new Date(nowTimestamp);

    if (!period?.endTo) {
      return 0;
    }

    const deadline = new Date(now);
    deadline.setHours(period.endTo.getHours(), period.endTo.getMinutes(), 0, 0);

    if (
      deadline.getTime() <= now.getTime() &&
      period.startFrom &&
      period.endTo.getHours() < period.startFrom.getHours()
    ) {
      deadline.setDate(deadline.getDate() + 1);
    }

    const remaining = deadline.getTime() - now.getTime();
    return remaining > 0 ? remaining : 0;
  });

  public readonly currentPeriod = this.#currentPeriod.asReadonly();
  public readonly activeTab = this.#activeTab.asReadonly();
  public readonly currentTime = this.#currentTime.asReadonly();

  public readonly progress = computed(() => {
    if (!this.isPeriodCurrentlyApplicable()) {
      return 0;
    }

    const period = this.#currentPeriod();
    if (!period?.startFrom || !period?.endTo) return 0;

    const now = getTimeInMilliseconds(new Date(this.#currentTime()));
    const start = getTimeInMilliseconds(period.startFrom);
    const end = getTimeInMilliseconds(period.endTo);

    const total = start <= end ? end - start : 24 * 60 * 60 * 1000 - start + end;

    if (total === 0) return 0;
    const elapsed = now >= start ? now - start : 24 * 60 * 60 * 1000 - start + now;
    const result = 1 - elapsed / total;

    return Math.min(Math.max(result, 0), 1);
  });

  public readonly periods: Signal<IFocus.Period[] | null> = computed(
    () => this.#periods()?.filter(p => p.id !== QUICK_FOCUS_ID) ?? null
  );
  public readonly quickPeriod: Signal<IFocus.Period[] | null> = computed(
    () => this.#periods()?.filter(p => p.id === QUICK_FOCUS_ID) ?? null
  );

  public readonly isPeriodCurrentlyApplicable: Signal<boolean> = computed(() => {
    const period = this.#currentPeriod();
    if (!period || !period.startFrom || !period.endTo) return false;

    const now = new Date(this.#currentTime());
    const today = now.getDay();

    const startMs = getTimeInMilliseconds(period.startFrom);
    const endMs = getTimeInMilliseconds(period.endTo);
    const currentMs = getTimeInMilliseconds(now);

    if (!isCurrentTimeInRange(now, period.startFrom, period.endTo)) {
      return false;
    }

    if (period.daysOfWeek) {
      const spansMidnight = startMs > endMs;

      const isMorningOfNextDay = spansMidnight && currentMs < endMs;
      const dayToCheck = isMorningOfNextDay ? (today + 6) % 7 : today;

      if (!period.daysOfWeek.includes(dayToCheck)) {
        return false;
      }
    }

    return true;
  });

  /**
   * Formatted focus time as a string (MM:SS or HH:MM:SS).
   */
  public readonly focusElapsedTimeFormatted: Signal<string> = computed(() => {
    const remaining = this.#focusRemainingTime();

    if (remaining <= 0) {
      return '00:00';
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  public readonly isCurrentTabInSystem: Signal<boolean> = computed(() => {
    const tab = this.#activeTab();
    const period = this.#currentPeriod();
    const library = this.#allLibraryWebsites();

    if (!tab?.url) return false;
    const cleanedUrl = cleanUrlHelper(tab.url);

    // 1. Проверяем в текущем периоде
    const inPeriod = period?.webSites?.some(site => cleanUrlHelper(site.url) === cleanedUrl);
    if (inPeriod) return true;

    // 2. Проверяем во всей библиотеке (во всех папках)
    return Object.values(library).some(folderSites =>
      folderSites.some(site => cleanUrlHelper(site.url) === cleanedUrl)
    );
  });

  constructor() {
    this.#syncInitialState();
    this.#listenToStorageChanges();
    this.#getActiveTab();
    this.#listenToTabChanges();
    this.#startTimer();
  }

  public addPeriod(period: IFocus.Period): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.ADD_PERIOD, period });
    }
  }

  public removePeriod(id: string): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.REMOVE_PERIOD, id });
    }
  }

  public async updatePeriod(period: IFocus.Period): Promise<void> {
    const currentPeriod = this.#currentPeriod();
    const isUpdatingActivePeriod = Boolean(
      currentPeriod && currentPeriod.id === period.id && currentPeriod.isActive
    );

    let periodToSend = period;

    if (isUpdatingActivePeriod) {
      this.#logger.info('Stopping active focus before persisting edited period.');
      this.stopFocus();
      this.#toastService.show({
        message: TOAST_MESSAGES_ENUM.FOCUS_STOPPED_FOR_SETTINGS,
        type: TOAST_TYPE_ENUM.INFO,
      });
      periodToSend = { ...period, isActive: false };
    }

    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({
        command: CHROME_COMMAND_ENUM.UPDATE_PERIOD,
        period: periodToSend,
      });
    }
  }

  public stopFocus() {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.STOP_FOCUS });
    }
  }

  public toggleFocus(): void {
    if (this.#isChromeRuntime) {
      this.#notifyIfNoSitesBlocked(this.#currentPeriod());

      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.TOGGLE_FOCUS }, response => {
        if (chrome.runtime.lastError) {
          this.#logger.error('Error sending message to background:', chrome.runtime.lastError);
          this.#toastService.show({
            message: 'Failed to communicate with background service.',
            type: TOAST_TYPE_ENUM.ERROR,
          });
          return;
        }

        if (response && !response.success) {
          if (response.error === FOCUS_ERROR_ENUM.PERIOD_NOT_SCHEDULED_TODAY) {
            this.#toastService.show({
              message: TOAST_MESSAGES_ENUM.PERIOD_NOT_SCHEDULED_TODAY,
              type: TOAST_TYPE_ENUM.WARN,
              target: `${TOAST_MESSAGES_ENUM.PERIOD_NOT_SCHEDULED_TODAY}${this.#currentPeriod()?.id}`,
            });
          } else if (response.error === FOCUS_ERROR_ENUM.PERIOD_OUTSIDE_TIME_RANGE) {
            this.#toastService.show({
              message: TOAST_MESSAGES_ENUM.PERIOD_OUTSIDE_TIME_RANGE,
              type: TOAST_TYPE_ENUM.WARN,
              target: `${TOAST_MESSAGES_ENUM.PERIOD_OUTSIDE_TIME_RANGE}${this.#currentPeriod()?.id}`,
            });
          }
        }
      });
    }
  }

  #getActiveTab(): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.GET_ACTIVE_TAB }, response => {
        if (response?.success) {
          this.#activeTab.set(response.tab);
        }
      });
    }
  }

  public addCurrentTabToLibrary(isActivated = false): void {
    if (!this.#isChromeRuntime) return;

    if (this.isCurrentTabInSystem()) {
      this.#toastService.show({
        message: TOAST_MESSAGES_ENUM.ALREADY_ADDED,
        type: TOAST_TYPE_ENUM.WARN,
      });
      return;
    }

    const tab = this.activeTab();
    const period = this.currentPeriod();

    if (tab?.url && period) {
      const cleanedUrl = cleanUrlHelper(tab.url);

      // 1. Проверка на защищенные сайты
      if (WEBSITES_UNBLOCKABLE.some(site => cleanUrlHelper(site.url) === cleanedUrl)) {
        this.#toastService.show({
          message: TOAST_MESSAGES_ENUM.UNBLOCKABLE_WEBSITE,
          type: TOAST_TYPE_ENUM.ERROR,
        });
        return;
      }

      const iconUrl = tab.favIconUrl ?? FaviconHelper.getGoogleUrl(cleanedUrl);
      const newSite: IFocus.WebSite = {
        id: cleanedUrl,
        url: cleanedUrl,
        name: tab.title || cleanedUrl,
        iconUrl: isSvgIcon(iconUrl) ? iconUrl : ICONS.GLOBE,
        description: tab.title || cleanedUrl,
        imageUrl: isImageIcon(iconUrl) ? iconUrl : '',
        type: IFocus.EWebSiteType.DEFAULT,
        isActivated,
        permissionLvl: PERMISSION_LVL_ENUM.FULL_ACCESS,
      };

      chrome.runtime.sendMessage(
        {
          command: CHROME_COMMAND_ENUM.ADD_WEBSITE_TO_SYSTEM,
          folder: newSite.type,
          website: newSite,
          periodId: period.id,
        },
        response => {
          if (response?.success) {
            this.#toastService.show({
              message: TOAST_MESSAGES_ENUM.ADDED,
              type: TOAST_TYPE_ENUM.ACCENT,
            });
          }
        }
      );
    }
  }

  public async toggleBlockedWebsite(site: IFocus.WebSite): Promise<void> {
    const currentPeriod = this.#currentPeriod();
    if (currentPeriod && currentPeriod.isActive) {
      this.#logger.info('Stopping active focus before updating website list.');
      this.stopFocus();
      this.#toastService.show({
        message: TOAST_MESSAGES_ENUM.FOCUS_STOPPED_FOR_SETTINGS,
        type: TOAST_TYPE_ENUM.INFO,
      });
    }

    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.TOGGLE_BLOCKED_WEBSITE, site });
    }
  }

  public setCurrentPeriod(periodId: string): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage(
        { command: CHROME_COMMAND_ENUM.SET_CURRENT_PERIOD, periodId },
        response => {
          if (chrome.runtime.lastError) {
            this.#logger.error('Error switching period:', chrome.runtime.lastError);
            this.#toastService.show({
              message: TOAST_MESSAGES_ENUM.FAILED_TO_SWITCH_PERIOD,
              type: TOAST_TYPE_ENUM.ERROR,
            });
            return;
          }

          if (response && !response.success) {
            const message =
              response.error === FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND
                ? TOAST_MESSAGES_ENUM.PERIOD_NOT_FOUND
                : TOAST_MESSAGES_ENUM.FAILED_TO_ACTIVATE_PERIOD;

            this.#toastService.show({
              message,
              type: TOAST_TYPE_ENUM.ERROR,
            });
          } else if (response && response.success) {
            this.#toastService.show({
              message: TOAST_MESSAGES_ENUM.PERIOD_ACTIVATED,
              type: TOAST_TYPE_ENUM.ACCENT,
            });
          }
        }
      );
    }
  }

  #syncInitialState(): void {
    if (!this.#isChromeRuntime) {
      this.#periods.set([createDefaultPeriodHelper()]);
      return;
    }

    this.#storage.getMany<InitialStorageSchema>(
      [
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
        CHROME_STORAGE_KEY_ENUM.PERIODS,
        CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY,
      ],
      result => {
        if (!result) {
          return;
        }

        const currentPeriod = result[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]
          ? this.#convertPeriodFromStorage(result[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD])
          : null;
        const periods = (result[CHROME_STORAGE_KEY_ENUM.PERIODS] || []).map(p =>
          this.#convertPeriodFromStorage(p)
        );

        // Check if user is logged in by checking if user credentials exist
        chrome.storage.local.get(
          [CHROME_STORAGE_KEY_ENUM.USER_EMAIL, CHROME_STORAGE_KEY_ENUM.USER_ID],
          credentials => {
            const isLoggedIn = Boolean(
              credentials[CHROME_STORAGE_KEY_ENUM.USER_EMAIL] &&
              credentials[CHROME_STORAGE_KEY_ENUM.USER_ID]
            );

            // If user is NOT logged in and has no periods, add default period
            // If user IS logged in, periods will be synced from backend (or default added there if none exist)
            if (!isLoggedIn && periods.length === 0) {
              this.addPeriod(createDefaultPeriodHelper());
            } else {
              this.#periods.set(periods);
            }

            this.#currentPeriod.set(currentPeriod);

            const library = result[CHROME_STORAGE_KEY_ENUM.WEBSITES_LIBRARY] || {};
            this.#allLibraryWebsites.set(library);
          }
        );
      }
    );
  }

  #listenToStorageChanges(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        if (changes[CHROME_STORAGE_KEY_ENUM.PERIODS]) {
          const newPeriods =
            (changes[CHROME_STORAGE_KEY_ENUM.PERIODS].newValue as IFocus.Period[]) || [];
          this.#periods.set(newPeriods.map(p => this.#convertPeriodFromStorage(p)));
        }

        if (changes[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]) {
          const newCurrentPeriod = changes[CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]
            .newValue as IFocus.Period | null;

          this.#currentPeriod.set(
            newCurrentPeriod ? this.#convertPeriodFromStorage(newCurrentPeriod) : null
          );
        }
      }
    });
  }

  /**
   * Start a timer that updates the current time signal every second.
   * This is used to automatically update the focus elapsed time.
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
   * Converts a period from storage format (with ISO string dates) to runtime format (with Date objects).
   * This is needed because Chrome storage serializes Date objects as ISO strings.
   */
  #convertPeriodFromStorage(period: IFocus.Period): IFocus.Period {
    const toDateSafe = (d: Date | string | null): Date | null => {
      if (!d) return null;
      const date = d instanceof Date ? d : new Date(d);
      // Return null if the date is invalid
      if (isNaN(date.getTime())) {
        this.#logger.warn('Invalid date detected, skipping:', d);
        return null;
      }
      return date;
    };

    return {
      ...period,
      startFrom: toDateSafe(period.startFrom),
      endTo: toDateSafe(period.endTo),
      sessionStartTime: toDateSafe(period.sessionStartTime),
      focusedTimes: (period.focusedTimes || []).map(ft => ({
        ...ft,
        startFrom: toDateSafe(ft.startFrom),
        endTo: toDateSafe(ft.endTo),
      })),
    };
  }

  #notifyIfNoSitesBlocked(period: IFocus.Period | null): void {
    const hasActivatedSites = period?.webSites.some(site => site.isActivated) ?? false;

    if (!period?.isActive && !hasActivatedSites) {
      this.#toastService.show({
        message: TOAST_MESSAGES_ENUM.NO_SITES_BLOCKED,
        type: TOAST_TYPE_ENUM.WARN,
        target: `${TOAST_MESSAGES_ENUM.NO_SITES_BLOCKED}${period?.id}`,
      });
    }
  }

  /**
   * Listen to Chrome tab changes (activation and URL updates)
   * to keep #activeTab signal in sync.
   */
  #listenToTabChanges(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.tabs.onActivated.addListener(() => {
      this.#getActiveTab();
    });

    chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
      if (tab.active && changeInfo.status === 'complete') {
        this.#activeTab.set(tab);
      }
    });

    this.#destroyRef.onDestroy(() => {
      chrome.tabs.onActivated.removeListener(this.#getActiveTab);
    });
  }
}
