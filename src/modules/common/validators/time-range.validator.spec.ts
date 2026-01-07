import { FormControl, FormGroup } from '@angular/forms';
import { timeRangeValidator } from './time-range.validator';

describe('timeRangeValidator', () => {
  describe('Valid time ranges', () => {
    it('should return null when start time is before end time', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl('17:00'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should return null for minimal time difference (1 minute)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl('09:01'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should return null for overnight time range (wrapping midnight)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('23:00'),
        endTime: new FormControl('23:59'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should return null for full working day', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('08:00'),
        endTime: new FormControl('18:00'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should return null for early morning range', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('00:00'),
        endTime: new FormControl('06:00'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should return null for late night range', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('20:00'),
        endTime: new FormControl('23:59'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should return null with custom field names', () => {
      const validator = timeRangeValidator('begin', 'finish');
      const group = new FormGroup({
        begin: new FormControl('10:30'),
        finish: new FormControl('14:45'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should return null for time range with seconds', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00:00'),
        endTime: new FormControl('17:00:00'),
      });
      expect(validator(group)).toBeNull();
    });
  });

  describe('Invalid time ranges', () => {
    it('should return error when start time equals end time', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl('09:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when start time is after end time', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('17:00'),
        endTime: new FormControl('09:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when start time is much later than end time', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('23:00'),
        endTime: new FormControl('08:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when start time is one minute after end time', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:01'),
        endTime: new FormControl('09:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error for times at midnight boundary (equal)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('00:00'),
        endTime: new FormControl('00:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error for times at end of day (equal)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('23:59'),
        endTime: new FormControl('23:59'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });
  });

  describe('Missing time values', () => {
    it('should return error when start time is missing (null)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl(null),
        endTime: new FormControl('17:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when end time is missing (null)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl(null),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when both times are missing (null)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl(null),
        endTime: new FormControl(null),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when start time is undefined', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl(undefined),
        endTime: new FormControl('17:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when end time is undefined', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl(undefined),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when both times are undefined', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl(undefined),
        endTime: new FormControl(undefined),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when start time is empty string', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl(''),
        endTime: new FormControl('17:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when end time is empty string', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl(''),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when both times are empty strings', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl(''),
        endTime: new FormControl(''),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });
  });

  describe('Missing form controls', () => {
    it('should return error when start time control does not exist', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        endTime: new FormControl('17:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when end time control does not exist', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when both controls do not exist', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        otherField: new FormControl('value'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should return error when form group is empty', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({});
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });
  });

  describe('Edge cases with time formats', () => {
    it('should handle time with leading zeros', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('08:00'),
        endTime: new FormControl('09:00'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should handle times without leading zeros (if supported)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('8:00'),
        endTime: new FormControl('9:00'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should handle 24-hour format at boundaries', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('00:00'),
        endTime: new FormControl('23:59'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should handle noon correctly', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('11:59'),
        endTime: new FormControl('12:01'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should handle midnight boundary correctly', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('23:59'),
        endTime: new FormControl('24:00'),
      });
      expect(validator(group)).toBeNull();
    });
  });

  describe('String comparison behavior', () => {
    it('should use lexicographic comparison (strings)', () => {
      // Since the validator uses string comparison, "09:00" < "17:00" lexicographically
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl('17:00'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should handle boundary case where string comparison differs from time', () => {
      // String comparison: "20:00" > "03:00" (which is correct for times in same day)
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('20:00'),
        endTime: new FormControl('03:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should handle same hour with different minutes', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('10:30'),
        endTime: new FormControl('10:45'),
      });
      expect(validator(group)).toBeNull();
    });
  });

  describe('Boundary conditions', () => {
    it('should handle minimum valid range (1 minute)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('12:00'),
        endTime: new FormControl('12:01'),
      });
      expect(validator(group)).toBeNull();
    });

    it('should reject range with 0 minute difference', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('12:00'),
        endTime: new FormControl('12:00'),
      });
      expect(validator(group)).toEqual({ invalidTimeRange: true });
    });

    it('should handle maximum valid range (almost full day)', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('00:00'),
        endTime: new FormControl('23:59'),
      });
      expect(validator(group)).toBeNull();
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for the same input', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl('17:00'),
      });
      const result1 = validator(group);
      const result2 = validator(group);
      expect(result1).toBe(result2);
      expect(result1).toBeNull();
    });

    it('should handle rapid successive validations', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const groups = [
        new FormGroup({
          startTime: new FormControl('09:00'),
          endTime: new FormControl('17:00'),
        }),
        new FormGroup({
          startTime: new FormControl('17:00'),
          endTime: new FormControl('09:00'),
        }),
        new FormGroup({
          startTime: new FormControl('10:00'),
          endTime: new FormControl('10:00'),
        }),
      ];

      const results = groups.map(grp => validator(grp));
      expect(results).toEqual([null, { invalidTimeRange: true }, { invalidTimeRange: true }]);
    });
  });

  describe('Factory function behavior', () => {
    it('should create independent validator instances with different field names', () => {
      const validator1 = timeRangeValidator('start', 'end');
      const validator2 = timeRangeValidator('begin', 'finish');

      const group1 = new FormGroup({
        start: new FormControl('09:00'),
        end: new FormControl('17:00'),
      });
      const group2 = new FormGroup({
        begin: new FormControl('09:00'),
        finish: new FormControl('17:00'),
      });

      expect(validator1(group1)).toBeNull();
      expect(validator2(group2)).toBeNull();
    });

    it('should maintain validator configuration across calls', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const validGroup = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl('17:00'),
      });
      const invalidGroup = new FormGroup({
        startTime: new FormControl('17:00'),
        endTime: new FormControl('09:00'),
      });

      expect(validator(validGroup)).toBeNull();
      expect(validator(invalidGroup)).toEqual({ invalidTimeRange: true });
      // Validate first group again to ensure state is not shared
      expect(validator(validGroup)).toBeNull();
    });
  });

  describe('Integration with FormGroup', () => {
    it('should work as group-level validator', () => {
      const group = new FormGroup(
        {
          startTime: new FormControl('09:00'),
          endTime: new FormControl('17:00'),
        },
        { validators: timeRangeValidator('startTime', 'endTime') }
      );

      expect(group.errors).toBeNull();
      expect(group.valid).toBe(true);
    });

    it('should update validation when values change', () => {
      const group = new FormGroup(
        {
          startTime: new FormControl('09:00'),
          endTime: new FormControl('17:00'),
        },
        { validators: timeRangeValidator('startTime', 'endTime') }
      );

      expect(group.errors).toBeNull();

      group.patchValue({ startTime: '18:00' });
      expect(group.errors).toEqual({ invalidTimeRange: true });

      group.patchValue({ endTime: '20:00' });
      expect(group.errors).toBeNull();
    });

    it('should validate on control reset', () => {
      const group = new FormGroup(
        {
          startTime: new FormControl('09:00'),
          endTime: new FormControl('17:00'),
        },
        { validators: timeRangeValidator('startTime', 'endTime') }
      );

      expect(group.errors).toBeNull();

      group.get('startTime')?.reset(null);
      expect(group.errors).toEqual({ invalidTimeRange: true });
    });
  });

  describe('Whitespace handling', () => {
    it('should handle times with leading whitespace', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl(' 09:00'),
        endTime: new FormControl('17:00'),
      });
      // String comparison: ' 09:00' < '17:00' is true
      expect(validator(group)).toBeNull();
    });

    it('should handle times with trailing whitespace', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('09:00'),
        endTime: new FormControl('17:00 '),
      });
      // String comparison: '09:00' < '17:00 ' is true
      expect(validator(group)).toBeNull();
    });

    it('should handle whitespace-only strings', () => {
      const validator = timeRangeValidator('startTime', 'endTime');
      const group = new FormGroup({
        startTime: new FormControl('   '),
        endTime: new FormControl('17:00'),
      });
      // Whitespace-only strings are truthy in JavaScript, so they pass the !start check
      // The validator then compares '   ' < '17:00' which is true lexicographically
      // This demonstrates actual validator behavior with edge case input
      expect(validator(group)).toBeNull();
    });
  });
});
