import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FocusService } from './services';
import { LoaderComponent, IFocus, isImageIcon, isHttpUrl, isSvgIcon } from '../common';
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

  protected readonly isSvgIcon: (url: string | null | undefined) => boolean = isSvgIcon;
  protected readonly isImageIcon: (url: string | null | undefined) => boolean = isImageIcon;
  protected readonly isHttpUrl: (url: string | null | undefined) => boolean = isHttpUrl;

  protected toggleFocus(): void {
    this.#focusService.toggleFocus();
  }

  protected toggleQuickFocus(): void {
    this.#focusService.toggleQuickFocus();
  }

  protected addCurrentTabToPeriod(): void {
    this.#focusService.addCurrentTabToPeriod();
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }
}
