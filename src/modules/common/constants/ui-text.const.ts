/**
 * UI Text Constants
 *
 * All user-facing text strings from HTML templates.
 * Organized by feature/component for easy i18n replacement in the future.
 */

export const UI_TEXT = Object.freeze({
  // Blocked Page
  BLOCKED_PAGE: {
    TITLE: 'Blocked',
    HEADING: '⛔ Access Blocked',
    MESSAGE: 'This website is blocked during your Digital Zen focus session.',
  },

  // App Header
  HEADER: {
    FOCUS_MENU_TITLE: 'Focus menu',
    ADD_NEW_PERIOD_TITLE: 'Add new period',
    LOGIN_GOOGLE_TITLE: 'Login with Google',
    LOGOUT_GOOGLE_TITLE: 'Logout from Google',
    POMODORO_MENU_TITLE: 'Pomodoro timer',
  },

  // Menu Component
  MENU: {
    ADD_PERIOD_BUTTON: 'Add Period',
  },

  // Period Form Component
  PERIOD_FORM: {
    LABELS: {
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
    ACTIVATE_BUTTON: 'Activate',
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
      SESSION_LENGTH: 'Session Length',
      BREAK_LENGTH: 'Break Length',
      LONG_BREAK_LENGTH: 'Long Break Length',
      CYCLES_BEFORE_LONG_BREAK: 'Cycles',
    },
    BUTTONS: {
      START: 'Start Studying',
      RESUME: 'Resume',
      PAUSE: 'Pause',
      RESET: 'Reset',
    },
    UNITS: {
      MINUTES: 'min',
      CYCLES: 'cyc',
    },
  },
});
