import { IFocus } from '../models';

/**
 * Default social media websites for the default period
 * This is a separate file to avoid circular dependencies with Angular modules
 * Can be safely imported in background service
 */
export const DEFAULT_PERIOD_WEBSITES: IFocus.WebSite[] = [
  {
    id: 'x',
    name: 'X',
    description: 'X',
    url: 'https://x.com',
    imageUrl: '',
    iconUrl: '#icon-twitter',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Instagram',
    url: 'https://www.instagram.com',
    imageUrl: '',
    iconUrl: '#icon-instagram',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Facebook',
    url: 'https://www.facebook.com',
    imageUrl: '',
    iconUrl: '#icon-facebook',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Telegram Web',
    url: 'https://web.telegram.org',
    imageUrl: '',
    iconUrl: '#icon-telegram',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Pinterest',
    url: 'https://www.pinterest.com',
    imageUrl: '',
    iconUrl: '#icon-pinterest',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'LinkedIn',
    url: 'https://www.linkedin.com',
    imageUrl: '',
    iconUrl: '#icon-linkedin',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    description: 'Snapchat',
    url: 'https://www.snapchat.com',
    imageUrl: '',
    iconUrl: '#icon-snapchat',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'vk',
    name: 'VK',
    description: 'ВКонтакте',
    url: 'https://vk.com',
    imageUrl: '',
    iconUrl: '#icon-vk',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'TikTok',
    url: 'https://www.tiktok.com',
    imageUrl: '',
    iconUrl: '#icon-tiktok',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'YouTube',
    url: 'https://www.youtube.com',
    imageUrl: '',
    iconUrl: '#icon-youtube',
    type: IFocus.EWebSiteType.SOCIAL_MEDIA,
    isBlocked: false,
  },
];

/**
 * All days of week for default period
 */
export const DEFAULT_PERIOD_DAYS: number[] = [1, 2, 3, 4, 5, 6, 0];
