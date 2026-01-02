export enum TOAST_MESSAGES_ENUM {
  ADDED = 'Added.',
  ALREADY_ADDED = 'Already added.',
  FOCUS_ACTIVE = 'Focus active.',
  NO_SITES_BLOCKED = 'No websites are in your block list.',
  PERIOD_NOT_SCHEDULED_TODAY = 'This period is not scheduled for today.',
}

export type ToastMessagesType =
  | TOAST_MESSAGES_ENUM.ADDED
  | TOAST_MESSAGES_ENUM.ALREADY_ADDED
  | TOAST_MESSAGES_ENUM.FOCUS_ACTIVE
  | TOAST_MESSAGES_ENUM.NO_SITES_BLOCKED
  | TOAST_MESSAGES_ENUM.PERIOD_NOT_SCHEDULED_TODAY;
