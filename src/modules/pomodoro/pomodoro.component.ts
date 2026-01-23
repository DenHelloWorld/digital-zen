import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICONS, UI_TEXT } from '../common';
import { ProgressBorderDirective } from '../common/directives/progress-border.directive';

/**
 * Pomodoro timer component
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_10: UI text constants usage
 * - DZ_12: SCSS по БЭМ
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-pomodoro',
  templateUrl: './pomodoro.component.html',
  styleUrls: ['./pomodoro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // angular modules
    CommonModule,
    // directives
    ProgressBorderDirective,
  ],
})
export class PomodoroComponent {
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
}
