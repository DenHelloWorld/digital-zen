import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { FocusService } from './services';
import { IFocus } from '../common/models';
import { LoaderComponent } from '../common';
import { PeriodComponent } from './components/period/period.component';
import { isImageIcon, isSvgIcon } from '../common/helpers';

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

  protected readonly isSvgIcon = isSvgIcon;
  protected readonly isImageIcon = isImageIcon;

  protected toggleFocus(): void {
    this.#focusService.toggleFocus();
  }

  protected toggleQuickFocus(): void {
    this.#focusService.toggleQuickFocus();
  }

  protected addCurrentTabToPeriod(): void {
    this.#focusService.addCurrentTabToPeriod();
  }

  protected stopFocus(): void {
    this.#focusService.stopFocus();
  }

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }
}
