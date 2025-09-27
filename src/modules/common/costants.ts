import {IFocus} from './models';

export const WEBSITE_X: Readonly<IFocus.BlockedWebSite> = {
  id: 'x',
  name: 'X',
  description: 'X',
  url: 'https://x.com',
  imageUrl: '',
  iconUrl: '#icon-x',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
}

export const WEBSITE_INST: Readonly<IFocus.BlockedWebSite> = {
  id: 'instagram',
  name: 'Instagram',
  description: 'Instagram',
  url: 'https://www.instagram.com',
  imageUrl: '',
  iconUrl: '#icon-instagram',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
}

export const WEBSITE_FACEBOOK: Readonly<IFocus.BlockedWebSite> = {
  id: 'facebook',
  name: 'Facebook',
  description: 'Facebook',
  url: 'https://www.facebook.com',
  imageUrl: '',
  iconUrl: '#icon-facebook',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
}

export const WEBSITE_TIKTOK: Readonly<IFocus.BlockedWebSite> = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'TikTok',
  url: 'https://www.tiktok.com',
  imageUrl: '',
  iconUrl: '#icon-tiktok',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
};

export const WEBSITE_VK: Readonly<IFocus.BlockedWebSite> = {
  id: 'vk',
  name: 'VK',
  description: 'ВКонтакте',
  url: 'https://vk.com',
  imageUrl: '',
  iconUrl: '#icon-vk',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
};

export const WEBSITE_TELEGRAM: Readonly<IFocus.BlockedWebSite> = {
  id: 'telegram',
  name: 'Telegram',
  description: 'Telegram Web',
  url: 'https://web.telegram.org',
  imageUrl: '',
  iconUrl: '#icon-telegram',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
};

export const WEBSITE_SNAPCHAT: Readonly<IFocus.BlockedWebSite> = {
  id: 'snapchat',
  name: 'Snapchat',
  description: 'Snapchat',
  url: 'https://www.snapchat.com',
  imageUrl: '',
  iconUrl: '#icon-snapchat',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
};

export const WEBSITE_LINKEDIN: Readonly<IFocus.BlockedWebSite> = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'LinkedIn',
  url: 'https://www.linkedin.com',
  imageUrl: '',
  iconUrl: '#icon-linkedin',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
};

export const WEBSITE_PINTEREST: Readonly<IFocus.BlockedWebSite> = {
  id: 'pinterest',
  name: 'Pinterest',
  description: 'Pinterest',
  url: 'https://www.pinterest.com',
  imageUrl: '',
  iconUrl: '#icon-pinterest',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
};

export const WEBSITES_SOCIAL_MEDIA: Readonly<readonly IFocus.BlockedWebSite[]> =
  Object.freeze([
    WEBSITE_X,
    WEBSITE_INST,
    WEBSITE_FACEBOOK,
    WEBSITE_TELEGRAM,
    WEBSITE_PINTEREST,
    WEBSITE_LINKEDIN,
    WEBSITE_SNAPCHAT,
    WEBSITE_VK,
    WEBSITE_TIKTOK
  ]);
