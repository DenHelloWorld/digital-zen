import {ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal} from '@angular/core';
import {FocusService} from './services';
import {IFocus} from '../common/models';
import {DayOfWeekType, LoaderComponent, WEBSITES_SOCIAL_MEDIA, WORK_DAYS_OF_WEEK} from '../common';
import {PeriodComponent} from './components/period/period.component';

@Component({
  selector: 'dz-focus',
  templateUrl: './focus.component.html',
  styleUrls: ['./focus.component.scss'],
  imports: [
    PeriodComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocusComponent implements OnInit {
  #focusService: FocusService = inject(FocusService);

  protected readonly isFocused: Signal<boolean> = this.#focusService.isFocused;
  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  protected readonly periods: Signal<IFocus.Period[] | null> = this.#focusService.periods;
  protected readonly blockedUrls: Signal<string[]> = computed(() => this.#focusService.allBlockedSites()?.map(s => s.url) ?? []);

  protected readonly defaultWebsites: readonly IFocus.BlockedWebSite[] = WEBSITES_SOCIAL_MEDIA;
  protected readonly defaultDaysOfWeek: readonly DayOfWeekType[] = WORK_DAYS_OF_WEEK;
  protected readonly websiteTypes: typeof IFocus.EWebSiteType = IFocus.EWebSiteType;

  public ngOnInit(): void {
    const workHoursPeriod: IFocus.Period = {
      id: 'work-social-block',
      name: 'Work Hours Social Media Block',
      description: 'Disables access to social media from 09:00 to 18:00 on weekdays.',
      startFrom: new Date(new Date().setHours(9, 0, 0, 0)),
      endTo: new Date(new Date().setHours(18, 0, 0, 0)),
      blockedSites: [...this.defaultWebsites],
      daysOfWeek: [...this.defaultDaysOfWeek],
    };

    setTimeout(() => {
      this.#focusService.addPeriod(workHoursPeriod);
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
    this.#focusService.startFocus();
  }

  protected stopFocus(): void {
    this.#focusService.stopFocus();
  }

  protected onToggleBlockedWebsite(site: IFocus.BlockedWebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }
}
