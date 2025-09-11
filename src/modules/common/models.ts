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
    blockedSites: IFocus.BlockedSites[];
  }

  export interface BlockedSites {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
  }
}
