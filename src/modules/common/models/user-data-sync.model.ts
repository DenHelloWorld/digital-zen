import { IFocus } from './focus.model';

export namespace IUserDataSync {
  /**
   * User data from API response
   */
  export interface User {
    id: number;
    email: string;
    user_id: string;
  }

  /**
   * Response from user data API
   */
  export interface Response {
    user: User | null;
    periods: IFocus.Period[];
  }

  /**
   * Request to save user data
   */
  export interface SaveRequest {
    user_email: string;
    user_id: string;
    periods: IFocus.Period[];
  }
}
