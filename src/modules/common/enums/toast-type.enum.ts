export enum TOAST_TYPE_ENUM {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  ACCENT = 'accent',
  WARN = 'warn',
}

export type ToastTypeType =
  | TOAST_TYPE_ENUM.INFO
  | TOAST_TYPE_ENUM.SUCCESS
  | TOAST_TYPE_ENUM.ERROR
  | TOAST_TYPE_ENUM.ACCENT
  | TOAST_TYPE_ENUM.WARN;
