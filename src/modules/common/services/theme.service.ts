import { CHROME_STORAGE_KEY_ENUM } from '../enums/chrome-storage-key.enum';
import { COLOR_SCHEMA_ENUM, ColorSchemaType } from '../enums/color-schema.enum';
import { ChromeStorageService } from './chrome-storage.service';
import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

/**
 * Theme service for managing light/dark theme state
 * Persists theme preference to Chrome storage and listens to system theme changes
 *
 * @guidelines
 * - DZ_02: Dependency injection using inject() function
 * - DZ_04: Angular Signals for reactive state
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 *
 * @see /docs/coding-guidelines.md
 * @see https://angular.dev/guide/signals (Signals)
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #chromeStorageService: ChromeStorageService = inject(ChromeStorageService);

  /** @guideline DZ_04, DZ_08 - Private writable signal for internal state */
  readonly #theme: WritableSignal<ColorSchemaType> = signal(COLOR_SCHEMA_ENUM.DARK);
  /** @guideline DZ_04 - Public readonly signal for consumers */
  public readonly theme: Signal<ColorSchemaType> = this.#theme.asReadonly();

  constructor() {
    this.#loadTheme();
  }

  public toggle(): void {
    const newTheme: ColorSchemaType =
      this.#theme() === COLOR_SCHEMA_ENUM.LIGHT ? COLOR_SCHEMA_ENUM.DARK : COLOR_SCHEMA_ENUM.LIGHT;
    this.#theme.set(newTheme);
    this.#chromeStorageService.set(CHROME_STORAGE_KEY_ENUM.THEME, newTheme);
  }

  #loadTheme(): void {
    this.#chromeStorageService.get(
      CHROME_STORAGE_KEY_ENUM.THEME,
      (savedTheme: ColorSchemaType | null) => {
        if (savedTheme) {
          this.#theme.set(savedTheme);
        } else {
          this.#listenSystemColorScheme();
        }
      }
    );
  }

  #listenSystemColorScheme(): void {
    if (window) {
      const prefersDark: MediaQueryList = window.matchMedia(
        `(prefers-color-scheme: ${COLOR_SCHEMA_ENUM.DARK})`
      );

      if (prefersDark.matches) {
        this.#theme.set(COLOR_SCHEMA_ENUM.DARK);
      }

      prefersDark.addEventListener('change', (e: MediaQueryListEvent) => {
        this.#theme.set(e.matches ? COLOR_SCHEMA_ENUM.DARK : COLOR_SCHEMA_ENUM.LIGHT);
      });
    }
  }
}
