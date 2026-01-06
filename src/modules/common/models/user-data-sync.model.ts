import { IFocus } from './focus.model';

/**
 * Response from user data API
 */
export interface IUserDataResponse {
  user: {
    id: number;
    email: string;
    user_id: string;
  } | null;
  periods: IFocus.Period[];
}

/**
 * Request to save user data
 */
export interface ISaveUserDataRequest {
  user_email: string;
  user_id: string;
  periods: IFocus.Period[];
}
