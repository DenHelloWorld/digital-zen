import { IFocus } from '../models';

export const MANUAL_TIME_RANGE: Readonly<IFocus.TimeRange> = Object.freeze({
  id: 'MANUAL_RANGE',
  name: 'Manual range',
  description: 'Custom time range',
  startFrom: '',
  endTo: '',
});

export const MORNING_TIME_RANGE: Readonly<IFocus.TimeRange> = Object.freeze({
  id: 'MORNING_HOURS',
  name: 'Morning hours',
  description: 'From 06:00 to 09:00',
  startFrom: '06:00',
  endTo: '09:00',
});

export const WORK_TIME_RANGE: Readonly<IFocus.TimeRange> = Object.freeze({
  id: 'WORK_HOURS',
  name: 'Work hours',
  description: 'From 09:00 to 17:00',
  startFrom: '09:00',
  endTo: '17:00',
});

export const EVENING_TIME_RANGE: Readonly<IFocus.TimeRange> = Object.freeze({
  id: 'EVENING_HOURS',
  name: 'Evening hours',
  description: 'From 17:00 to 21:00',
  startFrom: '17:00',
  endTo: '21:00',
});

export const ALL_DAY_TIME_RANGE: Readonly<IFocus.TimeRange> = Object.freeze({
  id: 'ALL_DAY_HOURS',
  name: 'All day',
  description: 'From 00:00 to 23:59',
  startFrom: '00:00',
  endTo: '23:59',
});

export const TIME_RANGES: readonly Readonly<IFocus.TimeRange>[] = Object.freeze([
  MORNING_TIME_RANGE,
  WORK_TIME_RANGE,
  EVENING_TIME_RANGE,
  ALL_DAY_TIME_RANGE,
  MANUAL_TIME_RANGE,
]);
