import { FormControl } from '@angular/forms';
import { arrayMinLengthValidator } from './array-min-length.validator';

describe('arrayMinLengthValidator', () => {
  describe('Valid arrays', () => {
    it('should return null for array with exactly minimum length (default 1)', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl([1]);
      expect(validator(control)).toBeNull();
    });

    it('should return null for array with more than minimum length (default 1)', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl([1, 2, 3]);
      expect(validator(control)).toBeNull();
    });

    it('should return null for array with exactly custom minimum length', () => {
      const validator = arrayMinLengthValidator(3);
      const control = new FormControl([1, 2, 3]);
      expect(validator(control)).toBeNull();
    });

    it('should return null for array with more than custom minimum length', () => {
      const validator = arrayMinLengthValidator(2);
      const control = new FormControl([1, 2, 3, 4, 5]);
      expect(validator(control)).toBeNull();
    });

    it('should return null for array with different types of elements', () => {
      const validator = arrayMinLengthValidator(3);
      const control = new FormControl(['string', 123, { key: 'value' }]);
      expect(validator(control)).toBeNull();
    });

    it('should return null for array with nested arrays', () => {
      const validator = arrayMinLengthValidator(2);
      const control = new FormControl([
        [1, 2],
        [3, 4],
      ]);
      expect(validator(control)).toBeNull();
    });

    it('should return null for array with objects', () => {
      const validator = arrayMinLengthValidator(2);
      const control = new FormControl([{ id: 1 }, { id: 2 }]);
      expect(validator(control)).toBeNull();
    });

    it('should return null for very large arrays', () => {
      const validator = arrayMinLengthValidator(100);
      const control = new FormControl(Array(150).fill(1));
      expect(validator(control)).toBeNull();
    });

    it('should handle minimum length of 0', () => {
      const validator = arrayMinLengthValidator(0);
      const control = new FormControl([]);
      expect(validator(control)).toBeNull();
    });
  });

  describe('Invalid arrays', () => {
    it('should return error for empty array with default minimum', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl([]);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for array shorter than custom minimum', () => {
      const validator = arrayMinLengthValidator(3);
      const control = new FormControl([1, 2]);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for empty array with custom minimum', () => {
      const validator = arrayMinLengthValidator(5);
      const control = new FormControl([]);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for array with length one less than minimum', () => {
      const validator = arrayMinLengthValidator(10);
      const control = new FormControl(Array(9).fill(0));
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });
  });

  describe('Non-array values', () => {
    it('should return error for null', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl(null);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for undefined', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl(undefined);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for string', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl('not an array');
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for number', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl(123);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for object', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl({ key: 'value' });
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for boolean', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl(true);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should return error for empty string', () => {
      const validator = arrayMinLengthValidator();
      const control = new FormControl('');
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });
  });

  describe('Edge cases', () => {
    it('should handle negative minimum length (treated as invalid)', () => {
      const validator = arrayMinLengthValidator(-1);
      const control = new FormControl([1, 2, 3]);
      expect(validator(control)).toBeNull();
    });

    it('should handle very large minimum length', () => {
      const validator = arrayMinLengthValidator(1000);
      const control = new FormControl(Array(999).fill(1));
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should handle array with null elements', () => {
      const validator = arrayMinLengthValidator(2);
      const control = new FormControl([null, null]);
      expect(validator(control)).toBeNull();
    });

    it('should handle array with undefined elements', () => {
      const validator = arrayMinLengthValidator(2);
      const control = new FormControl([undefined, undefined]);
      expect(validator(control)).toBeNull();
    });

    it('should handle array with mixed null and undefined', () => {
      const validator = arrayMinLengthValidator(3);
      const control = new FormControl([null, undefined, 'value']);
      expect(validator(control)).toBeNull();
    });

    it('should handle array with empty strings', () => {
      const validator = arrayMinLengthValidator(2);
      const control = new FormControl(['', '']);
      expect(validator(control)).toBeNull();
    });

    it('should handle sparse arrays', () => {
      const validator = arrayMinLengthValidator(3);
      const sparseArray = [];
      sparseArray[0] = 'a';
      sparseArray[2] = 'c';
      sparseArray.length = 3;
      const control = new FormControl(sparseArray);
      expect(validator(control)).toBeNull();
    });

    it('should handle array-like objects (should fail as not true array)', () => {
      const validator = arrayMinLengthValidator(2);
      const arrayLike = { 0: 'a', 1: 'b', length: 2 };
      const control = new FormControl(arrayLike);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });
  });

  describe('Boundary conditions', () => {
    it('should handle minimum length of 1 with single element', () => {
      const validator = arrayMinLengthValidator(1);
      const control = new FormControl(['single']);
      expect(validator(control)).toBeNull();
    });

    it('should handle minimum length of 1 with empty array', () => {
      const validator = arrayMinLengthValidator(1);
      const control = new FormControl([]);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });

    it('should handle exact boundary - array length equals minimum', () => {
      const validator = arrayMinLengthValidator(5);
      const control = new FormControl([1, 2, 3, 4, 5]);
      expect(validator(control)).toBeNull();
    });

    it('should handle just below boundary - array length one less than minimum', () => {
      const validator = arrayMinLengthValidator(5);
      const control = new FormControl([1, 2, 3, 4]);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const validator = arrayMinLengthValidator(3);
      const control = new FormControl([1, 2, 3]);
      const result1 = validator(control);
      const result2 = validator(control);
      expect(result1).toBe(result2);
      expect(result1).toBeNull();
    });

    it('should handle rapid successive validations', () => {
      const validator = arrayMinLengthValidator(2);
      const controls = [
        new FormControl([1, 2]),
        new FormControl([1]),
        new FormControl([1, 2, 3]),
        new FormControl([]),
      ];

      const results = controls.map(ctrl => validator(ctrl));
      expect(results).toEqual([null, { arrayTooShort: true }, null, { arrayTooShort: true }]);
    });

    it('should be reusable across multiple controls', () => {
      const validator = arrayMinLengthValidator(2);
      const control1 = new FormControl([1, 2]);
      const control2 = new FormControl([1]);

      expect(validator(control1)).toBeNull();
      expect(validator(control2)).toEqual({ arrayTooShort: true });
    });
  });

  describe('Default parameter behavior', () => {
    it('should use default minimum of 1 when no parameter provided', () => {
      const validator = arrayMinLengthValidator();
      const emptyControl = new FormControl([]);
      const singleControl = new FormControl([1]);

      expect(validator(emptyControl)).toEqual({ arrayTooShort: true });
      expect(validator(singleControl)).toBeNull();
    });

    it('should accept explicit minimum of 1', () => {
      const validatorDefault = arrayMinLengthValidator();
      const validatorExplicit = arrayMinLengthValidator(1);
      const control = new FormControl([1]);

      expect(validatorDefault(control)).toEqual(validatorExplicit(control));
    });
  });

  describe('Factory function behavior', () => {
    it('should create independent validator instances', () => {
      const validator1 = arrayMinLengthValidator(2);
      const validator2 = arrayMinLengthValidator(3);

      const control = new FormControl([1, 2]);

      expect(validator1(control)).toBeNull();
      expect(validator2(control)).toEqual({ arrayTooShort: true });
    });

    it('should maintain validator configuration across calls', () => {
      const validator = arrayMinLengthValidator(3);
      const control1 = new FormControl([1, 2]);
      const control2 = new FormControl([1, 2, 3]);
      const control3 = new FormControl([1]);

      expect(validator(control1)).toEqual({ arrayTooShort: true });
      expect(validator(control2)).toBeNull();
      expect(validator(control3)).toEqual({ arrayTooShort: true });
    });
  });
});
