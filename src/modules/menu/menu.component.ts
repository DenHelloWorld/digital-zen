import { DzToastService, LoaderComponent } from '../common/components';
import { ICONS } from '../common/constants/icons.const';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { TOAST_TYPE_ENUM } from '../common/enums/toast-type.enum';
import { logger } from '../common/helpers/logger';
import {
  SettingsBackupPayload,
  SettingsBackupService,
} from '../common/services/settings-backup.service';
import { PeriodComponent } from '../focus/components/period/period.component';
import { FocusService } from '../focus/services/focus.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

/**
 * Menu component for adding new focus periods
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Writable signal for local state
 * - DZ_10: UI text constants usage
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [
    // angular modules
    CommonModule,
    LoaderComponent,
    PeriodComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly #focusService = inject(FocusService);
  readonly #settingsBackupService = inject(SettingsBackupService);
  readonly #toastService = inject(DzToastService);
  readonly #logger = logger.createLogger('MenuComponent');
  readonly #isExportingBackup = signal(false);
  readonly #isImportingBackup = signal(false);
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected readonly periods = this.#focusService.periods;
  protected readonly isExportingBackup = this.#isExportingBackup.asReadonly();
  protected readonly isImportingBackup = this.#isImportingBackup.asReadonly();

  protected async exportSettings(): Promise<void> {
    if (this.#isExportingBackup()) {
      return;
    }

    this.#isExportingBackup.set(true);

    try {
      const backup = await this.#settingsBackupService.exportSettings();
      this.#downloadBackupFile(backup);
      this.#toastService.show({
        message: UI_TEXT.MENU.EXPORT_SUCCESS,
        type: TOAST_TYPE_ENUM.SUCCESS,
      });
    } catch (error) {
      this.#logger.error('Failed to export settings backup', error);
      this.#toastService.show({
        message: error instanceof Error ? error.message : UI_TEXT.MENU.EXPORT_ERROR,
        type: TOAST_TYPE_ENUM.ERROR,
      });
    } finally {
      this.#isExportingBackup.set(false);
    }
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
    this.#isImportingBackup.set(true);

    try {
      const content = await file.text();
      const backup = this.#settingsBackupService.parseBackupFromJson(content);
      await this.#settingsBackupService.importBackup(backup);

      this.#toastService.show({
        message: UI_TEXT.MENU.IMPORT_SUCCESS,
        type: TOAST_TYPE_ENUM.SUCCESS,
      });
    } catch (error) {
      this.#logger.error('Failed to import settings backup', error);
      this.#toastService.show({
        message: error instanceof Error ? error.message : UI_TEXT.MENU.IMPORT_ERROR,
        type: TOAST_TYPE_ENUM.ERROR,
      });
    } finally {
      this.#isImportingBackup.set(false);
    }
  }

  #downloadBackupFile(backup: SettingsBackupPayload): void {
    const fileName = `digital-zen-backup-${this.#formatTimestamp(backup.metadata.exportedAt)}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  #formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return this.#formatForFilename(new Date());
    }

    return this.#formatForFilename(date);
  }

  #formatForFilename(date: Date): string {
    const pad = (value: number): string => value.toString().padStart(2, '0');
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('-');
  }
}
