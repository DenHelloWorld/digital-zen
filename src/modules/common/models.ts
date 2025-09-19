export namespace IFocus {
  export interface Base {
    id: string;
    name: string;
    description: string;
    periods: IFocus.Period[];
  }

  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date;
    endTo: Date;
    blockedSites: IFocus.BlockedWebSite[];
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
}
