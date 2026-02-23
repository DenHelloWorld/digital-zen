import { COLOR_SCHEMA_ENUM } from '../enums/color-schema.enum';
import { ThemeService } from '../services/theme.service';
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
  Injector,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';

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
 * * @example
 * <ng-template [dzPopup]="data()" (closed)="data.set(null)" #popup="dzPopup">
 * <div class="dz-popup-content shadow">
 * <button (click)="popup.close()">Confirm</button>
 * </div>
 * </ng-template>
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
  readonly #injector = inject(Injector);
  readonly #themeService = inject(ThemeService);

  /** Trigger signal: opens when non-null, closes when null */
  public readonly openPayload = input<T | null>(null, { alias: 'dzPopup' });
  public readonly hasBackdrop = input<boolean>(true);
  public readonly anchor = input<HTMLElement | null>(null);

  /** Emits when the popup is closed by any means */
  public readonly closed = output<PopupCloseEvent<T>>();

  /** The active CDK Overlay reference */
  #overlayRef: OverlayRef | null = null;

  /** * Internal Subject to clean up subscriptions of the current active overlay.
   * Emits whenever the popup is destroyed/closed.
   */
  readonly #detached$ = new Subject<void>();

  public ngOnInit(): void {
    toObservable(this.openPayload, { injector: this.#injector })
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(payload => {
        if (payload) {
          this.#show();
        } else {
          this.#destroy();
        }
      });
  }

  public ngOnDestroy(): void {
    this.#destroy();
    this.#detached$.complete();
  }

  /**
   * Orchestrates the creation and attachment of the overlay.
   */
  #show(): void {
    // Prevent double-opening
    if (this.#overlayRef?.hasAttached()) return;

    // Build the overlay
    const hasBackdrop = this.hasBackdrop();
    const anchorElement = this.anchor();
    let positionStrategy;

    if (anchorElement) {
      positionStrategy = this.#overlay
        .position()
        .flexibleConnectedTo(anchorElement)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
        ]);
    } else {
      positionStrategy = this.#overlay.position().global().centerHorizontally().centerVertically();
    }

    this.#overlayRef = this.#overlay.create({
      positionStrategy,
      scrollStrategy: this.#overlay.scrollStrategies.reposition(),
      hasBackdrop,
      backdropClass: ['gradient-overlay', 'dz-popup-fade-in'],
      panelClass: this.#themeService.theme() === COLOR_SCHEMA_ENUM.DARK ? ['dark-theme'] : [],
    });

    // Attach the template portal
    const portal = new TemplatePortal(this.#templateRef, this.#viewContainerRef, {
      $implicit: this.openPayload(),
    });
    this.#overlayRef.attach(portal);

    this.#overlayRef
      .backdropClick()
      .pipe(takeUntil(this.#detached$))
      .subscribe(() => this.close(POPUP_CLOSE_REASON_ENUM.BACKDROP));

    this.#overlayRef
      .keydownEvents()
      .pipe(
        filter(event => event.key === 'Escape'),
        takeUntil(this.#detached$)
      )
      .subscribe(() => this.close(POPUP_CLOSE_REASON_ENUM.ESCAPE));
  }

  /**
   * Closes the popup and emits the closure event.
   * Can be called manually from the template.
   */
  public close(
    reason: PopupCloseReasonType = POPUP_CLOSE_REASON_ENUM.CONFIRM,
    newPayload?: T
  ): void {
    const payload = newPayload !== undefined ? newPayload : this.openPayload();

    this.#destroy();
    this.closed.emit({ reason, payload });
  }

  /**
   * Internal cleanup: disposes the overlay and terminates active subscriptions.
   */
  #destroy(): void {
    this.#detached$.next();

    if (this.#overlayRef) {
      this.#overlayRef.dispose();
      this.#overlayRef = null;
    }
  }
}
