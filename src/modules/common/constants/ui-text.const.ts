/**
 * UI Text Constants
 *
 * All user-facing text strings from HTML templates.
 * Organized by feature/component for easy i18n replacement in the future.
 */

export const UI_TEXT = Object.freeze({
  WEBSITE_LIBRARY: {
    TITLE: 'Websites',
    NEW_FOLDER_TITLE: 'Create New Folder',
    DELETE_FOLDER_TITLE: 'Delete Folder',
    ALREADY_EXISTS: 'already exists',
    CONFIRM_DELETE: 'Confirm to delete',
    ERRORS: {
      FOLDER_NOT_FOUND: 'Folder not found',
      SYSTEM_FOLDER_DELETE: 'System folders cannot be deleted',
    },
  },

  // Blocked Page
  BLOCKED_PAGE: {
    TITLE: 'Blocked',
    HEADING: '⛔ Access Blocked',
    MESSAGE: 'This website is blocked during your Digital Zen focus session.',
  },

  // App Header
  HEADER: {
    FOCUS_TITLE: 'Focus',
    ADD_NEW_PERIOD_TITLE: 'Add new period',
    EDIT_PERIOD_TITLE: 'Edit period',
    LOGIN_GOOGLE_TITLE: 'Login with Google',
    LOGOUT_GOOGLE_TITLE: 'Logout from Google',
    POMODORO_MENU_TITLE: 'Pomodoro timer',
    PERIODS_LIST_TITLE: 'List of all periods',
  },

  // Menu Component
  MENU: {
    ADD_PERIOD_BUTTON: 'Add Period',
    EXPORT_SETTINGS_BUTTON: 'Export settings',
    IMPORT_SETTINGS_BUTTON: 'Import settings',
    EXPORTING_SETTINGS_BUTTON: 'Preparing export...',
    IMPORTING_SETTINGS_BUTTON: 'Importing settings...',
    EXPORT_SUCCESS: 'Settings backup exported. Check your downloads folder.',
    IMPORT_SUCCESS: 'Settings imported successfully.',
    EXPORT_ERROR: 'Failed to export settings.',
    IMPORT_ERROR: 'Failed to import settings. Please choose a valid backup file.',
    EXPORT_TITLE:
      'Export settings (filename uses local time: digital-zen-backup-YYYY-MM-DD-HH-mm-ss)',
    IMPORT_TITLE: 'Import settings from a digital-zen-backup-YYYY-MM-DD-HH-mm-ss file.',
  },

  // Period Form Component
  PERIOD_FORM: {
    LABELS: {
      ACTIVATE_ON_SAVE: 'Activate on save',
      NAME: 'Name',
      DESCRIPTION: 'Description',
      DAYS_OF_WEEK: 'Days of week',
      START_FROM: 'Start from',
      END_TO: 'End to',
      WEBSITES_URLS: 'Websites URLs',
      TIME_RANGE: 'Time Range',
    },
    PLACEHOLDERS: {
      NAME: "Enter period's name...",
      DESCRIPTION: "Enter period's description...",
      START_FROM: '* Start From',
      END_TO: '* End To',
    },
    ERRORS: {
      CHOOSE_DAYS: 'Choose one or more days',
      INVALID_TIME_RANGE: 'Invalid time range',
      CHOOSE_WEBSITES: 'Choose one or more websites',
      DUPLICATE_NAME: 'A period with this name already exists',
      UNBLOCKABLE_WEBSITE: 'This website cannot be blocked (e.g., privacy policy)',
    },
    BUTTONS: {
      CREATE: 'Create',
      UPDATE: 'Update',
      CANCEL: 'Cancel',
    },
  },

  // Period Component
  PERIOD: {
    CONFIRM_DELETE: 'Delete',
    ARIA_LABELS: {
      EDIT_PERIOD: 'Edit period',
      DELETE_PERIOD: 'Delete period',
      CONFIRM_DELETE: 'Confirm delete period',
      CANCEL_DELETE: 'Cancel delete',
      ACTIVATE_PERIOD: 'Activate period',
    },
    ACTIVATED: 'Activated',
    DEACTIVATED: 'Deactivated',
    ACTIVATE_DISABLED_TOOLTIP: 'Stop focus to activate this period',
    BLOCK_BEHAVIOUR: {
      BANNER_BLOCK: 'Tabs will be closed for the websites below',
      BANNER_WARN: 'Warning overlay will appear on these websites',
      BANNER_WHITE_LIST: 'Only these websites will be accessible. All others will be blocked',
    },
  },

  // Dynamic Input Component
  DYNAMIC_INPUT: {
    TITLES: {
      REMOVE: 'Remove',
      SAVE: 'Save',
      CANCEL: 'Cancel',
      ADD: 'Add',
      RESET: 'Reset',
      DELETE_ALL: 'Delete All',
    },
    HINTS: {
      FILL_TO_ADD: 'Fill to add...',
    },
    EMPTY_PLACEHOLDER: 'Empty...',
    ADD_BUTTON: 'Add',
    ERRORS: {
      DUPLICATE_FIELD: 'A field with this value already exists',
    },
  },

  // Common
  COMMON: {
    REQUIRED_MARKER: '*',
    WEBSITE_LIBRARY: 'Website library',
  },

  // Time Line Component
  TIME_LINE: {
    NOW_LABEL: 'now:',
  },

  // Toast Container
  TOAST: {
    CLOSE_ICON: '✕',
  },

  // Focus Component
  FOCUS: {
    ADD_CURRENT_TAB_TITLE: 'Add current website to period',
    ADD_AND_BLOCK_CURRENT_TAB_TITLE: 'Add current website to period and block',
    TOGGLE_FOCUS_TITLE: 'Toggle focus session',
    START: 'Start',
    STOP: 'Stop',
    ENABLED: 'Enabled',
    DISABLED: 'Disabled',
    CANNOT_ADD_CURRENT_TAB_TITLE: 'This website cannot be added',
  },

  // Theme Switcher Component
  THEME_SWITCHER: {
    TOGGLE_THEME_TITLE: 'Toggle theme',
  },

  // Footer
  FOOTER: {
    PRIVACY_POLICY_LINK: 'Privacy Policy',
    PRIVACY_POLICY_ARIA_LABEL: 'Privacy Policy (opens in new tab)',
  },

  // Banner Component
  BANNER: {
    EXAMPLES: {
      INFO_TITLE: 'Information',
      INFO_MESSAGE: 'This is an informational banner message.',
      SUCCESS_TITLE: 'Success',
      SUCCESS_MESSAGE: 'Operation completed successfully!',
      WARN_TITLE: 'Warning',
      WARN_MESSAGE: 'Please review your settings before proceeding.',
      ERROR_TITLE: 'Error',
      ERROR_MESSAGE: 'An error occurred. Please try again.',
    },
  },

  POMODORO: {
    TITLES: {
      WORK: 'Work',
      SHORT_BREAK_LENGTH: 'Short Break',
      LONG_BREAK_LENGTH: 'Long Break',
      POMODOROS_BEFORE_LONG_BREAK: 'Pomodoros',
    },
    BUTTONS: {
      START: 'Start Studying',
      RESUME: 'Resume',
      PAUSE: 'Pause',
      RESET: 'Reset',
    },
    UNITS: {
      MINUTES: 'min',
      POMO: 'pomo',
      POMODORO: 'Pomodoro',
      FINISH: 'Finish',
    },
  },
});
