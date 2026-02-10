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
  ARROW_DROP_DOWN: '#icon-arrow-drop-down',
  CHECK: '#icon-check',
  CLOSE: '#icon-close',
  CYCLE: '#icon-cycle',
  DELETE: '#icon-delete',
  EDIT: '#icon-edit',
  FACEBOOK: '#icon-facebook',
  FOLDER_OFF: '#icon-folder-off',
  GLOBE: '#icon-globe',
  GOOGLE_LOGO: '#icon-google-logo',
  INSTAGRAM: '#icon-instagram',
  LINKEDIN: '#icon-linkedin',
  LOGIN: '#icon-login',
  LOGOUT: '#icon-logout',
  MENU: '#icon-menu',
  MINUS: '#icon-minus',
  MOON: '#icon-moon',
  PERSON_ZEN: '#icon-person-zen',
  PINTEREST: '#icon-pinterest',
  PLUS: '#icon-plus',
  RESET: '#icon-reset',
  SAVE: '#icon-save',
  SNAPCHAT: '#icon-snapchat',
  SUN: '#icon-sun',
  TELEGRAM: '#icon-telegram',
  TIKTOK: '#icon-tiktok',
  VK: '#icon-vk',
  X: '#icon-x',
  YOUTUBE: '#icon-youtube',
  CHRONIC: '#icon-chronic',
  PRIVACY_TIP: '#icon-privacy-tip',
  POWER_SWITCHER: '#icon-power-settings-circle',
  INFO: '#icon-info',
  SUCCESS: '#icon-success',
  WARNING: '#icon-warning',
  ERROR: '#icon-error',
  BLOCK: '#icon-block',
  PAUSE: '#icon-pause',
  TOMATO: '#icon-tomato',
  SCHOOL: '#icon-school',
  COFFEE: '#icon-coffee',
  CHAIR: '#icon-chair',
  NETWORK_INTELLIGENCE: '#icon-network-intelligence',
  PLAY_ARROW: '#icon-play-arrow',
  RESUME: '#icon-resume',
  ADD_LINK: '#icon-add-link',
  WIFI_FIND: '#icon-wifi-find',
  WIFI_OFF: '#icon-wifi-off',
  WIFI: '#icon-wifi',
  STOP: '#icon-stop',
  ASSIGMENT: '#icon-assigment',
  KEEP: '#icon-keep',
  KEEP_OFF: '#icon-keep-off',
  VIEW_SIDEBAR: '#icon-view-sidebar',
  TROPHY: '#icon-trophy',
  WORKSPACE_PREMIUM: '#icon-workspace-premium',
} as const);

/**
 * Type representing all available icon identifiers
 */
export type IconType = (typeof ICONS)[keyof typeof ICONS];
