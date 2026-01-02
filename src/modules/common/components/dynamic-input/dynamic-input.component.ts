import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  InputSignal,
  model,
  ModelSignal,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { ICONS, UI_TEXT } from '../../constants';

@Component({
  selector: 'dz-dynamic-input',
  templateUrl: 'dynamic-input.component.html',
  styleUrls: ['dynamic-input.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicInputComponent<T> implements OnInit {
  readonly #initEntities: WritableSignal<T[]> = signal<T[]>([]);

  protected readonly isAdding: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly newEntity = signal<T | null>(null);
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  protected readonly entityKeys = computed(() => {
    const list = this.#initEntities();
    const first = list && list.length > 0 ? list[0] : null;

    if (!first || typeof first !== 'object' || Array.isArray(first)) {
      return [];
    }

    const allKeys = Object.keys(first);
    const idKey = this.idKey();
    const excludeKeys = this.excludeKeys() as string[];

    return allKeys.filter((key: string) => key !== idKey && !excludeKeys.includes(key));
  });
  protected readonly isNewEntityValid = computed(() => {
    const obj = this.newEntity() as Record<string, unknown>;
    if (!obj) return false;

    return this.entityKeys()
      .filter((k: string) => k !== this.idKey())
      .every((key: string) => {
        const val: unknown = obj[key];
        return val !== undefined && val !== null && String(val).trim().length > 0;
      });
  });
  protected isPlaceholderShown = computed(() => {
    return !this.entities()?.length && !this.isAdding();
  });

  public readonly labelKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly idKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly readonlyKeys: InputSignal<T[keyof T][]> = input<T[keyof T][]>([]);
  public readonly excludeKeys: InputSignal<(keyof T)[]> = input<(keyof T)[]>([]);

  public readonly entities: ModelSignal<T[] | undefined> = model<T[]>();

  public ngOnInit(): void {
    this.#initEntities.set([...(this.entities() ?? [])]);
  }

  protected getLabel(item: T): string {
    const label: T[keyof T] = item[this.labelKey()];
    return typeof label === 'string' ? label : String(label);
  }

  protected isReadonly = (item: T): boolean => {
    return this.readonlyKeys().includes(item[this.idKey()]);
  };

  protected addEntity(): void {
    const newEntity: T | null = this.newEntity();

    if (!newEntity) {
      return;
    }

    newEntity[this.idKey()] = Date.now() as NonNullable<T>[keyof T];

    this.entities.set([...(this.entities() ?? []), newEntity]);
    this.toggleIsAdding();
  }

  protected updateField(key: string, value: T): void {
    this.newEntity.update(current => ({ ...current, [key]: value }) as T);
  }

  protected resetEntities(): void {
    this.entities.set([...(this.#initEntities() ?? [])]);
  }

  protected clearEntities(): void {
    this.entities.set([]);
  }

  protected removeEntity(item: T): void {
    const idKey: keyof T = this.idKey();
    const filtered: T[] = (this.entities() ?? []).filter((e: T) => e[idKey] !== item[idKey]);
    this.entities.set(filtered);
  }

  protected updateEntity(updatedItem: T): void {
    const idKey: keyof T = this.idKey();
    const updated: T[] =
      this.entities() ?? [].map(e => (e[idKey] === updatedItem[idKey] ? updatedItem : e));
    this.entities.set(updated);
  }

  protected toggleIsAdding(): void {
    this.isAdding.set(!this.isAdding());
  }

  protected cancelAdding(): void {
    this.newEntity.set(null);
    this.isAdding.set(false);
  }
}
