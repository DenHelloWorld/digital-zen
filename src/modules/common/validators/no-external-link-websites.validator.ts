import { AbstractControl, ValidationErrors } from '@angular/forms';
import { IFocus } from '../models';
import { filterBlockableWebsites } from '../helpers';

/**
 * Validator that checks if an array of websites contains any EXTERNAL_LINK type websites.
 * EXTERNAL_LINK websites (like privacy policy) should never be added to blocked sites.
 * This prevents users from manually adding forbidden websites through the form.
 *
 * @guideline DZ_16 - Custom validator pattern
 * @guideline DZ_07 - Strict TypeScript typing
 *
 * @see /docs/coding-guidelines.md#dz_16-custom-validators
 * @see https://angular.dev/guide/forms/form-validation#defining-custom-validators
 *
 * @param control - Form control containing array of websites
 * @returns Validation error if array contains EXTERNAL_LINK websites, null otherwise
 *
 * @example
 * ```typescript
 * const control = new FormControl(websites, noExternalLinkWebsitesValidator);
 * // Returns { externalLinkNotAllowed: true } if array contains EXTERNAL_LINK websites
 * // Returns null if all websites are blockable (SOCIAL_MEDIA or DEFAULT)
 * ```
 */
export function noExternalLinkWebsitesValidator(control: AbstractControl): ValidationErrors | null {
  const value: typeof control.value = control.value;

  if (!Array.isArray(value)) {
    return null;
  }

  // Use helper to filter blockable websites
  const blockableWebsites = filterBlockableWebsites(value as IFocus.WebSite[]);

  // If filtered list is shorter, it means there were EXTERNAL_LINK websites
  if (blockableWebsites.length < value.length) {
    return { externalLinkNotAllowed: true };
  }

  return null;
}
