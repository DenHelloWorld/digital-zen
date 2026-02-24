import { BlockBehaviourType } from '../enums/block-behaviour.enum';
import { DayOfWeekShortNameType } from '../enums/day-of-week-short-name.enum';
import { DayOfWeekType } from '../enums/day-of-week.enum';
import { PermissionLvlType } from '../enums/permission-lvl.enum';

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
        isActive: boolean;
        blockBehaviour: BlockBehaviourType;
        sessionStartTime: string | null;
      }
    }
  }

  export interface Period {
    id: string;
    name: string;
    description: string | null;
    startFrom: Date | null;
    endTo: Date | null;
    webSites: IFocus.WebSite[];
    daysOfWeek: DayOfWeekType[];
    focusedTimes: IFocus.FocusedTime[];
    isActive: boolean;
    blockBehaviour: BlockBehaviourType;
    sessionStartTime: Date | null;
    timeLeftSec: number | null;
  }

  export interface WebSite {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    iconUrl: string;
    type: IWebSiteType | string;
    isActivated: boolean;
    permissionLvl: PermissionLvlType;
  }

  export enum EWebSiteType {
    DEFAULT = 'Default 🌐',
    COMMUNICATION = 'Mail & Chat 📩',
    WORK_DEVELOPMENT = 'Work Development 💻',
    AI = 'AI 🤖',
    EDUCATION = 'Education 🎓',
    FINANCE_CRYPTO = 'Finance & Crypto 💸',
    HEALTH_FITNESS = 'Health & Fitness 🍎',
    SOCIAL_MEDIA = 'Social Media 📱',
    ENTERTAINMENT = 'Entertainment 🎮',
    SHOPPING = 'Shopping 🛒',
    NEWS = 'News 📰',
    ADULT = 'Adult 18+ 🔞',
    UNBLOCKABLE = 'Unblockable',
    DELETE = 'Wastebasket 🗑️',
  }

  export type IWebSiteType =
    | IFocus.EWebSiteType.SOCIAL_MEDIA
    | IFocus.EWebSiteType.AI
    | IFocus.EWebSiteType.ENTERTAINMENT
    | IFocus.EWebSiteType.SHOPPING
    | IFocus.EWebSiteType.NEWS
    | IFocus.EWebSiteType.EDUCATION
    | IFocus.EWebSiteType.WORK_DEVELOPMENT
    | IFocus.EWebSiteType.DEFAULT
    | IFocus.EWebSiteType.UNBLOCKABLE
    | IFocus.EWebSiteType.ADULT
    | IFocus.EWebSiteType.HEALTH_FITNESS
    | IFocus.EWebSiteType.FINANCE_CRYPTO
    | IFocus.EWebSiteType.COMMUNICATION
    | IFocus.EWebSiteType.DELETE;

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
