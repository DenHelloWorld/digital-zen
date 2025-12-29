/**
 * Checks if the given URL points to an icon or image file.
 *
 * The function:
 * - Converts the URL to lowercase.
 * - Removes any query parameters.
 * - Safely handles `null` or `undefined`.
 *
 * Supported extensions: `.png`, `.jpg`, `.jpeg`, `.webp`, `.ico`.
 *
 * @param url - The URL of the image or icon. Can be `null` or `undefined`.
 * @returns `true` if the URL points to an image/icon, otherwise `false`.
 *
 * @example
 * isImageIcon("https://example.com/favicon.ico"); // true
 * isImageIcon("https://example.com/image.png?size=32"); // true
 * isImageIcon(null); // false
 * isImageIcon("https://example.com/file.txt"); // false
 */
export const isImageIcon = (url: string | null | undefined): boolean => {
  const cleanUrl = (url || '').trim().split('?')[0].toLowerCase();

  return /\.(png|jpe?g|webp|ico)$/.test(cleanUrl);
};
