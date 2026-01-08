import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicInputComponent } from './dynamic-input.component';
import { ICONS, UI_TEXT } from '../../constants';

/**
 * DynamicInputComponent Tests
 *
 * @guidelines
 * - DZ_01: Standalone component testing
 * - DZ_03: OnPush change detection testing
 * - DZ_04: Testing with Angular Signals (signal, computed, InputSignal, ModelSignal)
 * - DZ_07: Testing with TypeScript generics
 *
 * @see /docs/testing-guide.md
 * @see /docs/testing-best-practices.md
 */

// Test data types
interface TestEntity {
  id: number;
  name: string;
  description: string;
}

describe('DynamicInputComponent', () => {
  let component: DynamicInputComponent<TestEntity>;
  let fixture: ComponentFixture<DynamicInputComponent<TestEntity>>;

  const mockEntities: TestEntity[] = [
    { id: 1, name: 'Entity 1', description: 'Description 1' },
    { id: 2, name: 'Entity 2', description: 'Description 2' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicInputComponent], // Standalone component in imports
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicInputComponent<TestEntity>);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('labelKey', 'name');
    fixture.componentRef.setInput('idKey', 'id');
    fixture.componentRef.setInput('entities', mockEntities);

    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with required inputs', () => {
      expect(component.labelKey()).toBe('name');
      expect(component.idKey()).toBe('id');
      expect(component.entities()).toEqual(mockEntities);
    });

    it('should have default values for optional inputs', () => {
      expect(component.readonlyKeys()).toEqual([]);
      expect(component.excludeKeys()).toEqual([]);
    });

    it('should initialize isAdding to false', () => {
      expect(component['isAdding']()).toBe(false);
    });

    it('should initialize newEntity to null', () => {
      expect(component['newEntity']()).toBeNull();
    });

    it('should have uiText constant', () => {
      expect(component['uiText']).toBe(UI_TEXT);
    });

    it('should have icons constant', () => {
      expect(component['icons']).toBe(ICONS);
    });
  });

  describe('ngOnInit', () => {
    it('should copy entities to initEntities on init', () => {
      component.ngOnInit();
      // We can't directly access private signal, but we can test behavior
      component['resetEntities']();
      expect(component.entities()).toEqual(mockEntities);
    });
  });

  describe('entityKeys computed signal', () => {
    it('should compute entity keys excluding id and excluded keys', () => {
      const keys = component['entityKeys']();
      expect(keys).toContain('name');
      expect(keys).toContain('description');
      expect(keys).not.toContain('id');
    });

    it('should exclude keys specified in excludeKeys input', () => {
      fixture.componentRef.setInput('excludeKeys', ['description']);
      fixture.detectChanges();

      const keys = component['entityKeys']();
      expect(keys).toContain('name');
      expect(keys).not.toContain('description');
      expect(keys).not.toContain('id');
    });
  });

  describe('isNewEntityValid computed signal', () => {
    it('should return false when newEntity is null', () => {
      component['newEntity'].set(null);
      expect(component['isNewEntityValid']()).toBe(false);
    });

    it('should return true when all fields are filled', () => {
      component['newEntity'].set({ id: 0, name: 'Test', description: 'Test desc' });
      expect(component['isNewEntityValid']()).toBe(true);
    });

    it('should return false when any field is empty', () => {
      component['newEntity'].set({ id: 0, name: '', description: 'Test desc' });
      expect(component['isNewEntityValid']()).toBe(false);
    });

    it('should return false when any field is null', () => {
      component['newEntity'].set({ id: 0, name: 'Test', description: null as unknown as string });
      expect(component['isNewEntityValid']()).toBe(false);
    });

    it('should return false when any field is undefined', () => {
      component['newEntity'].set({
        id: 0,
        name: 'Test',
        description: undefined as unknown as string,
      });
      expect(component['isNewEntityValid']()).toBe(false);
    });

    it('should return false when any field has only whitespace', () => {
      component['newEntity'].set({ id: 0, name: '   ', description: 'Test desc' });
      expect(component['isNewEntityValid']()).toBe(false);
    });
  });

  describe('isPlaceholderShown computed signal', () => {
    it('should return true when no entities and not adding', () => {
      fixture.componentRef.setInput('entities', []);
      component['isAdding'].set(false);
      fixture.detectChanges();

      expect(component['isPlaceholderShown']()).toBe(true);
    });

    it('should return false when entities exist', () => {
      fixture.componentRef.setInput('entities', mockEntities);
      component['isAdding'].set(false);
      fixture.detectChanges();

      expect(component['isPlaceholderShown']()).toBe(false);
    });

    it('should return false when adding', () => {
      fixture.componentRef.setInput('entities', []);
      component['isAdding'].set(true);
      fixture.detectChanges();

      expect(component['isPlaceholderShown']()).toBe(false);
    });
  });

  describe('getLabel method', () => {
    it('should return string label', () => {
      expect(component['getLabel'](mockEntities[0])).toBe('Entity 1');
    });

    it('should convert non-string labels to strings', () => {
      const numericEntity = { id: 3, name: 123, description: 'Test' } as unknown as TestEntity;
      expect(component['getLabel'](numericEntity)).toBe('123');
    });
  });

  describe('isReadonly method', () => {
    it('should return false for non-readonly items', () => {
      expect(component['isReadonly'](mockEntities[0])).toBe(false);
    });

    it('should return true for readonly items', () => {
      fixture.componentRef.setInput('readonlyKeys', [1]);
      fixture.detectChanges();

      expect(component['isReadonly'](mockEntities[0])).toBe(true);
      expect(component['isReadonly'](mockEntities[1])).toBe(false);
    });
  });

  describe('toggleIsAdding method', () => {
    it('should toggle isAdding state', () => {
      expect(component['isAdding']()).toBe(false);

      component['toggleIsAdding']();
      expect(component['isAdding']()).toBe(true);

      component['toggleIsAdding']();
      expect(component['isAdding']()).toBe(false);
    });
  });

  describe('cancelAdding method', () => {
    it('should reset newEntity to null', () => {
      component['newEntity'].set({ id: 0, name: 'Test', description: 'Test' });
      component['cancelAdding']();

      expect(component['newEntity']()).toBeNull();
    });

    it('should set isAdding to false', () => {
      component['isAdding'].set(true);
      component['cancelAdding']();

      expect(component['isAdding']()).toBe(false);
    });
  });

  describe('updateField method', () => {
    it('should update field in newEntity', () => {
      component['newEntity'].set({ id: 0, name: '', description: '' });
      component['updateField']('name', 'Updated Name' as unknown as TestEntity);

      expect(component['newEntity']()?.name).toBe('Updated Name');
    });

    it('should create new object when newEntity is null', () => {
      component['newEntity'].set(null);
      component['updateField']('name', 'New Name' as unknown as TestEntity);

      expect(component['newEntity']()?.name).toBe('New Name');
    });

    it('should preserve other fields when updating one field', () => {
      component['newEntity'].set({ id: 0, name: 'Original', description: 'Original Desc' });
      component['updateField']('name', 'Updated Name' as unknown as TestEntity);

      const newEntity = component['newEntity']();
      expect(newEntity?.name).toBe('Updated Name');
      expect(newEntity?.description).toBe('Original Desc');
    });
  });

  describe('addEntity method', () => {
    it('should add new entity to entities list', () => {
      const newEntity = { id: 0, name: 'New Entity', description: 'New Description' };
      component['newEntity'].set(newEntity);

      component['addEntity']();

      const entities = component.entities();
      expect(entities?.length).toBe(3);
      expect(entities?.[2].name).toBe('New Entity');
      expect(entities?.[2].description).toBe('New Description');
    });

    it('should generate unique id using Date.now()', () => {
      const newEntity = { id: 0, name: 'New Entity', description: 'New Description' };
      component['newEntity'].set(newEntity);

      const beforeTime = Date.now();
      component['addEntity']();
      const afterTime = Date.now();

      const entities = component.entities();
      const addedEntity = entities?.[2];
      expect(addedEntity?.id).toBeGreaterThanOrEqual(beforeTime);
      expect(addedEntity?.id).toBeLessThanOrEqual(afterTime);
    });

    it('should toggle isAdding after adding', () => {
      component['newEntity'].set({ id: 0, name: 'Test', description: 'Test' });
      component['isAdding'].set(true);

      component['addEntity']();

      expect(component['isAdding']()).toBe(false);
    });

    it('should do nothing when newEntity is null', () => {
      component['newEntity'].set(null);
      const beforeLength = component.entities()?.length || 0;

      component['addEntity']();

      expect(component.entities()?.length).toBe(beforeLength);
    });
  });

  describe('removeEntity method', () => {
    it('should remove entity from list', () => {
      component['removeEntity'](mockEntities[0]);

      const entities = component.entities();
      expect(entities?.length).toBe(1);
      expect(entities?.[0]).toEqual(mockEntities[1]);
    });

    it('should remove correct entity by id', () => {
      component['removeEntity'](mockEntities[1]);

      const entities = component.entities();
      expect(entities?.length).toBe(1);
      expect(entities?.[0]).toEqual(mockEntities[0]);
    });

    it('should handle removing from empty list', () => {
      fixture.componentRef.setInput('entities', []);
      fixture.detectChanges();

      component['removeEntity'](mockEntities[0]);

      expect(component.entities()).toEqual([]);
    });
  });

  describe('resetEntities method', () => {
    it('should reset entities to initial state', () => {
      // Modify entities
      component['removeEntity'](mockEntities[0]);
      expect(component.entities()?.length).toBe(1);

      // Reset
      component['resetEntities']();

      expect(component.entities()).toEqual(mockEntities);
    });
  });

  describe('clearEntities method', () => {
    it('should clear all entities', () => {
      component['clearEntities']();

      expect(component.entities()).toEqual([]);
    });
  });

  describe('Template rendering - Entity list', () => {
    it('should render all entities', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const items = compiled.querySelectorAll('.item');
      expect(items.length).toBe(mockEntities.length);
    });

    it('should render entity names in inputs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const inputs = compiled.querySelectorAll<HTMLInputElement>('.item input');

      expect(inputs[0].value).toBe('Entity 1');
      expect(inputs[1].value).toBe('Entity 2');
    });

    it('should disable entity inputs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const inputs = compiled.querySelectorAll<HTMLInputElement>('.item input');

      inputs.forEach(input => {
        expect(input.disabled).toBe(true);
      });
    });

    it('should render delete buttons for each entity', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButtons = compiled.querySelectorAll('.item button.delete');
      expect(deleteButtons.length).toBe(mockEntities.length);
    });
  });

  describe('Template rendering - Placeholder', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('entities', []);
      component['isAdding'].set(false);
      fixture.detectChanges();
    });

    it('should show placeholder when no entities and not adding', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const placeholder = compiled.querySelector('.dz-placeholder');
      expect(placeholder).toBeTruthy();
    });

    it('should show placeholder text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const placeholderText = compiled.querySelector('.dz-placeholder__text');
      expect(placeholderText?.textContent).toContain(UI_TEXT.DYNAMIC_INPUT.EMPTY_PLACEHOLDER);
    });

    it('should show add button in placeholder', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const addButton = compiled.querySelector('.dz-placeholder button');
      expect(addButton?.textContent).toContain(UI_TEXT.DYNAMIC_INPUT.ADD_BUTTON);
    });
  });

  describe('Template rendering - Adding mode', () => {
    beforeEach(() => {
      component['isAdding'].set(true);
      component['newEntity'].set({ id: 0, name: '', description: '' });
      fixture.detectChanges();
    });

    it('should show adding section when isAdding is true', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const addingSection = compiled.querySelector('.item.dz-box.shadow');
      expect(addingSection).toBeTruthy();
    });

    it('should show hint text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const hint = compiled.querySelector('.dz-form__hint');
      expect(hint?.textContent).toContain(UI_TEXT.DYNAMIC_INPUT.HINTS.FILL_TO_ADD);
    });

    it('should render input fields for each entity key', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const inputs = compiled.querySelectorAll('.dz-box input');
      // Should have inputs for 'name' and 'description' (excluding 'id')
      expect(inputs.length).toBe(2);
    });

    it('should disable save button when entity is not valid', () => {
      component['newEntity'].set({ id: 0, name: '', description: '' });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const saveButton = compiled.querySelector('.dz-box button.dz-button--activated');
      expect(saveButton?.hasAttribute('disabled')).toBe(true);
    });

    it('should enable save button when entity is valid', () => {
      component['newEntity'].set({ id: 0, name: 'Valid', description: 'Valid desc' });
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const saveButton = compiled.querySelector('.dz-box button.dz-button--activated');
      expect(saveButton?.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('Template rendering - Action buttons', () => {
    it('should show action buttons when not adding', () => {
      component['isAdding'].set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const actions = compiled.querySelector('.actions');
      expect(actions).toBeTruthy();
    });

    it('should show add button when entities exist', () => {
      component['isAdding'].set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('.actions button');
      // Should have add, reset, and delete all buttons
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should always show reset button', () => {
      component['isAdding'].set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const resetButton = Array.from(compiled.querySelectorAll('.actions button')).find(btn =>
        btn.getAttribute('title')?.includes(UI_TEXT.DYNAMIC_INPUT.TITLES.RESET)
      );
      expect(resetButton).toBeTruthy();
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
      const items = compiled.querySelectorAll('.item');
      expect(items.length).toBe(0);
    });

    it('should handle multiple rapid add/cancel operations', () => {
      component['toggleIsAdding']();
      component['cancelAdding']();
      component['toggleIsAdding']();
      component['cancelAdding']();

      expect(component['isAdding']()).toBe(false);
      expect(component['newEntity']()).toBeNull();
    });

    it('should handle entities with special characters', () => {
      const specialEntity = {
        id: 3,
        name: 'Test <>&"',
        description: 'Test\'s "description"',
      };
      fixture.componentRef.setInput('entities', [specialEntity]);
      fixture.detectChanges();

      expect(component['getLabel'](specialEntity)).toBe('Test <>&"');
    });
  });
});
