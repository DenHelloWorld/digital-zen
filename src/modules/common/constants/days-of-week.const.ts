import { DAY_OF_WEEK_ENUM, DayOfWeekType } from '../enums/day-of-week.enum';
import { DAY_OF_WEEK_SHORT_NAME_ENUM } from '../enums/day-of-week-short-name.enum';
import { IFocus } from '../models/focus.model';

/**
 * Day of week constants for Digital Zen Chrome Extension
 * Contains individual day definitions and collections of days
 */

export const DAY_SUNDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.SUNDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.SUNDAY,
};

export const DAY_MONDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.MONDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.MONDAY,
};

export const DAY_TUESDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.TUESDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.TUESDAY,
};

export const DAY_WEDNESDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.WEDNESDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.WEDNESDAY,
};

export const DAY_THURSDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.THURSDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.THURSDAY,
};

export const DAY_FRIDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.FRIDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.FRIDAY,
};

export const DAY_SATURDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.SATURDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.SATURDAY,
};

/**
 * Array of work days (Monday to Friday)
 */
export const WORK_DAYS_OF_WEEK_DAYS: Readonly<readonly DayOfWeekType[]> = Object.freeze([
  // DAY_SUNDAY.day,
  DAY_MONDAY.day,
  DAY_TUESDAY.day,
  DAY_WEDNESDAY.day,
  DAY_THURSDAY.day,
  DAY_FRIDAY.day,
  // DAY_SATURDAY.day
]);

/**
 * Array of all days of the week (as enum values)
 */
export const ALL_DAYS_OF_WEEK_DAYS: Readonly<readonly DayOfWeekType[]> = Object.freeze([
  DAY_SUNDAY.day,
  DAY_MONDAY.day,
  DAY_TUESDAY.day,
  DAY_WEDNESDAY.day,
  DAY_THURSDAY.day,
  DAY_FRIDAY.day,
  DAY_SATURDAY.day,
]);

/**
 * Array of all days of the week (as DayOfWeek objects)
 */
export const ALL_DAYS_OF_WEEK: readonly Readonly<IFocus.DayOfWeek>[] = Object.freeze([
  DAY_SUNDAY,
  DAY_MONDAY,
  DAY_TUESDAY,
  DAY_WEDNESDAY,
  DAY_THURSDAY,
  DAY_FRIDAY,
  DAY_SATURDAY,
]);
