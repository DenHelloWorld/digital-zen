import { AbstractControl, ValidationErrors } from '@angular/forms';
import { IFocus } from '../models';
import { cleanUrlHelper } from '../helpers';
import { WEBSITES_UNBLOCKABLE, VALIDATION_ERROR_KEYS } from '../constants';

/**
 * Validator that checks if an array of websites contains any UNBLOCKABLE websites.
 * UNBLOCKABLE websites (like privacy policy) should never be added to blocked sites.
 * This prevents users from manually adding forbidden websites through the form.
 *
 * The validator compares cleaned URLs (using cleanUrlHelper) instead of relying on
 * the website type property, as users can manually add URLs that match UNBLOCKABLE
 * websites but have a different type assigned.
 *
 * @guideline DZ_16 - Custom validator pattern
 * @guideline DZ_07 - Strict TypeScript typing
 *
 * @see /docs/coding-guidelines.md#dz_16-custom-validators
 * @see https://angular.dev/guide/forms/form-validation#defining-custom-validators
 *
 * @param control - Form control containing array of websites
 * @returns Validation error if array contains UNBLOCKABLE websites, null otherwise
 *
 * @example
 * ```typescript
 * const control = new FormControl(websites, noUnblockableWebsitesValidator);
 * // Returns { [VALIDATION_ERROR_KEYS.UNBLOCKABLE_NOT_ALLOWED]: true } if array contains UNBLOCKABLE websites
 * // Returns null if all websites are blockable
 * ```
 */
export function noUnblockableWebsitesValidator(control: AbstractControl): ValidationErrors | null {
  const value: typeof control.value = control.value;

  if (!Array.isArray(value)) {
    return null;
  }

  // Get cleaned URLs of all UNBLOCKABLE websites for comparison
  const unblockableUrls = WEBSITES_UNBLOCKABLE.map(site => cleanUrlHelper(site.url));

  // Check if any website in the array has a URL that matches an UNBLOCKABLE website
  const hasUnblockableWebsite = (value as IFocus.WebSite[]).some(website => {
    const cleanedUrl = cleanUrlHelper(website.url);
    return unblockableUrls.includes(cleanedUrl);
  });

  if (hasUnblockableWebsite) {
    return { [VALIDATION_ERROR_KEYS.UNBLOCKABLE_NOT_ALLOWED]: true };
  }

  return null;
}
