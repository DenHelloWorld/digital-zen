import { ICONS } from '../common/constants/icons.const';
import { UI_TEXT } from '../common/constants/ui-text.const';
import { MiniRouterService } from '../common/services/mini-router.service';
import { PeriodComponent } from '../focus/components/period/period.component';
import { FocusService } from '../focus/services/focus.service';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Signal,
  viewChildren,
} from '@angular/core';

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

    // components
    PeriodComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  readonly #focusService = inject(FocusService);
  readonly #router = inject(MiniRouterService);

  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  protected readonly periods = this.#focusService.periods;
  protected readonly payload = this.#router.payload as Signal<{
    scrollPeriodId: string;
  } | null>;
  readonly periodItems = viewChildren<ElementRef>('periodItem');

  readonly _ = effect(() => {
    const periodId = this.payload()?.scrollPeriodId;
    const items = this.periodItems();

    if (periodId && items.length > 0) {
      const targetEl = items.find(el => el.nativeElement.id === periodId);

      if (targetEl) {
        targetEl.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.nativeElement.classList.add('shake');
      }
    }
  });
}
