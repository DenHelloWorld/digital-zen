import { IFocus } from '../../models/focus.model';
import { MultiSelectorDirective } from '../multi-selector/multi-selector.directive';
import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';

/**
 * Weekdays selector component for choosing days of the week
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Using Angular Signals (InputSignal, ModelSignal)
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-weekdays-selector',
  templateUrl: './weekdays-selector.component.html',
  styleUrls: ['./weekdays-selector.component.scss'],
  imports: [
    // components
    TitleCasePipe,
  ],
  hostDirectives: [
    {
      directive: MultiSelectorDirective,
      inputs: [
        'entities',
        'idKey',
        'readonlyKeys',
        'isSelectable',
        'isOnlySingleSelectable',
        'selectedEntities',
      ],
      outputs: ['selectedEntitiesChange'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekdaysSelectorComponent {
  protected readonly selection =
    inject<MultiSelectorDirective<IFocus.DayOfWeek>>(MultiSelectorDirective);

  protected readonly labelKey: keyof IFocus.DayOfWeek = 'name';
  protected readonly todayDayId: number = new Date().getDay();

  public readonly isTodayShow: InputSignal<boolean> = input<boolean>(true);

  protected isHighlighted(item: IFocus.DayOfWeek): boolean {
    const highlighted = this.isTodayShow() ? this.todayDayId : null;
    return highlighted != null && item[this.selection.idKey()] === this.todayDayId;
  }

  protected getLabel(item: IFocus.DayOfWeek): string {
    const label = item[this.labelKey];
    return typeof label === 'string' ? label : String(label);
  }
}
