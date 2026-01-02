import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  COLOR_SCHEMA_ENUM,
  ColorSchemaType,
  LoaderComponent,
  ThemeService,
  ThemeSwitcherComponent,
  UI_TEXT,
  VIEW_ENUM,
  ViewType,
} from '../modules/common';
import { FocusComponent } from '../modules/focus/focus.component';
import { DzToastContainerComponent } from '../modules/common/components/toast-container/toast-container';
import { AuthService } from '../modules/auth';
import { PeriodFormComponent } from '../modules/menu/components/period-form';

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
    DzToastContainerComponent,
    LoaderComponent,
    PeriodFormComponent,
  ],
})
export class App {
  readonly #themeService: ThemeService = inject(ThemeService);
  readonly #authService: AuthService = inject(AuthService);

  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;
  protected readonly currentViewType: WritableSignal<ViewType> = signal(VIEW_ENUM.FOCUS);
  protected readonly isGoogleAuthenticated: Signal<boolean> =
    this.#authService.isGoogleAuthenticated;
  protected readonly isGoogleAuthPending: Signal<boolean> = this.#authService.isGoogleAuthPending;

  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
  protected readonly viewTypes: typeof VIEW_ENUM = VIEW_ENUM;
  protected readonly uiText = UI_TEXT;

  protected setViewType(viewType: ViewType) {
    this.currentViewType.set(viewType);
  }

  protected loginWithGoogle(): void {
    this.#authService.loginWithGoogle();
  }

  protected logoutFromGoogle(): void {
    this.#authService.logoutFromGoogle();
  }
}
