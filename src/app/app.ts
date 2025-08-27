import {ChangeDetectionStrategy, Component, inject, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {COLOR_SCHEMA_ENUM, ColorSchemaType, ThemeService, ThemeSwitcherComponent} from '../modules/common';

@Component({
  selector: 'dz-app',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    // components
    ThemeSwitcherComponent
  ],
})
export class App {
  readonly #themeService: ThemeService = inject(ThemeService);

  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;

  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
}
