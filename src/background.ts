/// <reference types="chrome"/>
namespace IFocus {
  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date;
    endTo: Date;
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
  #sessionStartTime: Date | null = null;

  /**
   * @constructor
   * @description Creates a new instance and initializes event listeners and state.
   */
  constructor() {
    this.initializeListeners();
    this.checkSessionStatus();
    this.setCurrentPeriodIfNone();
  }

  /**
   * @method checkSessionStatus
   * @description Checks if a focus session was active and continues it or stops it.
   */
  private async checkSessionStatus(): Promise<void> {
    const result = await chrome.storage.local.get(['currentPeriod', 'periods']);
    const storedPeriod: IFocus.Period | null = result['currentPeriod'] as IFocus.Period || null;

    if (storedPeriod) {
      this.#currentPeriod = storedPeriod;
      const now = new Date();
      const endTime = new Date(storedPeriod.endTo);

      if (now < endTime) {
        const activelyBlockedUrls = storedPeriod.webSites
          .filter(site => site.isBlocked)
          .map(site => site.url);

        this.updateBlockRules(activelyBlockedUrls);

        this.#timer = setInterval(() => {
          if (new Date() > endTime) {
            this.stopFocus();
          }
        }, 1000);
      } else {
        // Session has expired, stop it
        this.stopFocus();
      }
    } else {
      this.updateBlockRules([]);
    }

    this.setCurrentPeriodIfNone();
  }

  /**
   * @method initializeListeners
   * @description Initializes all event handlers that listen for changes in the Chrome API.
   * These listeners allow the extension to react to user actions in the background.
   */
  private initializeListeners(): void {
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      switch (message.command) {
        case 'addPeriod':
          await this.addPeriod(message.period);
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
        case 'toggleBlockedWebsite':
          await this.toggleWebSiteBlocking(message.site);
          sendResponse({ success: true });
          return;
        case 'startFocus': {
          const result = await chrome.storage.local.get('periods');
          const periods = result['periods'] as IFocus.Period[] || [];
          const periodToStart = periods.find((p: IFocus.Period) => p.id === message.periodId);

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
      chrome.storage.local.set({ 'tab_id': activeInfo.tabId });
    });

    /**
     * @event chrome.tabs.onUpdated
     * @description Listens for when a tab updates its status (e.g., completes loading).
     */
    chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.OnUpdatedInfo, tab: chrome.tabs.Tab) => {
      if (changeInfo.status === 'complete' && tab.active && tab.url) {
        chrome.storage.local.set({ 'tab_url': tab.url });
      }
    });

    /**
     * @event chrome.history.onVisited
     * @description Listens for when the user visits a new page.
     */
    chrome.history.onVisited.addListener((historyItem: chrome.history.HistoryItem) => {
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
    const periods: IFocus.Period[] = result['periods'] as IFocus.Period[] || [];

    const exists = periods.some(p => p.id === period.id);
    if (exists) {
      console.warn(`Period with ID "${period.id}" already exists. Skipping add.`);
      return;
    }

    periods.push(period);
    await chrome.storage.local.set({ periods });
    await this.setCurrentPeriodIfNone();
  }

  /**
   * @method removePeriod
   * @description Removes a period from storage by its ID.
   */
  private async removePeriod(periodId: string): Promise<void> {
    const result = await chrome.storage.local.get(['periods', 'currentPeriod']);
    const periods: IFocus.Period[] = result['periods'] as IFocus.Period[] || [];
    const current: IFocus.Period | null = result['currentPeriod'] as IFocus.Period || null;

    const newPeriods = periods.filter(p => p.id !== periodId);
    await chrome.storage.local.set({ periods: newPeriods });

    if (current && current.id === periodId) {
      this.stopFocus();
    }

    await this.setCurrentPeriodIfNone();
  }

  /**
   * @method updatePeriod
   * @description Updates an existing period in storage.
   */
  private async updatePeriod(period: IFocus.Period): Promise<void> {
    const result = await chrome.storage.local.get('periods');
    const periods: IFocus.Period[] = result['periods'] as IFocus.Period[] || [];
    const index = periods.findIndex(p => p.id === period.id);

    if (index !== -1) {
      periods[index] = period;
      await chrome.storage.local.set({ periods });

      const activelyBlockedSites = period.webSites.filter(site => site.isBlocked);
      const activelyBlockedUrls = activelyBlockedSites.map(s => s.url);

      if (this.#currentPeriod?.id === period.id) {
        this.#currentPeriod = period;
        if(period.isFocused) {
          this.updateBlockRules(activelyBlockedUrls);
        }
      }
    }
  }

  /**
   * @method toggleWebSiteBlocking
   * @description Toggles the isBlocked status for a site in the currently selected period,
   * regardless of whether focus is active.
   * @param toggledSite The WebSite object to toggle (contains the ID).
   */
  private async toggleWebSiteBlocking(toggledSite: IFocus.WebSite): Promise<void> {
    const result = await chrome.storage.local.get(['currentPeriod', 'periods']);
    const periodToUpdate: IFocus.Period | null = result['currentPeriod'] as IFocus.Period || null;
    const allPeriods: IFocus.Period[] = result['periods'] as IFocus.Period[] || [];

    if (!periodToUpdate) {
      console.warn('⚠️ Cannot toggle site: No period is currently selected (currentPeriod is null).');
      return;
    }

    let siteFoundAndToggled = false;

    const updatedWebSites = periodToUpdate.webSites.map(site => {
      if (site.id === toggledSite.id) {
        siteFoundAndToggled = true;
        return {
          ...site,
          isBlocked: !site.isBlocked,
        };
      }
      return site;
    });

    if (!siteFoundAndToggled) {
      console.warn(`Site with ID ${toggledSite.id} not found in current period.`);
      return;
    }

    const updatedPeriod: IFocus.Period = {
      ...periodToUpdate,
      webSites: updatedWebSites,
    };
    const periodIndexInArray = allPeriods.findIndex(p => p.id === updatedPeriod.id);

    if (periodIndexInArray !== -1) {
      allPeriods[periodIndexInArray] = updatedPeriod;
      await chrome.storage.local.set({ periods: allPeriods });
    }

    await chrome.storage.local.set({ currentPeriod: updatedPeriod });

    if (updatedPeriod.isFocused) {
      this.#currentPeriod = updatedPeriod;
      const activelyBlockedUrls = updatedWebSites
        .filter(site => site.isBlocked)
        .map(site => site.url);

      this.updateBlockRules(activelyBlockedUrls);
    }
  }

  /**
   * @method setCurrentPeriodIfNone
   * @description Ensures that if periods exist, one is selected as currentPeriod in storage.
   */
  private async setCurrentPeriodIfNone(): Promise<void> {
    const result = await chrome.storage.local.get(['currentPeriod', 'periods']);
    const current: IFocus.Period | null = result['currentPeriod'] as IFocus.Period || null;
    const periods: IFocus.Period[] = result['periods'] as IFocus.Period[] || [];

    if (!current && periods.length > 0) {
      await chrome.storage.local.set({ currentPeriod: periods[0] });
    } else if (current && periods.length === 0) {
      await chrome.storage.local.remove('currentPeriod');
    }
  }

  /**
   * @method startFocus
   * @description Starts a focus session for a given period.
   * @param period The period object containing the blocked sites.
   */
  private async startFocus(period: IFocus.Period): Promise<void> { // ✅ Сделаем async
    const today = new Date().getDay();
    if (period.daysOfWeek && !period.daysOfWeek.includes(today)) {
      return;
    }

    this.#currentPeriod = period;
    this.#sessionStartTime = new Date();
    this.#currentPeriod.isFocused = true;

    await chrome.storage.local.set({ currentPeriod: period })
    await this.updatePeriodInPeriodsArray(period);

    const activelyBlockedSites = period.webSites.filter(site => site.isBlocked);
    const activelyBlockedUrls = activelyBlockedSites.map(site => site.url);

    this.updateBlockRules(activelyBlockedUrls);

    this.#timer = setInterval(() => {
      const now = new Date();
      if ( this.#currentPeriod?.endTo && now > this.#currentPeriod.endTo) {
        this.stopFocus();
      }
    }, 1000);
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

    if (this.#currentPeriod && this.#sessionStartTime) {
      const endTime = new Date();

      const newFocusedTime: IFocus.FocusedTime = {
        id: Date.now().toString(),
        periodId: this.#currentPeriod.id,
        startFrom: this.#sessionStartTime,
        endTo: endTime,
      };

      this.#currentPeriod.isFocused = false;

      this.#currentPeriod.focusedTimes = [
        ...(this.#currentPeriod.focusedTimes || []),
        newFocusedTime,
      ];

      await this.updatePeriodInPeriodsArray(this.#currentPeriod);
      await chrome.storage.local.set({ currentPeriod: this.#currentPeriod });
      this.#sessionStartTime = null;
    }

    this.updateBlockRules([]);
    await this.setCurrentPeriodIfNone();
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
    const periods: IFocus.Period[] = result['periods'] as IFocus.Period[] || [];
    const index = periods.findIndex(p => p.id === period.id);

    if (index !== -1) {
      periods[index] = period;
      await chrome.storage.local.set({ periods });
    }
  }
}

new BackgroundService();
