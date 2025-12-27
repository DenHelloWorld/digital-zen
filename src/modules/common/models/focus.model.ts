import { DayOfWeekShortNameType, DayOfWeekType } from '../enums';

export namespace IFocus {
  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date | null;
    endTo: Date | null;
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
    type: IWebSiteType;
    isBlocked: boolean;
  }

  export enum EWebSiteType {
    DEFAULT = 'Default',
    SOCIAL_MEDIA = 'Social Media',
  }

  export type IWebSiteType = IFocus.EWebSiteType.SOCIAL_MEDIA | IFocus.EWebSiteType.DEFAULT;

  export interface DayOfWeek {
    day: DayOfWeekType;
    name: DayOfWeekShortNameType;
  }

  export interface FocusedTime {
    id: string;
    periodId: string;
    startFrom: Date | null;
    endTo: Date | null;
  }
}
