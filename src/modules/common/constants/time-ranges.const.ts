import { IFocus } from '../models';

export const MANUAL_TIME_RANGE = {
  id: 'MANUAL_RANGE',
  name: 'Manual range',
  description: 'Custom time range',
  startFrom: '',
  endTo: '',
};

export const TIME_RANGES: readonly Readonly<IFocus.TimeRange>[] = Object.freeze([
  {
    id: 'MORNING_HOURS',
    name: 'Morning hours',
    description: 'From 06:00 to 09:00',
    startFrom: '06:00',
    endTo: '09:00',
  },
  {
    id: 'WORK_HOURS',
    name: 'Work hours',
    description: 'From 09:00 to 17:00',
    startFrom: '09:00',
    endTo: '17:00',
  },
  {
    id: 'EVENING_HOURS',
    name: 'Evening hours',
    description: 'From 17:00 to 21:00',
    startFrom: '17:00',
    endTo: '21:00',
  },
  {
    id: 'ALL_DAY_HOURS',
    name: 'All day',
    description: 'From 00:00 to 23:59',
    startFrom: '00:00',
    endTo: '23:59',
  },
  MANUAL_TIME_RANGE,
]);
