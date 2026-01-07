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
} from '../modules/common';
import { FocusComponent } from '../modules/focus/focus.component';
import { DzToastContainerComponent } from '../modules/common/components/toast-container/toast-container';
import { AuthService } from '../modules/auth';
import { PeriodFormComponent } from '../modules/menu/components/period-form';

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
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #themeService: ThemeService = inject(ThemeService);
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #authService: AuthService = inject(AuthService);

  /** @guideline DZ_04 - Signal for reactive theme state */
  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;
  /** @guideline DZ_04 - Writable signal for view type state */
  protected readonly currentViewType: WritableSignal<ViewType> = signal(VIEW_ENUM.MENU);
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
