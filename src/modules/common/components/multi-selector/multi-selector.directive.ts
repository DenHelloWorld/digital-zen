import { Directive, input, model } from '@angular/core';

@Directive({
  selector: '[dzMultiSelector]',
  standalone: true,
})
export class MultiSelectorDirective<T> {
  public readonly entities = input.required<T[]>();
  public readonly idKey = input.required<keyof T>();
  public readonly readonlyKeys = input<T[keyof T][]>([]);
  public readonly isSelectable = input<boolean>(true);
  public readonly isOnlySingleSelectable = input<boolean>(false);

  public readonly selectedEntities = model<T[]>([]);

  public isSelected(item: T): boolean {
    const selected = this.selectedEntities() ?? [];
    return selected.some(e => e[this.idKey()] === item[this.idKey()]);
  }

  public isReadonly(item: T): boolean {
    if (!this.isSelectable()) return true;
    return this.readonlyKeys().includes(item[this.idKey()]);
  }

  public toggle(item: T): void {
    if (this.isReadonly(item)) return;

    const current = this.selectedEntities() ?? [];
    const itemId = item[this.idKey()];
    const isAlreadySelected = current.some(e => e[this.idKey()] === itemId);

    if (this.isOnlySingleSelectable()) {
      this.selectedEntities.set(isAlreadySelected ? [] : [item]);
      return;
    }

    const nextValue = isAlreadySelected
      ? current.filter(e => e[this.idKey()] !== itemId)
      : [...current, item];

    this.selectedEntities.set(nextValue);
  }
}
