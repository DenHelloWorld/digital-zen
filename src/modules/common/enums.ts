export enum COLOR_SCHEMA_ENUM {
  DARK = 'dark',
  LIGHT = 'light',
}
export type ColorSchemaType = COLOR_SCHEMA_ENUM.DARK | COLOR_SCHEMA_ENUM.LIGHT;

export enum VIEW_ENUM {
  FOCUS = 0,
  MENU = 1,
}

export type ViewType = VIEW_ENUM.FOCUS | VIEW_ENUM.MENU;

export enum DATE_FORMAT_ENUM {
  DATE_ONLY = 'dd.MM.yyyy',
  DATE_TIME = 'dd.MM.yyyy HH:mm',
  TIME_ONLY = 'HH:mm',
  ISO = "yyyy-MM-dd'T'HH:mm:ss",
  US_DATE = 'MM/dd/yyyy',
  FULL_TEXT_RU = "d MMMM y 'г.', HH:mm",
  WEEKDAY_SHORT = 'EEE, d MMM y',
  WITH_TIMEZONE = 'dd.MM.yyyy HH:mm zzzz',
}

export type DateFormatType =
  | DATE_FORMAT_ENUM.DATE_ONLY
  | DATE_FORMAT_ENUM.DATE_TIME
  | DATE_FORMAT_ENUM.TIME_ONLY
  | DATE_FORMAT_ENUM.ISO
  | DATE_FORMAT_ENUM.US_DATE
  | DATE_FORMAT_ENUM.FULL_TEXT_RU
  | DATE_FORMAT_ENUM.WEEKDAY_SHORT
  | DATE_FORMAT_ENUM.WITH_TIMEZONE;

export enum DAY_OF_WEEK_ENUM {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export type DayOfWeekType =
  | DAY_OF_WEEK_ENUM.SUNDAY
  | DAY_OF_WEEK_ENUM.MONDAY
  | DAY_OF_WEEK_ENUM.TUESDAY
  | DAY_OF_WEEK_ENUM.WEDNESDAY
  | DAY_OF_WEEK_ENUM.THURSDAY
  | DAY_OF_WEEK_ENUM.FRIDAY
  | DAY_OF_WEEK_ENUM.SATURDAY;

export enum DAY_OF_WEEK_SHORT_NAME_ENUM {
  SUNDAY = 'sun',
  MONDAY = 'mon',
  TUESDAY = 'tue',
  WEDNESDAY = 'wed',
  THURSDAY = 'thu',
  FRIDAY = 'fri',
  SATURDAY = 'sat',
}

export type DayOfWeekShortNameType =
  | DAY_OF_WEEK_SHORT_NAME_ENUM.SUNDAY
  | DAY_OF_WEEK_SHORT_NAME_ENUM.MONDAY
  | DAY_OF_WEEK_SHORT_NAME_ENUM.TUESDAY
  | DAY_OF_WEEK_SHORT_NAME_ENUM.WEDNESDAY
  | DAY_OF_WEEK_SHORT_NAME_ENUM.THURSDAY
  | DAY_OF_WEEK_SHORT_NAME_ENUM.FRIDAY
  | DAY_OF_WEEK_SHORT_NAME_ENUM.SATURDAY;

export enum POSITIONS_ENUM {
  TOP_RIGHT = 'top-right',
  TOP_LEFT = 'top-left',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left',
  TOP_CENTER = 'top-center',
  BOTTOM_CENTER = 'bottom-center',
}

export enum TOAST_TYPE_ENUM {
  INFO = 'info',
  ERROR = 'error',
  ACCENT = 'accent',
  WARN = 'warn',
}

export enum TOAST_MESSAGES_ENUM {
  ADDED = 'Added.',
  ALREADY_ADDED = 'Already added.',
  FOCUS_ACTIVE = 'Focus active.',
  NO_SITES_BLOCKED = 'No websites are in your block list.',
}
