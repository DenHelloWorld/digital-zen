import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { COLOR_SCHEMA_ENUM, ColorSchemaType } from '../enums';
import { ChromeStorageService } from './chrome-storage.service';
import { CHROME_STORAGE_KEY_ENUM } from '../enums/chrome-storage-key.enum';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly #chromeStorageService: ChromeStorageService = inject(ChromeStorageService);

  readonly #theme: WritableSignal<ColorSchemaType> = signal(COLOR_SCHEMA_ENUM.LIGHT);
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
