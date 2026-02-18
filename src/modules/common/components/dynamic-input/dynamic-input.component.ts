import { ICONS } from '../../constants/icons.const';
import { UI_TEXT } from '../../constants/ui-text.const';
import { CommonModule } from '@angular/common';
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
  TemplateRef,
  WritableSignal,
} from '@angular/core';

/**
 * Dynamic input component for managing a list of entities with add/remove/edit capabilities
 * Generic component that works with any entity type
 *
 * @guidelines
 * - DZ_01: Standalone component
 * - DZ_03: OnPush change detection strategy
 * - DZ_04: Angular Signals (signal, computed, InputSignal, ModelSignal)
 * - DZ_07: Strict TypeScript with generics
 * - DZ_08: Private fields with # prefix
 * - DZ_10: UI text constants usage
 *
 * @see /docs/coding-guidelines.md
 * @see https://angular.dev/guide/signals (Signals)
 */
@Component({
  selector: 'dz-dynamic-input',
  templateUrl: 'dynamic-input.component.html',
  styleUrls: ['dynamic-input.component.scss'],
  imports: [
    // angular modules
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicInputComponent<T> implements OnInit {
  /** @guideline DZ_04, DZ_08 - Private writable signal */
  readonly #initEntities: WritableSignal<T[]> = signal<T[]>([]);

  /** @guideline DZ_04 - Writable signals for local state */
  protected readonly duplicateValue = signal<string | null>(null);
  protected readonly isAdding = signal<boolean>(false);
  protected readonly newEntity = signal<T | null>(null);
  /** @guideline DZ_10 - UI text constants */
  protected readonly uiText = UI_TEXT;
  protected readonly icons = ICONS;
  /** @guideline DZ_04 - Computed signal (derived state) */
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
  /** @guideline DZ_04 - Computed signal (derived state) */
  protected readonly isNewEntityValid = computed(() => {
    const obj = this.newEntity() as Record<string, unknown>;
    if (!obj || this.duplicateValue()) return false;

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
  protected readonly previewText = computed(() => {
    const previewFn = this.newEntityPreview();
    if (!previewFn) {
      return null;
    }

    return previewFn(this.newEntity());
  });

  public readonly labelKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly idKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly readonlyKeys: InputSignal<T[keyof T][]> = input<T[keyof T][]>([]);
  public readonly excludeKeys: InputSignal<(keyof T)[]> = input<(keyof T)[]>([]);
  public readonly iconTemplate: InputSignal<TemplateRef<unknown> | null> =
    input<TemplateRef<unknown> | null>(null);
  public readonly entityTransformer: InputSignal<((entity: T) => T) | null> = input<
    ((entity: T) => T) | null
  >(null);
  public readonly newEntityPreview: InputSignal<((entity: T | null) => string | null) | null> =
    input<((entity: T | null) => string | null) | null>(null);

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

    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const entityToAdd: T = {
      ...newEntity,
      [this.idKey()]: newId,
    } as T;
    const transformer = this.entityTransformer();
    const normalizedEntity = transformer ? transformer(entityToAdd) : entityToAdd;

    this.entities.set([...(this.entities() ?? []), normalizedEntity]);

    this.newEntity.set(null);
    this.isAdding.set(false);
  }

  protected updateField(key: string, value: T): void {
    this.newEntity.update(current => ({ ...current, [key]: value }) as T);

    if (key === this.labelKey()) {
      const normalizedText = this.#normalizeDuplicateValue(this.newEntity() as T);

      const exists = (this.entities() ?? []).some(item => {
        return this.#normalizeDuplicateValue(item) === normalizedText;
      });

      this.duplicateValue.set(exists ? normalizedText : null);
    }
  }

  #normalizeDuplicateValue(entity?: T): string {
    const previewFn = this.newEntityPreview();
    const targetEntity = entity ?? (this.newEntity() as T | null);

    if (previewFn && targetEntity) {
      const previewValue = previewFn(targetEntity);
      if (previewValue) {
        return previewValue.trim().toLowerCase();
      }
    }

    if (targetEntity) {
      const label = this.getLabel(targetEntity);
      return label.trim().toLowerCase();
    }

    return '';
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

  protected toggleIsAdding(): void {
    this.isAdding.set(!this.isAdding());
  }

  protected cancelAdding(): void {
    this.newEntity.set(null);
    this.isAdding.set(false);
    this.duplicateValue.set(null);
  }
}
