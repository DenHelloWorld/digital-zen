import { DayOfWeekShortNameType, DayOfWeekType } from '../enums';

export namespace IFocus {
  export interface Period {
    id: string;
    name: string;
    description: string;
    startFrom: Date | null;
    endTo: Date | null;
    webSites: IFocus.WebSite[];
    daysOfWeek: DayOfWeekType[];
    focusedTimes: IFocus.FocusedTime[];
    isFocused: boolean;
    sessionStartTime: Date | null;
    pomodoroSettings?: PomodoroSettings;
    currentPomodoro?: PomodoroSession;
  }

  export interface WebSite {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    iconUrl: string;
    type: IWebSiteType;
    isBlocked: boolean;
  }

  export enum EWebSiteType {
    DEFAULT = 'Default',
    SOCIAL_MEDIA = 'Social Media',
  }

  export type IWebSiteType = IFocus.EWebSiteType.SOCIAL_MEDIA | IFocus.EWebSiteType.DEFAULT;

  export interface DayOfWeek {
    day: DayOfWeekType;
    name: DayOfWeekShortNameType;
  }

  export interface FocusedTime {
    id: string;
    periodId: string;
    startFrom: Date | null;
    endTo: Date | null;
  }

  export interface PomodoroSettings {
    enabled: boolean;
    /** Work session duration in minutes (min: 1, max: 120, default: 25) */
    workDuration: number;
    /** Short break duration in minutes (min: 1, max: 30, default: 5) */
    shortBreakDuration: number;
    /** Long break duration in minutes (min: 5, max: 60, default: 15) */
    longBreakDuration: number;
    /** Number of work sessions before long break (min: 2, max: 10, default: 4) */
    pomodorosUntilLongBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    soundEnabled: boolean;
    /** Volume level (min: 0, max: 100, default: 70) */
    soundVolume: number;
  }

  export interface PomodoroSession {
    currentCycle: number; // 1-N
    totalCycles: number; // Total completed today
    state: 'work' | 'short-break' | 'long-break' | 'paused';
    cycleStartTime: Date | null;
    cycleEndTime: Date | null;
    isPaused: boolean;
    remainingTime?: number; // For pause/resume functionality (milliseconds)
  }

  export interface PomodoroStatistics {
    date: Date;
    completedPomodoros: number;
    totalFocusTime: number; // milliseconds
    totalBreakTime: number; // milliseconds
    interruptions: number;
  }
}
