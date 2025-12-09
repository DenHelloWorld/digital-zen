/// <reference types="chrome"/>
namespace IFocus {
  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date;
    endTo: Date;
    blockedSites: BlockedSites[];
    daysOfWeek?: number[];
    focusedTimes: IFocus.FocusedTime[];
  }

  export interface BlockedSites {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
  }

  export interface FocusedTime {
    id: string;
    periodId: string;
    startFrom: Date;
    endTo: Date;
  }
}

/**
 * @class BackgroundService
 * @description The main service class that manages the extension's background tasks and data persistence.
 */
class BackgroundService {
  #currentPeriod: IFocus.Period | null = null;
  #timer: ReturnType<typeof setInterval> | undefined;
  #isFocused = false;
  #sessionStartTime: Date | null = null;

  /**
   * @constructor
   * @description Creates a new instance and initializes event listeners and state.
   */
  constructor() {
    this.initializeListeners();
    this.checkSessionStatus();
  }

  /**
   * @method checkSessionStatus
   * @description Checks if a focus session was active and continues it or stops it.
   */
  private async checkSessionStatus(): Promise<void> {
    const result = await chrome.storage.local.get(['currentPeriod', 'periods']);
    const storedPeriod: IFocus.Period | null = result['currentPeriod'] || null;

    if (storedPeriod) {
      this.#currentPeriod = storedPeriod;
      const now = new Date();
      const endTime = new Date(storedPeriod.endTo);

      if (now < endTime) {
        const blockedUrls = storedPeriod.blockedSites.map(site => site.url);
        this.updateBlockRules(blockedUrls);

        this.#timer = setInterval(() => {
          if (new Date() > endTime) {
            this.stopFocus();
          }
        }, 1000);
        console.log(`Continuing an active focus session for period: ${storedPeriod.name}`);
      } else {
        // Session has expired, stop it
        this.stopFocus();
        console.log(`Expired session found and stopped.`);
      }
    } else {
      console.log('No active session found on startup.');
      // No active session, ensure rules are clean just in case.
      this.updateBlockRules([]);
    }
  }

  /**
   * @method initializeListeners
   * @description Initializes all event handlers that listen for changes in the Chrome API.
   * These listeners allow the extension to react to user actions in the background.
   */
  private initializeListeners(): void {
    console.log('Digital Zen Service Worker has started.');

    // Message listener for communication with the popup
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      switch (message.command) {
        case 'addPeriod':
          await this.addPeriod(message.period);
          console.log('added period for period.', message.period);
          sendResponse({ success: true });
          return;
        case 'removePeriod':
          await this.removePeriod(message.id);
          sendResponse({ success: true });
          return;
        case 'updatePeriod':
          await this.updatePeriod(message.period);
          sendResponse({ success: true });
          return;
        case 'startFocus': {
          const result = await chrome.storage.local.get('periods');
          const periods = result['periods'] || [];
          const periodToStart = periods.find((p: IFocus.Period) => p.id === message.periodId);

          console.log('startFocus periods',  periods);
          console.log('startFocus periodToStart',  periodToStart);

          if (periodToStart) {
            this.startFocus(periodToStart);
          } else {
            console.error(`Period with ID ${message.periodId} not found.`);
          }
          sendResponse({ success: true });
          return;
        }
        case 'stopFocus':
          this.stopFocus();
          sendResponse({ success: true });
          return;
        default:
          console.warn('Unknown command received:', message.command);
          sendResponse({ success: false, error: 'Unknown command' });
          return;
      }
    });

    /**
     * @event chrome.tabs.onActivated
     * @description Listens for when the user activates (switches to) another tab.
     */
    chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.OnActivatedInfo) => {
      console.log(`An event occurred: onActivated. Tab ID: ${activeInfo.tabId}`);
      chrome.storage.local.set({ 'tab_id': activeInfo.tabId });
    });

    /**
     * @event chrome.tabs.onUpdated
     * @description Listens for when a tab updates its status (e.g., completes loading).
     */
    chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab: chrome.tabs.Tab) => {
      if (changeInfo.status === 'complete' && tab.active && tab.url) {
        console.log(`An event occurred: onUpdated. URL of loaded tab: ${tab.url}`);
        chrome.storage.local.set({ 'tab_url': tab.url });
      }
    });

    /**
     * @event chrome.history.onVisited
     * @description Listens for when the user visits a new page.
     */
    chrome.history.onVisited.addListener((historyItem: chrome.history.HistoryItem) => {
      console.log(`An event occurred: onVisited. Visited page: ${historyItem.url}`);
      if (historyItem.url) {
        chrome.storage.local.set({ 'history_url': historyItem.url });
      }
    });
  }

  /**
   * @method addPeriod
   * @description Adds a new period to storage.
   */
  private async addPeriod(period: IFocus.Period): Promise<void> {
    const result = await chrome.storage.local.get('periods');
    const periods: IFocus.Period[] = result['periods'] || [];

    const exists = periods.some(p => p.id === period.id);
    if (exists) {
      console.warn(`Period with ID "${period.id}" already exists. Skipping add.`);
      return;
    }

    periods.push(period);
    await chrome.storage.local.set({ periods });
    console.log('Period added successfully.', periods);
  }

  /**
   * @method removePeriod
   * @description Removes a period from storage by its ID.
   */
  private async removePeriod(periodId: string): Promise<void> {
    const result = await chrome.storage.local.get(['periods', 'currentPeriod']);
    const periods: IFocus.Period[] = result['periods'] || [];
    const current: IFocus.Period | null = result['currentPeriod'] || null;

    const newPeriods = periods.filter(p => p.id !== periodId);
    await chrome.storage.local.set({ periods: newPeriods });

    if (current && current.id === periodId) {
      this.stopFocus();
    }

    console.log('Period removed successfully. newPeriods', newPeriods);
  }


  /**
   * @method updatePeriod
   * @description Updates an existing period in storage.
   */
  private async updatePeriod(period: IFocus.Period): Promise<void> {
    const result = await chrome.storage.local.get('periods');
    const periods: IFocus.Period[] = result['periods'] || [];
    console.log('updatePeriod', periods);
    console.log('period', period);
    const index = periods.findIndex(p => p.id === period.id);
    if (index !== -1) {
      periods[index] = period;
      await chrome.storage.local.set({ periods });
      await this.updateAllBlockedSites(period.blockedSites);
      if (this.#currentPeriod?.id === period.id) {
        this.#currentPeriod = period;
        if(this.#isFocused) {
          this.updateBlockRules(period.blockedSites.map(s => s.url));
        }
      }
    }
  }

  /**
   * @method startFocus
   * @description Starts a focus session for a given period.
   * @param period The period object containing the blocked sites.
   */
  private startFocus(period: IFocus.Period): void {
    const today = new Date().getDay();
    if (period.daysOfWeek && !period.daysOfWeek.includes(today)) {
      console.log('Сегодня не входит в список дней недели для этого периода.');
      return;
    }

    this.#currentPeriod = period;
    this.#sessionStartTime = new Date();

    chrome.storage.local.set({ currentPeriod: period });

    const blockedUrls = period.blockedSites.map(site => site.url);
    this.updateBlockRules(blockedUrls);
    this.updateAllBlockedSites(period.blockedSites);
    this.#isFocused = true;

    this.#timer = setInterval(() => {
      const now = new Date();
      if ( this.#currentPeriod?.endTo && now > this.#currentPeriod.endTo) {
        this.stopFocus();
      }
    }, 1000);

    console.log('Focus started for period:', period);
  }

  /**
   * @method stopFocus
   * @description Stops the current focus session.
   */
  private async stopFocus(): Promise<void> {
    if (this.#timer) {
      clearInterval(this.#timer);
      this.#timer = undefined;
    }

    if (this.#isFocused && this.#currentPeriod && this.#sessionStartTime) {
      const endTime = new Date();

      const newFocusedTime: IFocus.FocusedTime = {
        id: Date.now().toString(),
        periodId: this.#currentPeriod.id,
        startFrom: this.#sessionStartTime,
        endTo: endTime,
      };

      this.#currentPeriod.focusedTimes = [
        ...(this.#currentPeriod.focusedTimes || []),
        newFocusedTime,
      ];

      console.log('Focus stopped. currentPeriod:', this.#currentPeriod);

      await this.updatePeriodInPeriodsArray(this.#currentPeriod);

      this.#sessionStartTime = null;
    }

    await chrome.storage.local.remove('currentPeriod');

    this.#currentPeriod = null;
    this.updateBlockRules([]);

    this.#isFocused = false;
    console.log('Focus stopped.');
  }

  private async updateAllBlockedSites(allBlockedSites: IFocus.BlockedSites[]): Promise<void> {
    await chrome.storage.local.set({ allBlockedSites });
    console.log('Updated allBlockedSites:', allBlockedSites);
  }

  /**
   * @method updateBlockRules
   * @description Updates the declarativeNetRequest rules with a new list of domains.
   * @param domainList The list of domains to block.
   */
  private updateBlockRules(domainList: string[]): void {
    chrome.declarativeNetRequest.getDynamicRules((dynamicRules: chrome.declarativeNetRequest.Rule[]) => {
      const currentRuleIds: number[] = dynamicRules.map(rule => rule.id);

      const rulesToAdd: chrome.declarativeNetRequest.Rule[] = domainList.map((domain, index) => {
        const ruleId: number = index + 1;
        return this.createRedirectRule(domain, ruleId);
      });

      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds,
        addRules: rulesToAdd
      }, () => {
        console.log('Block rules updated successfully.', domainList);
      });
    });
  }

  /**
   * @method createRedirectRule
   * @description Generates a redirect rule for a specific domain.
   */
  private createRedirectRule(domain: string, ruleId: number): chrome.declarativeNetRequest.Rule {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');

    return {
      id: ruleId,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { url: chrome.runtime.getURL("blocked-page.html") }
      },
      condition: {
        urlFilter: `||${cleanDomain}^`,
        resourceTypes: ["main_frame"]
      }
    };
  }

  /**
   * @method updatePeriodInPeriodsArray
   * @description Finds and updates a period within the main 'periods' array in storage.
   */
  private async updatePeriodInPeriodsArray(period: IFocus.Period): Promise<void> {
    const result = await chrome.storage.local.get('periods');
    const periods: IFocus.Period[] = result['periods'] || [];

    const index = periods.findIndex(p => p.id === period.id);
    if (index !== -1) {
      // Обновляем Период в основном списке, сохраняя все изменения (включая focusedTimes)
      periods[index] = period;
      await chrome.storage.local.set({ periods });
      console.log(`Period ${period.id} successfully updated in periods array with new focused time.`);
    }
  }
}

new BackgroundService();
