import { FormControl } from '@angular/forms';
import { uniquePeriodNameValidator } from './unique-period-name.validator';
import { IFocus } from '../models/focus.model';

describe('uniquePeriodNameValidator', () => {
  // Helper function to create mock periods
  const createPeriod = (id: string, name: string): IFocus.Period => ({
    id,
    name,
    description: '',
    startFrom: null,
    endTo: null,
    webSites: [],
    daysOfWeek: [],
    focusedTimes: [],
    isFocused: false,
    sessionStartTime: null,
  });

  describe('Unique names (valid)', () => {
    it('should return null when name is unique', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Gaming');
      expect(validator(control)).toBeNull();
    });

    it('should return null when name is unique (case-insensitive check)', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('workout'); // Different from existing
      expect(validator(control)).toBeNull();
    });

    it('should return null when editing same period with same name', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods, '1');
      const control = new FormControl('Work'); // Same name as period being edited
      expect(validator(control)).toBeNull();
    });

    it('should return null when editing period and name is unique among others', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods, '1');
      const control = new FormControl('Gaming'); // Unique name
      expect(validator(control)).toBeNull();
    });

    it('should return null for unique name with different casing', () => {
      const existingPeriods = [createPeriod('1', 'work'), createPeriod('2', 'study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Gaming');
      expect(validator(control)).toBeNull();
    });

    it('should return null when name has extra whitespace but is still unique after trim', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('  Gaming  '); // Unique after trim
      expect(validator(control)).toBeNull();
    });

    it('should return null for very long unique names', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('A'.repeat(1000));
      expect(validator(control)).toBeNull();
    });

    it('should return null when existing periods array is empty', () => {
      const validator = uniquePeriodNameValidator([]);
      const control = new FormControl('Work');
      expect(validator(control)).toBeNull();
    });

    it('should return null when existing periods is null', () => {
      const validator = uniquePeriodNameValidator(null);
      const control = new FormControl('Work');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Duplicate names (invalid)', () => {
    it('should return error when name already exists (exact match)', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error when name exists with different casing', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('work'); // Same as 'Work' (case-insensitive)
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error when name exists with mixed casing', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('WoRk');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error when name matches after trimming', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('  Work  '); // Same after trim
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error when existing name has whitespace and input matches after trim', () => {
      const existingPeriods = [createPeriod('1', '  Work  '), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error when both names have whitespace but match after trim', () => {
      const existingPeriods = [createPeriod('1', '  Work  ')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('  work  ');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error when editing different period with existing name', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods, '3'); // Editing period '3'
      const control = new FormControl('Work'); // Name already used by period '1'
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error when name matches another period while editing', () => {
      const existingPeriods = [
        createPeriod('1', 'Work'),
        createPeriod('2', 'Study'),
        createPeriod('3', 'Gaming'),
      ];
      const validator = uniquePeriodNameValidator(existingPeriods, '2'); // Editing 'Study'
      const control = new FormControl('Work'); // Trying to rename to existing 'Work'
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error for uppercase duplicate', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('WORK');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should return error for lowercase duplicate', () => {
      const existingPeriods = [createPeriod('1', 'WORK')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('work');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });
  });

  describe('Empty and null values', () => {
    it('should return null for empty string', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return null for null', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });

    it('should return null for undefined', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl(undefined);
      expect(validator(control)).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('   ');
      expect(validator(control)).toBeNull();
    });

    it('should return null for tabs and newlines', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('\t\n');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Non-string values', () => {
    it('should return null for number', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl(123);
      expect(validator(control)).toBeNull();
    });

    it('should return null for boolean', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl(true);
      expect(validator(control)).toBeNull();
    });

    it('should return null for object', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl({ name: 'Work' });
      expect(validator(control)).toBeNull();
    });

    it('should return null for array', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl(['Work']);
      expect(validator(control)).toBeNull();
    });
  });

  describe('Edge cases with whitespace', () => {
    it('should handle leading whitespace in input', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('  Work');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should handle trailing whitespace in input', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work  ');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should handle leading whitespace in existing period', () => {
      const existingPeriods = [createPeriod('1', '  Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should handle trailing whitespace in existing period', () => {
      const existingPeriods = [createPeriod('1', 'Work  ')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should handle internal whitespace differences', () => {
      const existingPeriods = [createPeriod('1', 'Work Period')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('WorkPeriod'); // Different - no space
      expect(validator(control)).toBeNull();
    });

    it('should handle multiple spaces in names', () => {
      const existingPeriods = [createPeriod('1', 'Work  Period')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work Period'); // Different - single space
      expect(validator(control)).toBeNull();
    });
  });

  describe('Special characters', () => {
    it('should handle names with special characters (unique)', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work!@#');
      expect(validator(control)).toBeNull();
    });

    it('should handle names with special characters (duplicate)', () => {
      const existingPeriods = [createPeriod('1', 'Work!@#')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('work!@#');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should handle names with emoji (unique)', () => {
      const existingPeriods = [createPeriod('1', 'Work 😀')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work 😁');
      expect(validator(control)).toBeNull();
    });

    it('should handle names with emoji (duplicate)', () => {
      const existingPeriods = [createPeriod('1', 'Work 😀')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('work 😀');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should handle unicode characters', () => {
      const existingPeriods = [createPeriod('1', 'Работа')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('работа'); // Same in different case
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });
  });

  describe('Multiple existing periods', () => {
    it('should check against all existing periods', () => {
      const existingPeriods = [
        createPeriod('1', 'Work'),
        createPeriod('2', 'Study'),
        createPeriod('3', 'Gaming'),
        createPeriod('4', 'Exercise'),
      ];
      const validator = uniquePeriodNameValidator(existingPeriods);

      expect(validator(new FormControl('Work'))).toEqual({ duplicatePeriodName: true });
      expect(validator(new FormControl('study'))).toEqual({ duplicatePeriodName: true });
      expect(validator(new FormControl('GAMING'))).toEqual({ duplicatePeriodName: true });
      expect(validator(new FormControl('exercise'))).toEqual({ duplicatePeriodName: true });
      expect(validator(new FormControl('Sleep'))).toBeNull();
    });

    it('should handle large number of existing periods', () => {
      const existingPeriods = Array.from({ length: 100 }, (_, i) =>
        createPeriod(`${i}`, `Period${i}`)
      );
      const validator = uniquePeriodNameValidator(existingPeriods);

      expect(validator(new FormControl('period50'))).toEqual({ duplicatePeriodName: true });
      expect(validator(new FormControl('Period999'))).toBeNull();
    });
  });

  describe('Edit mode with currentPeriodId', () => {
    it('should allow same name when editing the same period', () => {
      const existingPeriods = [
        createPeriod('1', 'Work'),
        createPeriod('2', 'Study'),
        createPeriod('3', 'Gaming'),
      ];
      const validator = uniquePeriodNameValidator(existingPeriods, '2');
      const control = new FormControl('Study'); // Editing period 2, keeping same name
      expect(validator(control)).toBeNull();
    });

    it('should allow same name with different casing when editing same period', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods, '2');
      const control = new FormControl('STUDY'); // Same period, different casing
      expect(validator(control)).toBeNull();
    });

    it('should reject duplicate of other period when editing', () => {
      const existingPeriods = [
        createPeriod('1', 'Work'),
        createPeriod('2', 'Study'),
        createPeriod('3', 'Gaming'),
      ];
      const validator = uniquePeriodNameValidator(existingPeriods, '2');
      const control = new FormControl('Work'); // Trying to use name from period 1
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should handle non-existent currentPeriodId (new period scenario)', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods, 'non-existent');
      const control = new FormControl('Work');
      expect(validator(control)).toEqual({ duplicatePeriodName: true });
    });

    it('should allow unique name when editing with currentPeriodId', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods, '2');
      const control = new FormControl('Gaming'); // Unique name
      expect(validator(control)).toBeNull();
    });
  });

  describe('Boundary conditions', () => {
    it('should handle single existing period', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods);

      expect(validator(new FormControl('Work'))).toEqual({ duplicatePeriodName: true });
      expect(validator(new FormControl('Study'))).toBeNull();
    });

    it('should handle editing only period', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const validator = uniquePeriodNameValidator(existingPeriods, '1');
      const control = new FormControl('Work');
      expect(validator(control)).toBeNull();
    });

    it('should handle very similar names that are different', () => {
      const existingPeriods = [createPeriod('1', 'Work1')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work2');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);
      const control = new FormControl('Work');

      const result1 = validator(control);
      const result2 = validator(control);
      expect(result1).toEqual(result2);
      expect(result1).toEqual({ duplicatePeriodName: true });
    });

    it('should handle rapid successive validations', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);

      const controls = [
        new FormControl('Work'),
        new FormControl('Gaming'),
        new FormControl('study'),
        new FormControl('Sleep'),
      ];

      const results = controls.map(ctrl => validator(ctrl));
      expect(results).toEqual([
        { duplicatePeriodName: true },
        null,
        { duplicatePeriodName: true },
        null,
      ]);
    });
  });

  describe('Factory function behavior', () => {
    it('should create independent validator instances', () => {
      const periods1 = [createPeriod('1', 'Work')];
      const periods2 = [createPeriod('1', 'Study')];

      const validator1 = uniquePeriodNameValidator(periods1);
      const validator2 = uniquePeriodNameValidator(periods2);

      const control = new FormControl('Work');

      expect(validator1(control)).toEqual({ duplicatePeriodName: true });
      expect(validator2(control)).toBeNull();
    });

    it('should maintain validator configuration across calls', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const validator = uniquePeriodNameValidator(existingPeriods);

      expect(validator(new FormControl('Work'))).toEqual({ duplicatePeriodName: true });
      expect(validator(new FormControl('Gaming'))).toBeNull();
      expect(validator(new FormControl('study'))).toEqual({ duplicatePeriodName: true });
    });
  });

  describe('Integration with FormControl', () => {
    it('should work with FormControl validator', () => {
      const existingPeriods = [createPeriod('1', 'Work')];
      const control = new FormControl('Work', uniquePeriodNameValidator(existingPeriods));

      expect(control.errors).toEqual({ duplicatePeriodName: true });
      expect(control.valid).toBe(false);

      control.setValue('Study');
      expect(control.errors).toBeNull();
      expect(control.valid).toBe(true);
    });

    it('should update validation on value changes', () => {
      const existingPeriods = [createPeriod('1', 'Work'), createPeriod('2', 'Study')];
      const control = new FormControl('Gaming', uniquePeriodNameValidator(existingPeriods));

      expect(control.valid).toBe(true);

      control.setValue('Work');
      expect(control.valid).toBe(false);
      expect(control.errors).toEqual({ duplicatePeriodName: true });

      control.setValue('Exercise');
      expect(control.valid).toBe(true);
    });
  });
});
