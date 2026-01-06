import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ThemeService } from '../../services';
import { COLOR_SCHEMA_ENUM, ColorSchemaType } from '../../enums';
import { ICONS, UI_TEXT } from '../../constants';

/**
 * Theme switcher component for toggling between light and dark themes
 * 
 * @guidelines
 * - DZ_01: Standalone component
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals for reactive state
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_10: UI text constants usage
 * 
 * @see /docs/CODING_GUIDELINES.md
 */
@Component({
  selector: 'dz-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #themeService: ThemeService = inject(ThemeService);

  /** @guideline DZ_04 - Signal for reactive theme state */
  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;
  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected toggleTheme(): void {
    this.#themeService.toggle();
  }
}
