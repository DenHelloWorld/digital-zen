import {FormControl} from '@angular/forms';
import {DayOfWeekShortNameType, DayOfWeekType} from './enums';

export namespace IFocus {
  export namespace Form {
    export interface UpsertPeriod {
      id: FormControl<string>;
      name: FormControl<string>;
      description: FormControl<string>;
      startFrom: FormControl<Date>;
      endTo: FormControl<Date>;
      blockedSites: FormControl<IFocus.BlockedWebSite[]>;
      daysOfWeek: FormControl<DayOfWeekType[]>;
      focusedTimes: FormControl<IFocus.FocusedTime[]>;
    }
  }

  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date;
    endTo: Date;
    blockedSites: IFocus.BlockedWebSite[];
    daysOfWeek: DayOfWeekType[];
    focusedTimes: IFocus.FocusedTime[];
  }

  export interface BlockedWebSite {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    iconUrl: string;
    type: IWebSiteType
  }

  export enum EWebSiteType {
    SOCIAL_MEDIA = 'Social Media',
  }

  export type IWebSiteType = IFocus.EWebSiteType.SOCIAL_MEDIA;

  export interface DayOfWeek {
    day: DayOfWeekType;
    name: DayOfWeekShortNameType;
  }

  export interface FocusedTime {
    id: string;
    periodId: string;
    startFrom: Date;
    endTo: Date;
  }
}
