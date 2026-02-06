import { Injectable, signal } from '@angular/core';
import { VIEW_ENUM, ViewType } from '../enums/view.enum';

@Injectable({ providedIn: 'root' })
export class MiniRouterService {
  readonly #currentRoute = signal<ViewType>(VIEW_ENUM.FOCUS);
  readonly #payload = signal<unknown | null>(null);

  public readonly currentRoute = this.#currentRoute.asReadonly();
  public readonly payload = this.#payload.asReadonly();

  public navigate(route: ViewType, payload: object | null = null) {
    this.#payload.set(payload);
    this.#currentRoute.set(route);
  }
}
