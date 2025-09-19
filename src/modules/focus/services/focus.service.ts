import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {IFocus} from '../../common/models';

@Injectable({
  providedIn: 'root'
})
export class FocusService {
  readonly #isFocused: WritableSignal<boolean> = signal<boolean>(false);
  readonly #entities: WritableSignal<IFocus.Base[]> = signal<IFocus.Base[]>([])
  readonly #currentPeriod: WritableSignal<IFocus.Period | null> = signal<IFocus.Period | null>(null);
  readonly #allBlockedSites: WritableSignal<IFocus.BlockedWebSite[] | null> = signal(null);
  readonly #periods: WritableSignal<IFocus.Period[] | null> = signal(null);

  public readonly isFocused: Signal<boolean> = computed(() => {
    return this.#isFocused();
  })
  public readonly entities: Signal<IFocus.Base[]> = computed(() => {
    return this.#entities();
  });
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
    if (typeof chrome === 'undefined' || !chrome.runtime) {
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

  public add(entity: IFocus.Base): void {
    if (this.#entities().find(e => e.id === entity.id)) {
      console.warn(`Entity with id "${entity.id}" already exists. Skipping add.`);
      this.update(entity);
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      for (const period of entity.periods) {
        chrome.runtime.sendMessage({ command: 'addPeriod', period });
      }
    }
    this.#entities.set([...this.#entities(), entity]);

    if (!this.#currentPeriod()) {
      // set default
      this.#currentPeriod.set(entity.periods[0]);
    }
  }

  public removePeriod(id: string): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'removePeriod', id });
    }

    if (this.#currentPeriod()?.id === id) {
      this.#currentPeriod.set(null);
    }
  }

  public update(entity: IFocus.Base): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'updatePeriod', period: entity });
    }

    this.#entities.set(this.#entities().map((e: IFocus.Base) => e.id === entity.id ? entity : e));

    const updated = entity.periods.find(p => p.id === this.#currentPeriod()?.id);
    if (updated) {
      this.#currentPeriod.set(updated);
    }
  }

  public updatePeriod(period: IFocus.Period): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'updatePeriod', period });
    }

    const allEntities = this.#entities();
    const newEntities = allEntities.map(base => {
      if (base.periods.some(p => p.id === period.id)) {
        const updatedPeriods = base.periods.map(p => p.id === period.id ? period : p);
        return { ...base, periods: updatedPeriods };
      }
      return base;
    });

    this.#entities.set(newEntities);

    if (this.#currentPeriod()?.id === period.id) {
      this.#currentPeriod.set(period);
    }

    this.#allBlockedSites.set(period.blockedSites);
  }



  public startFocus(periodId: string): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'startFocus', periodId: periodId });
    }

    const periodToFocus = this.entities().flatMap(f => f.periods).find(p => p.id === periodId);
    if (periodToFocus) {
      this.#currentPeriod.set(periodToFocus);
    }

    this.#isFocused.set(true);
  }

  public stopFocus(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'stopFocus' });
    }
    // this.#currentPeriod.set(null);
    this.#isFocused.set(false);
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
