export enum COLOR_SCHEMA_ENUM {
  DARK = 'dark',
  LIGHT = 'light',
}
export type ColorSchemaType = COLOR_SCHEMA_ENUM.DARK | COLOR_SCHEMA_ENUM.LIGHT;

export enum CHROME_STORAGE_KEY_ENUM {
  THEME = 'theme',
  TAB_ID = 'tab_id',
  TAB_URL = 'tab_url',
  HISTORY_URL = 'history_url',
}
export type ChromeStorageKeyType =
  CHROME_STORAGE_KEY_ENUM.THEME |
  CHROME_STORAGE_KEY_ENUM.TAB_ID |
  CHROME_STORAGE_KEY_ENUM.TAB_URL |
  CHROME_STORAGE_KEY_ENUM.HISTORY_URL;

export enum VIEW_ENUM {
  FOCUS = 0,
  MENU = 1
}

export type ViewType = VIEW_ENUM.FOCUS | VIEW_ENUM.MENU;
