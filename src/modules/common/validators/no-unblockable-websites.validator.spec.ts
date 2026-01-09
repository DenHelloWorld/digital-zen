import { FormControl } from '@angular/forms';
import { IFocus } from '../models';
import { ICONS, WEBSITE_PRIVACY_POLICY } from '../constants';
import { noUnblockableWebsitesValidator } from './no-unblockable-websites.validator';

describe('noUnblockableWebsitesValidator', () => {
  describe('Valid values', () => {
    it('should return null for array with only SOCIAL_MEDIA websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X social media',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: true,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });

    it('should return null for array with only DEFAULT websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'custom',
          name: 'Custom Site',
          description: 'Custom site',
          url: 'https://custom.com',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.DEFAULT,
          isBlocked: true,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });

    it('should return null for array with mixed SOCIAL_MEDIA and DEFAULT websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: true,
        },
        {
          id: 'custom',
          name: 'Custom',
          description: 'Custom',
          url: 'https://custom.com',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.DEFAULT,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });

    it('should return null for empty array', () => {
      const control = new FormControl([]);
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });
  });

  describe('Invalid values - URL-based validation', () => {
    it('should return error for website with privacy policy URL (actual URL from WEBSITE_PRIVACY_POLICY)', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: WEBSITE_PRIVACY_POLICY.url,
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.UNBLOCKABLE,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toEqual({ unblockableNotAllowed: true });
    });

    it('should return error for privacy policy URL even with SOCIAL_MEDIA type', () => {
      // This is the key test case - user manually adds privacy policy URL
      // but it gets classified as SOCIAL_MEDIA by addCurrentTabToPeriod()
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: WEBSITE_PRIVACY_POLICY.url,
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA, // Wrong type, but URL matches
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toEqual({ unblockableNotAllowed: true });
    });

    it('should return error for privacy policy URL even with DEFAULT type', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: WEBSITE_PRIVACY_POLICY.url,
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.DEFAULT, // Wrong type, but URL matches
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toEqual({ unblockableNotAllowed: true });
    });

    it('should return error for privacy policy URL with path and query params', () => {
      // Test that URL cleaning works - URL with extra path/params should still match
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: WEBSITE_PRIVACY_POLICY.url + '?lang=en&version=1',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toEqual({ unblockableNotAllowed: true });
    });

    it('should return error for mixed array with privacy policy URL', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: true,
        },
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: WEBSITE_PRIVACY_POLICY.url,
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA, // Wrong type
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toEqual({ unblockableNotAllowed: true });
    });

    it('should return error even if UNBLOCKABLE URL has isBlocked set to true', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: WEBSITE_PRIVACY_POLICY.url,
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: true, // Even if marked as blocked, should fail validation
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toEqual({ unblockableNotAllowed: true });
    });
  });

  describe('Null/undefined handling', () => {
    it('should return null for non-array value', () => {
      const control = new FormControl('not an array');
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle array with incomplete website objects (missing url)', () => {
      const websites = [
        {
          id: 'incomplete',
          // Missing url property
        },
      ];

      const control = new FormControl(websites);
      // Should not throw, should return null since URL is undefined
      expect(noUnblockableWebsitesValidator(control)).toBeNull();
    });

    it('should be idempotent', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: WEBSITE_PRIVACY_POLICY.url,
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      const result1 = noUnblockableWebsitesValidator(control);
      const result2 = noUnblockableWebsitesValidator(control);

      expect(result1).toEqual(result2);
      expect(result1).toEqual({ unblockableNotAllowed: true });
    });

    it('should not mutate the control value', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'x',
          name: 'X',
          description: 'X',
          url: 'https://x.com',
          imageUrl: '',
          iconUrl: ICONS.X,
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: true,
        },
      ];

      const control = new FormControl(websites);
      const originalLength = websites.length;
      const originalType = websites[0].type;

      noUnblockableWebsitesValidator(control);

      expect(websites.length).toBe(originalLength);
      expect(websites[0].type).toBe(originalType);
    });

    it('should handle websites with different URL formats that normalize to same origin', () => {
      // Test URLs that should match after cleaning
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy',
          description: 'Privacy',
          url: WEBSITE_PRIVACY_POLICY.url + '/extra/path',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.SOCIAL_MEDIA,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noUnblockableWebsitesValidator(control)).toEqual({ unblockableNotAllowed: true });
    });
  });
});
