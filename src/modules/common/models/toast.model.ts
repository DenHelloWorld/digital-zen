import { TOAST_TYPE_ENUM } from '../enums/toast-type.enum';
import { POSITIONS_ENUM } from '../enums/positions.enum';

export interface IToast {
  id: number;
  message: string;
  type?: TOAST_TYPE_ENUM;
  position?: POSITIONS_ENUM;
  durationInMs?: number;
  leaving?: boolean;
}
