export const API_URLS = {
  GOOGLE: {
    USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
    REVOKE_TOKEN: 'https://accounts.google.com/o/oauth2/revoke?token=',
  },
  GITHUB: {
    CLIENT_ID: 'Ov23liI9K0GJNwH8L5fG', // Public client ID for device flow
    DEVICE_CODE: 'https://github.com/login/device/code',
    ACCESS_TOKEN: 'https://github.com/login/oauth/access_token',
    USER_INFO: 'https://api.github.com/user',
  },
};
