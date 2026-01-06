import { API_CONFIG } from './api-config.const';

export const API_URLS = {
  GOOGLE: {
    USER_INFO: 'https://www.googleapis.com/oauth2/v3/userinfo',
    REVOKE_TOKEN: 'https://accounts.google.com/o/oauth2/revoke?token=',
  },
  USER: `${API_CONFIG.apiUrl}/user`,
};
