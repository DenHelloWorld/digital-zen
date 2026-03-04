import { DzToastService } from '../common/components';
import { SwitchComponent } from '../common/components/switch/switch.component';
import { WeekdaysSelectorComponent } from '../common/components/weekdays-selector/weekdays-selector.component';
import { ALL_DAYS_OF_WEEK } from '../common/constants/days-of-week.const';
import { ICONS } from '../common/constants/icons.const';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { WEBSITES_LIBRARY_PRESET, WEBSITES_UNBLOCKABLE } from '../common/constants/websites.const';
import { PopupDirective } from '../common/directives/popup.directive';
import { ProgressBorderDirective } from '../common/directives/progress-border.directive';
import { BLOCK_BEHAVIOUR_ENUM } from '../common/enums/block-behaviour.enum';
import { COLORS_ENUM } from '../common/enums/colors.enum';
import { TOAST_MESSAGES_ENUM } from '../common/enums/toast-messages.enum';
import { TOAST_TYPE_ENUM } from '../common/enums/toast-type.enum';
import { VIEW_ENUM, ViewType } from '../common/enums/view.enum';
import { cleanUrlHelper } from '../common/helpers/clean-url.helper';
import { isHttpUrl } from '../common/helpers/is-http-url.helper';
import { isImageIcon } from '../common/helpers/is-image-icon.helper';
import { isSvgIcon } from '../common/helpers/is-svg-icon.helper';
import { IFocus } from '../common/models/focus.model';
import { MiniRouterService } from '../common/services/mini-router.service';
import { WebsitesLibraryComponent } from './components/websites-library/websites-library.component';
import { FocusService } from './services/focus.service';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';

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
    WebsitesLibraryComponent,
    // directives
    ProgressBorderDirective,
    PopupDirective,
  ],
  host: {
    class: 'dz-focus',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusComponent implements OnInit {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #injector = inject(Injector);
  readonly #destroyRef = inject(DestroyRef);
  readonly #focusService = inject(FocusService);
  readonly #router = inject(MiniRouterService);
  readonly #toastService = inject(DzToastService);

  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly activeTab: Signal<chrome.tabs.Tab | undefined> = this.#focusService.activeTab;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly currentPeriod = this.#focusService.currentPeriod;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly periods: Signal<IFocus.Period[] | null> = this.#focusService.periods;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly focusElapsedTimeFormatted: Signal<string> =
    this.#focusService.focusElapsedTimeFormatted;
  /** @guideline DZ_04 - Signals for reactive state */
  protected readonly progress: Signal<number> = this.#focusService.currentPeriodProgress;

  protected readonly isFocusActive: Signal<boolean> = computed(
    () => this.currentPeriod()?.isActive ?? false
  );

  protected readonly selectedDays: Signal<IFocus.DayOfWeek[]> = computed(() => {
    const selected = this.currentPeriod()?.daysOfWeek;
    return [...ALL_DAYS_OF_WEEK].filter(day => selected?.includes(day.day));
  });
  protected readonly currentPeriodFoldersToAdd = computed(() => {
    const lib = this.currentPeriod().library;
    const presetKeys = Object.keys(WEBSITES_LIBRARY_PRESET);
    const allKeys = Object.keys(lib);

    return [...presetKeys, ...allKeys.filter(k => !presetKeys.includes(k)).sort()].filter(
      k => k !== IFocus.EWebSiteType.UNBLOCKABLE && k !== IFocus.EWebSiteType.DELETE
    );
  });

  protected readonly popupPeriodData = signal<IFocus.Period>(this.currentPeriod());
  protected readonly isWebsitesPopupShown = signal<boolean>(false);
  protected readonly isFoldersPopupShown = signal<boolean>(false);
  protected readonly isCurrentTabInSystem: Signal<boolean> =
    this.#focusService.isCurrentTabInSystem;
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
  protected readonly activeWebsitesCount: Signal<number> = computed(() => {
    const library = this.currentPeriod()?.library;
    if (!library) return 0;

    return Object.values(library)
      .flat()
      .filter(site => site.isActivated).length;
  });
  protected readonly isTabButtonDisabled = computed(() => {
    return this.isCurrentTabUnblockable() || !isHttpUrl(this.activeTab()?.url);
  });

  protected readonly statusIcon = computed(() => {
    const period = this.currentPeriod();

    if (!period) {
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

    if (!period) {
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

  protected readonly isSvgIcon: (url: string | null | undefined) => boolean = isSvgIcon;
  protected readonly isImageIcon: (url: string | null | undefined) => boolean = isImageIcon;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly colors = COLORS_ENUM;
  protected readonly viewTypes = VIEW_ENUM;
  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];

  public ngOnInit(): void {
    toObservable(this.popupPeriodData, { injector: this.#injector })
      .pipe(
        filter(() => this.isWebsitesPopupShown()),
        filter(popupData => {
          const serviceData = this.#focusService.currentPeriod();
          return JSON.stringify(popupData) !== JSON.stringify(serviceData);
        }),
        debounceTime(400),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(updatedPeriod => {
        this.#focusService.updatePeriod(updatedPeriod);
      });
  }

  protected onToggleFocus(): void {
    this.#focusService.toggleFocus();
  }

  protected onEditCurrentPeriod(): void {
    this.onNavigation(VIEW_ENUM.EDIT_PERIOD, { period: this.currentPeriod() });
  }

  protected onAddPeriod(): void {
    this.onNavigation(VIEW_ENUM.ADD_PERIOD);
  }

  // Library popup
  protected onOpenWebsitesList(): void {
    const current = this.currentPeriod();
    if (current) {
      this.popupPeriodData.set(current);
    }

    this.isWebsitesPopupShown.set(true);
  }

  // Folders Popup
  protected onOpenFoldersPopup(): void {
    if (this.isCurrentTabInSystem()) {
      this.#toastService.show({
        message: TOAST_MESSAGES_ENUM.ALREADY_IN_LIBRARY,
        type: TOAST_TYPE_ENUM.WARN,
      });
      return;
    } else {
      this.isFoldersPopupShown.set(true);
    }
  }
  protected onCloseFoldersPopup(): void {
    this.isFoldersPopupShown.set(false);
  }
  protected onAddCurrentTab(folder: string): void {
    this.#focusService.addCurrentTabWebsiteToLibrary(true, folder);
    this.onCloseFoldersPopup();
  }

  protected onNavigation(route: ViewType, payload: object | null = null): void {
    this.#router.navigate(route, payload);
  }
}
