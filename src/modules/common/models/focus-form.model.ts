import { BlockBehaviourType } from '../enums/block-behaviour.enum';
import { DayOfWeekType } from '../enums/day-of-week.enum';
import { IFocus } from './focus.model';
import { FormControl } from '@angular/forms';

export namespace IFocusForm {
  export interface UpsertPeriod {
    id: FormControl<string>;
    name: FormControl<string>;
    description: FormControl<string | null>;
    startFrom: FormControl<string | null>;
    endTo: FormControl<string | null>;
    webSites: FormControl<IFocus.WebSite[]>;
    daysOfWeek: FormControl<DayOfWeekType[]>;
    blockBehaviour: FormControl<BlockBehaviourType>;
    focusedTimes: FormControl<IFocus.FocusedTime[]>;
    isActive: FormControl<boolean>;
    sessionStartTime: FormControl<Date | null>;
    setAsCurrentPeriod: FormControl<boolean>;
  }
}
