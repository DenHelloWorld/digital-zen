/**
 * Icon identifiers used throughout the application.
 * All icons are defined as SVG symbols in index.html and referenced by their ID.
 *
 * @example
 * ```html
 * <svg class="dz-icon">
 *   <use [attr.href]="icons.PLUS"></use>
 * </svg>
 * ```
 */
export const ICONS = Object.freeze({
  /** Arrow drop down icon */
  ARROW_DROP_DOWN: '#icon-arrow-drop-down',
  /** Check/checkmark icon */
  CHECK: '#icon-check',
  /** Close/X icon */
  CLOSE: '#icon-close',
  /** Cycle/refresh animation icon */
  CYCLE: '#icon-cycle',
  /** Delete/trash icon */
  DELETE: '#icon-delete',
  /** Edit/pencil icon */
  EDIT: '#icon-edit',
  /** Facebook social media icon */
  FACEBOOK: '#icon-facebook',
  /** Folder off/empty folder icon */
  FOLDER_OFF: '#icon-folder-off',
  /** Globe/world icon */
  GLOBE: '#icon-globe',
  /** Google logo icon */
  GOOGLE_LOGO: '#icon-google-logo',
  /** Instagram social media icon */
  INSTAGRAM: '#icon-instagram',
  /** LinkedIn social media icon */
  LINKEDIN: '#icon-linkedin',
  /** Login icon */
  LOGIN: '#icon-login',
  /** Logout icon */
  LOGOUT: '#icon-logout',
  /** Menu/hamburger icon */
  MENU: '#icon-menu',
  /** Minus/subtract icon */
  MINUS: '#icon-minus',
  /** Moon icon (for dark theme) */
  MOON: '#icon-moon',
  /** Person zen/meditation icon */
  PERSON_ZEN: '#icon-person-zen',
  /** Pinterest social media icon */
  PINTEREST: '#icon-pinterest',
  /** Plus/add icon */
  PLUS: '#icon-plus',
  /** Reset icon */
  RESET: '#icon-reset',
  /** Save/floppy disk icon */
  SAVE: '#icon-save',
  /** Snapchat social media icon */
  SNAPCHAT: '#icon-snapchat',
  /** Sun icon (for light theme) */
  SUN: '#icon-sun',
  /** Telegram social media icon */
  TELEGRAM: '#icon-telegram',
  /** TikTok social media icon */
  TIKTOK: '#icon-tiktok',
  /** VK social media icon */
  VK: '#icon-vk',
  /** X (Twitter) social media icon */
  X: '#icon-x',
  /** YouTube social media icon */
  YOUTUBE: '#icon-youtube',
  /** Chronic/timer icon */
  CHRONIC: '#icon-chronic',
  /** Privacy tip/shield icon */
  PRIVACY_TIP: '#icon-privacy-tip',
  /** Power settings/switcher icon */
  POWER_SWITCHER: '#icon-power-settings-circle',
  /** Info icon for banners */
  INFO: '#icon-info',
  /** Success icon for banners */
  SUCCESS: '#icon-success',
  /** Warning icon for banners */
  WARNING: '#icon-warning',
  /** Error icon for banners */
  ERROR: '#icon-error',
  /** Icon representing a block action */
  BLOCK: '#icon-block',
  PAUSE: '#icon-pause',
} as const);

/**
 * Type representing all available icon identifiers
 */
export type IconType = (typeof ICONS)[keyof typeof ICONS];
