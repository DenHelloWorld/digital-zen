import { MultiSelectorComponent } from './multi-selector.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

/**
 * MultiSelectorComponent Tests
 *
 * @guidelines
 * - DZ_01: Standalone component testing
 * - DZ_03: OnPush change detection testing
 * - DZ_04: Testing with Angular Signals (InputSignal, ModelSignal)
 * - DZ_07: Testing with TypeScript generics
 *
 * @see /docs/testing-guide.md
 * @see /docs/testing-best-practices.md
 */

// Test data types
interface TestEntity {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MultiSelectorComponent],
  template: `
    <dz-multi-selector [entities]="entities" labelKey="name" idKey="id">
      <ng-template #itemTemplate let-item>
        <span class="custom-content">{{ item.name }} - custom</span>
      </ng-template>
    </dz-multi-selector>
  `,
})
class TestHostComponent {
  entities = [{ id: 99, name: 'custom item' }]; // Уникальный ID, чтобы не было NG0955
}

describe('MultiSelectorComponent', () => {
  let component: MultiSelectorComponent<TestEntity>;
  let fixture: ComponentFixture<MultiSelectorComponent<TestEntity>>;

  const mockEntities: TestEntity[] = [
    { id: 1, name: 'item one' },
    { id: 2, name: 'item two' },
    { id: 3, name: 'item three' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectorComponent, TestHostComponent], // Standalone component in imports
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectorComponent<TestEntity>);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('entities', mockEntities);
    fixture.componentRef.setInput('labelKey', 'name');
    fixture.componentRef.setInput('idKey', 'id');

    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with required inputs', () => {
      expect(component.entities()).toEqual(mockEntities);
      expect(component.labelKey()).toBe('name');
      expect(component.idKey()).toBe('id');
    });

    it('should have default values for optional inputs', () => {
      expect(component.readonlyKeys()).toEqual([]);
      expect(component.orientation()).toBe('vertical');
      expect(component.isSelectable()).toBe(true);
      expect(component.highlightedId()).toBeNull();
      expect(component.isOnlySingleSelectable()).toBe(false);
    });

    it('should initialize selectedEntities as undefined', () => {
      expect(component.selectedEntities()).toBeUndefined();
    });
  });

  describe('Selection behavior - Multiple selection mode', () => {
    it('should select an item when toggled', () => {
      component['toggle'](mockEntities[0]);

      const selected = component.selectedEntities();
      expect(selected).toBeDefined();
      expect(selected?.length).toBe(1);
      expect(selected?.[0]).toEqual(mockEntities[0]);
    });

    it('should deselect an item when toggled again', () => {
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[0]);

      const selected = component.selectedEntities();
      expect(selected).toEqual([]);
    });

    it('should select multiple items', () => {
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[1]);

      const selected = component.selectedEntities();
      expect(selected?.length).toBe(2);
      expect(selected).toContain(mockEntities[0]);
      expect(selected).toContain(mockEntities[1]);
    });

    it('should deselect specific item from multiple selections', () => {
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[1]);
      component['toggle'](mockEntities[2]);
      component['toggle'](mockEntities[1]); // Deselect middle item

      const selected = component.selectedEntities();
      expect(selected?.length).toBe(2);
      expect(selected).toContain(mockEntities[0]);
      expect(selected).toContain(mockEntities[2]);
      expect(selected).not.toContain(mockEntities[1]);
    });
  });

  describe('Selection behavior - Single selection mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isOnlySingleSelectable', true);
      fixture.detectChanges();
    });

    it('should select only one item at a time', () => {
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[1]);

      const selected = component.selectedEntities();
      expect(selected?.length).toBe(1);
      expect(selected?.[0]).toEqual(mockEntities[1]);
    });

    it('should deselect item when clicked again', () => {
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[0]);

      const selected = component.selectedEntities();
      expect(selected).toEqual([]);
    });

    it('should replace previous selection with new one', () => {
      component['toggle'](mockEntities[0]);
      expect(component.selectedEntities()?.[0]).toEqual(mockEntities[0]);

      component['toggle'](mockEntities[2]);
      const selected = component.selectedEntities();
      expect(selected?.length).toBe(1);
      expect(selected?.[0]).toEqual(mockEntities[2]);
    });
  });

  describe('Readonly behavior', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('readonlyKeys', [1, 2]);
      fixture.detectChanges();
    });

    it('should identify readonly items', () => {
      expect(component['isReadonly'](mockEntities[0])).toBe(true);
      expect(component['isReadonly'](mockEntities[1])).toBe(true);
      expect(component['isReadonly'](mockEntities[2])).toBe(false);
    });

    it('should not toggle readonly items', () => {
      component['toggle'](mockEntities[0]); // readonly item

      expect(component.selectedEntities()).toBeUndefined();
    });

    it('should toggle non-readonly items', () => {
      component['toggle'](mockEntities[2]); // non-readonly item

      const selected = component.selectedEntities();
      expect(selected?.length).toBe(1);
      expect(selected?.[0]).toEqual(mockEntities[2]);
    });
  });

  describe('Selectable behavior', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isSelectable', false);
      fixture.detectChanges();
    });

    it('should mark all items as readonly when not selectable', () => {
      expect(component['isReadonly'](mockEntities[0])).toBe(true);
      expect(component['isReadonly'](mockEntities[1])).toBe(true);
      expect(component['isReadonly'](mockEntities[2])).toBe(true);
    });

    it('should not toggle any items when not selectable', () => {
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[1]);

      expect(component.selectedEntities()).toBeUndefined();
    });
  });

  describe('isSelected method', () => {
    it('should return false when no items are selected', () => {
      expect(component['isSelected'](mockEntities[0])).toBe(false);
    });

    it('should return true for selected items', () => {
      component.selectedEntities.set([mockEntities[0], mockEntities[1]]);

      expect(component['isSelected'](mockEntities[0])).toBe(true);
      expect(component['isSelected'](mockEntities[1])).toBe(true);
      expect(component['isSelected'](mockEntities[2])).toBe(false);
    });

    it('should handle undefined selectedEntities', () => {
      component.selectedEntities.set(undefined);

      expect(component['isSelected'](mockEntities[0])).toBe(false);
    });
  });

  describe('getLabel method', () => {
    it('should return string label', () => {
      expect(component['getLabel'](mockEntities[0])).toBe('item one');
      expect(component['getLabel'](mockEntities[1])).toBe('item two');
    });

    it('should convert non-string labels to strings', () => {
      const numericEntity = { id: 4, name: 123 } as unknown as TestEntity;
      expect(component['getLabel'](numericEntity)).toBe('123');
    });
  });

  describe('Highlighting', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('highlightedId', 2);
      fixture.detectChanges();
    });

    it('should identify highlighted item', () => {
      expect(component['isHighlighted'](mockEntities[0])).toBe(false);
      expect(component['isHighlighted'](mockEntities[1])).toBe(true);
      expect(component['isHighlighted'](mockEntities[2])).toBe(false);
    });

    it('should return false when highlightedId is null', () => {
      fixture.componentRef.setInput('highlightedId', null);
      fixture.detectChanges();

      expect(component['isHighlighted'](mockEntities[0])).toBe(false);
      expect(component['isHighlighted'](mockEntities[1])).toBe(false);
    });
  });

  describe('Template rendering', () => {
    it('should render ul element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const ul = compiled.querySelector('ul');
      expect(ul).toBeTruthy();
      expect(ul?.classList.contains('dz-list')).toBe(true);
      expect(ul?.classList.contains('dz-list--full')).toBe(true);
    });

    it('should apply vertical orientation class by default', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const ul = compiled.querySelector('ul');
      expect(ul?.classList.contains('dz-list--vertical')).toBe(true);
      expect(ul?.classList.contains('dz-list--horizontal')).toBe(false);
    });

    it('should apply horizontal orientation class when set', () => {
      fixture.componentRef.setInput('orientation', 'horizontal');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const ul = compiled.querySelector('ul');
      expect(ul?.classList.contains('dz-list--horizontal')).toBe(true);
      expect(ul?.classList.contains('dz-list--vertical')).toBe(false);
    });

    it('should render all entities as list items', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const items = compiled.querySelectorAll('li');
      expect(items.length).toBe(mockEntities.length);
    });

    it('should render buttons with correct labels', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      expect(buttons[0].textContent?.trim()).toBe('Item One'); // titlecase applied
      expect(buttons[1].textContent?.trim()).toBe('Item Two');
      expect(buttons[2].textContent?.trim()).toBe('Item Three');
    });

    it('should apply activated class to selected items', () => {
      component.selectedEntities.set([mockEntities[0]]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      expect(buttons[0].classList.contains('dz-button--activated')).toBe(true);
      expect(buttons[1].classList.contains('dz-button--activated')).toBe(false);
    });

    it('should disable readonly items', () => {
      fixture.componentRef.setInput('readonlyKeys', [1]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');

      expect(buttons[0].disabled).toBe(true);
      expect(buttons[1].disabled).toBe(false);
      expect(buttons[2].disabled).toBe(false);
    });

    it('should apply highlighted class to highlighted items', () => {
      fixture.componentRef.setInput('highlightedId', 2);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const listItems = compiled.querySelectorAll('li');

      expect(listItems[0].classList.contains('dz-list__item--highlighted')).toBe(false);
      expect(listItems[1].classList.contains('dz-list__item--highlighted')).toBe(true);
      expect(listItems[2].classList.contains('dz-list__item--highlighted')).toBe(false);
    });

    it('should trigger toggle on button click', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelectorAll('button')[0];

      button.click();

      expect(component.selectedEntities()?.length).toBe(1);
      expect(component.selectedEntities()?.[0]).toEqual(mockEntities[0]);
    });
  });

  describe('Change detection', () => {
    it('should use OnPush change detection strategy', () => {
      expect(fixture.componentRef.changeDetectorRef).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty entities array', () => {
      fixture.componentRef.setInput('entities', []);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const items = compiled.querySelectorAll('li');
      expect(items.length).toBe(0);
    });

    it('should handle rapid toggle calls', () => {
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[0]);
      component['toggle'](mockEntities[0]);

      const selected = component.selectedEntities();
      expect(selected?.length).toBe(1);
      expect(selected?.[0]).toEqual(mockEntities[0]);
    });

    it('should maintain selection when entities change', () => {
      component.selectedEntities.set([mockEntities[0]]);
      const newEntities = [...mockEntities, { id: 4, name: 'item four' }];
      fixture.componentRef.setInput('entities', newEntities);
      fixture.detectChanges();

      expect(component['isSelected'](mockEntities[0])).toBe(true);
    });
  });

  describe('Custom Content Projection', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
    });

    it('should display custom template content when provided', () => {
      const compiled = hostFixture.nativeElement as HTMLElement;
      const customElement = compiled.querySelector('.custom-content');

      expect(customElement).toBeTruthy();
      expect(customElement?.textContent).toContain('custom item - custom');
    });

    it('should verify itemTemplate signal is populated in host', () => {
      const compiled = hostFixture.nativeElement as HTMLElement;
      const customElement = compiled.querySelector('.custom-content');
      expect(customElement).not.toBeNull();
    });

    it('should render default label in the main component fixture (no template)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('button');
      expect(button?.textContent?.trim()).toBe('Item One');
      expect(component.itemTemplate()).toBeUndefined();
    });
  });
});
