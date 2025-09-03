/// <reference types="chrome"/>

/**
 * @class BackgroundService
 * @description The main service class that manages the extension's background tasks,
 * such as listening for tab and browser history events.
 */
class BackgroundService {

  /**
   * @constructor
   * @description Creates a new instance of BackgroundService and initializes the event listeners.
   */
  constructor() {
    this.initializeListeners();
    this.updateBlockRules();
  }

  /**
   * @method initializeListeners
   * @description Initializes all event handlers that listen for changes in the Chrome API.
   * These listeners allow the extension to react to user actions in the background.
   */
  initializeListeners(): void {
    console.log('Digital Zen Service Worker has started.');

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
      // If the URL exists, save it to local storage.
      if (historyItem.url) {
        chrome.storage.local.set({ 'history_url': historyItem.url });
      }
    });
  }

  /**
   * @method updateBlockRules
   * @description Fetches the list of blocked domains from storage and updates the
   * declarativeNetRequest rules accordingly.
   */
  updateBlockRules(): void {
    chrome.storage.local.get('blocked_domains', (result: { blocked_domains?: string[] }) => {
      let domainList: string[] = result.blocked_domains || [];

      domainList = [...domainList, 'facebook.com'];

      chrome.declarativeNetRequest.getDynamicRules((dynamicRules: chrome.declarativeNetRequest.Rule[]) => {
        const currentRuleIds: number[] = dynamicRules.map(rule => rule.id);

        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: currentRuleIds
        }, () => {
          chrome.storage.local.get('last_rule_id', (idResult: { last_rule_id?: number }) => {
            let nextId: number = idResult.last_rule_id || 1;
            const rulesToAdd: chrome.declarativeNetRequest.Rule[] = domainList.map(domain => {
              const rule = this.createRedirectRule(domain, nextId);
              nextId++;
              return rule;
            });

            chrome.declarativeNetRequest.updateDynamicRules({
              addRules: rulesToAdd
            });

            chrome.storage.local.set({ 'last_rule_id': nextId });

            console.log('Block rules updated successfully.');
          });
        });
      });
    });
  }

  /**
   * @method createRedirectRule
   * @description Generates a redirect rule for a specific domain.
   */
  createRedirectRule(domain: string, ruleId: number): chrome.declarativeNetRequest.Rule {
    return {
      id: ruleId,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { url: chrome.runtime.getURL("pages/blocked-page.html") }
      },
      condition: {
        urlFilter: `*://*.${domain}/*`,
        resourceTypes: ["main_frame"]
      }
    };
  }
}

new BackgroundService();
