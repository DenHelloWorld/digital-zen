/// <reference types="chrome"/>
import { ALARM_PERIOD_IN_MINUTES } from '../modules/common/constants/alarm-period-in-minutes.const';
import { DEFAULT_POMODORO_SETTINGS } from '../modules/common/constants/default-pomodoro-settings.const';
import { CHROME_ALARM_ENUM } from '../modules/common/enums/chrome-alarm-name.enum';
import {
  CHROME_COMMAND_ENUM,
  ChromeCommandType,
} from '../modules/common/enums/chrome-command.enum';
import { FOCUS_ERROR_ENUM } from '../modules/common/enums/focus-error.enum';
import { createDefaultPomodoroStateHelper } from '../modules/common/helpers/create-default-pomodoro-state.helper';
import { logger } from '../modules/common/helpers/logger';
import { isCurrentTimeAfter } from '../modules/common/helpers/time.helper';
import { IFocus } from '../modules/common/models/focus.model';
import { AlarmAdapter } from './common/alarm-adapter';
import { ExtensionIconAdapter } from './common/extension-icon-adapter';
import { GoogleAuthAdapter } from './common/google-auth-adapter';
import { StorageAdapter } from './common/storage-adapter';
import { UserDataSyncAdapter } from './common/user-data-sync-adapter';
import { BackgroundFocusService } from './focus/background-focus-service';
import { BackgroundPomodoroService } from './pomodoro/background-pomodoro.service';

type FocusOperationResult = { success: true } | { success: false; error: FOCUS_ERROR_ENUM };

/**
 * @class BackgroundService
 * @description The main service class that manages the extension's background tasks and data persistence.
 */
