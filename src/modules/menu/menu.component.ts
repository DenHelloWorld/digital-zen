import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  imports: [
    // angular modules
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
}
