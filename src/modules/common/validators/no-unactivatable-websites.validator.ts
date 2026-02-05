import { AbstractControl, ValidationErrors } from '@angular/forms';
import { WEBSITES_UNACTIVATABLE } from '../constants/websites.const';
import { VALIDATION_ERROR_KEYS } from '../constants/validation-errors.const';
import { cleanUrlHelper } from '../helpers/clean-url.helper';
import { IFocus } from '../models/focus.model';

export function noUnactivatableWebsitesValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value: typeof control.value = control.value;

  if (!Array.isArray(value)) {
    return null;
  }

  // Get cleaned URLs of all UNBLOCKABLE websites for comparison
  const unblockableUrls = WEBSITES_UNACTIVATABLE.map(site => cleanUrlHelper(site.url));

  // Find all websites that match UNBLOCKABLE websites and collect their URLs
  const invalidWebsites = (value as IFocus.WebSite[])
    .filter(website => {
      const cleanedUrl = cleanUrlHelper(website.url);
      return unblockableUrls.includes(cleanedUrl);
    })
    .map(website => cleanUrlHelper(website.url));

  if (invalidWebsites.length > 0) {
    return {
      [VALIDATION_ERROR_KEYS.UNACTIVATABLE_NOT_ALLOWED]: true,
      invalidUrls: invalidWebsites,
    };
  }

  return null;
}
