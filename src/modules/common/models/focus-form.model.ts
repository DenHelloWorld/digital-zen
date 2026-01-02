import { IFocus } from '../models';
import { FormControl } from '@angular/forms';
import { DayOfWeekType } from '../enums';

export namespace IFocusForm {
  export interface UpsertPeriod {
    id: FormControl<string>;
    name: FormControl<string>;
    description: FormControl<string>;
    startFrom: FormControl<string | null>;
    endTo: FormControl<string | null>;
    webSites: FormControl<IFocus.WebSite[]>;
    daysOfWeek: FormControl<DayOfWeekType[]>;
    focusedTimes: FormControl<IFocus.FocusedTime[]>;
    isFocused: FormControl<boolean>;
    sessionStartTime: FormControl<Date | null>;
  }
}
