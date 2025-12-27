import { MESSAGE_TYPE_ENUM, POSITIONS_ENUM } from '../enums';

export interface IToast {
  id: number;
  message: string;
  type?: MESSAGE_TYPE_ENUM;
  position?: POSITIONS_ENUM;
  durationInMs?: number;
  leaving?: boolean;
}
