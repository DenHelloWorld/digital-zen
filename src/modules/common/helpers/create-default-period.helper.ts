import { ALL_DAYS_OF_WEEK_DAYS } from '../constants/days-of-week.const';
import { DEFAULT_PERIOD_ID } from '../constants/default-period-id.const';
import { ALL_DAY_TIME_RANGE } from '../constants/time-ranges.const';
import { WEBSITES_LIBRARY_PRESET } from '../constants/websites.const';
import { BLOCK_BEHAVIOUR_ENUM } from '../enums/block-behaviour.enum';
import { IFocus } from '../models/focus.model';
import { setTimeFromStr } from './time.helper';

export const createDefaultPeriodHelper = (): IFocus.Period => {
  const now = new Date();

  return {
    timeLeftSec: null,
    id: DEFAULT_PERIOD_ID,
    name: 'Social Media Block',
    description: null,
    startFrom: setTimeFromStr(now, ALL_DAY_TIME_RANGE.startFrom),
    endTo: setTimeFromStr(now, ALL_DAY_TIME_RANGE.endTo),
    daysOfWeek: [...ALL_DAYS_OF_WEEK_DAYS],
    focusedTimes: [],
    blockBehaviour: BLOCK_BEHAVIOUR_ENUM.WARN,
    isActive: false,
    sessionStartTime: null,
    library: { ...WEBSITES_LIBRARY_PRESET } as Record<string, IFocus.WebSite[]>,
  };
};
