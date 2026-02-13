import { SwitchComponent } from '../common/components/switch/switch.component';
import { WeekdaysSelectorComponent } from '../common/components/weekdays-selector/weekdays-selector.component';
import { ALL_DAYS_OF_WEEK } from '../common/constants/days-of-week.const';
import { ICONS } from '../common/constants/icons.const';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { WEBSITES_UNACTIVATABLE } from '../common/constants/websites.const';
import { ProgressBorderDirective } from '../common/directives/progress-border.directive';
import { BLOCK_BEHAVIOUR_ENUM } from '../common/enums/block-behaviour.enum';
import { COLORS_ENUM } from '../common/enums/colors.enum';
import { VIEW_ENUM } from '../common/enums/view.enum';
import { cleanUrlHelper } from '../common/helpers/clean-url.helper';
import { isHttpUrl } from '../common/helpers/is-http-url.helper';
import { isImageIcon } from '../common/helpers/is-image-icon.helper';
import { isSvgIcon } from '../common/helpers/is-svg-icon.helper';
import { IFocus } from '../common/models/focus.model';
import { MiniRouterService } from '../common/services/mini-router.service';
import { FocusService } from './services/focus.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  imports: [
    // angular modules
    CommonModule,
    // components
    ProgressBorderDirective,
    WeekdaysSelectorComponent,
    SwitchComponent,
  ],
  host: {
    class: 'dz-focus',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusComponent {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #focusService: FocusService = inject(FocusService);
  readonly #router = inject(MiniRouterService);

  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly activeTab: Signal<chrome.tabs.Tab | undefined> = this.#focusService.activeTab;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly periods: Signal<IFocus.Period[] | null> = this.#focusService.periods;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly focusElapsedTimeFormatted: Signal<string> =
    this.#focusService.focusElapsedTimeFormatted;
  /** @guideline DZ_04 - Computed signal (derived state) */
  // TODO: add progress signal for dzProgressBorder ( 1 - endsTo, 0  - startsFrom, currentValue - now )
  protected readonly isFocusActive: Signal<boolean> = computed(
    () => this.currentPeriod()?.isActive ?? false
  );
  protected readonly selectedDays: Signal<IFocus.DayOfWeek[]> = computed(() => {
    const selected = this.currentPeriod()?.daysOfWeek;
    return [...ALL_DAYS_OF_WEEK].filter(day => selected?.includes(day.day));
  });
  protected readonly isCurrentTabInCurrentPeriod = this.#focusService.isCurrentTabInCurrentPeriod;
  /** @guideline DZ_04 - Computed signal (derived state) */
  // TODO: remove
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

  protected readonly statusIcon = computed(() => {
    const period = this.currentPeriod();

    if (!period?.isActive) {
      return this.icons.MOON;
    }

    switch (period.blockBehaviour) {
      case BLOCK_BEHAVIOUR_ENUM.WHITELIST:
        return this.icons.PERSON_ZEN;
      case BLOCK_BEHAVIOUR_ENUM.BLOCK:
        return this.icons.BLOCK;
      case BLOCK_BEHAVIOUR_ENUM.WARN:
        return this.icons.WARNING;
      default:
        return this.icons.MOON;
    }
  });

  protected readonly isSvgIcon: (url: string | null | undefined) => boolean = isSvgIcon;
  protected readonly isImageIcon: (url: string | null | undefined) => boolean = isImageIcon;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly colors = COLORS_ENUM;
  protected readonly blockBehaviours = BLOCK_BEHAVIOUR_ENUM;

  protected toggleFocus(): void {
    this.#focusService.toggleFocus();
  }

  protected blockCurrentTab(): void {
    this.#focusService.addCurrentTabToPeriod(true);
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }

  protected onEditCurrentPeriod(): void {
    this.#router.navigate(VIEW_ENUM.EDIT_PERIOD, this.currentPeriod());
  }

  protected onAddPeriod(): void {
    this.#router.navigate(VIEW_ENUM.ADD_PERIOD);
  }

  protected onOpenWebsitesList(): void {
    console.debug('onOpenWebsitesList');
  }
}
