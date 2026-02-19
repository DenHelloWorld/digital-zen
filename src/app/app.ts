import { AuthService } from '../modules/auth';
import {
  DzToastContainerComponent,
  LoaderComponent,
  ThemeSwitcherComponent,
} from '../modules/common/components';
import { ICONS } from '../modules/common/constants/icons.const';
import { UI_TEXT } from '../modules/common/constants/ui-text.const';
import { WEBSITE_PRIVACY_POLICY } from '../modules/common/constants/websites.const';
import { CHROME_COMMAND_ENUM } from '../modules/common/enums/chrome-command.enum';
import { COLOR_SCHEMA_ENUM, ColorSchemaType } from '../modules/common/enums/color-schema.enum';
import { VIEW_ENUM, ViewType } from '../modules/common/enums/view.enum';
import { MiniRouterService } from '../modules/common/services/mini-router.service';
import { SettingsBackupService } from '../modules/common/services/settings-backup.service';
import { ThemeService } from '../modules/common/services/theme.service';
import { PeriodFormComponent } from '../modules/focus/components/period-form/period-form.component';
import { FocusComponent } from '../modules/focus/focus.component';
import { MenuComponent } from '../modules/menu/menu.component';
import { PomodoroComponent } from '../modules/pomodoro/pomodoro.component';
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
    LoaderComponent,
    PeriodFormComponent,
    MenuComponent,
  ],
  host: {
    class: 'dz-app gradient-overlay',
  },
})
export class App {
  /** @guideline DZ_08 - Private readonly field for runtime check */
  readonly #isChromeRuntime: boolean = !!chrome.runtime;
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #themeService = inject(ThemeService);
  readonly #authService = inject(AuthService);
  readonly #router = inject(MiniRouterService);
  readonly #settingsBackupService = inject(SettingsBackupService);

  /** @guideline DZ_04 - Signal for reactive theme state */
  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;
  /** @guideline DZ_04 - Writable signal for view type state */
  protected readonly currentRoute = this.#router.currentRoute;
  /** @guideline DZ_04 - Signal for reactive authentication state */
  protected readonly isGoogleAuthenticated: Signal<boolean> =
    this.#authService.isGoogleAuthenticated;
  /** @guideline DZ_04 - Signal for reactive auth pending state */
  protected readonly isGoogleAuthPending: Signal<boolean> = this.#authService.isGoogleAuthPending;
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

  protected loginWithGoogle(): void {
    this.#authService.loginWithGoogle();
  }

  protected logoutFromGoogle(): void {
    this.#authService.logoutFromGoogle();
  }

  public openSidePanel(): void {
    if (this.#isChromeRuntime) {
      chrome.windows.getCurrent(win => {
        chrome.runtime.sendMessage({
          command: CHROME_COMMAND_ENUM.OPEN_SIDE_PANEL_APP,
          windowId: win.id,
        });

        window.close();
      });
    }
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
}
