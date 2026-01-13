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
import { ALL_DAYS_OF_WEEK, ICONS, IFocus, UI_TEXT } from '../../../common';
import { TimeLineComponent } from '../time-line/time-line.component';
import { WeekdaysSelectorComponent } from '../../../common/components/weekdays-selector/weekdays-selector.component';
import { PeriodFormComponent } from '../../../menu/components/period-form';
import { FocusService } from '../../services';

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
    PeriodFormComponent,
  ],
})
export class PeriodComponent {
  /** @guideline DZ_02, DZ_08, DZ_09 - Dependency injection with inject(), private #, readonly */
  readonly #focusService: FocusService = inject(FocusService);

  protected readonly allDays: Readonly<IFocus.DayOfWeek>[] = [...ALL_DAYS_OF_WEEK];
  /** @guideline DZ_04 - Computed signal (derived state) */
  protected readonly selectedDays: Signal<IFocus.DayOfWeek[]> = computed(() => {
    const selected = this.period().daysOfWeek;
    return this.allDays.filter(day => selected.includes(day.day));
  });

  /** @guideline DZ_04 - Writable signal for local state */
  protected readonly isEditing: WritableSignal<boolean> = signal(false);
  /** @guideline DZ_04 - Writable signal for local state */
  protected readonly isConfirmingDelete: WritableSignal<boolean> = signal(false);
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;

  /** @guideline DZ_04 - InputSignal for component inputs */
  public readonly period: InputSignal<IFocus.Period> = input.required<IFocus.Period>();
  public readonly totalPeriodsCount: InputSignal<number> = input.required<number>();
  public readonly isCurrent: InputSignal<boolean> = input.required<boolean>();
  public readonly isFocusActive: InputSignal<boolean> = input.required<boolean>();

  public readonly toggleBlockedWebsite: OutputEmitterRef<IFocus.WebSite> = output<IFocus.WebSite>();

  protected onToggleBlockedWebsite(site: IFocus.WebSite): void {
    this.toggleBlockedWebsite.emit(site);
  }

  protected onEdit(): void {
    this.isEditing.set(true);
  }

  protected onFormCompleted(): void {
    this.isEditing.set(false);
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
