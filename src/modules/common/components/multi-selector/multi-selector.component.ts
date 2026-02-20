import { MultiSelectorDirective } from './multi-selector.directive';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  inject,
  input,
  TemplateRef,
} from '@angular/core';

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
  imports: [
    // angular modules
    NgTemplateOutlet,
    // pipes
    TitleCasePipe,
  ],
  hostDirectives: [
    {
      directive: MultiSelectorDirective,
      inputs: [
        'entities',
        'idKey',
        'readonlyKeys',
        'isSelectable',
        'isOnlySingleSelectable',
        'selectedEntities',
      ],
      outputs: ['selectedEntitiesChange'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectorComponent<T> {
  protected readonly selection = inject<MultiSelectorDirective<T>>(MultiSelectorDirective);

  public readonly labelKey = input.required<keyof T>();
  public readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  public readonly size = input<'sm' | 'md' | 'lg'>('sm');
  public readonly highlightedId = input<T[keyof T] | null>(null);

  public readonly itemTemplate = contentChild<TemplateRef<{ $implicit: T }>>('itemTemplate');

  protected getLabel(item: T): string {
    const label = item[this.labelKey()];
    return typeof label === 'string' ? label : String(label);
  }

  protected isHighlighted(item: T): boolean {
    const highlighted = this.highlightedId();
    return highlighted != null && item[this.selection.idKey()] === highlighted;
  }
}
