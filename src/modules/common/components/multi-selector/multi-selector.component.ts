import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  model,
  ModelSignal,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'dz-multi-selector',
  templateUrl: './multi-selector.component.html',
  styleUrls: ['./multi-selector.component.scss'],
  imports: [TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectorComponent<T> {
  public readonly entities: InputSignal<T[]> = input.required<T[]>();
  public readonly labelKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly idKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly readonlyKeys: InputSignal<T[keyof T][]> = input<T[keyof T][]>([]);
  public readonly orientation: InputSignal<'vertical' | 'horizontal'> = input<
    'vertical' | 'horizontal'
  >('vertical');
  public readonly isSelectable: InputSignal<boolean> = input<boolean>(true);
  public readonly highlightedId: InputSignal<T[keyof T] | null> = input<T[keyof T] | null>(null);

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
