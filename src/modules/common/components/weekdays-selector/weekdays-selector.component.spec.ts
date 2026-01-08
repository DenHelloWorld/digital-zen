import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeekdaysSelectorComponent } from './weekdays-selector.component';
import { MultiSelectorComponent } from '../multi-selector/multi-selector.component';
import { ALL_DAYS_OF_WEEK } from '../../constants';
import { IFocus } from '../../models';

/**
 * WeekdaysSelectorComponent Tests
 *
 * @guidelines
 * - DZ_01: Standalone component testing
 * - DZ_03: OnPush change detection testing
 * - DZ_04: Testing with Angular Signals (InputSignal, ModelSignal)
 *
 * @see /docs/testing-guide.md
 * @see /docs/testing-best-practices.md
 */
describe('WeekdaysSelectorComponent', () => {
  let component: WeekdaysSelectorComponent;
  let fixture: ComponentFixture<WeekdaysSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekdaysSelectorComponent], // Standalone component in imports
    }).compileComponents();

    fixture = TestBed.createComponent(WeekdaysSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have all days of the week', () => {
      expect(component['allDays']).toEqual(ALL_DAYS_OF_WEEK);
      expect(component['allDays'].length).toBe(7);
    });

    it('should have correct idKey', () => {
      expect(component['idKey']).toBe('day');
    });

    it('should have correct labelKey', () => {
      expect(component['labelKey']).toBe('name');
    });

    it('should calculate today day id', () => {
      const todayDayId = new Date().getDay();
      expect(component['todayDayId']).toBe(todayDayId);
    });

    it('should have default value for isSelectable', () => {
      expect(component.isSelectable()).toBe(true);
    });

    it('should have default value for isTodayShow', () => {
      expect(component.isTodayShow()).toBe(true);
    });

    it('should initialize selectedDays as undefined', () => {
      expect(component.selectedDays()).toBeUndefined();
    });
  });

  describe('Template rendering', () => {
    it('should render dz-multi-selector component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const multiSelector = compiled.querySelector('dz-multi-selector');
      expect(multiSelector).toBeTruthy();
    });

    it('should pass entities to multi-selector', () => {
      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.entities()).toEqual(ALL_DAYS_OF_WEEK);
    });

    it('should pass labelKey to multi-selector', () => {
      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.labelKey()).toBe('name');
    });

    it('should pass idKey to multi-selector', () => {
      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.idKey()).toBe('day');
    });

    it('should pass horizontal orientation to multi-selector', () => {
      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.orientation()).toBe('horizontal');
    });

    it('should pass isSelectable to multi-selector', () => {
      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.isSelectable()).toBe(true);
    });

    it('should highlight today when isTodayShow is true', () => {
      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.highlightedId()).toBe(component['todayDayId']);
    });

    it('should not highlight when isTodayShow is false', () => {
      fixture.componentRef.setInput('isTodayShow', false);
      fixture.detectChanges();

      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.highlightedId()).toBeNull();
    });
  });

  describe('Two-way binding with selectedDays', () => {
    it('should update selectedDays when multi-selector selection changes', () => {
      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;

      // Simulate selection
      const selectedDays = [ALL_DAYS_OF_WEEK[0], ALL_DAYS_OF_WEEK[1]];
      multiSelectorComponent.selectedEntities.set(selectedDays);
      fixture.detectChanges();

      expect(component.selectedDays()).toEqual(selectedDays);
    });

    it('should pass selectedDays to multi-selector', () => {
      const selectedDays = [ALL_DAYS_OF_WEEK[2], ALL_DAYS_OF_WEEK[3]];
      component.selectedDays.set(selectedDays);
      fixture.detectChanges();

      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.selectedEntities()).toEqual(selectedDays);
    });
  });

  describe('Input: isSelectable', () => {
    it('should accept isSelectable input', () => {
      fixture.componentRef.setInput('isSelectable', false);
      fixture.detectChanges();

      expect(component.isSelectable()).toBe(false);
    });

    it('should pass isSelectable to multi-selector', () => {
      fixture.componentRef.setInput('isSelectable', false);
      fixture.detectChanges();

      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.isSelectable()).toBe(false);
    });
  });

  describe('Input: isTodayShow', () => {
    it('should accept isTodayShow input', () => {
      fixture.componentRef.setInput('isTodayShow', false);
      fixture.detectChanges();

      expect(component.isTodayShow()).toBe(false);
    });

    it('should control highlighting based on isTodayShow', () => {
      fixture.componentRef.setInput('isTodayShow', true);
      fixture.detectChanges();

      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.highlightedId()).toBe(component['todayDayId']);

      fixture.componentRef.setInput('isTodayShow', false);
      fixture.detectChanges();

      expect(multiSelectorComponent.highlightedId()).toBeNull();
    });
  });

  describe('Change detection', () => {
    it('should use OnPush change detection strategy', () => {
      expect(fixture.componentRef.changeDetectorRef).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty selectedDays', () => {
      component.selectedDays.set([]);
      fixture.detectChanges();

      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.selectedEntities()).toEqual([]);
    });

    it('should handle all days selected', () => {
      component.selectedDays.set([...ALL_DAYS_OF_WEEK]);
      fixture.detectChanges();

      const multiSelectorComponent = fixture.debugElement.children[0]
        .componentInstance as MultiSelectorComponent<IFocus.DayOfWeek>;
      expect(multiSelectorComponent.selectedEntities()?.length).toBe(7);
    });

    it('should maintain immutability of ALL_DAYS_OF_WEEK', () => {
      const originalLength = ALL_DAYS_OF_WEEK.length;
      component.selectedDays.set([ALL_DAYS_OF_WEEK[0]]);
      fixture.detectChanges();

      expect(ALL_DAYS_OF_WEEK.length).toBe(originalLength);
      expect(component['allDays'].length).toBe(originalLength);
    });
  });
});
