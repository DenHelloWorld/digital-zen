import { ALL_DAYS_OF_WEEK_DAYS } from '../constants/days-of-week.const';
import { DEFAULT_PERIOD_ID } from '../constants/default-period-id.const';
import { WEBSITES_SOCIAL_MEDIA } from '../constants/websites.const';
import { BLOCK_BEHAVIOUR_ENUM } from '../enums/block-behaviour.enum';
import { IFocus } from '../models/focus.model';

export const createDefaultPeriodHelper = (): IFocus.Period => {
  return {
    timeLeftSec: null,
    id: DEFAULT_PERIOD_ID,
    name: 'Social Media Block',
    description: null,
    startFrom: new Date(new Date().setHours(9, 0, 0, 0)),
    endTo: new Date(new Date().setHours(17, 0, 0, 0)),
    webSites: [...WEBSITES_SOCIAL_MEDIA],
    daysOfWeek: [...ALL_DAYS_OF_WEEK_DAYS],
    focusedTimes: [],
    blockBehaviour: BLOCK_BEHAVIOUR_ENUM.WARN,
    isActive: false,
    sessionStartTime: null,
  };
};
