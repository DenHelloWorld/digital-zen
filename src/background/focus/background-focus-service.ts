import { ALARM_PERIOD_IN_MINUTES } from '../../modules/common/constants/alarm-period-in-minutes.const';
import { CHROME_ALARM_ENUM } from '../../modules/common/enums/chrome-alarm-name.enum';
import { FOCUS_ERROR_ENUM } from '../../modules/common/enums/focus-error.enum';
import { filterBlockableWebsites } from '../../modules/common/helpers/filter-blockable-websites.helper';
import { isCurrentTimeInRange } from '../../modules/common/helpers/time.helper';
import { IFocus } from '../../modules/common/models/focus.model';
import { AlarmAdapter } from '../common/alarm-adapter';
import { ExtensionIconAdapter } from '../common/extension-icon-adapter';
import { StorageAdapter } from '../common/storage-adapter';
import { UserDataSyncAdapter } from '../common/user-data-sync-adapter';
import { BlockerService } from './blocker-service';

export type FocusOperationResult = { success: true } | { success: false; error: FOCUS_ERROR_ENUM };

export class BackgroundFocusService {
  readonly #blocker = new BlockerService();

  async updateBlockRulesForCurrentPeriod(): Promise<void> {
    const current = await StorageAdapter.getCurrentPeriod();
    if (current && current.webSites) {
      const blockableWebsites = filterBlockableWebsites(current.webSites);
      this.#blocker.updateBlockRulesWithBehaviour(
        blockableWebsites.filter(site => site.isActivated).map(site => site.url),
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

    period.isActive = true;
    period.sessionStartTime = now;

    await StorageAdapter.saveCurrentPeriod(period);
    await StorageAdapter.savePeriod(period);

    const blockableWebsites = filterBlockableWebsites(period.webSites);
    this.#blocker.updateBlockRulesWithBehaviour(
      blockableWebsites.filter(site => site.isActivated).map(site => site.url),
      period.blockBehaviour
    );
    ExtensionIconAdapter.setIcon(true);
    AlarmAdapter.create(CHROME_ALARM_ENUM.CHECK_FOCUS_END, {
      periodInMinutes: ALARM_PERIOD_IN_MINUTES,
    });

    return { success: true };
  }

  async stopFocus(): Promise<FocusOperationResult> {
    const current = await StorageAdapter.getCurrentPeriod();

    if (!current || !current.isActive) {
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

    current.isActive = false;
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
    if (current.isActive) return this.stopFocus();
    return this.startFocus(current);
  }

  async addNewFolderToLibrary(newFolder: string): Promise<void> {
    await StorageAdapter.addNewFolderToLibrary(newFolder);
  }

  async removeFolderFromLibrary(folder: string): Promise<void> {
    await StorageAdapter.removeFolderFromLibrary(folder);
  }

  async addWebsiteToFolder(folderName: string, website: IFocus.WebSite): Promise<void> {
    await StorageAdapter.addWebsiteToFolder(folderName, website);
  }

  async addWebsiteToSystem(
    folderName: string,
    website: IFocus.WebSite,
    periodId: string
  ): Promise<void> {
    await StorageAdapter.addWebsiteToSystem(folderName, website, periodId);
  }

  async removeWebsiteFromFolder(folderName: string, websiteUrl: string): Promise<void> {
    await StorageAdapter.removeWebsiteFromFolder(folderName, websiteUrl);
  }
}
