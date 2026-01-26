export enum CHROME_ALARM_ENUM {
  CHECK_FOCUS_END = 'checkFocusEnd',
  POMODORO_TICK = 'pomodoroTick',
}

export type ChromeAlarmType = CHROME_ALARM_ENUM.CHECK_FOCUS_END | CHROME_ALARM_ENUM.POMODORO_TICK;
