import {FormControl} from '@angular/forms';
import {DayOfWeekShortNameType, DayOfWeekType, MESSAGE_TYPE_ENUM, POSITIONS_ENUM} from './enums';

export namespace IFocus {
  export namespace Form {
    export interface UpsertPeriod {
      id: FormControl<string>;
      name: FormControl<string>;
      description: FormControl<string>;
      startFrom: FormControl<Date>;
      endTo: FormControl<Date>;
      webSites: FormControl<IFocus.WebSite[]>;
      daysOfWeek: FormControl<DayOfWeekType[]>;
      focusedTimes: FormControl<IFocus.FocusedTime[]>;
      isFocused: FormControl<boolean>;
    }
  }

  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date;
    endTo: Date;
    webSites: IFocus.WebSite[];
    daysOfWeek: DayOfWeekType[];
    focusedTimes: IFocus.FocusedTime[];
    isFocused: boolean;
  }

  export interface WebSite {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    iconUrl: string;
    type: IWebSiteType
    isBlocked: boolean;
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

export interface IToast {
  id: number;
  message: string;
  type?: MESSAGE_TYPE_ENUM;
  position?: POSITIONS_ENUM;
  duration?: number;
  leaving?: boolean;
}
