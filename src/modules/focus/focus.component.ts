import { DzToastContainerComponent } from '../common/components';
import { SwitchComponent } from '../common/components/switch/switch.component';
import { WeekdaysSelectorComponent } from '../common/components/weekdays-selector/weekdays-selector.component';
import { ALL_DAYS_OF_WEEK } from '../common/constants/days-of-week.const';
import { ICONS } from '../common/constants/icons.const';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { ALL_PRESET_WEBSITES, WEBSITES_UNBLOCKABLE } from '../common/constants/websites.const';
import { PopupDirective } from '../common/directives/popup.directive';
import { ProgressBorderDirective } from '../common/directives/progress-border.directive';
import { BLOCK_BEHAVIOUR_ENUM } from '../common/enums/block-behaviour.enum';
import { COLORS_ENUM } from '../common/enums/colors.enum';
import { VIEW_ENUM, ViewType } from '../common/enums/view.enum';
import { cleanProtocolHelper } from '../common/helpers/clean-protocol.helper';
import { cleanUrlHelper } from '../common/helpers/clean-url.helper';
import { FaviconHelper } from '../common/helpers/favicon.helper';
import { isHttpUrl } from '../common/helpers/is-http-url.helper';
import { isImageIcon } from '../common/helpers/is-image-icon.helper';
import { isSvgIcon } from '../common/helpers/is-svg-icon.helper';
import { IFocus } from '../common/models/focus.model';
import { MiniRouterService } from '../common/services/mini-router.service';
import { FocusService } from './services/focus.service';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  Signal,
} from '@angular/core';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  imports: [
    // angular modules
    CommonModule,
    // components
    WeekdaysSelectorComponent,
    SwitchComponent,
    DzToastContainerComponent,
    // directives
    ProgressBorderDirective,
    PopupDirective,
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
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly progress: Signal<number> = this.#focusService.progress;

  protected readonly websitesPopupData = computed(() => {
    const currentWebsites = this.currentPeriodWebSites();

    return {
      ...this.#mapWebsitesToCategories(currentWebsites),
      [IFocus.EWebSiteType.FROM_CURRENT_PERIOD]: currentWebsites,
    };
  });
  protected readonly openedFolders = signal<Set<IFocus.IWebSiteType>>(
    new Set(Object.values(IFocus.EWebSiteType))
  );

  protected readonly isFocusActive: Signal<boolean> = computed(
    () => this.currentPeriod()?.isActive ?? false
  );
  protected readonly currentPeriodWebSites: Signal<IFocus.WebSite[]> = computed(
    () => this.currentPeriod()?.webSites ?? []
  );
  protected readonly selectedDays: Signal<IFocus.DayOfWeek[]> = computed(() => {
    const selected = this.currentPeriod()?.daysOfWeek;
    return [...ALL_DAYS_OF_WEEK].filter(day => selected?.includes(day.day));
  });

  protected readonly isWebsitesPopupShown = signal<boolean>(false);
  protected readonly isCurrentTabInCurrentPeriod: Signal<boolean> =
    this.#focusService.isCurrentTabInCurrentPeriod;
  protected readonly isPeriodCurrentlyApplicable: Signal<boolean> =
    this.#focusService.isPeriodCurrentlyApplicable;
  protected readonly isCurrentTabUnblockable: Signal<boolean> = computed(() => {
    const tab = this.activeTab();
    if (!tab?.url) {
      return false;
    }

    const cleanedUrl = cleanUrlHelper(tab.url);
    return WEBSITES_UNBLOCKABLE.some(site => cleanUrlHelper(site.url) === cleanedUrl);
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

  protected readonly status = computed(() => {
    const period = this.currentPeriod();

    if (!period?.isActive) {
      return 'Idle';
    }

    switch (period.blockBehaviour) {
      case BLOCK_BEHAVIOUR_ENUM.WHITELIST:
        return 'Focus';
      case BLOCK_BEHAVIOUR_ENUM.BLOCK:
        return 'Block';
      case BLOCK_BEHAVIOUR_ENUM.WARN:
        return 'Warn';
      default:
        return 'Idle';
    }
  });

  protected readonly cleanProtocolHelper = cleanProtocolHelper;
  protected readonly isSvgIcon: (url: string | null | undefined) => boolean = isSvgIcon;
  protected readonly isImageIcon: (url: string | null | undefined) => boolean = isImageIcon;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly colors = COLORS_ENUM;
  protected readonly viewTypes = VIEW_ENUM;
  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];
  protected readonly websiteTypes = Object.values(IFocus.EWebSiteType).filter(
    type => type !== IFocus.EWebSiteType.DEFAULT && type !== IFocus.EWebSiteType.UNBLOCKABLE
  );

  protected onToggleFocus(): void {
    this.#focusService.toggleFocus();
  }

  protected onBlockCurrentTab(): void {
    this.#focusService.addCurrentTabToPeriod(true);
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }

  protected onEditCurrentPeriod(): void {
    this.onNavigation(VIEW_ENUM.EDIT_PERIOD, { period: this.currentPeriod() });
  }

  protected onAddPeriod(): void {
    this.onNavigation(VIEW_ENUM.ADD_PERIOD);
  }

  protected onOpenWebsitesList(): void {
    this.isWebsitesPopupShown.set(true);
  }

  protected onCloseWebsitesList(): void {
    this.isWebsitesPopupShown.set(false);
  }

  protected onNavigation(route: ViewType, payload: object | null = null): void {
    this.#router.navigate(route, payload);
  }

  protected getFavicon(url: string): string {
    return FaviconHelper.getGoogleUrl(url);
  }

  protected toggleFolder(type: IFocus.IWebSiteType): void {
    this.openedFolders.update(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }

  protected isFolderOpen(type: IFocus.IWebSiteType): boolean {
    return this.openedFolders().has(type);
  }

  #mapWebsitesToCategories(
    activeWebsites: IFocus.WebSite[]
  ): Record<IFocus.IWebSiteType, IFocus.WebSite[]> {
    const activeUrls = new Set(activeWebsites.filter(s => s.isActivated).map(s => s.url));

    const result = {} as Record<IFocus.IWebSiteType, IFocus.WebSite[]>;

    for (const key in ALL_PRESET_WEBSITES) {
      const category = key as IFocus.IWebSiteType;

      result[category] = ALL_PRESET_WEBSITES[category].map(site => ({
        ...site,
        isActivated: activeUrls.has(site.url),
      }));
    }

    return result;
  }
}
