export const API_URLS = {
  GOOGLE: {
    USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
    REVOKE_TOKEN: 'https://accounts.google.com/o/oauth2/revoke?token=',
  },
  GITHUB: {
    CLIENT_ID: '__GITHUB_CLIENT_ID__',
    AUTHORIZE: 'https://github.com/login/oauth/authorize',
    USER_INFO: 'https://api.github.com/user',
    REVOKE_TOKEN: 'https://api.github.com/applications/__GITHUB_CLIENT_ID__/token',
  },
};
