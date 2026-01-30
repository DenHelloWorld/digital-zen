import { BLOCK_BEHAVIOUR_ENUM } from '../../modules/common/enums/block-behaviour.enum';
import { CHROME_COMMAND_ENUM } from '../../modules/common/enums/chrome-command.enum';

export class BlockerService {
  public updateBlockRulesWithBehaviour(
    domainList: string[],
    behaviour: BLOCK_BEHAVIOUR_ENUM
  ): void {
    if (behaviour === BLOCK_BEHAVIOUR_ENUM.BLOCK) {
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
    } else if (behaviour === BLOCK_BEHAVIOUR_ENUM.WARN) {
      this.#injectWarnToTabs(domainList);
      this.clearRules();
    }
  }

  public clearRules(): void {
    chrome.declarativeNetRequest.getDynamicRules(dynamicRules => {
      const currentRuleIds = dynamicRules.map(r => r.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds,
        addRules: [],
      });
    });

    this.#hideWarnInTabs();
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

  #hideWarnInTabs(): void {
    chrome.tabs.query({}, tabs => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: CHROME_COMMAND_ENUM.HIDE_BANNER }).catch(() => {
            /* empty */
          });
        }
      }
    });
  }

  #injectWarnToTabs(domainList: string[]): void {
    chrome.tabs.query({}, tabs => {
      for (const tab of tabs) {
        if (tab.id && tab.url && domainList.some(domain => tab.url?.includes(domain))) {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: ['inject-loader.js'],
            },
            () => {
              if (tab.id) {
                chrome.tabs
                  .sendMessage(tab.id, { action: CHROME_COMMAND_ENUM.SHOW_BANNER })
                  .catch(() => {
                    /* empty */
                  });
              }
            }
          );
        }
      }
    });
  }
}
