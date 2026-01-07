import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  model,
  ModelSignal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';

/**
 * Generic multi-selector component for selecting multiple items from a list
 * Supports both horizontal and vertical orientations with readonly and highlighted states
 * 
 * @guidelines
 * - DZ_01: Standalone component with imports array
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals (InputSignal, ModelSignal)
 * - DZ_07: Strict TypeScript with generics
 * 
 * @see /docs/coding-guidelines.md
 * @see https://angular.dev/guide/components/importing (Standalone Components)
 * @see https://angular.dev/guide/signals (Signals)
 */
@Component({
  selector: 'dz-multi-selector',
  templateUrl: './multi-selector.component.html',
  styleUrls: ['./multi-selector.component.scss'],
  imports: [TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectorComponent<T> {
  /** @guideline DZ_04 - InputSignal for component inputs */
  public readonly entities: InputSignal<T[]> = input.required<T[]>();
  public readonly labelKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly idKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly readonlyKeys: InputSignal<T[keyof T][]> = input<T[keyof T][]>([]);
  public readonly orientation: InputSignal<'vertical' | 'horizontal'> = input<
    'vertical' | 'horizontal'
  >('vertical');
  public readonly isSelectable: InputSignal<boolean> = input<boolean>(true);
  public readonly highlightedId: InputSignal<T[keyof T] | null> = input<T[keyof T] | null>(null);

  /** @guideline DZ_04 - ModelSignal for two-way binding */
  public readonly selectedEntities: ModelSignal<T[] | undefined> = model<T[]>();

  protected isSelected = (item: T): boolean => {
    const selected = this.selectedEntities() ?? [];
    const itemId = item[this.idKey()];
    return selected.some(e => e[this.idKey()] === itemId);
  };

  protected getLabel(item: T): string {
    const label: T[keyof T] = item[this.labelKey()];
    return typeof label === 'string' ? label : String(label);
  }

  protected isReadonly = (item: T): boolean => {
    if (this.isSelectable()) {
      return this.readonlyKeys().includes(item[this.idKey()]);
    } else {
      return true;
    }
  };

  protected toggle(item: T): void {
    if (this.isReadonly(item) || !this.isSelectable()) {
      return;
    }

    const current = this.selectedEntities() ?? [];
    const id = item[this.idKey()];
    const isAlready = current.some(e => e[this.idKey()] === id);

    this.selectedEntities.set(
      isAlready ? current.filter(e => e[this.idKey()] !== id) : [...current, item]
    );
  }

  protected isHighlighted = (item: T): boolean => {
    const highlighted = this.highlightedId();
    return highlighted != null && item[this.idKey()] === highlighted;
  };
}
