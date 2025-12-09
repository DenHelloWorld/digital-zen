import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject, Injector,
  OnInit,
  runInInjectionContext,
  Signal
} from '@angular/core';
import {FocusService} from './services';
import {IFocus} from '../common/models';
import {
  ALL_DAYS_OF_WEEK_DAYS,
  DayOfWeekType,
  LoaderComponent,
  WEBSITES_SOCIAL_MEDIA,
} from '../common';
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
  readonly #focusService: FocusService = inject(FocusService);
  readonly #injector = inject(Injector);

  protected readonly currentPeriod: Signal<IFocus.Period | null> = this.#focusService.currentPeriod;
  protected readonly periods: Signal<IFocus.Period[] | null> = this.#focusService.periods;

  protected readonly defaultWebsites: IFocus.WebSite[] = [...WEBSITES_SOCIAL_MEDIA];
  protected readonly defaultDaysOfWeek: DayOfWeekType[] = [...ALL_DAYS_OF_WEEK_DAYS];

  public ngOnInit(): void {
    this.#launchDefaultPeriod();
  }

  protected toggleFocus(): void {
    if(this.currentPeriod()?.isFocused){
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

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.#focusService.toggleBlockedWebsite(site);
  }

  #launchDefaultPeriod(): void {
    const workHoursPeriod: IFocus.Period = {
      id: 'work-social-block',
      name: 'Work Hours Social Media Block',
      description: 'Disables access to social media 24/7.',
      startFrom: new Date(new Date().setHours(0, 0, 0, 0)),
      endTo: new Date(new Date().setHours(23, 59, 59, 999)),
      webSites: this.defaultWebsites,
      daysOfWeek: this.defaultDaysOfWeek,
      focusedTimes: [],
      isFocused: false,
    };

    runInInjectionContext(this.#injector, () => {
      effect(() => {
        const currentPeriods = this.periods();

        if (currentPeriods !== null) {
          const exists = currentPeriods.some(p => p.id === workHoursPeriod.id);

          if (!exists) {
            this.#focusService.addPeriod(workHoursPeriod);
          }
        }
      });
    });
  }
}
