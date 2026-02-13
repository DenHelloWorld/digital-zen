import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  inject,
  OnDestroy,
  input,
  output,
  TemplateRef,
  ViewContainerRef,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, tap } from 'rxjs';

/**
 * Enumeration of possible reasons for closing the popup.
 */
export enum POPUP_CLOSE_REASON_ENUM {
  BACKDROP = 'backdrop',
  ESCAPE = 'escape',
  CONFIRM = 'confirm',
}

/**
 * Type representing the reason for closing the popup.
 */
export type PopupCloseReasonType =
  | POPUP_CLOSE_REASON_ENUM.BACKDROP
  | POPUP_CLOSE_REASON_ENUM.ESCAPE
  | POPUP_CLOSE_REASON_ENUM.CONFIRM;

/**
 * Interface for the event emitted when the popup is closed.
 */
export interface PopupCloseEvent<T = unknown> {
  reason: PopupCloseReasonType;
  payload: T | null;
}

/**
 * Directive to manage a popup overlay for an `ng-template`.
 * Synchronizes visibility with the `openPayload` signal.
 *
 * @example
 * ```html
 * <ng-template [dzPopup]="selectedUser()" (closed)="onClose($event)" #popup="dzPopup">
 *   <div class="dz-popup-content shadow">
 *
 *     <h2 class="dz-form__field">Edit Profile</h2>
 *
 *     <div class="dz-list dz-list--full">
 *       <input class="dz-input" [value]="selectedUser()?.name" placeholder="Name">
 *       <p class="dz-form__hint">This is how others will see you.</p>
 *     </div>
 *
 *     <div class="dz-form__actions">
 *       <button class="dz-button dz-button--ghost" (click)="selectedUser.set(null)">
 *         Cancel
 *       </button>
 *       <button class="dz-button dz-button--activated" (click)="popup.close()">
 *         Save Changes
 *       </button>
 *     </div>
 *
 *   </div>
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[dzPopup]',
  standalone: true,
  exportAs: 'dzPopup',
})
export class PopupDirective<T = unknown> implements OnInit, OnDestroy {
  readonly #overlay = inject(Overlay);
  readonly #templateRef = inject(TemplateRef);
  readonly #viewContainerRef = inject(ViewContainerRef);
  readonly #destroyRef = inject(DestroyRef);

  /**
   * Input signal that controls the popup state.
   * If value is not null, the popup opens.
   */
  readonly openPayload = input<T | null>(null, { alias: 'dzPopup' });

  /**
   * Event emitted when the popup is closed.
   */
  readonly closed = output<PopupCloseEvent<T>>();

  /** Reference to the CDK Overlay */
  #overlayRef: OverlayRef | null = null;

  public ngOnInit(): void {
    toObservable(this.openPayload)
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),

        tap(payload => (payload !== null ? this.#show() : this.#destroy())),

        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.#destroy();
  }

  /**
   * Creates and displays the overlay.
   */
  #show(): void {
    // Guard against multiple attachments
    if (this.#overlayRef?.hasAttached()) return;

    // Create overlay with global centering and scroll blocking
    this.#overlayRef = this.#overlay.create({
      positionStrategy: this.#overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.#overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: ['dz-popup-overlay', 'dz-popup-fade-in'],
    });

    // Attach the template to the overlay
    const portal = new TemplatePortal(this.#templateRef, this.#viewContainerRef);
    this.#overlayRef.attach(portal);

    // Handle backdrop clicks
    this.#overlayRef
      .backdropClick()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => this.close(POPUP_CLOSE_REASON_ENUM.BACKDROP));

    // Handle keyboard events (Escape key)
    this.#overlayRef
      .keydownEvents()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.close(POPUP_CLOSE_REASON_ENUM.ESCAPE);
        }
      });
  }

  /**
   * Public method to close the popup.
   * @param reason - The reason for closure (defaults to CONFIRM).
   */
  public close(reason: PopupCloseReasonType = POPUP_CLOSE_REASON_ENUM.CONFIRM): void {
    const payload = this.openPayload();
    this.#destroy();
    this.closed.emit({ reason, payload });
  }

  /**
   * Internal method to dispose of the overlay and its resources.
   */
  #destroy(): void {
    if (this.#overlayRef) {
      this.#overlayRef.dispose();
      this.#overlayRef = null;
    }
  }
}
