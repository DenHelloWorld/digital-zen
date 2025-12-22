import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {IFocus} from '../../common/models';
import {DEFAULT_PERIOD, MESSAGE_TYPE_ENUM, MESSAGES_ENUM, QUICK_FOCUS_ID} from '../../common'
import {cleanUrlHelper} from '../../common/pipes';
import {DzToastService} from '../../common/components/toast-container/toast.service';

@Injectable({
  providedIn: 'root'
})
export class FocusService {
  readonly #isChromeRuntime: boolean = !!chrome.runtime;
  readonly #toastService: DzToastService = inject(DzToastService);

  readonly #currentPeriod: WritableSignal<IFocus.Period | null> = signal<IFocus.Period | null>(null);
  readonly #periods: WritableSignal<IFocus.Period[] | null> = signal(null);
  readonly #activeTab: WritableSignal<chrome.tabs.Tab | undefined> = signal(undefined);

  public readonly currentPeriod: Signal<IFocus.Period | null> = computed(() => {
    return this.#currentPeriod();
  });
  public readonly periods: Signal<IFocus.Period[] | null> = computed(() =>
    this.#periods()?.filter(p => p.id !== QUICK_FOCUS_ID) ?? null
  );
  public readonly quickPeriod: Signal<IFocus.Period[] | null> = computed(() =>
    this.#periods()?.filter(p => p.id === QUICK_FOCUS_ID) ?? null
  );
  public readonly activeTab: Signal<chrome.tabs.Tab | undefined> = computed(() => {
    return this.#activeTab();
  })


  public constructor() {
    this.syncInitialState();
    this.listenToStorageChanges();
    this.getActiveTab();
  }

  private async syncInitialState(): Promise<void> {
    if (!this.#isChromeRuntime) {
      this.#periods.set([DEFAULT_PERIOD])
      console.warn("Chrome API is not available. Running in development mode.");
      return;
    }

    const result = await chrome.storage.local.get(['currentPeriod', 'periods', 'allBlockedSites']);
    const currentPeriod: IFocus.Period | null = result['currentPeriod'] as IFocus.Period || null;
    const periods: IFocus.Period[] = result['periods'] as IFocus.Period[] || [];

    if (!currentPeriod) {
      this.addPeriod(DEFAULT_PERIOD);
    }

    this.#periods.set(periods);
    this.#currentPeriod.set(currentPeriod);
  }

  private listenToStorageChanges(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {

        if (changes['periods']) {
          const newPeriods = changes['periods'].newValue as IFocus.Period[] || [];
          this.#periods.set(newPeriods);
        }

        if (changes['currentPeriod']) {
          const newCurrentPeriod = changes['currentPeriod'].newValue as IFocus.Period | null;

          this.#currentPeriod.set(newCurrentPeriod);
        }
      }
    });
  }

  public addPeriod(period: IFocus.Period): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'addPeriod', period });
    }
  }

  public removePeriod(id: string): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'removePeriod', id });
    }
  }

  public updatePeriod(period: IFocus.Period): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'updatePeriod', period });
    }
  }

  public startFocus(): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'startFocus', periodId: this.#currentPeriod()?.id });
    }
  }

  public stopFocus(): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'stopFocus' });
    }
  }

  public toggleQuickFocus(): void {
    if (this.#isChromeRuntime && this.activeTab()?.url) {
      chrome.runtime.sendMessage({ command: 'toggleQuickFocus', siteUrl: this.activeTab()?.url});
    }
  }

  public toggleFocus(): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'toggleFocus' });
    }
  }

  public setCurrentPeriod(currentPeriod: IFocus.Period): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'setCurrentPeriod', currentPeriod });
    }
  }

  public getActiveTab(): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage(
        { command: 'getActiveTab' },
        (response) => {
          if (response?.success) {
            this.#activeTab.set(response.tab);
          }
        }
      );
    }
  }

  public addCurrentTabToPeriod(): void {
    if (!this.#isChromeRuntime) {
      return;
    }

    const tab = this.activeTab();
    const period = this.currentPeriod();

    if (tab?.url && period) {
      const clearedUrl = cleanUrlHelper(tab.url)
      const iconUrl = tab.favIconUrl ?? this.getGoogleFaviconUrl(clearedUrl)

      const newSite: IFocus.WebSite = {
        id: clearedUrl,
        url: clearedUrl,
        name: tab.title || clearedUrl,
        iconUrl,
        description: tab.title || clearedUrl,
        imageUrl: iconUrl,
        type: IFocus.EWebSiteType.SOCIAL_MEDIA,
        isBlocked: false
      };

      const siteExists = period.webSites.some(s => s.url === newSite.url);

      if (!siteExists) {
        const updatedPeriod = {
          ...period,
          webSites: [...period.webSites, newSite]
        };

        this.updatePeriod(updatedPeriod);
        this.#toastService.show({ message: MESSAGES_ENUM.ADDED, type: MESSAGE_TYPE_ENUM.ACCENT });
      } else {
        this.#toastService.show({ message: MESSAGES_ENUM.ALREADY_ADDED, type: MESSAGE_TYPE_ENUM.ERROR });
      }
    }
  }

  public toggleBlockedWebsite(site: IFocus.WebSite): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'toggleBlockedWebsite', site });
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
      console.error("Invalid URL provided:", siteUrl, e);
      return 'favicon.ico';
    }
  }
}
