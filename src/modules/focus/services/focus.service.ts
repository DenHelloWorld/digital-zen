
import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {IFocus} from '../../common/models';

@Injectable({
  providedIn: 'root'
})
export class FocusService {
  readonly #isFocused: WritableSignal<boolean> = signal<boolean>(false);
  readonly #entities: WritableSignal<IFocus.Base[]> = signal<IFocus.Base[]>([])
  readonly #currentPeriod: WritableSignal<IFocus.Period | null> = signal<IFocus.Period | null>(null);

  public readonly isFocused: Signal<boolean> = computed(() => {
    return this.#isFocused();
  })
  public readonly entities: Signal<IFocus.Base[]> = computed(() => {
    return this.#entities();
  });
  public readonly currentPeriod: Signal<IFocus.Period | null> = computed(() => {
    return this.#currentPeriod();
  });

  public constructor() {
    this.syncWithBackground();
  }

  private async syncWithBackground(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const response = await chrome.runtime.sendMessage({ command: 'getPeriods' });
      const isFocused = await chrome.runtime.sendMessage({ command: 'getIsFocused' });
      if (response && response.periods) {
            this.#entities.set(response.periods);
      }
      if (isFocused && isFocused.isFocused !== null) {
        console.log('isFocused', isFocused.isFocused);
        this.#isFocused.set(isFocused.isFocused);
      }
    } else {
      console.warn("Chrome API is not available. Running in development mode.");
    }
  }

  public add(entity: IFocus.Base): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      for (const period of entity.periods) {
        chrome.runtime.sendMessage({ command: 'addPeriod', period });
      }
    }
    this.#entities.set([...this.#entities(), entity]);
  }

  public remove(id: string): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'removePeriod', id });
    }
    this.#entities.set(this.#entities().filter((entity: IFocus.Base) => entity.id !== id));
  }

  public update(entity: IFocus.Base): void {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'updatePeriod', period: entity });
    }
    this.#entities.set(this.#entities().map((e: IFocus.Base) => e.id === entity.id ? entity : e));
  }

  public startFocus(periodId: string): void {
    // Only send the ID to the background
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ command: 'startFocus', periodId: periodId });
    }

    // Update the local state optimistically
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
    this.#currentPeriod.set(null);
    this.#isFocused.set(false);
  }
}
