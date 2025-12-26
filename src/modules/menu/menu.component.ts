import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { AddPeriodFormComponent } from './components/add-period-form';

@Component({
  selector: 'dz-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [AddPeriodFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  protected isAddPeriodFormShow: WritableSignal<boolean> = signal(false);
  protected onAddClick(): void {
    this.isAddPeriodFormShow.set(true);
  }
}
