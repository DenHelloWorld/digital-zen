import { IFocus } from '../models';

/**
 * Helper function to filter websites to only include blockable types.
 * Removes EXTERNAL_LINK type websites which should never be blocked.
 *
 * @guideline DZ_07 - Strict TypeScript typing
 * @see /docs/coding-guidelines.md#dz_07-strict-typescript-mode
 *
 * @param websites - Array of websites to filter
 * @returns Array containing only blockable websites (excludes EXTERNAL_LINK type)
 *
 * @example
 * ```typescript
 * const websites = [
 *   { type: IFocus.EWebSiteType.SOCIAL_MEDIA, ... },
 *   { type: IFocus.EWebSiteType.EXTERNAL_LINK, ... }, // Will be filtered out
 * ];
 * const blockable = filterBlockableWebsites(websites);
 * // Returns only SOCIAL_MEDIA and DEFAULT type websites
 * ```
 */
export function filterBlockableWebsites(websites: IFocus.WebSite[]): IFocus.WebSite[] {
  return websites.filter(website => website.type !== IFocus.EWebSiteType.EXTERNAL_LINK);
}
