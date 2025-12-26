import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import { IFocus } from '../../../common/models';
import { ALL_DAYS_OF_WEEK } from '../../../common';
import { TimeLineComponent } from '../time-line/time-line.component';
import { WeekdaysSelectorComponent } from '../../../common/components/weekdays-selector/weekdays-selector.component';

@Component({
  selector: 'dz-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // components
    TimeLineComponent,
    WeekdaysSelectorComponent,
  ],
})
export class PeriodComponent {
  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];
  protected readonly selectedDays: Signal<IFocus.DayOfWeek[]> = computed(() => {
    const selected = this.period().daysOfWeek;
    return this.allDays.filter(day => selected.includes(day.day));
  });

  public readonly period: InputSignal<IFocus.Period> = input.required<IFocus.Period>();

  public readonly toggleBlockedWebsite: OutputEmitterRef<IFocus.WebSite> = output<IFocus.WebSite>();

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.toggleBlockedWebsite.emit(site);
  }
}
