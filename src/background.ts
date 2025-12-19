/// <reference types="chrome"/>
namespace IFocus {
  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date | null;
    endTo: Date | null;
    webSites: WebSite[];
    daysOfWeek?: number[];
    focusedTimes: IFocus.FocusedTime[];
    isFocused: boolean;
  }

  export interface WebSite {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    isBlocked: boolean;
  }

  export interface FocusedTime {
    id: string;
    periodId: string;
    startFrom: Date | null;
    endTo: Date | null;
  }
}

/**
 * Тип данных, который реально хранится в storage (ISO строки вместо Date)
 */
interface StoredPeriod extends Omit<IFocus.Period, 'startFrom' | 'endTo' | 'focusedTimes'> {
  startFrom: string | null;
  endTo: string | null;
  focusedTimes: StoredFocusedTime[];
}

interface StoredFocusedTime extends Omit<IFocus.FocusedTime, 'startFrom' | 'endTo'> {
  startFrom: string | null;
  endTo: string | null;
}

class StorageAdapter {
  private static writeQueue: Promise<unknown> = Promise.resolve();

  // === Public API ===

  static async savePeriod(period: IFocus.Period): Promise<void> {
    return this.enqueue(async () => {
      const stored = this.toStorageFormat(period);
      const result = await chrome.storage.local.get('periods');
      const periods: StoredPeriod[] = Array.isArray(result['periods']) ? result['periods'] : [];

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
        currentPeriod: this.toStorageFormat(period)
      });
    });
  }

  static async getPeriods(): Promise<IFocus.Period[]> {
    const result = await chrome.storage.local.get('periods');
    const raw: StoredPeriod[] = Array.isArray(result['periods']) ? result['periods'] : [];
    return raw.map(this.fromStorageFormat);
  }

  static async getCurrentPeriod(): Promise<IFocus.Period | null> {
    const result = await chrome.storage.local.get('currentPeriod');
    const rawObj = result['currentPeriod'];

    // Если rawObj пустой объект или null, возвращаем null
    if (!rawObj || typeof rawObj !== 'object') return null;

    // Теперь приводим к StoredPeriod
    const raw = rawObj as StoredPeriod;

    return this.fromStorageFormat(raw);
  }

  // === Private helpers ===

  private static async enqueue<T>(task: () => Promise<T>): Promise<T> {
    const nextTask = this.writeQueue.then(() => task());
    this.writeQueue = nextTask;
    return nextTask;
  }

  private static toStorageFormat(period: IFocus.Period): StoredPeriod {
    const toISOStringSafe = (d: Date | string | null) => {
      if (!d) return null;
      return d instanceof Date ? d.toISOString() : String(d);
    };

    return {
      ...period,
      startFrom: toISOStringSafe(period.startFrom),
      endTo: toISOStringSafe(period.endTo),
      focusedTimes: (period.focusedTimes || []).map(ft => ({
        ...ft,
        startFrom: toISOStringSafe(ft.startFrom),
        endTo: toISOStringSafe(ft.endTo),
      })),
    };
  }

  private static fromStorageFormat(stored: StoredPeriod): IFocus.Period {
    return {
      ...stored,
      startFrom: stored.startFrom ? new Date(stored.startFrom) : null,
      endTo: stored.endTo ? new Date(stored.endTo) : null,
      focusedTimes: (stored.focusedTimes || []).map(ft => ({
        ...ft,
        startFrom: ft.startFrom ? new Date(ft.startFrom) : null,
        endTo: ft.endTo ? new Date(ft.endTo) : null,
      })),
    };
  }
}

/**
 * @class BackgroundService
 * @description The main service class that manages the extension's background tasks and data persistence.
 */
/// <reference types="chrome"/>
class BackgroundServiceMV3 {
  #currentPeriod: IFocus.Period | null = null;
  #sessionStartTime: Date | null = null;

  constructor() {
    this.initializeListeners();
    this.initializeAlarms();
    this.restoreCurrentPeriod();
  }

