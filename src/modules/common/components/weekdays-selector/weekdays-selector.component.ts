import {ChangeDetectionStrategy, Component, model, ModelSignal} from '@angular/core';
import {IFocus} from '../../models';
import {ALL_DAYS_OF_WEEK} from '../../costants';
import {MultiSelectorComponent} from '../multi-selector/multi-selector.component';

@Component({
  selector: "dz-weekdays-selector",
  templateUrl: "./weekdays-selector.component.html",
  styleUrls: ["./weekdays-selector.component.scss"],
  imports: [
    MultiSelectorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekdaysSelectorComponent {
  protected readonly idKey: keyof IFocus.DayOfWeek  = 'day';
  protected readonly labelKey: keyof IFocus.DayOfWeek  = 'name';
  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];

  public readonly selectedDays: ModelSignal<IFocus.DayOfWeek[] | undefined> = model<IFocus.DayOfWeek[]>();
}
