import { ICONS } from '../constants/icons.const';
import { IFocus } from '../models/focus.model';
import { filterBlockableWebsites } from './filter-blockable-websites.helper';

describe('filterBlockableWebsites', () => {
  describe('Valid inputs', () => {
    it('should return all websites when none are UNBLOCKABLE', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X social media',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isActivated: true,
        },
        {
          id: 'custom',
          name: 'Custom Site',
          description: 'Custom site',
          url: 'https://custom.com',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.DEFAULT,
          isActivated: false,
        },
      ];

      const result = filterBlockableWebsites(websites);

      expect(result.length).toBe(2);
      expect(result).toEqual(websites);
    });

    it('should filter out UNBLOCKABLE websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X social media',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isActivated: true,
        },
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.UNBLOCKABLE,
          isActivated: false,
        },
      ];

      const result = filterBlockableWebsites(websites);

      expect(result.length).toBe(1);
      expect(result[0].type).toBe(IFocus.EWebSiteType.SOCIAL_MEDIA);
      expect(result[0].id).toBe('x');
    });

    it('should filter out multiple UNBLOCKABLE websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'facebook',
          name: 'Facebook',
          description: 'Facebook',
          url: 'https://facebook.com',
          imageUrl: '',
          iconUrl: ICONS.FACEBOOK,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isActivated: true,
        },
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.UNBLOCKABLE,
          isActivated: false,
        },
        {
          id: 'terms',
          name: 'Terms of Service',
          description: 'Terms',
          url: 'https://example.com/terms',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.UNBLOCKABLE,
          isActivated: false,
        },
      ];

      const result = filterBlockableWebsites(websites);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('facebook');
    });

    it('should keep SOCIAL_MEDIA type websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isActivated: true,
        },
        {
          id: 'instagram',
          name: 'Instagram',
          description: 'Instagram',
          url: 'https://instagram.com',
          imageUrl: '',
          iconUrl: ICONS.INSTAGRAM,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isActivated: false,
        },
      ];

      const result = filterBlockableWebsites(websites);

      expect(result.length).toBe(2);
      expect(result[0].type).toBe(IFocus.EWebSiteType.SOCIAL_MEDIA);
      expect(result[1].type).toBe(IFocus.EWebSiteType.SOCIAL_MEDIA);
    });

    it('should keep DEFAULT type websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'custom1',
          name: 'Custom 1',
          description: 'Custom site 1',
          url: 'https://custom1.com',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.DEFAULT,
          isActivated: true,
        },
        {
          id: 'custom2',
          name: 'Custom 2',
          description: 'Custom site 2',
          url: 'https://custom2.com',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.DEFAULT,
          isActivated: false,
        },
      ];

      const result = filterBlockableWebsites(websites);

      expect(result.length).toBe(2);
      expect(result[0].type).toBe(IFocus.EWebSiteType.DEFAULT);
      expect(result[1].type).toBe(IFocus.EWebSiteType.DEFAULT);
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = filterBlockableWebsites([]);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should return empty array when all websites are UNBLOCKABLE', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.UNBLOCKABLE,
          isActivated: false,
        },
      ];

      const result = filterBlockableWebsites(websites);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should filter UNBLOCKABLE even if isBlocked is true', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.UNBLOCKABLE,
          isActivated: true,
        },
      ];

      const result = filterBlockableWebsites(websites);

      expect(result.length).toBe(0);
    });

    it('should not mutate the original array', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isActivated: true,
        },
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.UNBLOCKABLE,
          isActivated: false,
        },
      ];

      const originalLength = websites.length;
      filterBlockableWebsites(websites);

      expect(websites.length).toBe(originalLength);
      expect(websites[1].type).toBe(IFocus.EWebSiteType.UNBLOCKABLE);
    });
  });

  describe('Performance', () => {
    it('should return consistent results for same input', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isActivated: true,
        },
      ];

      const result1 = filterBlockableWebsites(websites);
      const result2 = filterBlockableWebsites(websites);

      expect(result1).toEqual(result2);
    });
  });
});
