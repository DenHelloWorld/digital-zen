import { VIEW_ENUM, ViewType } from '../enums/view.enum';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MiniRouterService {
  readonly #currentRoute = signal<ViewType>(VIEW_ENUM.FOCUS);
  readonly #payload = signal<unknown | null>(null);
  readonly #isSidePanel = signal<boolean>(window.location.search.includes('view=sidepanel'));
  readonly #previousRoute = signal<ViewType | null>(null);

  public readonly currentRoute = this.#currentRoute.asReadonly();
  public readonly payload = this.#payload.asReadonly();
  public readonly previousRoute = this.#previousRoute.asReadonly();

  public readonly isSidePanel = this.#isSidePanel.asReadonly();

  public navigate(route: ViewType, payload: object | null = null) {
    this.#previousRoute.set(this.#currentRoute());
    this.#payload.set(payload);
    this.#currentRoute.set(route);
  }
}
