export * from './quick-focus-id.const';
export * from './api-urls.const';
export * from './ui-text.const';
export * from './icons.const';

import { DAY_OF_WEEK_ENUM, DAY_OF_WEEK_SHORT_NAME_ENUM, DayOfWeekType } from '../enums';
import { IFocus } from '../models';
import { ICONS } from './icons.const';

export const WEBSITE_X: Readonly<IFocus.WebSite> = {
  id: 'x',
  name: 'X',
  description: 'X',
  url: 'https://x.com',
  imageUrl: '',
  iconUrl: ICONS.X,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_INST: Readonly<IFocus.WebSite> = {
  id: 'instagram',
  name: 'Instagram',
  description: 'Instagram',
  url: 'https://www.instagram.com',
  imageUrl: '',
  iconUrl: ICONS.INSTAGRAM,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_FACEBOOK: Readonly<IFocus.WebSite> = {
  id: 'facebook',
  name: 'Facebook',
  description: 'Facebook',
  url: 'https://www.facebook.com',
  imageUrl: '',
  iconUrl: ICONS.FACEBOOK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_TIKTOK: Readonly<IFocus.WebSite> = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'TikTok',
  url: 'https://www.tiktok.com',
  imageUrl: '',
  iconUrl: ICONS.TIKTOK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_VK: Readonly<IFocus.WebSite> = {
  id: 'vk',
  name: 'VK',
  description: 'ВКонтакте',
  url: 'https://vk.com',
  imageUrl: '',
  iconUrl: ICONS.VK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_TELEGRAM: Readonly<IFocus.WebSite> = {
  id: 'telegram',
  name: 'Telegram',
  description: 'Telegram Web',
  url: 'https://web.telegram.org',
  imageUrl: '',
  iconUrl: ICONS.TELEGRAM,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_SNAPCHAT: Readonly<IFocus.WebSite> = {
  id: 'snapchat',
  name: 'Snapchat',
  description: 'Snapchat',
  url: 'https://www.snapchat.com',
  imageUrl: '',
  iconUrl: ICONS.SNAPCHAT,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_LINKEDIN: Readonly<IFocus.WebSite> = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'LinkedIn',
  url: 'https://www.linkedin.com',
  imageUrl: '',
  iconUrl: ICONS.LINKEDIN,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_PINTEREST: Readonly<IFocus.WebSite> = {
  id: 'pinterest',
  name: 'Pinterest',
  description: 'Pinterest',
  url: 'https://www.pinterest.com',
  imageUrl: '',
  iconUrl: ICONS.PINTEREST,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITE_YOUTUBE: Readonly<IFocus.WebSite> = {
  id: 'youtube',
  name: 'Youtube',
  description: 'Youtube',
  url: 'https://www.youtube.com',
  imageUrl: '',
  iconUrl: ICONS.YOUTUBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

export const WEBSITES_SOCIAL_MEDIA: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_X,
  WEBSITE_INST,
  WEBSITE_FACEBOOK,
  WEBSITE_TELEGRAM,
  WEBSITE_PINTEREST,
  WEBSITE_LINKEDIN,
  WEBSITE_SNAPCHAT,
  WEBSITE_VK,
  WEBSITE_TIKTOK,
  WEBSITE_YOUTUBE,
]);

export const DAY_SUNDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.SUNDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.SUNDAY,
};

export const DAY_MONDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.MONDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.MONDAY,
};

export const DAY_TUESDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.TUESDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.TUESDAY,
};

export const DAY_WEDNESDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.WEDNESDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.WEDNESDAY,
};

export const DAY_THURSDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.THURSDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.THURSDAY,
};

export const DAY_FRIDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.FRIDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.FRIDAY,
};

export const DAY_SATURDAY: Readonly<IFocus.DayOfWeek> = {
  day: DAY_OF_WEEK_ENUM.SATURDAY,
  name: DAY_OF_WEEK_SHORT_NAME_ENUM.SATURDAY,
};

export const WORK_DAYS_OF_WEEK_DAYS: Readonly<readonly DayOfWeekType[]> = Object.freeze([
  // DAY_SUNDAY.day,
  DAY_MONDAY.day,
  DAY_TUESDAY.day,
  DAY_WEDNESDAY.day,
  DAY_THURSDAY.day,
  DAY_FRIDAY.day,
  // DAY_SATURDAY.day
]);

export const ALL_DAYS_OF_WEEK_DAYS: Readonly<readonly DayOfWeekType[]> = Object.freeze([
  DAY_SUNDAY.day,
  DAY_MONDAY.day,
  DAY_TUESDAY.day,
  DAY_WEDNESDAY.day,
  DAY_THURSDAY.day,
  DAY_FRIDAY.day,
  DAY_SATURDAY.day,
]);

export const ALL_DAYS_OF_WEEK: readonly Readonly<IFocus.DayOfWeek>[] = Object.freeze([
  DAY_SUNDAY,
  DAY_MONDAY,
  DAY_TUESDAY,
  DAY_WEDNESDAY,
  DAY_THURSDAY,
  DAY_FRIDAY,
  DAY_SATURDAY,
]);

export const DEFAULT_PERIOD: Readonly<IFocus.Period> = Object.freeze({
  id: 'work-social-block',
  name: 'Work Hours Social Media Block',
  description: 'Disables access to social media 24/7.',
  startFrom: new Date(new Date().setHours(0, 0, 0, 0)),
  endTo: new Date(new Date().setHours(23, 59, 59, 999)),
  webSites: [...WEBSITES_SOCIAL_MEDIA],
  daysOfWeek: [...ALL_DAYS_OF_WEEK_DAYS],
  focusedTimes: [],
  isFocused: false,
  sessionStartTime: null,
});
