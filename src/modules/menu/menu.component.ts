import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { PeriodFormComponent } from './components/period-form';
import { ICONS, UI_TEXT } from '../common';

@Component({
  selector: 'dz-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [PeriodFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  protected isAddPeriodFormShow: WritableSignal<boolean> = signal(false);
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected onAddClick(): void {
    this.isAddPeriodFormShow.set(true);
  }

  protected onFormCompleted(): void {
    this.isAddPeriodFormShow.set(false);
  }
}
