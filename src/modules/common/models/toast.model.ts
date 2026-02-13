import { POSITIONS_ENUM } from '../enums/positions.enum';
import { TOAST_TYPE_ENUM } from '../enums/toast-type.enum';

export interface IToast {
  id: number;
  message: string;
  type?: TOAST_TYPE_ENUM;
  position?: POSITIONS_ENUM;
  durationInMs?: number;
  leaving?: boolean;
  target?: string;
}
