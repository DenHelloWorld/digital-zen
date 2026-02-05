import { IFocus } from '../models/focus.model';
import { ICONS } from './icons.const';
import { FaviconHelper } from '../helpers/favicon.helper';

/**
 * Website constants for Digital Zen Chrome Extension
 * Contains definitions of popular websites and social media platforms
 */

export const WEBSITE_X: Readonly<IFocus.WebSite> = {
  id: 'x',
  name: 'X',
  description: 'X',
  url: 'https://x.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://x.com'),
  iconUrl: ICONS.X,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_INST: Readonly<IFocus.WebSite> = {
  id: 'instagram',
  name: 'Instagram',
  description: 'Instagram',
  url: 'https://www.instagram.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://www.instagram.com'),
  iconUrl: ICONS.INSTAGRAM,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_FACEBOOK: Readonly<IFocus.WebSite> = {
  id: 'facebook',
  name: 'Facebook',
  description: 'Facebook',
  url: 'https://www.facebook.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://www.facebook.com'),
  iconUrl: ICONS.FACEBOOK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_TIKTOK: Readonly<IFocus.WebSite> = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'TikTok',
  url: 'https://www.tiktok.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://www.tiktok.com'),
  iconUrl: ICONS.TIKTOK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_VK: Readonly<IFocus.WebSite> = {
  id: 'vk',
  name: 'VK',
  description: 'ВКонтакте',
  url: 'https://vk.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://vk.com'),
  iconUrl: ICONS.VK,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_SNAPCHAT: Readonly<IFocus.WebSite> = {
  id: 'snapchat',
  name: 'Snapchat',
  description: 'Snapchat',
  url: 'https://www.snapchat.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://snapchat.com'),
  iconUrl: ICONS.SNAPCHAT,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_LINKEDIN: Readonly<IFocus.WebSite> = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'LinkedIn',
  url: 'https://www.linkedin.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://www.linkedin.com'),
  iconUrl: ICONS.LINKEDIN,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_PINTEREST: Readonly<IFocus.WebSite> = {
  id: 'pinterest',
  name: 'Pinterest',
  description: 'Pinterest',
  url: 'https://www.pinterest.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://www.pinterest.com'),
  iconUrl: ICONS.PINTEREST,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

export const WEBSITE_YOUTUBE: Readonly<IFocus.WebSite> = {
  id: 'youtube',
  name: 'YouTube',
  description: 'YouTube',
  url: 'https://www.youtube.com',
  imageUrl: FaviconHelper.getGoogleUrl('https://www.youtube.com'),
  iconUrl: ICONS.YOUTUBE,
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
  isBlocked: true,
};

/**
 * Array of all social media websites
 */
export const WEBSITES_SOCIAL_MEDIA: Readonly<readonly IFocus.WebSite[]> = Object.freeze([
  WEBSITE_X,
  WEBSITE_INST,
  WEBSITE_FACEBOOK,
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
