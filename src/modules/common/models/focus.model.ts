import { DayOfWeekShortNameType, DayOfWeekType } from '../enums';

export namespace IFocus {
  export namespace Api {
    export namespace Upsert {
      export interface FocusedTime {
        id: string;
        periodId: string;
        startFrom: string | null;
        endTo: string | null;
      }

      export interface Period {
        id: string;
        name: string;
        description: string;
        startFrom: string | null;
        endTo: string | null;
        webSites: string[];
        daysOfWeek: DayOfWeekType[];
        focusedTimes: IFocus.Api.Upsert.FocusedTime[];
        isFocused: boolean;
        sessionStartTime: string | null;
      }
    }
  }

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
    sessionStartTime: Date | null;
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
    UNBLOCKABLE = 'Unblockable',
  }

  export type IWebSiteType =
    | IFocus.EWebSiteType.SOCIAL_MEDIA
    | IFocus.EWebSiteType.DEFAULT
    | IFocus.EWebSiteType.UNBLOCKABLE;

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

  export interface TimeRange {
    id: string;
    name: string;
    description: string;
    startFrom: string;
    endTo: string;
  }
}
