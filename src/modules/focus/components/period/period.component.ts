import { DzToastService } from '../../../common/components';
import { WeekdaysSelectorComponent } from '../../../common/components/weekdays-selector/weekdays-selector.component';
import { ALL_DAYS_OF_WEEK } from '../../../common/constants/days-of-week.const';
import { ICONS } from '../../../common/constants/icons.const';
import { UI_TEXT } from '../../../common/constants/ui-text.const';
import { BLOCK_BEHAVIOUR_ENUM } from '../../../common/enums/block-behaviour.enum';
import { TOAST_MESSAGES_ENUM } from '../../../common/enums/toast-messages.enum';
import { VIEW_ENUM } from '../../../common/enums/view.enum';
import { isHttpUrl } from '../../../common/helpers/is-http-url.helper';
import { IFocus } from '../../../common/models/focus.model';
import { RemoveProtocolPipe } from '../../../common/pipes/remove-protocol.pipe';
import { MiniRouterService } from '../../../common/services/mini-router.service';
import { FocusService } from '../../services/focus.service';
import { TimeLineComponent } from '../time-line/time-line.component';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

/**
 * Period display and management component
 * Displays a single focus period with its details, blocked websites, and controls
 *
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_02: Dependency injection using inject() function
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals for reactive state (signal, computed, InputSignal)
 * - DZ_08: Private fields with # prefix
 * - DZ_09: Readonly for injected dependencies
 * - DZ_10: UI text constants usage
 *
 * @see /docs/coding-guidelines.md
 */
@Component({
  selector: 'dz-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // angular modules
    CommonModule,
    // components
    TimeLineComponent,
    WeekdaysSelectorComponent,
    // pipes
    RemoveProtocolPipe,
  ],
})
export class PeriodComponent {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #focusService: FocusService = inject(FocusService);
  readonly #toastService: DzToastService = inject(DzToastService);
  readonly #router = inject(MiniRouterService);

  /** @guideline DZ_04 - Computed signal (derived state) */
  protected readonly selectedDays: Signal<IFocus.DayOfWeek[]> = computed(() => {
    const selected = this.period().daysOfWeek;
    return this.allDays.filter(day => selected.includes(day.day));
  });

  protected isOutsideTimeRangeError = computed(() =>
    this.#toastService
      .toasts()
      .find(t => t.target === `${TOAST_MESSAGES_ENUM.PERIOD_OUTSIDE_TIME_RANGE}${this.period().id}`)
  );
  protected isNotScheduledToday = computed(() =>
    this.#toastService
      .toasts()
      .find(
        t => t.target === `${TOAST_MESSAGES_ENUM.PERIOD_NOT_SCHEDULED_TODAY}${this.period().id}`
      )
  );
  protected readonly totalPeriodsCount = computed(() => this.#focusService.periods()?.length || 0);
  protected readonly isCurrent = computed(
    () => this.#focusService.currentPeriod()?.id === this.period().id
  );
  protected readonly isFocusActive = computed(() => this.period().isActive);

  /** @guideline DZ_04 - Writable signal for local state */
  protected readonly isConfirmingDelete: WritableSignal<boolean> = signal(false);
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];
  protected readonly blockBehaviours: typeof BLOCK_BEHAVIOUR_ENUM = BLOCK_BEHAVIOUR_ENUM;
  protected readonly isHttpUrl = isHttpUrl;

  /** @guideline DZ_04 - InputSignal for component inputs */
  public readonly period: InputSignal<IFocus.Period> = input.required<IFocus.Period>();

  public readonly toggleBlockedWebsite: OutputEmitterRef<IFocus.WebSite> = output<IFocus.WebSite>();

  protected onEdit(): void {
    this.#router.navigate(VIEW_ENUM.EDIT_PERIOD, this.period());
  }

  protected onDelete(): void {
    this.isConfirmingDelete.set(true);
  }

  protected onConfirmDelete(): void {
    this.#focusService.removePeriod(this.period().id);
    this.isConfirmingDelete.set(false);
  }

  protected onCancelDelete(): void {
    this.isConfirmingDelete.set(false);
  }

  protected onActivate(): void {
    this.#focusService.setCurrentPeriod(this.period().id);
  }
}
