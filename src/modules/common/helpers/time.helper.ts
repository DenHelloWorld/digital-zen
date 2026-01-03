const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

/**
 * Extracts time-only value from a Date object.
 * Returns milliseconds since midnight (ignoring the date portion).
 * This allows for time-only comparisons regardless of the actual date.
 *
 * @param date - The date object to extract time from
 * @returns Milliseconds since midnight (0-86399999)
 *
 * @example
 * ```typescript
 * const date1 = new Date('2024-01-01T14:30:00');
 * const date2 = new Date('2024-12-31T14:30:00');
 * getTimeInMilliseconds(date1) === getTimeInMilliseconds(date2); // true
 * ```
 */
export const getTimeInMilliseconds = (date: Date): number => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  return (
    hours * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND +
    minutes * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND +
    seconds * MILLISECONDS_PER_SECOND +
    milliseconds
  );
};

/**
 * Compares current time with a target time, ignoring the date portion.
 * Returns true if current time (hours:minutes:seconds) is after the target time.
 *
 * Note: This function compares time within the same day. It does not handle
 * periods that span midnight (e.g., 22:00 to 02:00).
 *
 * @param currentDate - The current date/time to compare
 * @param targetDate - The target date/time to compare against
 * @returns True if current time is after target time, false otherwise
 *
 * @example
 * ```typescript
 * const now = new Date('2024-01-15T14:30:00');
 * const target = new Date('2024-01-01T10:00:00');
 * isCurrentTimeAfter(now, target); // true (14:30 > 10:00)
 * ```
 */
export const isCurrentTimeAfter = (currentDate: Date, targetDate: Date): boolean => {
  const currentTimeMs = getTimeInMilliseconds(currentDate);
  const targetTimeMs = getTimeInMilliseconds(targetDate);
  return currentTimeMs > targetTimeMs;
};
