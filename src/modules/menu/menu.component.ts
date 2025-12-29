import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { PeriodFormComponent } from './components/period-form';

@Component({
  selector: 'dz-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [PeriodFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  protected isAddPeriodFormShow: WritableSignal<boolean> = signal(false);

  protected onAddClick(): void {
    this.isAddPeriodFormShow.set(true);
  }

  protected onFormCompleted(): void {
    this.isAddPeriodFormShow.set(false);
  }
}
