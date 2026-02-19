import { BLOCK_BEHAVIOUR_ENUM } from '../../modules/common/enums/block-behaviour.enum';
import { CHROME_COMMAND_ENUM } from '../../modules/common/enums/chrome-command.enum';
import { isHttpUrl } from '../../modules/common/helpers/is-http-url.helper';
import { buildRequestDomainVariants } from '../../modules/common/helpers/request-domain-variants.helper';

export class BlockerService {
  readonly BLOCK_ALL_RULE_ID = 9999;

  public updateBlockRulesWithBehaviour(
    domainList: string[],
    behaviour: BLOCK_BEHAVIOUR_ENUM
  ): void {
    const expandedDomains = this.#buildReloadDomains(domainList);

    if (behaviour === BLOCK_BEHAVIOUR_ENUM.WARN) {
      this.#injectWarnToTabs(expandedDomains);
      this.clearRules();
      return;
    }

    chrome.declarativeNetRequest.getDynamicRules(dynamicRules => {
      const currentRuleIds = dynamicRules.map(r => r.id);
      let rulesToAdd: chrome.declarativeNetRequest.Rule[] = [];

      switch (behaviour) {
        case BLOCK_BEHAVIOUR_ENUM.BLOCK:
          rulesToAdd = domainList.map((domain, index) =>
            this.#createRedirectRule(domain, index + 1)
          );
          break;

        case BLOCK_BEHAVIOUR_ENUM.WHITELIST: {
          const allowRules = domainList.map((domain, index) =>
            this.#createAllowRule(domain, index + 1)
          );
          rulesToAdd = [...allowRules, this.#createBlockAllRule()];
          break;
        }
      }

      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: currentRuleIds,
          addRules: rulesToAdd,
        },
        () => {
          if (behaviour === BLOCK_BEHAVIOUR_ENUM.WHITELIST) {
            this.#reloadNonWhitelistedTabs(domainList);
          } else if (domainList.length > 0) {
            this.#reloadBlockedTabs(this.#buildReloadDomains(domainList));
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

    this.#hideWarnInTabs();
  }

  #createAllowRule(domain: string, ruleId: number): chrome.declarativeNetRequest.Rule {
    const requestDomains = buildRequestDomainVariants(domain);
    return {
      id: ruleId,
      priority: 2,
      action: { type: 'allow' },
      condition: {
        requestDomains,
        resourceTypes: ['main_frame'],
      },
    };
  }

  #createBlockAllRule(): chrome.declarativeNetRequest.Rule {
    return {
      id: this.BLOCK_ALL_RULE_ID,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { url: chrome.runtime.getURL('blocked-page.html') },
      },
      condition: {
        urlFilter: '*', // Блокировать всё
        resourceTypes: ['main_frame'],
      },
    };
  }

  #createRedirectRule(domain: string, ruleId: number): chrome.declarativeNetRequest.Rule {
    return {
      id: ruleId,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { url: chrome.runtime.getURL('blocked-page.html') },
      },
      condition: {
        requestDomains: buildRequestDomainVariants(domain),
        resourceTypes: ['main_frame'],
      },
    };
  }

  async #reloadBlockedTabs(domainList: string[]): Promise<void> {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && isHttpUrl(tab.url)) {
        const isBlocked = domainList.some(domain => tab.url?.includes(domain));
        if (isBlocked) {
          chrome.tabs.reload(tab.id);
        }
      }
    }
  }

  #buildReloadDomains(domainList: string[]): string[] {
    return Array.from(new Set(domainList.flatMap(domain => buildRequestDomainVariants(domain))));
  }

  async #reloadNonWhitelistedTabs(whitelist: string[]): Promise<void> {
    const tabs = await chrome.tabs.query({});
    const cleanWhitelist = whitelist
      .map(domain =>
        domain
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0]
          .trim()
      )
      .filter(Boolean);
    const whitelistVariants = this.#buildReloadDomains(cleanWhitelist);

    for (const tab of tabs) {
      if (tab.id && tab.url && isHttpUrl(tab.url)) {
        const tabVariants = buildRequestDomainVariants(tab.url);
        const tabUrlClean = tabVariants[0] ?? '';

        const isAllowed =
          cleanWhitelist.some(
            domain => tabUrlClean === domain || tabUrlClean.endsWith('.' + domain)
          ) || whitelistVariants.some(domain => tab.url?.includes(domain));

        if (!isAllowed) {
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
