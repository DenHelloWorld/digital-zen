import { CHROME_STORAGE_KEY_ENUM } from '../enums/chrome-storage-key.enum';
import { VIEW_ENUM, ViewType } from '../enums/view.enum';
import { ChromeStorageService } from './chrome-storage.service';
import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MiniRouterService {
  readonly #storageService = inject(ChromeStorageService);

  readonly #currentRoute = signal<ViewType>(VIEW_ENUM.FOCUS);
  readonly #payload = signal<unknown | null>(null);
  readonly #isSidePanel = signal<boolean>(window.location.search.includes('view=sidepanel'));
  readonly #previousRoute = signal<ViewType | null>(null);

  public readonly currentRoute = this.#currentRoute.asReadonly();
  public readonly payload = this.#payload.asReadonly();
  public readonly previousRoute = this.#previousRoute.asReadonly();

  public readonly isSidePanel = this.#isSidePanel.asReadonly();

  constructor() {
    this.#storageService.get<ViewType>(CHROME_STORAGE_KEY_ENUM.CURRENT_ROUTE, route => {
      if (route) {
        this.#currentRoute.set(route);
      }
    });

    toObservable(this.#currentRoute)
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(route => {
        this.#storageService.set(CHROME_STORAGE_KEY_ENUM.CURRENT_ROUTE, route);
      });
  }

  public navigate(route: ViewType, payload: object | null = null) {
    this.#previousRoute.set(this.#currentRoute());
    this.#payload.set(payload);
    this.#currentRoute.set(route);
  }
}
