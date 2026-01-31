import { FormControl } from '@angular/forms';

import { BlockBehaviourType } from '../enums/block-behaviour.enum';
import { IFocus } from './focus.model';
import { DayOfWeekType } from '../enums/day-of-week.enum';

export namespace IFocusForm {
  export interface UpsertPeriod {
    id: FormControl<string>;
    name: FormControl<string>;
    description: FormControl<string>;
    startFrom: FormControl<string | null>;
    endTo: FormControl<string | null>;
    webSites: FormControl<IFocus.WebSite[]>;
    daysOfWeek: FormControl<DayOfWeekType[]>;
    blockBehaviour: FormControl<BlockBehaviourType>;
    focusedTimes: FormControl<IFocus.FocusedTime[]>;
    isFocused: FormControl<boolean>;
    sessionStartTime: FormControl<Date | null>;
  }
}
