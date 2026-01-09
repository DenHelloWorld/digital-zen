import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FocusService } from './services';
import {
  LoaderComponent,
  ICONS,
  IFocus,
  isImageIcon,
  isHttpUrl,
  isSvgIcon,
  UI_TEXT,
  CleanUrlPipe,
  cleanUrlHelper,
  WEBSITES_UNBLOCKABLE,
} from '../common';
import { PeriodComponent } from './components/period/period.component';

/**
 * Focus management component
 * Main component for managing focus sessions and periods
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals for reactive state (signal, computed)
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_10: UI text constants usage
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  imports: [
    // pipes
    CleanUrlPipe,
    // components
    PeriodComponent,
    LoaderComponent,
  ],
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
    () => this.currentPeriod()?.isFocused ?? false
  );
  /** @guideline DZ_04 - Computed signal (derived state) */
  protected readonly displayedPeriods: Signal<IFocus.Period[]> = computed(() => {
    const current = this.currentPeriod();
    const all = this.periods();

    if (!all || all.length === 0) {
      return [];
    }

    // When focus is active, show only the current period
    if (current?.isFocused) {
      return [current];
    }

    // When focus is inactive, show current period first, then others
    if (current) {
      const others = all.filter(p => p.id !== current.id);
      return [current, ...others];
    }

    return all;
  });

  /** @guideline DZ_04 - Computed signal to check if current tab is unblockable */
  protected readonly isCurrentTabUnblockable: Signal<boolean> = computed(() => {
    const tab = this.activeTab();
    if (!tab?.url) {
      return false;
    }

    const cleanedUrl = cleanUrlHelper(tab.url);
    return WEBSITES_UNBLOCKABLE.some(site => cleanUrlHelper(site.url) === cleanedUrl);
  });

  protected readonly isSvgIcon: (url: string | null | undefined) => boolean = isSvgIcon;
  protected readonly isImageIcon: (url: string | null | undefined) => boolean = isImageIcon;
  protected readonly isHttpUrl: (url: string | null | undefined) => boolean = isHttpUrl;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected toggleFocus(): void {
    this.#focusService.toggleFocus();
  }

  protected addCurrentTabToPeriod(): void {
    this.#focusService.addCurrentTabToPeriod();
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }

  protected isPeriodCurrent(period: IFocus.Period): boolean {
    return this.currentPeriod()?.id === period.id;
  }
}
