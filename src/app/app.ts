import {ChangeDetectionStrategy, Component, inject, signal, Signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  COLOR_SCHEMA_ENUM,
  ColorSchemaType,
  ThemeService,
  ThemeSwitcherComponent,
  VIEW_ENUM,
  ViewType
} from '../modules/common';
import {FocusComponent} from '../modules/focus/focus.component';
import {MenuComponent} from '../modules/menu/menu.component';


@Component({
  selector: 'dz-app',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    // components
    ThemeSwitcherComponent,
    FocusComponent,
    MenuComponent
  ],
})
export class App {
  readonly #themeService: ThemeService = inject(ThemeService);

  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;

  protected readonly currentViewType: WritableSignal<VIEW_ENUM> = signal(VIEW_ENUM.FOCUS)

  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
  protected readonly viewTypes: typeof VIEW_ENUM = VIEW_ENUM;

  protected setViewType(viewType: ViewType) {
    this.currentViewType.set(viewType);
  }
}
