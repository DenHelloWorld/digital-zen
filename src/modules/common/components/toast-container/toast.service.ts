import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { IToast } from '../../models';
import { MESSAGE_TYPE_ENUM, POSITIONS_ENUM } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class DzToastService {
  readonly #toasts: WritableSignal<IToast[]> = signal<IToast[]>([]);

  public readonly toasts: Signal<IToast[]> = computed(() => this.#toasts());

  public show(toast: Partial<IToast>) {
    const id = Date.now();
    const newToast: IToast = {
      id,
      message: toast.message || '',
      type: toast.type || MESSAGE_TYPE_ENUM.INFO,
      position: toast.position || POSITIONS_ENUM.BOTTOM_CENTER,
      durationInMs: toast.durationInMs || 3000,
    };

    this.#toasts.update(current => [...current, newToast]);

    if (newToast?.durationInMs && newToast?.durationInMs > 0) {
      setTimeout(() => this.hide(id), newToast.durationInMs);
    }
  }

  public hide(id: number) {
    this.#toasts.update(current => current.map(t => (t.id === id ? { ...t, leaving: true } : t)));

    setTimeout(() => {
      this.#toasts.update(current => current.filter(t => t.id !== id));
    }, 300);
  }
}
