import { ICONS } from '../../constants/icons.const';
import { UI_TEXT } from '../../constants/ui-text.const';
import { POSITIONS_ENUM } from '../../enums/positions.enum';
import { TOAST_TYPE_ENUM } from '../../enums/toast-type.enum';
import { DzToastService } from './toast.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

/**
 * Toast notification container component
 * Manages and displays toast notifications in various positions
 * Uses dz-banner styles for consistent message display
 *
 * @guidelines
 * - DZ_01: Standalone component
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_10: UI text constants usage
 * - DZ_10.1: Icon constants usage
 * - DZ_20: Banner styles usage for toast notifications
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-toast-container',
  styleUrls: ['./toast-container.scss'],
  templateUrl: './toast-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // angular modules
    CommonModule,
  ],
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
  /** @guideline DZ_10.1 - Icon constants */
  protected readonly icons = ICONS;

  protected getToastsByPosition(pos: POSITIONS_ENUM) {
    return this.toastService.toasts().filter(t => t.position === pos);
  }

  /**
   * Gets the appropriate icon based on toast type
   * @guideline DZ_20 - Icon mapping for banner message types
   */
  protected getToastIcon(type?: TOAST_TYPE_ENUM): string {
    switch (type) {
      case TOAST_TYPE_ENUM.INFO:
        return this.icons.INFO;
      case TOAST_TYPE_ENUM.SUCCESS:
        return this.icons.SUCCESS;
      case TOAST_TYPE_ENUM.WARN:
        return this.icons.WARNING;
      case TOAST_TYPE_ENUM.ERROR:
        return this.icons.ERROR;
      case TOAST_TYPE_ENUM.ACCENT:
        return this.icons.INFO;
      default:
        return this.icons.INFO;
    }
  }
}
