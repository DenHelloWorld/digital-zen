import {DzToastService} from './toast.service';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MESSAGE_TYPE_ENUM, POSITIONS_ENUM} from '../../enums';

@Component({
  selector: 'dz-toast-container',
  styleUrls: ['./toast-container.scss'],
  templateUrl: './toast-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DzToastContainerComponent {
  protected toastService: DzToastService = inject(DzToastService);

  protected positions: POSITIONS_ENUM[] = [
    POSITIONS_ENUM.BOTTOM_CENTER,
    POSITIONS_ENUM.BOTTOM_RIGHT,
    POSITIONS_ENUM.BOTTOM_LEFT,
    POSITIONS_ENUM.TOP_CENTER,
    POSITIONS_ENUM.TOP_RIGHT,
    POSITIONS_ENUM.TOP_LEFT,
  ];

  protected messageTypes: typeof MESSAGE_TYPE_ENUM = MESSAGE_TYPE_ENUM

  protected getToastsByPosition(pos: POSITIONS_ENUM) {
    return this.toastService.toasts().filter(t => t.position === pos);
  }
}
