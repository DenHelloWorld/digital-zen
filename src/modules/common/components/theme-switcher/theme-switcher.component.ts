import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { ThemeService } from '../../services';
import { COLOR_SCHEMA_ENUM, ColorSchemaType } from '../../enums';
import { UI_TEXT } from '../../constants';

@Component({
  selector: 'dz-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  readonly #themeService: ThemeService = inject(ThemeService);

  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;
  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
  protected readonly uiText = UI_TEXT;

  protected toggleTheme(): void {
    this.#themeService.toggle();
  }
}
