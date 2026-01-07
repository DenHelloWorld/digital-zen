import { getTimeInMilliseconds, isCurrentTimeAfter } from './time.helper';

describe('time.helper', () => {
  describe('getTimeInMilliseconds', () => {
    it('should return 0 for midnight (00:00:00.000)', () => {
      const date = new Date('2024-01-01T00:00:00.000');
      expect(getTimeInMilliseconds(date)).toBe(0);
    });

    it('should calculate milliseconds correctly for 1 hour', () => {
      const date = new Date('2024-01-01T01:00:00.000');
      const expected = 1 * 60 * 60 * 1000; // 3,600,000 ms
      expect(getTimeInMilliseconds(date)).toBe(expected);
    });

    it('should calculate milliseconds correctly for specific time', () => {
      const date = new Date('2024-01-01T14:30:45.500');
      const expected =
        14 * 60 * 60 * 1000 + // 14 hours
        30 * 60 * 1000 + // 30 minutes
        45 * 1000 + // 45 seconds
        500; // 500 milliseconds
      expect(getTimeInMilliseconds(date)).toBe(expected);
    });

    it('should return same value for same time on different dates', () => {
      const date1 = new Date('2024-01-01T14:30:00.000');
      const date2 = new Date('2024-12-31T14:30:00.000');
      const date3 = new Date('2025-06-15T14:30:00.000');

      expect(getTimeInMilliseconds(date1)).toBe(getTimeInMilliseconds(date2));
      expect(getTimeInMilliseconds(date2)).toBe(getTimeInMilliseconds(date3));
    });

    it('should handle maximum time value (23:59:59.999)', () => {
      const date = new Date('2024-01-01T23:59:59.999');
      const expected =
        23 * 60 * 60 * 1000 + // 23 hours
        59 * 60 * 1000 + // 59 minutes
        59 * 1000 + // 59 seconds
        999; // 999 milliseconds
      expect(getTimeInMilliseconds(date)).toBe(expected);
      expect(getTimeInMilliseconds(date)).toBe(86399999);
    });

    it('should handle noon (12:00:00.000)', () => {
      const date = new Date('2024-01-01T12:00:00.000');
      const expected = 12 * 60 * 60 * 1000; // 43,200,000 ms
      expect(getTimeInMilliseconds(date)).toBe(expected);
    });

    it('should handle early morning times', () => {
      const date = new Date('2024-01-01T00:01:00.000');
      const expected = 1 * 60 * 1000; // 60,000 ms
      expect(getTimeInMilliseconds(date)).toBe(expected);
    });

    it('should handle times with only seconds', () => {
      const date = new Date('2024-01-01T00:00:30.000');
      const expected = 30 * 1000; // 30,000 ms
      expect(getTimeInMilliseconds(date)).toBe(expected);
    });

    it('should handle times with only milliseconds', () => {
      const date = new Date('2024-01-01T00:00:00.500');
      expect(getTimeInMilliseconds(date)).toBe(500);
    });

    it('should handle different years consistently', () => {
      const date2020 = new Date('2020-01-01T10:30:00.000');
      const date2024 = new Date('2024-01-01T10:30:00.000');
      const date2030 = new Date('2030-01-01T10:30:00.000');

      expect(getTimeInMilliseconds(date2020)).toBe(getTimeInMilliseconds(date2024));
      expect(getTimeInMilliseconds(date2024)).toBe(getTimeInMilliseconds(date2030));
    });

    it('should handle leap year dates (ignores date portion)', () => {
      const leap = new Date('2024-02-29T15:45:30.123');
      const nonLeap = new Date('2023-03-01T15:45:30.123');

      expect(getTimeInMilliseconds(leap)).toBe(getTimeInMilliseconds(nonLeap));
    });

    it('should return values within valid range (0 to 86399999)', () => {
      const midnight = new Date('2024-01-01T00:00:00.000');
      const almostMidnight = new Date('2024-01-01T23:59:59.999');

      expect(getTimeInMilliseconds(midnight)).toBeGreaterThanOrEqual(0);
      expect(getTimeInMilliseconds(almostMidnight)).toBeLessThan(86400000);
    });

    it('should handle different timezones (uses local time)', () => {
      // Note: getHours(), getMinutes() etc. return local time
      const date = new Date('2024-01-01T12:00:00.000Z');
      const result = getTimeInMilliseconds(date);

      // Result depends on local timezone, but should be consistent
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(86400000);
    });

    it('should produce sequential results for sequential times', () => {
      const time1 = new Date('2024-01-01T10:00:00.000');
      const time2 = new Date('2024-01-01T10:00:01.000');
      const time3 = new Date('2024-01-01T10:00:02.000');

      expect(getTimeInMilliseconds(time2)).toBeGreaterThan(getTimeInMilliseconds(time1));
      expect(getTimeInMilliseconds(time3)).toBeGreaterThan(getTimeInMilliseconds(time2));
    });
  });

  describe('isCurrentTimeAfter', () => {
    it('should return true when current time is after target time', () => {
      const current = new Date('2024-01-01T14:30:00.000');
      const target = new Date('2024-01-01T10:00:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(true);
    });

    it('should return false when current time is before target time', () => {
      const current = new Date('2024-01-01T10:00:00.000');
      const target = new Date('2024-01-01T14:30:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(false);
    });

    it('should return false when times are equal', () => {
      const current = new Date('2024-01-01T12:00:00.000');
      const target = new Date('2024-01-01T12:00:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(false);
    });

    it('should compare time only, ignoring dates', () => {
      const current = new Date('2024-12-31T14:30:00.000');
      const target = new Date('2024-01-01T10:00:00.000');
      // Even though current date is much later, only time matters
      expect(isCurrentTimeAfter(current, target)).toBe(true);
    });

    it('should compare time only when dates are different', () => {
      const current = new Date('2020-01-01T09:00:00.000');
      const target = new Date('2030-12-31T15:00:00.000');
      // current date is earlier, but time is what matters
      expect(isCurrentTimeAfter(current, target)).toBe(false);
    });

    it('should handle midnight comparisons', () => {
      const current = new Date('2024-01-01T00:00:00.001');
      const target = new Date('2024-01-01T00:00:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(true);
    });

    it('should handle near-midnight comparisons', () => {
      const current = new Date('2024-01-01T23:59:59.999');
      const target = new Date('2024-01-01T00:00:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(true);
    });

    it('should handle millisecond precision', () => {
      const current = new Date('2024-01-01T12:00:00.501');
      const target = new Date('2024-01-01T12:00:00.500');
      expect(isCurrentTimeAfter(current, target)).toBe(true);
    });

    it('should return false for same millisecond', () => {
      const current = new Date('2024-01-01T12:00:00.500');
      const target = new Date('2024-12-31T12:00:00.500');
      expect(isCurrentTimeAfter(current, target)).toBe(false);
    });

    it('should handle morning vs afternoon comparisons', () => {
      const morning = new Date('2024-01-01T09:00:00.000');
      const afternoon = new Date('2024-01-01T15:00:00.000');

      expect(isCurrentTimeAfter(afternoon, morning)).toBe(true);
      expect(isCurrentTimeAfter(morning, afternoon)).toBe(false);
    });

    it('should handle noon boundary', () => {
      const beforeNoon = new Date('2024-01-01T11:59:59.999');
      const noon = new Date('2024-01-01T12:00:00.000');
      const afterNoon = new Date('2024-01-01T12:00:00.001');

      expect(isCurrentTimeAfter(noon, beforeNoon)).toBe(true);
      expect(isCurrentTimeAfter(afterNoon, noon)).toBe(true);
      expect(isCurrentTimeAfter(beforeNoon, noon)).toBe(false);
    });

    it('should work with same Date object references', () => {
      const current = new Date('2024-01-01T14:30:00.000');
      const target = new Date('2024-01-01T14:30:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(false);
    });

    it('should handle different years with same time', () => {
      const current = new Date('2025-06-15T10:30:00.000');
      const target = new Date('2020-01-01T10:30:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(false); // same time
    });

    it('should handle leap year dates', () => {
      const current = new Date('2024-02-29T16:00:00.000');
      const target = new Date('2023-03-01T14:00:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(true);
    });

    it('should be consistent with getTimeInMilliseconds', () => {
      const current = new Date('2024-01-01T14:30:00.000');
      const target = new Date('2024-01-01T10:00:00.000');

      const currentMs = getTimeInMilliseconds(current);
      const targetMs = getTimeInMilliseconds(target);

      expect(isCurrentTimeAfter(current, target)).toBe(currentMs > targetMs);
    });

    it('should handle edge case of one millisecond difference', () => {
      const current = new Date('2024-01-01T12:00:00.001');
      const target = new Date('2024-01-01T12:00:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(true);

      const current2 = new Date('2024-01-01T12:00:00.000');
      const target2 = new Date('2024-01-01T12:00:00.001');
      expect(isCurrentTimeAfter(current2, target2)).toBe(false);
    });

    it('should handle comparison across different timezones (using local time)', () => {
      // Both dates will be interpreted in local timezone
      const current = new Date('2024-01-01T14:00:00.000');
      const target = new Date('2024-01-01T10:00:00.000');
      expect(isCurrentTimeAfter(current, target)).toBe(true);
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle time wrapping (does not handle midnight wrap)', () => {
      // Note: The function does NOT handle periods that span midnight
      // 23:00 to 02:00 would not work as expected
      const current = new Date('2024-01-01T01:00:00.000');
      const target = new Date('2024-01-01T23:00:00.000');

      // This returns false because 01:00 < 23:00 in time-only comparison
      expect(isCurrentTimeAfter(current, target)).toBe(false);
    });

    it('should work for typical business hours check', () => {
      const workStart = new Date('2024-01-01T09:00:00.000');
      const workEnd = new Date('2024-01-01T17:00:00.000');

      const during = new Date('2024-01-01T14:30:00.000');
      const before = new Date('2024-01-01T08:00:00.000');
      const after = new Date('2024-01-01T18:00:00.000');

      expect(isCurrentTimeAfter(during, workStart)).toBe(true);
      expect(isCurrentTimeAfter(before, workStart)).toBe(false);
      expect(isCurrentTimeAfter(after, workEnd)).toBe(true);
    });

    it('should maintain precision across calculations', () => {
      const date1 = new Date('2024-01-01T12:34:56.789');
      const ms = getTimeInMilliseconds(date1);

      // Verify precision is maintained
      const expectedMs = 12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 * 1000 + 789;

      expect(ms).toBe(expectedMs);
    });

    it('should handle rapid successive comparisons', () => {
      const times = [
        new Date('2024-01-01T08:00:00.000'),
        new Date('2024-01-01T10:00:00.000'),
        new Date('2024-01-01T12:00:00.000'),
        new Date('2024-01-01T14:00:00.000'),
      ];

      for (let i = 1; i < times.length; i++) {
        expect(isCurrentTimeAfter(times[i], times[i - 1])).toBe(true);
      }
    });
  });

  describe('Type safety and input validation', () => {
    it('should work with Date objects created in different ways', () => {
      const date1 = new Date('2024-01-01T12:00:00.000');
      const date2 = new Date(2024, 0, 1, 12, 0, 0, 0);

      expect(getTimeInMilliseconds(date1)).toBe(getTimeInMilliseconds(date2));
    });

    it('should handle Date objects with timezone offsets', () => {
      const date1 = new Date('2024-01-01T12:00:00.000Z');
      const date2 = new Date('2024-01-01T12:00:00.000+05:00');

      // Results will differ based on timezone interpretation
      const ms1 = getTimeInMilliseconds(date1);
      const ms2 = getTimeInMilliseconds(date2);

      expect(typeof ms1).toBe('number');
      expect(typeof ms2).toBe('number');
    });
  });
});
