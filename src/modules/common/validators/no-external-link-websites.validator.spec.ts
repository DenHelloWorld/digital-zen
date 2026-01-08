import { FormControl } from '@angular/forms';
import { IFocus } from '../models';
import { ICONS } from '../constants';
import { noExternalLinkWebsitesValidator } from './no-external-link-websites.validator';

describe('noExternalLinkWebsitesValidator', () => {
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
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
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
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
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
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
    });

    it('should return null for empty array', () => {
      const control = new FormControl([]);
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
    });
  });

  describe('Invalid values', () => {
    it('should return error for array with EXTERNAL_LINK website', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.EXTERNAL_LINK,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noExternalLinkWebsitesValidator(control)).toEqual({ externalLinkNotAllowed: true });
    });

    it('should return error for mixed array with EXTERNAL_LINK', () => {
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
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.EXTERNAL_LINK,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noExternalLinkWebsitesValidator(control)).toEqual({ externalLinkNotAllowed: true });
    });

    it('should return error for multiple EXTERNAL_LINK websites', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy',
          description: 'Privacy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.EXTERNAL_LINK,
          isBlocked: false,
        },
        {
          id: 'terms',
          name: 'Terms',
          description: 'Terms',
          url: 'https://example.com/terms',
          imageUrl: '',
          iconUrl: '',
          type: IFocus.EWebSiteType.EXTERNAL_LINK,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      expect(noExternalLinkWebsitesValidator(control)).toEqual({ externalLinkNotAllowed: true });
    });

    it('should return error even if EXTERNAL_LINK has isBlocked set to true', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.EXTERNAL_LINK,
          isBlocked: true,
        },
      ];

      const control = new FormControl(websites);
      expect(noExternalLinkWebsitesValidator(control)).toEqual({ externalLinkNotAllowed: true });
    });
  });

  describe('Null/undefined handling', () => {
    it('should return null for non-array value', () => {
      const control = new FormControl('not an array');
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
    });

    it('should return null for undefined value', () => {
      const control = new FormControl(undefined);
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle array with incomplete website objects', () => {
      const websites = [
        {
          id: 'incomplete',
          // Missing type property
        },
      ];

      const control = new FormControl(websites);
      expect(noExternalLinkWebsitesValidator(control)).toBeNull();
    });

    it('should be idempotent', () => {
      const websites: IFocus.WebSite[] = [
        {
          id: 'privacy',
          name: 'Privacy Policy',
          description: 'Privacy Policy',
          url: 'https://example.com/privacy',
          imageUrl: '',
          iconUrl: ICONS.PRIVACY_TIP,
          type: IFocus.EWebSiteType.EXTERNAL_LINK,
          isBlocked: false,
        },
      ];

      const control = new FormControl(websites);
      const result1 = noExternalLinkWebsitesValidator(control);
      const result2 = noExternalLinkWebsitesValidator(control);

      expect(result1).toEqual(result2);
      expect(result1).toEqual({ externalLinkNotAllowed: true });
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

      noExternalLinkWebsitesValidator(control);

      expect(websites.length).toBe(originalLength);
      expect(websites[0].type).toBe(originalType);
    });
  });
});
