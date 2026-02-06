import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FocusService } from './services/focus.service';

import { PeriodComponent } from './components/period/period.component';
import { LoaderComponent } from '../common/components';
import { IFocus } from '../common/models/focus.model';
import { cleanUrlHelper } from '../common/helpers/clean-url.helper';
import { WEBSITES_UNACTIVATABLE } from '../common/constants/websites.const';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { ICONS } from '../common/constants/icons.const';
import { isImageIcon } from '../common/helpers/is-image-icon.helper';
import { isHttpUrl } from '../common/helpers/is-http-url.helper';
import { isSvgIcon } from '../common/helpers/is-svg-icon.helper';
import { DEFAULT_FOCUS_TIMER_CONFIG } from '../common/constants/default-focus-timer-config.const';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  imports: [
    // angular modules
    CommonModule,
    // components
    PeriodComponent,
    LoaderComponent,
  ],
  host: {
    class: 'dz-focus',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusComponent {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #focusService: FocusService = inject(FocusService);

  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly activeTab: Signal<chrome.tabs.Tab | undefined> = this.#focusService.activeTab;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly periods: Signal<IFocus.Period[] | null> = this.#focusService.periods;
  /** @guideline DZ_04 - Computed signal (derived state) */
  protected readonly periodsCount: Signal<number> = computed(() => this.periods()?.length ?? 0);
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly focusElapsedTimeFormatted: Signal<string> =
    this.#focusService.focusElapsedTimeFormatted;
  /** @guideline DZ_04 - Computed signal (derived state) */
  protected readonly isFocusActive: Signal<boolean> = computed(
    () => this.currentPeriod()?.isActive ?? false
  );
  protected readonly isCurrentTabInCurrentPeriod = this.#focusService.isCurrentTabInCurrentPeriod;
  /** @guideline DZ_04 - Computed signal (derived state) */
  protected readonly displayedPeriods: Signal<IFocus.Period[]> = computed(() => {
    const current = this.currentPeriod();
    const all = this.periods();

    if (!all || all.length === 0) {
      return [];
    }

    // When focus is active, show only the current period
    if (current?.isActive) {
      return [current];
    }

    // When focus is inactive, show current period first, then others
    if (current) {
      const others = all.filter(p => p.id !== current.id);
      return [current, ...others];
    }

    return all;
  });

  protected readonly isCurrentTabUnblockable: Signal<boolean> = computed(() => {
    const tab = this.activeTab();
    if (!tab?.url) {
      return false;
    }

    const cleanedUrl = cleanUrlHelper(tab.url);
    return WEBSITES_UNACTIVATABLE.some(site => cleanUrlHelper(site.url) === cleanedUrl);
  });

  protected readonly isTabButtonDisabled = computed(() => {
    return this.isCurrentTabUnblockable() || !isHttpUrl(this.activeTab()?.url);
  });
  protected timeLeftMin = computed(() => {
    return (this.currentPeriod()?.timeLeftSec ?? 0) * 60;
  });

  protected readonly isSvgIcon: (url: string | null | undefined) => boolean = isSvgIcon;
  protected readonly isImageIcon: (url: string | null | undefined) => boolean = isImageIcon;
  protected readonly isHttpUrl: (url: string | null | undefined) => boolean = isHttpUrl;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly focusTimerConfig = DEFAULT_FOCUS_TIMER_CONFIG;

  protected toggleFocus(): void {
    this.#focusService.toggleFocus();
  }

  protected blockCurrentTab(): void {
    this.#focusService.addCurrentTabToPeriod(true);
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }

  protected isPeriodCurrent(period: IFocus.Period): boolean {
    return this.currentPeriod()?.id === period.id;
  }
}
