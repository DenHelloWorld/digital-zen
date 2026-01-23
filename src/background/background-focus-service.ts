import { IFocus } from '../modules/common/models';
import { QUICK_FOCUS_ID } from '../modules/common/constants';
import { CHROME_ALARM_ENUM, FOCUS_ERROR_ENUM } from '../modules/common/enums';
import { isCurrentTimeInRange } from '../modules/common/helpers';
import { filterBlockableWebsites } from '../modules/common/helpers';
import { BLOCK_BEHAVIOUR_ENUM } from '../modules/common/enums/block-behaviour.enum';
import { StorageAdapter } from './storage-adapter';
import { UserDataSyncAdapter } from './user-data-sync-adapter';
import { AlarmAdapter } from './alarm-adapter';
import { ExtensionIconAdapter } from './extension-icon-adapter';
import { BlockerService } from './blocker-service';

export type FocusOperationResult = { success: true } | { success: false; error: FOCUS_ERROR_ENUM };

export class BackgroundFocusService {
  readonly #blocker = new BlockerService();

  async updateBlockRulesForCurrentPeriod(): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();
    if (current && current.webSites) {
      const blockableWebsites = filterBlockableWebsites(current.webSites);
      this.#blocker.updateBlockRulesWithBehaviour(
        blockableWebsites.filter(site => site.isBlocked).map(site => site.url),
        current.blockBehaviour
      );
    }
  }

  clearBlockRules(): void {
    this.#blocker.clearRules();
  }

  async startFocus(period: IFocus.Period): Promise<FocusOperationResult> {
    const now = new Date();
    const today = now.getDay();

    if (period.daysOfWeek && !period.daysOfWeek.includes(today)) {
      return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_NOT_SCHEDULED_TODAY };
    }

    if (!isCurrentTimeInRange(now, period.startFrom, period.endTo)) {
      return { success: false, error: FOCUS_ERROR_ENUM.PERIOD_OUTSIDE_TIME_RANGE };
    }

    period.isFocused = true;
    period.sessionStartTime = now;

    await StorageAdapter.saveCurrentPeriod(period);
    await StorageAdapter.savePeriod(period);

    const blockableWebsites = filterBlockableWebsites(period.webSites);
    this.#blocker.updateBlockRulesWithBehaviour(
      blockableWebsites.filter(site => site.isBlocked).map(site => site.url),
      period.blockBehaviour
    );
    ExtensionIconAdapter.setIcon(true);
    AlarmAdapter.create(CHROME_ALARM_ENUM.CHECK_FOCUS_END, { periodInMinutes: 1 });

    return { success: true };
  }

  async stopFocus(): Promise<FocusOperationResult> {
    const current = await StorageAdapter.getCurrentPeriod();

    if (!current || !current.isFocused) {
      return { success: true };
    }

    const endTime = new Date();

    if (current.sessionStartTime) {
      const newFocusedTime: IFocus.FocusedTime = {
        id: Date.now().toString(),
        periodId: current.id,
        startFrom: current.sessionStartTime,
        endTo: endTime,
      };
      current.focusedTimes = [...(current.focusedTimes || []), newFocusedTime];
    }

    current.isFocused = false;
    current.sessionStartTime = null;
    await StorageAdapter.savePeriod(current);
    await StorageAdapter.saveCurrentPeriod(current);

    this.#blocker.clearRules();
    ExtensionIconAdapter.setIcon(false);
    await UserDataSyncAdapter.syncPeriodsToBackend();

    return { success: true };
  }

  async toggleFocus(): Promise<FocusOperationResult> {
    const current = await StorageAdapter.getCurrentPeriod();
    if (!current) return { success: true };
    if (current.isFocused) return this.stopFocus();
    return this.startFocus(current);
  }

  async toggleQuickFocus(url: string): Promise<FocusOperationResult> {
    const current = await StorageAdapter.getCurrentPeriod();
    if (current && current.id === QUICK_FOCUS_ID && current.isFocused) {
      return this.stopFocus();
    }
    return this.startQuickFocus(url);
  }

  async startQuickFocus(url: string): Promise<FocusOperationResult> {
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    const quickPeriod: IFocus.Period = {
      id: QUICK_FOCUS_ID,
      name: `Focus: ${domain}`,
      description: 'Quick focus session',
      startFrom: new Date(),
      endTo: null,
      isFocused: true,
      focusedTimes: [],
      blockBehaviour: BLOCK_BEHAVIOUR_ENUM.BLOCK,
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
    return this.startFocus(quickPeriod);
  }
}
