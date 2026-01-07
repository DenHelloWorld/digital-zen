import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { PeriodFormComponent } from './components/period-form';
import { ICONS, UI_TEXT } from '../common';

/**
 * Menu component for adding new focus periods
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Writable signal for local state
 * - DZ_10: UI text constants usage
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [PeriodFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  /** @guideline DZ_04 - Writable signal for local state */
  protected isAddPeriodFormShow: WritableSignal<boolean> = signal(false);
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected onAddClick(): void {
    this.isAddPeriodFormShow.set(true);
  }

  protected onFormCompleted(): void {
    this.isAddPeriodFormShow.set(false);
  }
}