export class BackgroundService {
  readonly #logger = logger.createLogger('BackgroundService');
  readonly #focusService = new BackgroundFocusService();
  readonly #pomodoroService = new BackgroundPomodoroService();

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
                const result = await this.#focusService.startFocus(periodToStart);
                sendResponse(result);
              } else {
                sendResponse({ success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND });
              }
              break;
            }
            case CHROME_COMMAND_ENUM.STOP_FOCUS: {
              const result = await this.#focusService.stopFocus();
              sendResponse(result);
              break;
            }
            case CHROME_COMMAND_ENUM.TOGGLE_FOCUS: {
              const result = await this.#focusService.toggleFocus();
              sendResponse(result);
              break;
            }
            case CHROME_COMMAND_ENUM.TOGGLE_QUICK_FOCUS: {
              const result = await this.#focusService.toggleQuickFocus(message.siteUrl);
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
            case CHROME_COMMAND_ENUM.START_GOOGLE_AUTH: {
              const authResult = await GoogleAuthAdapter.login();
              sendResponse(authResult);
              break;
            }
            case CHROME_COMMAND_ENUM.LOGOUT_GOOGLE_AUTH: {
              const logoutResult = await GoogleAuthAdapter.logout();
              sendResponse(logoutResult);
              break;
            }
            case CHROME_COMMAND_ENUM.CLOSE_TAB: {
              if (sender.tab && sender.tab.id) {
                await chrome.tabs.remove(sender.tab.id);
                return;
              }
              break;
            }
            case CHROME_COMMAND_ENUM.START_POMODORO: {
              await this.#pomodoroService.start();
              sendResponse({ success: true });
              break;
            }
            case CHROME_COMMAND_ENUM.STOP_POMODORO: {
              await this.#pomodoroService.stop();
              sendResponse({ success: true });
              break;
            }
            case CHROME_COMMAND_ENUM.RESET_POMODORO: {
              await this.#pomodoroService.reset();
              sendResponse({ success: true });
              break;
            }
            case CHROME_COMMAND_ENUM.PAUSE_POMODORO: {
              await this.#pomodoroService.pause();
              sendResponse({ success: true });
              break;
            }
            case CHROME_COMMAND_ENUM.RESUME_POMODORO: {
              await this.#pomodoroService.resume();
              sendResponse({ success: true });
              break;
            }
            case CHROME_COMMAND_ENUM.SET_POMODORO_SETTINGS: {
              await this.#pomodoroService.setPomodoroSettings(message.settings);
              sendResponse({ success: true });
              break;
            }
            case CHROME_COMMAND_ENUM.SET_POMODORO_STATE: {
              await this.#pomodoroService.setPomodoroState(message.state);
              sendResponse({ success: true });
              break;
            }
            case CHROME_COMMAND_ENUM.OPEN_SIDE_PANEL_APP: {
              const targetWindowId = message.windowId || sender.tab?.windowId;

              if (targetWindowId) {
                chrome.sidePanel
                  .open({ windowId: targetWindowId })
                  .then(() => sendResponse({ success: true }))
                  .catch(err => {
                    this.#logger.error('SidePanel gesture error:', err);
                    sendResponse({ success: false });
                  });
              } else {
                chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
                sendResponse({ success: true });
              }
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

    chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active && tab.url) {
        chrome.storage.local.set({ tab_url: tab.url });
      }
    });

    chrome.runtime.onInstalled.addListener(() => {
      this.initializePomodoroDefaults();
      this.#logger.info('Pomodoro defaults initialized via onInstalled');
    });
  }

  /**
   * Initializing alarms for focus control
   */
  private initializeAlarms(): void {
    AlarmAdapter.addListener(async alarm => {
      switch (alarm.name) {
        case CHROME_ALARM_ENUM.CHECK_FOCUS_END: {
          const current = await StorageAdapter.getCurrentPeriod();
          if (current?.isActive && current.endTo && isCurrentTimeAfter(new Date(), current.endTo)) {
            await this.#focusService.stopFocus();
          }
          break;
        }

        case CHROME_ALARM_ENUM.POMODORO_TICK:
          await this.#pomodoroService.handleAlarmTrigger();
          break;

        default:
          this.#logger.warn(`Unknown alarm received: ${alarm.name}`);
      }
    });
  }

  /**
   * Restoring the current period when starting the extension
   */
  private async restoreCurrentPeriod(): Promise<void> {
    let current = await StorageAdapter.getCurrentPeriod();
    const periods = await StorageAdapter.getPeriods();

    if (!current && periods.length > 0) {
      await StorageAdapter.saveCurrentPeriod(periods[0]);
      current = periods[0];
    }

    this.updateExtensionIcon(!!current?.isActive);

    if (current?.isActive) {
      this.#focusService.updateBlockRulesForCurrentPeriod();
      this.scheduleAlarm();
    } else {
      this.#focusService.clearBlockRules();
    }
  }

  /**
   * Check every minute
   * */
  private scheduleAlarm(): void {
    AlarmAdapter.create(CHROME_ALARM_ENUM.CHECK_FOCUS_END, {
      periodInMinutes: ALARM_PERIOD_IN_MINUTES,
    });
  }

  private async addPeriod(period: IFocus.Period): Promise<void> {
    const periods = await StorageAdapter.getPeriods();
    if (!periods.some(p => p.id === period.id)) {
      await StorageAdapter.savePeriod(period);
      await this.restoreCurrentPeriod();
      // Sync to backend
      await UserDataSyncAdapter.syncPeriodsToBackend();
    }
  }

  private async removePeriod(periodId: string): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();

    await StorageAdapter.removePeriod(periodId);

    if (current?.id === periodId) await this.#focusService.stopFocus();
    await this.restoreCurrentPeriod();
    await UserDataSyncAdapter.syncPeriodsToBackend();
  }

  private async updatePeriod(period: IFocus.Period): Promise<void> {
    await StorageAdapter.savePeriod(period);
    const current = await StorageAdapter.getCurrentPeriod();

    if (current && current.id === period.id) {
      await StorageAdapter.saveCurrentPeriod(period);
      if (period.isActive) {
        this.#focusService.updateBlockRulesForCurrentPeriod();
        this.scheduleAlarm();
      }
    }
    await UserDataSyncAdapter.syncPeriodsToBackend();
  }

  private async toggleWebSiteBlocking(toggledSite: IFocus.WebSite): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();
    if (!current) {
      return;
    }

    const updatedWebSites = current.webSites.map(site =>
      site.url === toggledSite.url ? { ...site, isActivated: !site.isActivated } : site
    );

    const updatedPeriod = { ...current, webSites: updatedWebSites };
    await StorageAdapter.savePeriod(updatedPeriod);
    await StorageAdapter.saveCurrentPeriod(updatedPeriod);

    if (updatedPeriod.isActive) {
      this.#focusService.updateBlockRulesForCurrentPeriod();
    }
    await UserDataSyncAdapter.syncPeriodsToBackend();
  }

  private updateExtensionIcon(isFocused: boolean): void {
    ExtensionIconAdapter.setIcon(isFocused);
  }

  private async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    return tabs.length ? tabs[0] : null;
  }

  private async setCurrentPeriod(periodId: string): Promise<FocusOperationResult> {
    const periods = await StorageAdapter.getPeriods();
    const periodToSet = periods.find(p => p.id === periodId);

    if (!periodToSet) {
      return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND };
    }

    const current = await StorageAdapter.getCurrentPeriod();

    if (current?.isActive) {
      await this.#focusService.stopFocus();
      const updatedPeriods = await StorageAdapter.getPeriods();
      const freshPeriod = updatedPeriods.find(p => p.id === periodId);

      if (!freshPeriod) {
        return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_FOUND };
      }

      await StorageAdapter.saveCurrentPeriod(freshPeriod);
    } else {
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

  private async initializePomodoroDefaults(): Promise<void> {
    let settings = await StorageAdapter.getPomodoroSettings();
    const state = await StorageAdapter.getPomodoroState();

    if (!settings) {
      await StorageAdapter.savePomodoroSettings(DEFAULT_POMODORO_SETTINGS);
      settings = DEFAULT_POMODORO_SETTINGS;
      this.#logger.info('Pomodoro settings initialized');
    }

    if (!state) {
      const initialState = createDefaultPomodoroStateHelper(settings);
      await StorageAdapter.savePomodoroState(initialState);
      this.#logger.info('Pomodoro state initialized');
    }
  }
}
