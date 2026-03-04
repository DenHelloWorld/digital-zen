import { DzToastContainerComponent, ThemeSwitcherComponent } from '../modules/common/components';
import { ICONS } from '../modules/common/constants/icons.const';
import { UI_TEXT } from '../modules/common/constants/ui-text.const';
import { WEBSITE_PRIVACY_POLICY } from '../modules/common/constants/websites.const';
import { ProgressBorderDirective } from '../modules/common/directives/progress-border.directive';
import { COLOR_SCHEMA_ENUM, ColorSchemaType } from '../modules/common/enums/color-schema.enum';
import { VIEW_ENUM, ViewType } from '../modules/common/enums/view.enum';
import { MiniRouterService } from '../modules/common/services/mini-router.service';
import { SettingsBackupService } from '../modules/common/services/settings-backup.service';
import { ThemeService } from '../modules/common/services/theme.service';
import { PeriodFormComponent } from '../modules/focus/components/period-form/period-form.component';
import { FocusComponent } from '../modules/focus/focus.component';
import { FocusService } from '../modules/focus/services/focus.service';
import { MenuComponent } from '../modules/menu/menu.component';
import { PomodoroComponent } from '../modules/pomodoro/pomodoro.component';
import { PomodoroService } from '../modules/pomodoro/services/pomodoro.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, inject, Signal } from '@angular/core';

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
    PeriodFormComponent,
    MenuComponent,
    ProgressBorderDirective,
  ],
  host: {
    class: 'dz-app gradient-overlay',
  },
})
export class App {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #themeService = inject(ThemeService);
  // readonly #authService = inject(AuthService);
  readonly #router = inject(MiniRouterService);
  readonly #settingsBackupService = inject(SettingsBackupService);
  readonly #pomodoroService = inject(PomodoroService);
  readonly #focusService = inject(FocusService);

  protected readonly currentPeriodProgress: Signal<number> =
    this.#focusService.currentPeriodProgress;
  protected readonly pomodoroProgress = this.#pomodoroService.progress;
  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;
  protected readonly currentRoute = this.#router.currentRoute;
  // protected readonly isGoogleAuthenticated: Signal<boolean> =
  //   this.#authService.isGoogleAuthenticated;
  // protected readonly isGoogleAuthPending: Signal<boolean> = this.#authService.isGoogleAuthPending;
  protected readonly isSidePanel = this.#router.isSidePanel;
  protected readonly isExportingBackup = this.#settingsBackupService.isExportingBackup;
  protected readonly isImportingBackup = this.#settingsBackupService.isImportingBackup;

  protected readonly colorSchemes: typeof COLOR_SCHEMA_ENUM = COLOR_SCHEMA_ENUM;
  protected readonly views: typeof VIEW_ENUM = VIEW_ENUM;
  /** @guideline DZ_10 - UI text constants usage */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly websites = { PRIVACY_POLICY: WEBSITE_PRIVACY_POLICY } as const;

  protected setViewType(viewType: ViewType) {
    this.#router.navigate(viewType);
  }

  // protected loginWithGoogle(): void {
  //   this.#authService.loginWithGoogle();
  // }
  //
  // protected logoutFromGoogle(): void {
  //   this.#authService.logoutFromGoogle();
  // }

  public openSidePanel(): void {
    this.#router.openSidePanel();
  }

  protected async exportSettings(): Promise<void> {
    await this.#settingsBackupService.exportSettingsWithDownload();
  }

  protected triggerImport(fileInput: HTMLInputElement | null): void {
    fileInput?.click();
  }

  protected async handleImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    input.value = '';
    await this.#settingsBackupService.importBackupFromFile(file);
  }

  @HostBinding('class.dz-app--side-panel')
  get sidePanelClass() {
    return this.#router.isSidePanel();
  }

  @HostBinding('class.dz-app--options')
  get optionsClass() {
    return this.#router.isOptions();
  }
}
