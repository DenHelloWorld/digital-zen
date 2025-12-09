import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {IFocus} from '../../common/models';

@Injectable({
  providedIn: 'root'
})
export class FocusService {
  readonly #isChromeRuntime: boolean = !!chrome.runtime;

  readonly #currentPeriod: WritableSignal<IFocus.Period | null> = signal<IFocus.Period | null>(null);
  readonly #periods: WritableSignal<IFocus.Period[] | null> = signal(null);

  public readonly currentPeriod: Signal<IFocus.Period | null> = computed(() => {
    return this.#currentPeriod();
  });
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

  // public setCurrentPeriod(currentPeriod: IFocus.Period): void {
  //   if (this.#isChromeRuntime) {
  //     chrome.runtime.sendMessage({ command: 'setCurrentPeriod' });
  //   }
  //
  //   // this.#currentPeriod.set(currentPeriod);
  // }

  public toggleBlockedWebsite(site: IFocus.WebSite): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'toggleBlockedWebsite', site });
    }
  }
}
