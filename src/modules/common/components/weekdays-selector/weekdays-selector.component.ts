import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  model,
  ModelSignal,
} from '@angular/core';
import { IFocus } from '../../models';
import { MultiSelectorComponent } from '../multi-selector/multi-selector.component';
import { ALL_DAYS_OF_WEEK } from '../../constants';

/**
 * Weekdays selector component for choosing days of the week
 * 
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Using Angular Signals (InputSignal, ModelSignal)
 * 
 * @see /docs/CODING_GUIDELINES.md
 */
@Component({
  selector: 'dz-weekdays-selector',
  templateUrl: './weekdays-selector.component.html',
  styleUrls: ['./weekdays-selector.component.scss'],
  imports: [MultiSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekdaysSelectorComponent {
  protected readonly idKey: keyof IFocus.DayOfWeek = 'day';
  protected readonly labelKey: keyof IFocus.DayOfWeek = 'name';
  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];
  protected readonly todayDayId: number = new Date().getDay();

  public readonly isSelectable: InputSignal<boolean> = input<boolean>(true);
  public readonly isTodayShow: InputSignal<boolean> = input<boolean>(true);
  public readonly selectedDays: ModelSignal<IFocus.DayOfWeek[] | undefined> =
    model<IFocus.DayOfWeek[]>();
}
