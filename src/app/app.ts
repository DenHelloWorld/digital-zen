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
  ICONS,
  LoaderComponent,
  ThemeService,
  ThemeSwitcherComponent,
  UI_TEXT,
  VIEW_ENUM,
  ViewType,
  WEBSITE_PRIVACY_POLICY,
  DzToastContainerComponent,
} from '../modules/common';
import { FocusComponent } from '../modules/focus/focus.component';
import { AuthService } from '../modules/auth';
import { PomodoroComponent } from '../modules/pomodoro/pomodoro.component';
import { PeriodFormComponent } from '../modules/focus/components/period-form/period-form.component';

/**
 * Root application component for Digital Zen Chrome Extension
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals for reactive state
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_10: UI text constants usage
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-app',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // angular modules
    CommonModule,
    // components
    ThemeSwitcherComponent,
    FocusComponent,
    PomodoroComponent,
    DzToastContainerComponent,
    LoaderComponent,
    PeriodFormComponent,
  ],
})
export class App {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #themeService: ThemeService = inject(ThemeService);
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #authService: AuthService = inject(AuthService);

  /** @guideline DZ_04 - Signal for reactive theme state */
  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;
  /** @guideline DZ_04 - Writable signal for view type state */
  protected readonly currentViewType: WritableSignal<ViewType> = signal(VIEW_ENUM.POMODORO);
  /** @guideline DZ_04 - Signal for reactive authentication state */
  protected readonly isGoogleAuthenticated: Signal<boolean> =
    this.#authService.isGoogleAuthenticated;
  /** @guideline DZ_04 - Signal for reactive auth pending state */
  protected readonly isGoogleAuthPending: Signal<boolean> = this.#authService.isGoogleAuthPending;

  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
  protected readonly viewTypes: typeof VIEW_ENUM = VIEW_ENUM;
  /** @guideline DZ_10 - UI text constants usage */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly websites = { PRIVACY_POLICY: WEBSITE_PRIVACY_POLICY } as const;

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
