import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  IFocus,
  QUICK_FOCUS_ID,
  TOAST_TYPE_ENUM,
  TOAST_MESSAGES_ENUM,
  POSITIONS_ENUM,
  DEFAULT_PERIOD,
  ChromeStorageService,
  FOCUS_ERROR_ENUM,
} from '../../common';
import { DzToastService } from '../../common/components/toast-container/toast.service';
import { cleanUrlHelper, isImageIcon, isSvgIcon } from '../../common/helpers';
import { CHROME_COMMAND_ENUM } from '../../common/enums/chrome-command.enum';
import { CHROME_STORAGE_KEY_ENUM } from '../../common/enums/chrome-storage-key.enum';

interface InitialStorageSchema {
  [CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD]: IFocus.Period;
  [CHROME_STORAGE_KEY_ENUM.PERIODS]: IFocus.Period[];
  [CHROME_STORAGE_KEY_ENUM.ALL_BLOCKED_WEBSITES]: IFocus.WebSite[];
}

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  readonly #isChromeRuntime: boolean = !!chrome.runtime;
  readonly #toastService: DzToastService = inject(DzToastService);
  readonly #chromeStorageService: ChromeStorageService = inject(ChromeStorageService);
  readonly #destroyRef: DestroyRef = inject(DestroyRef);

  readonly #currentPeriod: WritableSignal<IFocus.Period | null> = signal<IFocus.Period | null>(
    null
  );
  readonly #periods: WritableSignal<IFocus.Period[] | null> = signal(null);
  readonly #activeTab: WritableSignal<chrome.tabs.Tab | undefined> = signal(undefined);
  readonly #currentTime: WritableSignal<number> = signal(Date.now());
  #timerIntervalId: ReturnType<typeof setInterval> | null = null;

  public readonly currentPeriod: Signal<IFocus.Period | null> = computed(() => {
    return this.#currentPeriod();
  });
  public readonly periods: Signal<IFocus.Period[] | null> = computed(
    () => this.#periods()?.filter(p => p.id !== QUICK_FOCUS_ID) ?? null
  );
  public readonly quickPeriod: Signal<IFocus.Period[] | null> = computed(
    () => this.#periods()?.filter(p => p.id === QUICK_FOCUS_ID) ?? null
  );
  public readonly activeTab: Signal<chrome.tabs.Tab | undefined> = computed(() => {
    return this.#activeTab();
  });

  /**
   * Computed signal that returns the elapsed focus time in milliseconds.
   * Returns 0 if focus is not active or sessionStartTime is not set.
   */
  public readonly focusElapsedTime: Signal<number> = computed(() => {
    const period = this.#currentPeriod();
    const currentTime = this.#currentTime();

    if (!period?.isFocused || !period?.sessionStartTime) {
      return 0;
    }

    return currentTime - period.sessionStartTime.getTime();
  });

  /**
   * Formatted focus time as a string (MM:SS or HH:MM:SS).
   */
  public readonly focusElapsedTimeFormatted: Signal<string> = computed(() => {
    const elapsed = this.focusElapsedTime();

    if (elapsed <= 0) {
      return '00:00';
    }

    const totalSeconds = Math.floor(elapsed / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  public constructor() {
    this.#syncInitialState();
    this.#listenToStorageChanges();
    this.#getActiveTab();
    this.#startTimer();
  }

  #syncInitialState(): void {
    if (!this.#isChromeRuntime) {
      this.#periods.set([DEFAULT_PERIOD]);
      return;
    }

    this.#chromeStorageService.getMany<InitialStorageSchema>(
      [
        CHROME_STORAGE_KEY_ENUM.CURRENT_PERIOD,
        CHROME_STORAGE_KEY_ENUM.PERIODS,
        CHROME_STORAGE_KEY_ENUM.ALL_BLOCKED_WEBSITES,
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

        if (!currentPeriod) {
          this.addPeriod(DEFAULT_PERIOD);
        }

        this.#periods.set(periods);
        this.#currentPeriod.set(currentPeriod);
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
        console.warn('Invalid date detected, skipping:', d);
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

  public updatePeriod(period: IFocus.Period): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.UPDATE_PERIOD, period });
    }
  }

  public toggleQuickFocus(): void {
    if (this.#isChromeRuntime && this.activeTab()?.url) {
      chrome.runtime.sendMessage({
        command: CHROME_COMMAND_ENUM.TOGGLE_QUICK_FOCUS,
        siteUrl: this.activeTab()?.url,
      });
    }
  }

  public toggleFocus(): void {
    if (this.#isChromeRuntime) {
      this.#notifyIfNoSitesBlocked(this.#currentPeriod());

      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.TOGGLE_FOCUS }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to background:', chrome.runtime.lastError);
          this.#toastService.show({
            message: 'Failed to communicate with background service.',
            type: TOAST_TYPE_ENUM.ERROR,
            position: POSITIONS_ENUM.BOTTOM_RIGHT,
          });
          return;
        }

        if (
          response &&
          !response.success &&
          response.error === FOCUS_ERROR_ENUM.PERIOD_NOT_SCHEDULED_TODAY
        ) {
          this.#toastService.show({
            message: TOAST_MESSAGES_ENUM.PERIOD_NOT_SCHEDULED_TODAY,
            type: TOAST_TYPE_ENUM.WARN,
            position: POSITIONS_ENUM.BOTTOM_RIGHT,
          });
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

  public addCurrentTabToPeriod(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    const tab = this.activeTab();
    const period = this.currentPeriod();

    if (tab?.url && period) {
      const clearedUrl = cleanUrlHelper(tab.url);
      const iconUrl = tab.favIconUrl ?? this.getGoogleFaviconUrl(clearedUrl);

      const newSite: IFocus.WebSite = {
        id: clearedUrl,
        url: clearedUrl,
        name: tab.title || clearedUrl,
        iconUrl: isSvgIcon(iconUrl) ? iconUrl : '',
        description: tab.title || clearedUrl,
        imageUrl: isImageIcon(iconUrl) ? iconUrl : '',
        type: IFocus.EWebSiteType.SOCIAL_MEDIA,
        isBlocked: false,
      };

      const siteExists = period.webSites.some(s => s.url === newSite.url);

      if (!siteExists) {
        const updatedPeriod = {
          ...period,
          webSites: [...period.webSites, newSite],
        };

        this.updatePeriod(updatedPeriod);
        this.#toastService.show({
          message: TOAST_MESSAGES_ENUM.ADDED,
          type: TOAST_TYPE_ENUM.ACCENT,
        });
      } else {
        this.#toastService.show({
          message: `${TOAST_MESSAGES_ENUM.ALREADY_ADDED}: ${clearedUrl}`,
          type: TOAST_TYPE_ENUM.WARN,
        });
      }
    }
  }

  public toggleBlockedWebsite(site: IFocus.WebSite): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.TOGGLE_BLOCKED_WEBSITE, site });
    }
  }

  public getGoogleFaviconUrl(siteUrl: string, size = 32): string {
    let normalizedUrl = siteUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    try {
      const url = new URL(normalizedUrl);
      const domain = url.hostname;

      return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}&size=${size}`;
    } catch (e) {
      console.error('Invalid URL provided:', siteUrl, e);
      return 'favicon.ico';
    }
  }

  #notifyIfNoSitesBlocked(period: IFocus.Period | null): void {
    const hasBlockedSites: boolean = period?.webSites.some(site => site.isBlocked) ?? false;

    if (!period?.isFocused && !hasBlockedSites) {
      this.#toastService.show({
        message: `${TOAST_MESSAGES_ENUM.FOCUS_ACTIVE} ${TOAST_MESSAGES_ENUM.NO_SITES_BLOCKED}`,
        type: TOAST_TYPE_ENUM.WARN,
        position: POSITIONS_ENUM.BOTTOM_RIGHT,
      });
    }
  }

  public setCurrentPeriod(periodId: string): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: CHROME_COMMAND_ENUM.SET_CURRENT_PERIOD, periodId });
    }
  }
}
