import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { IFocus } from '../../../common/models';
import { ALL_DAYS_OF_WEEK } from '../../../common';
import { TimeLineComponent } from '../time-line/time-line.component';
import { WeekdaysSelectorComponent } from '../../../common/components/weekdays-selector/weekdays-selector.component';
import { PeriodFormComponent } from '../../../menu/components/period-form';
import { FocusService } from '../../services';

@Component({
  selector: 'dz-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // components
    TimeLineComponent,
    WeekdaysSelectorComponent,
    PeriodFormComponent,
  ],
})
export class PeriodComponent {
  readonly #focusService: FocusService = inject(FocusService);

  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];
  protected readonly selectedDays: Signal<IFocus.DayOfWeek[]> = computed(() => {
    const selected = this.period().daysOfWeek;
    return this.allDays.filter(day => selected.includes(day.day));
  });

  protected readonly isEditing: WritableSignal<boolean> = signal(false);

  public readonly period: InputSignal<IFocus.Period> = input.required<IFocus.Period>();

  public readonly toggleBlockedWebsite: OutputEmitterRef<IFocus.WebSite> = output<IFocus.WebSite>();

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.toggleBlockedWebsite.emit(site);
  }

  protected onEdit(): void {
    this.isEditing.set(true);
  }

  protected onCancelEdit(): void {
    this.isEditing.set(false);
  }

  protected onDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.period().name}"?`)) {
      this.#focusService.removePeriod(this.period().id);
    }
  }
}
