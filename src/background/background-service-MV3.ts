/// <reference types="chrome"/>
import { StorageAdapter } from './storage-adapter';
import { UserDataSyncAdapter } from './user-data-sync-adapter';
import { IFocus } from '../modules/common/models/focus.model';
import { QUICK_FOCUS_ID } from '../modules/common/constants/quick-focus-id.const';
import {
  CHROME_COMMAND_ENUM,
  ChromeCommandType,
} from '../modules/common/enums/chrome-command.enum';
import { CHROME_ALARM_ENUM } from '../modules/common/enums/chrome-alarm-name.enum';
import { FOCUS_ERROR_ENUM } from '../modules/common/enums/focus-error.enum';
import { isCurrentTimeAfter, isCurrentTimeInRange } from '../modules/common/helpers/time.helper';
import { logger } from '../modules/common/helpers/logger';

type FocusOperationResult = { success: true } | { success: false; error: FOCUS_ERROR_ENUM };

/**
 * @class BackgroundService
 * @description The main service class that manages the extension's background tasks and data persistence.
 */
export class BackgroundServiceMV3 {
  #currentPeriod: IFocus.Period | null = null;
  #sessionStartTime: Date | null = null;
  readonly #logger = logger.createLogger('BackgroundService');

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
          switch (message.command as ChromeCommandType) {
            case CHROME_COMMAND_ENUM.ADD_PERIOD:
              await this.addPeriod(message.period);
              sendResponse({ success: true });
              break;
            case CHROME_COMMAND_ENUM.REMOVE_PERIOD:
              await this.removePeriod(message.id);
              sendResponse({ success: true });
              break;
            case CHROME_COMMAND_ENUM.UPDATE_PERIOD:
              await this.updatePeriod(message.period);
              sendResponse({ success: true });
              break;
            case CHROME_COMMAND_ENUM.TOGGLE_BLOCKED_WEBSITE:
              await this.toggleWebSiteBlocking(message.site);
              sendResponse({ success: true });
              break;
            case CHROME_COMMAND_ENUM.START_FOCUS: {
              const periods = await StorageAdapter.getPeriods();
              const periodToStart = periods.find(p => p.id === message.periodId);
              if (periodToStart) {
                const result = await this.startFocus(periodToStart);
                sendResponse(result);
              } else {
                sendResponse({ success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND });
              }
              break;
            }
            case CHROME_COMMAND_ENUM.STOP_FOCUS: {
              const result = await this.stopFocus();
              sendResponse(result);
              break;
            }
            case CHROME_COMMAND_ENUM.TOGGLE_FOCUS: {
              const result = await this.toggleFocus();
              sendResponse(result);
              break;
            }
            case CHROME_COMMAND_ENUM.TOGGLE_QUICK_FOCUS: {
              const result = await this.toggleQuickFocus(message.siteUrl);
              sendResponse(result);
              break;
            }
            case CHROME_COMMAND_ENUM.GET_ACTIVE_TAB: {
              const tab = await this.getActiveTab();

              sendResponse({
                success: true,
                tab: tab
                  ? {
                      id: tab.id,
                      url: tab.url,
                      title: tab.title,
                      favIconUrl: tab.favIconUrl,
                    }
                  : null,
              });
              break;
            }
            case CHROME_COMMAND_ENUM.SET_CURRENT_PERIOD: {
              const result = await this.setCurrentPeriod(message.periodId);
              sendResponse(result);
              break;
            }
            case CHROME_COMMAND_ENUM.SYNC_USER_DATA: {
              const syncResult = await this.syncUserData(message.userEmail, message.userId);
              sendResponse(syncResult);
              break;
            }
            default:
              sendResponse({ success: false, error: FOCUS_ERROR_ENUM.UNKNOWN_COMMAND });
          }
        } catch (error) {
          this.#logger.error('Error handling message:', error);
          sendResponse({ success: false, error: FOCUS_ERROR_ENUM.GENERIC_ERROR });
        }
      })();

      return true;
    });

    chrome.tabs.onActivated.addListener(activeInfo => {
      chrome.storage.local.set({ tab_id: activeInfo.tabId });
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active && tab.url) {
        chrome.storage.local.set({ tab_url: tab.url });
      }
    });
  }

  /**
   * Initializing alarms for focus control
   */
  private initializeAlarms(): void {
    chrome.alarms.onAlarm.addListener(async alarm => {
      if (alarm.name === CHROME_ALARM_ENUM.CHECK_FOCUS_END) {
        const current = await StorageAdapter.getCurrentPeriod();
        if (current?.isFocused && current.endTo && isCurrentTimeAfter(new Date(), current.endTo)) {
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
    chrome.alarms.create(CHROME_ALARM_ENUM.CHECK_FOCUS_END, { periodInMinutes: 1 });
  }

  private async addPeriod(period: IFocus.Period): Promise<void> {
    const periods = await StorageAdapter.getPeriods();
    if (!periods.some(p => p.id === period.id)) {
      await StorageAdapter.savePeriod(period);
      await this.restoreCurrentPeriod();
    }
  }

  private async removePeriod(periodId: string): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();

    await StorageAdapter.removePeriod(periodId);

    if (current?.id === periodId) await this.stopFocus();
    await this.restoreCurrentPeriod();
  }

  private async updatePeriod(period: IFocus.Period): Promise<void> {
    await StorageAdapter.savePeriod(period);
    const current = await StorageAdapter.getCurrentPeriod();

    if (current && current.id === period.id) {
      await StorageAdapter.saveCurrentPeriod(period);
      this.#currentPeriod = period;

      if (period.isFocused) {
        this.updateBlockRules(period.webSites.filter(s => s.isBlocked).map(s => s.url));
        this.scheduleAlarm();
      }
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

  private async startFocus(period: IFocus.Period): Promise<FocusOperationResult> {
    const today = new Date().getDay();

    if (period.daysOfWeek && !period.daysOfWeek.includes(today)) {
      return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_SCHEDULED_TODAY };
    }

    // Check if current time is within the period's time range
    const now = new Date();
    if (!isCurrentTimeInRange(now, period.startFrom, period.endTo)) {
      return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_OUTSIDE_TIME_RANGE };
    }

    this.#currentPeriod = period;
    this.#sessionStartTime = new Date();
    this.#currentPeriod.isFocused = true;
    this.#currentPeriod.sessionStartTime = this.#sessionStartTime;

    await StorageAdapter.saveCurrentPeriod(this.#currentPeriod);
    await StorageAdapter.savePeriod(this.#currentPeriod);

    this.updateBlockRules(period.webSites.filter(site => site.isBlocked).map(site => site.url));
    this.updateExtensionIcon(true);
    this.scheduleAlarm();

    return { success: true };
  }

  private async stopFocus(): Promise<FocusOperationResult> {
    if (!this.#currentPeriod || !this.#currentPeriod.isFocused) {
      // Already inactive - this is the desired state, so return success
      return { success: true };
    }

    const endTime = new Date();
    if (this.#sessionStartTime) {
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
      this.#sessionStartTime = null;
    }

    this.#currentPeriod.isFocused = false;
    this.#currentPeriod.sessionStartTime = null;
    await StorageAdapter.savePeriod(this.#currentPeriod);
    await StorageAdapter.saveCurrentPeriod(this.#currentPeriod);

    this.updateBlockRules([]);
    this.updateExtensionIcon(false);

    return { success: true };
  }

  private async toggleFocus(): Promise<FocusOperationResult> {
    const current = await StorageAdapter.getCurrentPeriod();

    if (!current) {
      // No period to toggle - this is a no-op, return success
      return { success: true };
    }

    if (current.isFocused) {
      return await this.stopFocus();
    } else {
      return await this.startFocus(current);
    }
  }

  private async toggleQuickFocus(url: string): Promise<FocusOperationResult> {
    const current = await StorageAdapter.getCurrentPeriod();

    if (current && current.id === QUICK_FOCUS_ID && current.isFocused) {
      return await this.stopFocus();
    } else {
      return await this.startQuickFocus(url);
    }
  }

  private updateBlockRules(domainList: string[]): void {
    chrome.declarativeNetRequest.getDynamicRules(dynamicRules => {
      const currentRuleIds = dynamicRules.map(r => r.id);
      const rulesToAdd = domainList.map((domain, index) =>
        this.createRedirectRule(domain, index + 1)
      );

      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds,
        addRules: rulesToAdd,
      });
    });
  }

  private createRedirectRule(domain: string, ruleId: number): chrome.declarativeNetRequest.Rule {
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

  private updateExtensionIcon(isFocused: boolean): void {
    const iconPath = isFocused ? 'icon-spa-colored.png' : 'icon-spa-transparent.png';
    chrome.action.setIcon({ path: { '16': iconPath, '48': iconPath, '128': iconPath } });
  }

  private async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    return tabs.length ? tabs[0] : null;
  }

  private async startQuickFocus(url: string): Promise<FocusOperationResult> {
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    const quickPeriod: IFocus.Period = {
      id: QUICK_FOCUS_ID,
      name: `Focus: ${domain}`,
      description: 'Quick focus session',
      startFrom: new Date(),
      endTo: null,
      isFocused: true,
      focusedTimes: [],
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      sessionStartTime: null,
      webSites: [
        {
          id: 'ws-' + Date.now(),
          type: IFocus.EWebSiteType.DEFAULT,
          name: domain,
          description: '',
          url: url,
          imageUrl: '',
          iconUrl: '',
          isBlocked: true,
        },
      ],
    };

    return await this.startFocus(quickPeriod);
  }

  private async setCurrentPeriod(periodId: string): Promise<FocusOperationResult> {
    const periods = await StorageAdapter.getPeriods();
    const periodToSet = periods.find(p => p.id === periodId);

    if (!periodToSet) {
      return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND };
    }

    // Stop focus if currently active
    if (this.#currentPeriod?.isFocused) {
      await this.stopFocus();
      // Refetch periods after stopping focus to get the latest state
      const updatedPeriods = await StorageAdapter.getPeriods();
      const freshPeriod = updatedPeriods.find(p => p.id === periodId);

      if (!freshPeriod) {
        return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND };
      }

      // Set the new current period with fresh data
      this.#currentPeriod = freshPeriod;
      await StorageAdapter.saveCurrentPeriod(freshPeriod);
    } else {
      // Set the new current period
      this.#currentPeriod = periodToSet;
      await StorageAdapter.saveCurrentPeriod(periodToSet);
    }

    return { success: true };
  }

  /**
   * Synchronize user data with backend
   */
  private async syncUserData(userEmail: string, userId: string): Promise<FocusOperationResult> {
    try {
      await UserDataSyncAdapter.syncUserData(userEmail, userId);
      return { success: true };
    } catch (error) {
      this.#logger.error('User data sync failed:', error);
      return { success: false, error: FOCUS_ERROR_ENUM.GENERIC_ERROR };
    }
  }
}
