export class BlockerService {
  public updateBlockRules(domainList: string[]): void {
    chrome.declarativeNetRequest.getDynamicRules(dynamicRules => {
      const currentRuleIds = dynamicRules.map(r => r.id);
      const rulesToAdd = domainList.map((domain, index) =>
        this.#createRedirectRule(domain, index + 1)
      );

      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: currentRuleIds,
          addRules: rulesToAdd,
        },
        () => {
          if (domainList.length > 0) {
            this.#reloadBlockedTabs(domainList);
          }
        }
      );
    });
  }

  public clearRules(): void {
    chrome.declarativeNetRequest.getDynamicRules(dynamicRules => {
      const currentRuleIds = dynamicRules.map(r => r.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds,
        addRules: [],
      });
    });
  }

  #createRedirectRule(domain: string, ruleId: number): chrome.declarativeNetRequest.Rule {
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .replace(/^www\./, '');

    return {
      id: ruleId,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { url: chrome.runtime.getURL('blocked-page.html') },
      },
      condition: {
        requestDomains: [cleanDomain],
        resourceTypes: ['main_frame'],
      },
    };
  }

  async #reloadBlockedTabs(domainList: string[]): Promise<void> {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url) {
        const isBlocked = domainList.some(domain => tab.url?.includes(domain));
        if (isBlocked) {
          chrome.tabs.reload(tab.id);
        }
      }
    }
  }
}
