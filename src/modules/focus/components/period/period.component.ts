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
import { ALL_DAYS_OF_WEEK, IFocus, UI_TEXT } from '../../../common';
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
  protected readonly isConfirmingDelete: WritableSignal<boolean> = signal(false);
  protected readonly uiText = UI_TEXT;

  public readonly period: InputSignal<IFocus.Period> = input.required<IFocus.Period>();
  public readonly totalPeriodsCount: InputSignal<number> = input.required<number>();

  public readonly toggleBlockedWebsite: OutputEmitterRef<IFocus.WebSite> = output<IFocus.WebSite>();

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.toggleBlockedWebsite.emit(site);
  }

  protected onEdit(): void {
    this.isEditing.set(true);
  }

  protected onFormCompleted(): void {
    this.isEditing.set(false);
  }

  protected onDelete(): void {
    this.isConfirmingDelete.set(true);
  }

  protected onConfirmDelete(): void {
    this.#focusService.removePeriod(this.period().id);
    this.isConfirmingDelete.set(false);
  }

  protected onCancelDelete(): void {
    this.isConfirmingDelete.set(false);
  }
}
