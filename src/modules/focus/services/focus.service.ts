import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {IFocus} from '../../common/models';

@Injectable({
  providedIn: 'root'
})
export class FocusService {
  readonly #isChromeRuntime: boolean = !!chrome.runtime;

  readonly #isFocused: WritableSignal<boolean> = signal<boolean>(false);
  readonly #currentPeriod: WritableSignal<IFocus.Period | null> = signal<IFocus.Period | null>(null);
  readonly #allBlockedSites: WritableSignal<IFocus.BlockedWebSite[] | null> = signal(null);
  readonly #periods: WritableSignal<IFocus.Period[] | null> = signal(null);

  public readonly isFocused: Signal<boolean> = computed(() => {
    return this.#isFocused();
  })
  public readonly currentPeriod: Signal<IFocus.Period | null> = computed(() => {
    return this.#currentPeriod();
  });
  public readonly allBlockedSites: Signal<IFocus.BlockedWebSite[] | null> = computed(() => {
    return this.#allBlockedSites();
  })
  public readonly periods: Signal<IFocus.Period[] | null> = computed(() => {
    return this.#periods();
  })

  public constructor() {
    this.syncInitialState();
    this.listenToStorageChanges();
  }

  private async syncInitialState(): Promise<void> {
    if (!this.#isChromeRuntime) {
      console.warn("Chrome API is not available. Running in development mode.");
      return;
    }

    const result = await chrome.storage.local.get(['currentPeriod', 'periods', 'allBlockedSites']);
    const currentPeriod: IFocus.Period | null = result['currentPeriod'] || null;
    const periods: IFocus.Period[] = result['periods'] || [];
    const allBlockedSites: IFocus.BlockedWebSite[] = result['allBlockedSites'] || [];
    const isFocused = !!currentPeriod;

    this.#isFocused.set(isFocused);
    this.#allBlockedSites.set(allBlockedSites);
    this.#periods.set(periods);

    if (isFocused) {
      this.#currentPeriod.set(currentPeriod);
    } else if (periods.length > 0) {
      this.#currentPeriod.set(periods[0]);
    } else {
      this.#currentPeriod.set(null);
    }
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

          if (!this.#currentPeriod() && newPeriods.length > 0) {
            this.#currentPeriod.set(newPeriods[0]);
          }
        }

        if (changes['currentPeriod']) {
          const newCurrentPeriod = changes['currentPeriod'].newValue as IFocus.Period | null;

          this.#currentPeriod.set(newCurrentPeriod);
          this.#isFocused.set(!!newCurrentPeriod); // Если currentPeriod есть, значит, фокус активен

          if (!newCurrentPeriod && this.#periods() && this.#periods()!.length > 0) {
            this.#currentPeriod.set(this.#periods()![0]);
          }
        }

        if (changes['allBlockedSites'] && changes['allBlockedSites'].newValue) {
          this.#allBlockedSites.set(changes['allBlockedSites'].newValue as IFocus.BlockedWebSite[]);
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

  // public setCurrentPeriod(currentPeriod: IFocus.Period): void {
  //   if (this.#isChromeRuntime) {
  //     chrome.runtime.sendMessage({ command: 'setCurrentPeriod' });
  //   }
  //
  //   // this.#currentPeriod.set(currentPeriod);
  // }

  public toggleBlockedWebsite(site: IFocus.BlockedWebSite): void {
    const current = this.#currentPeriod();
    if (!current) {
      console.warn('⚠️ Нет активного периода — невозможно изменить блокировку сайта');
      return;
    }

    const allBlockedSites: IFocus.BlockedWebSite[] = this.#allBlockedSites() ?? [];
    const alreadyBlocked = allBlockedSites.some(s => s.id === site.id);

    const updatedSites = alreadyBlocked
      ? allBlockedSites?.filter(s => s.id !== site.id)
      : [...allBlockedSites, site];

    const updatedPeriod: IFocus.Period = {
      ...current,
      blockedSites: updatedSites,
    };

    this.updatePeriod(updatedPeriod);
  }
}
