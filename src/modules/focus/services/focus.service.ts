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
    this.syncWithBackground();
  }

  private async syncWithBackground(): Promise<void> {
    if (!this.#isChromeRuntime) {
      console.warn("Chrome API is not available. Running in development mode.");
      return;
    }

    const getPeriods = await chrome.runtime.sendMessage({ command: 'getPeriods' });
    const getIsFocused = await chrome.runtime.sendMessage({ command: 'getIsFocused' });
    const current = await chrome.storage.local.get('currentPeriod');
    const blocked = await chrome.storage.local.get('allBlockedSites');

    const periods = getPeriods?.periods ?? [];
    const isFocused = getIsFocused?.isFocused ?? false;
    const currentPeriod = current['currentPeriod'] ?? null;
    const allBlockedSites = blocked['allBlockedSites'] ?? [];


    console.log('periods', periods);
    console.log('currentPeriod', currentPeriod);
    this.#isFocused.set(isFocused);
    if (currentPeriod) {
      this.#currentPeriod.set(currentPeriod);
    }
    this.#allBlockedSites.set(allBlockedSites);
  }

  public addPeriod(period: IFocus.Period): void {
    if ((this.#periods() ?? []).some(p => p.id === period.id)) {
      return;
    }

    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'addPeriod', period });
    }

    this.#periods.set([...this.#periods() ?? [], period]);

    if (!this.#currentPeriod()) {
      // set default
      this.#currentPeriod.set(period);
    }
  }

  public removePeriod(id: string): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'removePeriod', id });
    }

    if (this.#currentPeriod()?.id === id) {
      this.#currentPeriod.set(null);
    }
  }

  public updatePeriod(period: IFocus.Period): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'updatePeriod', period });
    }

    if (this.#currentPeriod()?.id === period.id) {
      this.#currentPeriod.set(period);
    }

    this.#allBlockedSites.set(period.blockedSites);
  }

  public startFocus(): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'startFocus', periodId: this.#currentPeriod()?.id });
    }

    this.#isFocused.set(true);
  }

  public stopFocus(): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'stopFocus' });
    }

    this.#isFocused.set(false);
  }

  public setCurrentPeriod(currentPeriod: IFocus.Period): void {
    if (this.#isChromeRuntime) {
      chrome.runtime.sendMessage({ command: 'setCurrentPeriod' });
    }

    this.#currentPeriod.set(currentPeriod);
  }

  public toggleBlockedWebsite(site: IFocus.BlockedWebSite): void {
    const current = this.#currentPeriod();
    if (!current) {
      console.warn('⚠️ Нет активного периода — невозможно изменить блокировку сайта');
      return;
    }

    const allBlockedSites: IFocus.BlockedWebSite[] = this.#allBlockedSites() ?? [];

    console.log('currentPeriod', current);

    const alreadyBlocked = allBlockedSites.some(s => s.id === site.id);

    console.log('alreadyBlocked', alreadyBlocked);

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
