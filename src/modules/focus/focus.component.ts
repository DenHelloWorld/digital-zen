import {ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal} from '@angular/core';
import {FocusService} from './services';
import {IFocus} from '../common/models';
import {WEBSITES_SOCIAL_MEDIA} from '../common';
import {PeriodComponent} from './components/period/period.component';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  imports: [
    PeriodComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocusComponent implements OnInit {
  #focusService: FocusService = inject(FocusService);

  protected readonly isFocused: Signal<boolean> = this.#focusService.isFocused;
  protected readonly focuses: Signal<IFocus.Base[]> = this.#focusService.entities;
  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  protected readonly periods: Signal<IFocus.Period[] | null> = this.#focusService.periods;
  protected readonly blockedUrls: Signal<string[]> = computed(() => this.#focusService.allBlockedSites()?.map(s => s.url) ?? []);


  protected readonly defaultWebsites: readonly IFocus.BlockedWebSite[] = WEBSITES_SOCIAL_MEDIA;
  protected readonly websiteTypes: typeof IFocus.EWebSiteType = IFocus.EWebSiteType;

  public ngOnInit(): void {
    const dummyPeriod: IFocus.Period = {
      id: 'dummy-period-123',
      name: 'Test Focus Period',
      description: 'A temporary period for testing.',
      startFrom: new Date(),
      endTo: new Date(Date.now() + 10 * 60 * 1000), // ✅ 10 минут
      blockedSites: [],
    };

    setTimeout(() => {
      this.#focusService.add({
        id: 'dummy-base-123',
        name: 'Test Focus Base',
        description: '',
        periods: [dummyPeriod],
      });
    }, 1000);
  }

  protected toggleFocus(): void {
    if(this.isFocused()){
      this.stopFocus();
    } else {
      this.startTestFocus();
    }
  }

  protected startTestFocus(): void {
    this.#focusService.startFocus('dummy-period-123');
  }

  protected stopFocus(): void {
    this.#focusService.stopFocus();
  }

  protected onWebsiteChange(site: IFocus.BlockedWebSite): void {
    // TODO: что-то не то при тогле, при перезапуске
    this.#focusService.toggleBlockedWebsite(site);
  }
}
