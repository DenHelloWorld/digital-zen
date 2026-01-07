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

/**
 * Checks if the current time falls within a specified time range.
 * Compares only the time portion of the dates, ignoring the date part.
 *
 * Note: This function does not handle time ranges that span midnight
 * (e.g., 22:00 to 02:00). It assumes the time range is within a single day.
 *
 * @param currentDate - The current date/time to check
 * @param startDate - The start of the time range (null means no lower bound)
 * @param endDate - The end of the time range (null means no upper bound)
 * @returns True if current time is within the range [start, end), false otherwise
 *
 * @example
 * ```typescript
 * const now = new Date('2024-01-15T14:30:00');
 * const start = new Date('2024-01-01T09:00:00');
 * const end = new Date('2024-01-01T17:00:00');
 * isCurrentTimeInRange(now, start, end); // true (14:30 is between 09:00 and 17:00)
 * ```
 */
export const isCurrentTimeInRange = (
  currentDate: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean => {
  // If both start and end are null, the time range is always valid
  if (startDate === null && endDate === null) {
    return true;
  }

  const currentTimeMs = getTimeInMilliseconds(currentDate);

  // If only start is specified, check if current time is after or equal to start
  if (startDate !== null && endDate === null) {
    const startTimeMs = getTimeInMilliseconds(startDate);
    return currentTimeMs >= startTimeMs;
  }

  // If only end is specified, check if current time is before end
  if (startDate === null && endDate !== null) {
    const endTimeMs = getTimeInMilliseconds(endDate);
    return currentTimeMs < endTimeMs;
  }

  // Both start and end are specified
  const startTimeMs = getTimeInMilliseconds(startDate!);
  const endTimeMs = getTimeInMilliseconds(endDate!);

  // Check if current time is within the range [start, end)
  return currentTimeMs >= startTimeMs && currentTimeMs < endTimeMs;
};
