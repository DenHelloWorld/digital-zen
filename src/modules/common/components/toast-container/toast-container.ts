import { DzToastService } from './toast.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POSITIONS_ENUM } from '../../enums';

@Component({
  selector: 'dz-toast-container',
  styleUrls: ['./toast-container.scss'],
  templateUrl: './toast-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DzToastContainerComponent {
  protected toastService = inject(DzToastService);

  positions = [
    POSITIONS_ENUM.BOTTOM_CENTER,
    POSITIONS_ENUM.BOTTOM_RIGHT,
    POSITIONS_ENUM.BOTTOM_LEFT,
    POSITIONS_ENUM.TOP_CENTER,
    POSITIONS_ENUM.TOP_RIGHT,
    POSITIONS_ENUM.TOP_LEFT,
  ];

  protected getToastsByPosition(pos: POSITIONS_ENUM) {
    return this.toastService.toasts().filter(t => t.position === pos);
  }
}
