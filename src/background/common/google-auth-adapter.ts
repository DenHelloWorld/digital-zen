/// <reference types="chrome"/>
import { EXTENSION_CONFIG } from '../../extension-config';
import { CHROME_STORAGE_KEY_ENUM } from '../../modules/common/enums/chrome-storage-key.enum';
import { logger } from '../../modules/common/helpers/logger';
import { IGoogleUserInfo } from '../../modules/common/models/google-user-info.model';

/**
 * OAuth adapter for background service worker
 * Handles Google OAuth authentication flow without Angular dependencies
 *
 * This adapter runs in the background service worker context and doesn't close
 * when the popup loses focus, ensuring OAuth flow completes successfully.
 */
export class GoogleAuthAdapter {
  private static readonly OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  private static readonly OAUTH_CLIENT_ID_PLACEHOLDER = '__OAUTH_CLIENT_ID__';
  private static readonly logger = logger.createLogger('GoogleAuthAdapter');

  private static readonly GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
  private static readonly GOOGLE_REVOKE_TOKEN_URL =
    'https://accounts.google.com/o/oauth2/revoke?token=';
  private static readonly GOOGLE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

  /**
   * Initiates Google OAuth login flow
   * @returns Promise with success status and optional error message
   */
  public static async login(): Promise<{ success: boolean; error?: string }> {
    try {
      const clientId = EXTENSION_CONFIG.OAUTH_CLIENT_ID;

      if (!clientId || clientId === this.OAUTH_CLIENT_ID_PLACEHOLDER) {
        const error = 'OAuth client ID not configured';
        this.logger.error(error);
        return { success: false, error };
      }

      // Get the redirect URL for this extension
      const redirectUrl = chrome.identity.getRedirectURL('oauth2');

      this.logger.info('OAuth redirect URL:', redirectUrl);
      this.logger.info(
        'If you get redirect_uri_mismatch error, add this URL to Google Cloud Console:',
        redirectUrl
      );

      // Construct OAuth authorization URL
      const authUrl =
        `${this.GOOGLE_OAUTH_AUTH_URL}?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(this.OAUTH_SCOPES.join(' '))}` +
        `&prompt=consent`;

      this.logger.info('Starting OAuth flow...');

      // Launch web auth flow - this is non-blocking in service worker
      const responseUrl = await new Promise<string | undefined>((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
          {
            url: authUrl,
            interactive: true,
          },
          (url?: string) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(url);
            }
          }
        );
      });

      if (!responseUrl) {
        const error = 'OAuth flow failed: no response URL returned';
        this.logger.error(error);
        return { success: false, error };
      }

      // Extract access token from response URL
      const token = this.extractTokenFromUrl(responseUrl);

      if (!token) {
        const error = 'Failed to extract token from response URL';
        this.logger.error(error);
        return { success: false, error };
      }

      this.logger.info('OAuth flow completed successfully, storing token...');

      // Store token in Chrome storage
      await this.storeToken(token);

      // Fetch and store user info
      const userInfo = await this.fetchUserInfo(token);

      if (userInfo) {
        await this.storeUserInfo(userInfo);
        this.logger.info('User info stored successfully');
        return { success: true };
      } else {
        const error = 'Failed to fetch user info';
        this.logger.error(error);
        return { success: false, error };
      }
    } catch (error) {
      this.logger.error('Error during login:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during login',
      };
    }
  }

  /**
   * Logs out the user by revoking the OAuth token and clearing stored data
   * @returns Promise with success status
   */
  public static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the stored token
      const token = await this.getStoredToken();

      if (token) {
        // Attempt to revoke the token with Google
        try {
          await this.revokeToken(token);
          this.logger.info('Token revoked successfully');
        } catch (error) {
          this.logger.error('Failed to revoke token:', error);
          // Continue with logout anyway
        }
      }

      // Clear all auth-related data
      await this.clearAuthData();

      this.logger.info('Logout completed, user credentials cleared');
      return { success: true };
    } catch (error) {
      this.logger.error('Error during logout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during logout',
      };
    }
  }

  /**
   * Extracts access token from OAuth redirect URL
   */
  private static extractTokenFromUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const fragment = parsedUrl.hash.substring(1);
      const params = new URLSearchParams(fragment);
      const token = params.get('access_token');

      if (token && token.length > 0) {
        return token;
      }

      this.logger.warn('Invalid or missing access token in OAuth response');
      return null;
    } catch (error) {
      this.logger.error('Error extracting token from URL:', error);
      return null;
    }
  }

  /**
   * Fetches user info from Google's userinfo endpoint
   */
  private static async fetchUserInfo(token: string): Promise<IGoogleUserInfo | null> {
    try {
      const response = await fetch(this.GOOGLE_USER_INFO_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logger.error('Failed to fetch user info:', response.status, response.statusText);
        return null;
      }

      const userInfo = (await response.json()) as IGoogleUserInfo;
      return userInfo;
    } catch (error) {
      this.logger.error('Error fetching user info:', error);
      return null;
    }
  }

  /**
   * Revokes the OAuth token with Google
   */
  private static async revokeToken(token: string): Promise<void> {
    const url = `${this.GOOGLE_REVOKE_TOKEN_URL}${encodeURIComponent(token)}`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to revoke token: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Stores token in chrome.storage.local
   */
  private static async storeToken(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN]: token }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Stores user info in chrome.storage.local
   */
  private static async storeUserInfo(userInfo: IGoogleUserInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      const dataToStore = {
        [CHROME_STORAGE_KEY_ENUM.GOOGLE_USER_INFO]: userInfo,
        [CHROME_STORAGE_KEY_ENUM.USER_EMAIL]: userInfo.email,
        [CHROME_STORAGE_KEY_ENUM.USER_ID]: userInfo.sub,
      };

      chrome.storage.local.set(dataToStore, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Gets stored token from chrome.storage.local
   */
  private static async getStoredToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve((result[CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN] as string) || null);
        }
      });
    });
  }

  /**
   * Clears all auth-related data from chrome.storage.local
   */
  private static async clearAuthData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const keysToRemove: string[] = [
        CHROME_STORAGE_KEY_ENUM.GOOGLE_AUTH_TOKEN,
        CHROME_STORAGE_KEY_ENUM.GOOGLE_USER_INFO,
        CHROME_STORAGE_KEY_ENUM.USER_EMAIL,
        CHROME_STORAGE_KEY_ENUM.USER_ID,
      ];

      chrome.storage.local.remove(keysToRemove, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}
