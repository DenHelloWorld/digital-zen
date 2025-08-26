import {Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {COLOR_SCHEMA_ENUM, ColorSchemaType} from '../enums';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly #theme: WritableSignal<ColorSchemaType> = signal(COLOR_SCHEMA_ENUM.LIGHT);
  public readonly theme: Signal<ColorSchemaType> = this.#theme.asReadonly();

  constructor() {
    this.#listenSystemColorScheme();
  }

  public toggle(): void {
    this.#theme.update((currentTheme) =>
      currentTheme === COLOR_SCHEMA_ENUM.LIGHT ? COLOR_SCHEMA_ENUM.DARK : COLOR_SCHEMA_ENUM.LIGHT
    );
  }

  #listenSystemColorScheme(): void {
    if (window) {
      const prefersDark: MediaQueryList = window.matchMedia(`(prefers-color-scheme: ${COLOR_SCHEMA_ENUM.DARK})`);

      if (prefersDark.matches) {
        this.#theme.set(COLOR_SCHEMA_ENUM.DARK);
      }

      prefersDark.addEventListener('change', (e: MediaQueryListEvent) => {
        this.#theme.set(e.matches ? COLOR_SCHEMA_ENUM.DARK : COLOR_SCHEMA_ENUM.LIGHT);
      });
    }
  }
}
