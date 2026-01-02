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
} from '../common';
import { PeriodComponent } from './components/period/period.component';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  imports: [
    // components
    PeriodComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FocusComponent {
  readonly #focusService: FocusService = inject(FocusService);

  protected readonly activeTab: Signal<chrome.tabs.Tab | undefined> = this.#focusService.activeTab;
  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  protected readonly periods: Signal<IFocus.Period[] | null> = this.#focusService.periods;
  protected readonly periodsCount: Signal<number> = computed(() => this.periods()?.length ?? 0);
  protected readonly focusElapsedTimeFormatted: Signal<string> =
    this.#focusService.focusElapsedTimeFormatted;
  protected readonly isFocusActive: Signal<boolean> = computed(
    () => this.currentPeriod()?.isFocused ?? false
  );
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

  protected readonly isSvgIcon: (url: string | null | undefined) => boolean = isSvgIcon;
  protected readonly isImageIcon: (url: string | null | undefined) => boolean = isImageIcon;
  protected readonly isHttpUrl: (url: string | null | undefined) => boolean = isHttpUrl;
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
