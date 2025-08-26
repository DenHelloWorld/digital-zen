import {Component, inject, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {COLOR_SCHEMA_ENUM, ColorSchemaType, ThemeService, ThemeSwitcherComponent} from '../modules/common';

@Component({
  selector: 'app',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
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
