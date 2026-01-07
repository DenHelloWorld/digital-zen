import { DzToastService } from './toast.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TOAST_TYPE_ENUM, POSITIONS_ENUM } from '../../enums';
import { UI_TEXT } from '../../constants';

/**
 * Toast notification container component
 * Manages and displays toast notifications in various positions
 * 
 * @guidelines
 * - DZ_01: Standalone component
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_10: UI text constants usage
 * 
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-toast-container',
  styleUrls: ['./toast-container.scss'],
  templateUrl: './toast-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DzToastContainerComponent {
  /** @guideline DZ_02 - Dependency injection with inject() */
  protected toastService: DzToastService = inject(DzToastService);

  protected positions: POSITIONS_ENUM[] = [
    POSITIONS_ENUM.BOTTOM_CENTER,
    POSITIONS_ENUM.BOTTOM_RIGHT,
    POSITIONS_ENUM.BOTTOM_LEFT,
    POSITIONS_ENUM.TOP_CENTER,
    POSITIONS_ENUM.TOP_RIGHT,
    POSITIONS_ENUM.TOP_LEFT,
  ];

  protected messageTypes: typeof TOAST_TYPE_ENUM = TOAST_TYPE_ENUM;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;

  protected getToastsByPosition(pos: POSITIONS_ENUM) {
    return this.toastService.toasts().filter(t => t.position === pos);
  }
}