  /**
   *  Initialization of messages and events
   *  */
  private initializeListeners(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      (async () => {
        try {
          switch (message.command) {
            case 'addPeriod':
              await this.addPeriod(message.period);
              sendResponse({ success: true });
              break;
            case 'removePeriod':
              await this.removePeriod(message.id);
              sendResponse({ success: true });
              break;
            case 'updatePeriod':
              await this.updatePeriod(message.period);
              sendResponse({ success: true });
              break;
            case 'toggleBlockedWebsite':
              await this.toggleWebSiteBlocking(message.site);
              sendResponse({ success: true });
              break;
            case 'startFocus': {
              const periods = await StorageAdapter.getPeriods();
              const periodToStart = periods.find(p => p.id === message.periodId);
              if (periodToStart) await this.startFocus(periodToStart);
              sendResponse({ success: true });
              break;
            }
            case 'stopFocus':
              await this.stopFocus();
              sendResponse({ success: true });
              break;
            case 'toggleFocus':
              await this.toggleFocus();
              sendResponse({ success: true });
              break;
            default:
              sendResponse({ success: false, error: 'Unknown command' });
          }
        } catch (error) {
          console.error('Background error:', error);
          sendResponse({ success: false, error: String(error) });
        }
      })();

      return true;
    });

    chrome.tabs.onActivated.addListener(activeInfo => {
      chrome.storage.local.set({ 'tab_id': activeInfo.tabId });
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active && tab.url) {
        chrome.storage.local.set({ 'tab_url': tab.url });
      }
    });
  }

  /**
   * Initializing alarms for focus control
   */
  private initializeAlarms(): void {
    chrome.alarms.onAlarm.addListener(async alarm => {
      if (alarm.name === 'checkFocusEnd') {
        const current = await StorageAdapter.getCurrentPeriod();
        if (current?.isFocused && current.endTo && new Date() > current.endTo) {
          await this.stopFocus();
        }
      }
    });
  }

  /**
   * Restoring the current period when starting the extension
   */
  private async restoreCurrentPeriod(): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();
    const periods = await StorageAdapter.getPeriods();

    if (!current && periods.length > 0) {
      await StorageAdapter.saveCurrentPeriod(periods[0]);
      this.#currentPeriod = periods[0];
    } else {
      this.#currentPeriod = current;
    }

    this.updateExtensionIcon(!!this.#currentPeriod?.isFocused);

    if (this.#currentPeriod?.isFocused) {
      this.updateBlockRules(this.#currentPeriod.webSites.filter(s => s.isBlocked).map(s => s.url));
      this.scheduleAlarm();
    } else {
      this.updateBlockRules([]);
    }
  }

  /**
   * Check every minute
   * */
  private scheduleAlarm(): void {
    chrome.alarms.create('checkFocusEnd', { periodInMinutes: 1 });
  }

  private async addPeriod(period: IFocus.Period): Promise<void> {
    const periods = await StorageAdapter.getPeriods();
    if (!periods.some(p => p.id === period.id)) {
      await StorageAdapter.savePeriod(period);
      await this.restoreCurrentPeriod();
    }
  }

  private async removePeriod(periodId: string): Promise<void> {
    const periods = await StorageAdapter.getPeriods();
    const current = await StorageAdapter.getCurrentPeriod();

    const newPeriods = periods.filter(p => p.id !== periodId);
    await chrome.storage.local.set({ periods: newPeriods });

    if (current?.id === periodId) await this.stopFocus();
    await this.restoreCurrentPeriod();
  }

  private async updatePeriod(period: IFocus.Period): Promise<void> {
    await StorageAdapter.savePeriod(period);

    if (this.#currentPeriod?.id === period.id && period.isFocused) {
      this.updateBlockRules(period.webSites.filter(s => s.isBlocked).map(s => s.url));
      this.#currentPeriod = period;
      this.scheduleAlarm();
    }
  }

  private async toggleWebSiteBlocking(toggledSite: IFocus.WebSite): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();
    if (!current) return;

    const updatedWebSites = current.webSites.map(site =>
      site.id === toggledSite.id ? { ...site, isBlocked: !site.isBlocked } : site
    );

    const updatedPeriod = { ...current, webSites: updatedWebSites };
    await StorageAdapter.savePeriod(updatedPeriod);
    await StorageAdapter.saveCurrentPeriod(updatedPeriod);

    if (updatedPeriod.isFocused) {
      this.updateBlockRules(updatedWebSites.filter(s => s.isBlocked).map(s => s.url));
      this.#currentPeriod = updatedPeriod;
    }
  }

  private async startFocus(period: IFocus.Period): Promise<void> {
    const today = new Date().getDay();
    if (period.daysOfWeek && !period.daysOfWeek.includes(today)) return;

    this.#currentPeriod = period;
    this.#sessionStartTime = new Date();
    this.#currentPeriod.isFocused = true;

    await StorageAdapter.saveCurrentPeriod(this.#currentPeriod);
    await StorageAdapter.savePeriod(this.#currentPeriod);

    this.updateBlockRules(period.webSites.filter(site => site.isBlocked).map(site => site.url));
    this.updateExtensionIcon(true);
    this.scheduleAlarm();
  }

  private async stopFocus(): Promise<void> {
    if (!this.#currentPeriod) return;

    const endTime = new Date();
    if (this.#sessionStartTime) {
      const newFocusedTime: IFocus.FocusedTime = {
        id: Date.now().toString(),
        periodId: this.#currentPeriod.id,
        startFrom: this.#sessionStartTime,
        endTo: endTime,
      };

      this.#currentPeriod.focusedTimes = [...(this.#currentPeriod.focusedTimes || []), newFocusedTime];
      this.#sessionStartTime = null;
    }

    this.#currentPeriod.isFocused = false;
    await StorageAdapter.savePeriod(this.#currentPeriod);
    await StorageAdapter.saveCurrentPeriod(this.#currentPeriod);

    this.updateBlockRules([]);
    this.updateExtensionIcon(false);
  }

  private async toggleFocus(): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();
    if (!current) return;

    if (current.isFocused) await this.stopFocus();
    else await this.startFocus(current);
  }

  private updateBlockRules(domainList: string[]): void {
    chrome.declarativeNetRequest.getDynamicRules(dynamicRules => {
      const currentRuleIds = dynamicRules.map(r => r.id);
      const rulesToAdd = domainList.map((domain, index) => this.createRedirectRule(domain, index + 1));

      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds,
        addRules: rulesToAdd,
      });
    });
  }

  private createRedirectRule(domain: string, ruleId: number): chrome.declarativeNetRequest.Rule {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return {
      id: ruleId,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.BLOCK
      },
      condition: { urlFilter: `||${cleanDomain}^`, resourceTypes: ["main_frame"] },
    };
  }

  private updateExtensionIcon(isFocused: boolean): void {
    const iconPath = isFocused ? "icon-spa-colored.png" : "icon-spa-transparent.png";
    chrome.action.setIcon({ path: { "16": iconPath, "48": iconPath, "128": iconPath } });
  }
}

new BackgroundServiceMV3();

