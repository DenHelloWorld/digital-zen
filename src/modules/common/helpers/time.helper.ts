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
 * Проверяет, попадает ли текущее время в указанный диапазон.
 * Сравнивает только временную часть дат, игнорируя календарную дату.
 * * Теперь поддерживает диапазоны, пересекающие полночь (например, с 22:00 до 02:00).
 *
 * @param currentDate - Текущая дата/время для проверки
 * @param startDate - Начало диапазона (null означает отсутствие нижней границы)
 * @param endDate - Конец диапазона (null означает отсутствие верхней границы)
 * @returns True, если текущее время находится в диапазоне [start, end), иначе false
 */
export const isCurrentTimeInRange = (
  currentDate: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean => {
  // Если обе границы не заданы, диапазон всегда валиден
  if (startDate === null && endDate === null) {
    return true;
  }

  const currentTimeMs = getTimeInMilliseconds(currentDate);

  // Если задано только начало: время должно быть позже или равно start
  if (startDate !== null && endDate === null) {
    const startTimeMs = getTimeInMilliseconds(startDate);
    return currentTimeMs >= startTimeMs;
  }

  // Если задан только конец: время должно быть строго до end
  if (startDate === null && endDate !== null) {
    const endTimeMs = getTimeInMilliseconds(endDate);
    return currentTimeMs < endTimeMs;
  }

  // Обе границы заданы
  const startTimeMs = getTimeInMilliseconds(startDate!);
  const endTimeMs = getTimeInMilliseconds(endDate!);

  if (startTimeMs <= endTimeMs) {
    // Стандартный диапазон внутри одного дня (например, 09:00 - 17:00)
    return currentTimeMs >= startTimeMs && currentTimeMs < endTimeMs;
  } else {
    // Диапазон, пересекающий полночь (например, 22:00 - 04:00)
    // Время должно быть ИЛИ после начала (вечер), ИЛИ до конца (утро)
    return currentTimeMs >= startTimeMs || currentTimeMs < endTimeMs;
  }
};

/**
 * Converts a Date object to a "Wall Time" ISO string (ignoring timezones).
 * This ensures that if you set 10:00 AM, it remains 10:00 AM regardless of UTC offsets.
 * The result is a string like "2024-05-20T10:00:00.000" (without the 'Z' suffix).
 *
 * @param date - The date object to convert
 * @returns ISO string without timezone indicator, or null if input is invalid
 *
 * @example
 * ```typescript
 * const date = new Date('2024-01-14T10:00:00+03:00'); // 10:00 AM local
 * toWallTimeISO(date); // "2024-01-14T10:00:00.000"
 * ```
 */
export const toWallTimeISO = (date: Date | string | null): string | null => {
  if (!date) {
    return null;
  }

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return null;
  }

  // Shift the date by the timezone offset so toISOString() outputs local time as if it were UTC
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  const localTime = new Date(d.getTime() - tzOffsetMs);

  // Remove the 'Z' at the end to mark it as a naive/local date string
  return localTime.toISOString().slice(0, -1);
};

/**
 * Converts a "Wall Time" ISO string back into a Date object.
 * This ensures the application works with Date objects while preserving the "Wall Time" digits.
 *
 * @param dateStr - The ISO string from storage (e.g., "2024-05-20T10:00:00.000")
 * @returns Date object in local time, or null if input is invalid
 */
export const fromWallTimeISO = (dateStr: string | Date | null): Date | null => {
  if (!dateStr) {
    return null;
  }

  // If it's already a Date, just return it (or check for validity)
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }

  // Important: If string ends with 'Z', remove it to force local time interpretation
  const normalizedStr = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;
  const date = new Date(normalizedStr);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Sets hours and minutes from a "HH:mm" format string into a Date object.
 *  @param date - The source date object
 * @param timeStr - Time string in "HH:mm" format (e.g., "09:00" or "23:59")
 * @returns A new Date object with updated time
 */
export const setTimeFromStr = (date: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};
