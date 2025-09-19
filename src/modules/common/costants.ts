import {IFocus} from './models';

export const WEBSITE_X: Readonly<IFocus.BlockedWebSite> = {
  id: 'x',
  name: 'x',
  description: 'x',
  url: 'https://x.com',
  imageUrl: '',
  iconUrl: '#icon-x',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
}

export const WEBSITE_INST: Readonly<IFocus.BlockedWebSite> = {
  id: 'instagram',
  name: 'instagram',
  description: 'instagram',
  url: 'https://www.instagram.com',
  imageUrl: '',
  iconUrl: '#icon-instagram',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
}

export const WEBSITE_FACEBOOK: Readonly<IFocus.BlockedWebSite> = {
  id: 'facebook',
  name: 'facebook',
  description: 'facebook',
  url: 'https://www.facebook.com',
  imageUrl: '',
  iconUrl: '#icon-facebook',
  type: IFocus.EWebSiteType.SOCIAL_MEDIA,
}

export const WEBSITES_SOCIAL_MEDIA: Readonly<readonly IFocus.BlockedWebSite[]> =
  Object.freeze([WEBSITE_X, WEBSITE_INST, WEBSITE_FACEBOOK]);
