/**
 * Checks if the given URL points to an SVG icon.
 *
 * The function:
 * - Converts the URL to lowercase.
 * - Removes any query parameters.
 * - Safely handles `null` or `undefined`.
 *
 * @param url - The URL of the SVG icon. Can be `null` or `undefined`.
 * @returns `true` if the URL ends with `.svg`, otherwise `false`.
 *
 * @example
 * isSvgIcon("https://example.com/icon.svg"); // true
 * isSvgIcon("https://example.com/icon.svg?size=32"); // true
 * isSvgIcon(null); // false
 * isSvgIcon("https://example.com/file.png"); // false
 */
export const isSvgIcon = (url?: string | null): boolean => {
  const cleanUrl = (url || '').trim().split('?')[0].toLowerCase();

  return cleanUrl.endsWith('.svg');
};
