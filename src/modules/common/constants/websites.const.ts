import { IFocus } from '../models/focus.model';
import { ICONS } from './icons.const';
import { ALL_DAYS_OF_WEEK_DAYS } from './days-of-week.const';

/**
 * Website constants for Digital Zen Chrome Extension
 * Contains definitions of popular websites and social media platforms
 */

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
  name: 'YouTube',
  description: 'YouTube',
  url: 'https://www.youtube.com',
  imageUrl: '',
  iconUrl: ICONS.YOUTUBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: false,
};

/**
 * Array of all social media websites
 */
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

/**
 * Unblockable website links for Digital Zen Chrome Extension
 * These links are never blockable and always accessible
 */
export const WEBSITE_PRIVACY_POLICY: Readonly<IFocus.WebSite> = {
  id: 'privacy-policy',
  name: 'Privacy Policy',
  description: 'Digital Zen Privacy Policy',
  url: 'https://digital-zen.csmpoint.com/api/privacy-policy.php',
  imageUrl: '',
  iconUrl: ICONS.PRIVACY_TIP,
  type: IFocus.EWebSiteType.UNBLOCKABLE,
  isBlocked: false,
};

/**
 * Array of all unblockable websites
 * These websites should never be blocked by the extension
 */
export const WEBSITES_UNBLOCKABLE: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_PRIVACY_POLICY,
]);

/**
 * Creates a default period with a unique ID for blocking social media during work hours
 * Each invocation generates a new period with timestamp-based unique ID
 *
 * @returns A new default period instance with unique ID
 */
export function createDefaultPeriod(): IFocus.Period {
  return {
    id: `work-social-block-${Date.now()}`,
    name: 'Work Hours Social Media Block',
    description: 'Disables access to social media during work hours.',
    startFrom: new Date(new Date().setHours(9, 0, 0, 0)),
    endTo: new Date(new Date().setHours(17, 0, 0, 0)),
    webSites: [...WEBSITES_SOCIAL_MEDIA],
    daysOfWeek: [...ALL_DAYS_OF_WEEK_DAYS],
    focusedTimes: [],
    isFocused: false,
    sessionStartTime: null,
  };
}
