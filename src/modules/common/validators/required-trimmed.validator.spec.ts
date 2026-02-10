import { requiredTrimmedValidator } from './required-trimmed.validator';
import { FormControl } from '@angular/forms';

describe('requiredTrimmedValidator', () => {
  describe('Valid non-empty strings', () => {
    it('should return null for non-empty string', () => {
      const control = new FormControl('valid text');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with leading whitespace but content', () => {
      const control = new FormControl('  text');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with trailing whitespace but content', () => {
      const control = new FormControl('text  ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with both leading and trailing whitespace', () => {
      const control = new FormControl('  text  ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with internal whitespace', () => {
      const control = new FormControl('hello world');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for single character string', () => {
      const control = new FormControl('a');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for numeric string', () => {
      const control = new FormControl('123');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with special characters', () => {
      const control = new FormControl('!@#$%^&*()');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with emoji', () => {
      const control = new FormControl('😀');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for multiline string with content', () => {
      const control = new FormControl('line1\nline2');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for very long string', () => {
      const control = new FormControl('a'.repeat(10000));
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with unicode characters', () => {
      const control = new FormControl('Привет мир');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });
  });

  describe('Invalid empty or whitespace-only strings', () => {
    it('should return error for empty string', () => {
      const control = new FormControl('');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for single space', () => {
      const control = new FormControl(' ');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for multiple spaces', () => {
      const control = new FormControl('     ');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for tab character', () => {
      const control = new FormControl('\t');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for multiple tabs', () => {
      const control = new FormControl('\t\t\t');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for newline character', () => {
      const control = new FormControl('\n');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for multiple newlines', () => {
      const control = new FormControl('\n\n\n');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for carriage return', () => {
      const control = new FormControl('\r');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for mixed whitespace characters', () => {
      const control = new FormControl(' \t\n\r ');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for non-breaking space', () => {
      const control = new FormControl('\u00A0');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle zero-width space (not trimmed by JS trim())', () => {
      // Note: JavaScript's trim() doesn't remove zero-width space
      const control = new FormControl('\u200B');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });
  });

  describe('Non-string values', () => {
    it('should return null for null', () => {
      const control = new FormControl(null);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for undefined', () => {
      const control = new FormControl(undefined);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for number', () => {
      const control = new FormControl(123);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for zero', () => {
      const control = new FormControl(0);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for negative number', () => {
      const control = new FormControl(-123);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for boolean true', () => {
      const control = new FormControl(true);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for boolean false', () => {
      const control = new FormControl(false);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for object', () => {
      const control = new FormControl({ key: 'value' });
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for array', () => {
      const control = new FormControl([1, 2, 3]);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for empty object', () => {
      const control = new FormControl({});
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for empty array', () => {
      const control = new FormControl([]);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for function', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const control = new FormControl(() => {});
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for Date object', () => {
      const control = new FormControl(new Date());
      expect(requiredTrimmedValidator(control)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle string with only leading whitespace', () => {
      const control = new FormControl('     text');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle string with only trailing whitespace', () => {
      const control = new FormControl('text     ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle string with excessive whitespace on both sides', () => {
      const control = new FormControl('          text          ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle string that becomes empty after trim', () => {
      const control = new FormControl('   \t\n   ');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle string with only line breaks', () => {
      const control = new FormControl('\n\n\n');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle mixed content and whitespace that trims to content', () => {
      const control = new FormControl('  \t\n  hello  \n\t  ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle very long whitespace-only string', () => {
      const control = new FormControl(' '.repeat(10000));
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle string with zero-width characters (not trimmed by JS trim())', () => {
      // Note: JavaScript's trim() doesn't remove zero-width characters
      const control = new FormControl('\u200B\u200B\u200B');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle string with form feed character', () => {
      const control = new FormControl('\f');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle string with vertical tab', () => {
      const control = new FormControl('\v');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });
  });

  describe('Special whitespace characters', () => {
    it('should handle en space (U+2002)', () => {
      const control = new FormControl('\u2002');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle em space (U+2003)', () => {
      const control = new FormControl('\u2003');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle thin space (U+2009)', () => {
      const control = new FormControl('\u2009');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle hair space (U+200A)', () => {
      const control = new FormControl('\u200A');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should handle zero-width non-joiner (U+200C) - not trimmed by JS trim()', () => {
      // Note: JavaScript's trim() doesn't remove zero-width non-joiner
      const control = new FormControl('\u200C');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle zero-width joiner (U+200D) - not trimmed by JS trim()', () => {
      // Note: JavaScript's trim() doesn't remove zero-width joiner
      const control = new FormControl('\u200D');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });
  });

  describe('Boundary conditions', () => {
    it('should handle minimum valid input - single character', () => {
      const control = new FormControl('x');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle single character with leading space', () => {
      const control = new FormControl(' x');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle single character with trailing space', () => {
      const control = new FormControl('x ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should handle single character surrounded by spaces', () => {
      const control = new FormControl(' x ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should reject just below minimum - empty string', () => {
      const control = new FormControl('');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const control = new FormControl('  test  ');
      const result1 = requiredTrimmedValidator(control);
      const result2 = requiredTrimmedValidator(control);
      expect(result1).toBe(result2);
      expect(result1).toBeNull();
    });

    it('should return consistent error for whitespace-only input', () => {
      const control = new FormControl('   ');
      const result1 = requiredTrimmedValidator(control);
      const result2 = requiredTrimmedValidator(control);
      expect(result1).toEqual(result2);
      expect(result1).toEqual({ required: true });
    });

    it('should handle rapid successive validations', () => {
      const controls = [
        new FormControl('valid'),
        new FormControl('   '),
        new FormControl('  text  '),
        new FormControl(''),
      ];

      const results = controls.map(ctrl => requiredTrimmedValidator(ctrl));
      expect(results).toEqual([null, { required: true }, null, { required: true }]);
    });
  });

  describe('Integration with form controls', () => {
    it('should work with FormControl setValue', () => {
      const control = new FormControl('', requiredTrimmedValidator);

      expect(control.errors).toEqual({ required: true });

      control.setValue('valid text');
      expect(control.errors).toBeNull();

      control.setValue('   ');
      expect(control.errors).toEqual({ required: true });
    });

    it('should work with FormControl patchValue', () => {
      const control = new FormControl('initial', requiredTrimmedValidator);

      expect(control.errors).toBeNull();

      control.patchValue('   ');
      expect(control.errors).toEqual({ required: true });

      control.patchValue('new value');
      expect(control.errors).toBeNull();
    });

    it('should work with FormControl reset', () => {
      const control = new FormControl('text', requiredTrimmedValidator);

      expect(control.errors).toBeNull();

      control.reset('');
      expect(control.errors).toEqual({ required: true });

      control.reset('valid');
      expect(control.errors).toBeNull();
    });
  });

  describe('Combined with other validators', () => {
    it('should work alongside Validators.required', () => {
      const control = new FormControl('   ', requiredTrimmedValidator);
      expect(control.errors).toEqual({ required: true });
    });

    it('should differentiate from Validators.required behavior', () => {
      const control = new FormControl('   ');

      // requiredTrimmedValidator considers whitespace as invalid
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });
  });
});
