/**
 * ExtensionIconAdapter — adapter for managing the Chrome extension icon
 * Follows DZ_XX standards, stateless, only static methods
 */

export class ExtensionIconAdapter {
  /**
   * Sets the extension icon depending on focus state
   * @param isFocused true — active focus, false — inactive
   */
  static setIcon(isFocused: boolean): void {
    const iconPrefix = isFocused ? 'icon-spa-colored' : 'icon-spa-transparent';
    chrome.action.setIcon({
      path: {
        '16': `${iconPrefix}-16x16.png`,
        '32': `${iconPrefix}-32x32.png`,
        '48': `${iconPrefix}-48x48.png`,
        '128': `${iconPrefix}-128x128.png`,
      },
    });
  }

  /**
   * Sets a badge on the extension icon
   * @param text Badge text (up to 4 characters)
   * @param color Badge background color (CSS color, optional)
   */
  static setBadge(text: string, color?: string): void {
    chrome.action.setBadgeText({ text });
    if (color) {
      chrome.action.setBadgeBackgroundColor({ color });
    }
  }

  /**
   * Clears the badge on the extension icon
   */
  static clearBadge(): void {
    chrome.action.setBadgeText({ text: '' });
  }

  /**
   * Sets a custom icon for the extension by icon name prefix
   * @param iconPrefix Icon file name prefix (e.g. 'icon-spa-colored')
   */
  static setCustomIcon(iconPrefix: string): void {
    chrome.action.setIcon({
      path: {
        '16': `${iconPrefix}-16x16.png`,
        '32': `${iconPrefix}-32x32.png`,
        '48': `${iconPrefix}-48x48.png`,
        '128': `${iconPrefix}-128x128.png`,
      },
    });
  }
}
