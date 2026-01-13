/// <reference types="chrome"/>
import { API_URLS } from '../modules/common/constants/api-urls.const';
import { API_CONFIG } from '../modules/common/constants/api-config.const';
import { IUserDataSync } from '../modules/common/models/user-data-sync.model';
import { IFocus } from '../modules/common/models/focus.model';
import { StorageAdapter } from './storage-adapter';
import { logger } from '../modules/common/helpers/logger';
import { CHROME_STORAGE_KEY_ENUM } from '../modules/common/enums/chrome-storage-key.enum';
import { createDefaultPeriod } from '../modules/common/constants/websites.const';
import { DEFAULT_PERIOD_ID } from '../modules/common/constants/default-period-id.const';

/**
 * User Data Sync Adapter for Background Service
 * Handles synchronization of user data with backend API in background context
 */
export class UserDataSyncAdapter {
  private static readonly logger = logger.createLogger('UserDataSyncAdapter');
  /**
   * Check if API key is configured
   * @private
   * @returns true if API key is configured, false otherwise
   */
  private static checkApiKey(): boolean {
    if (!API_CONFIG.apiKey) {
      UserDataSyncAdapter.logger.warn('API key is not configured - skipping backend sync');
      UserDataSyncAdapter.logger.info(
        'To enable backend sync, set API_SECRET_KEY in your .env file and rebuild with: npm run build:prod'
      );
      return false;
    }
    return true;
  }

  /**
   * Synchronize user data with backend
   * Fetches user data from API and creates user if doesn't exist
   *
   * @param userEmail User email
   * @param userId User ID (sub from Google Auth)
   * @returns Promise that resolves when sync is complete
   */
  static async syncUserData(userEmail: string, userId: string): Promise<void> {
    try {
      UserDataSyncAdapter.logger.info('Starting sync for:', userEmail);

      // Check if API key is configured - if not, skip backend sync
      if (!this.checkApiKey()) {
        UserDataSyncAdapter.logger.info('Backend sync skipped - API key not configured');
        return;
      }

      // Save user credentials to local storage for later use
      await chrome.storage.local.set({
        [CHROME_STORAGE_KEY_ENUM.USER_EMAIL]: userEmail,
        [CHROME_STORAGE_KEY_ENUM.USER_ID]: userId,
      });

      // Get user data from API
      const userData = await this.getUserData(userEmail, userId);

      // If API key is not configured, getUserData returns null
      if (!userData) {
        UserDataSyncAdapter.logger.info('Skipping backend sync - API key not configured');
        return;
      }

      UserDataSyncAdapter.logger.info('Received user data:', {
        hasUser: !!userData.user,
        periodsCount: userData.periods?.length ?? 0,
      });

      // If user doesn't exist, create new user
      if (!userData.user) {
        UserDataSyncAdapter.logger.info('User not found, creating new user');
        await this.createUser(userEmail, userId);
      } else {
        UserDataSyncAdapter.logger.info('User found, syncing periods');
      }

      // Sync periods from backend - replace local periods entirely with backend data
      if (userData.periods && userData.periods.length > 0) {
        UserDataSyncAdapter.logger.info(
          'Syncing periods from backend, count:',
          userData.periods.length
        );

        // Atomically replace all local periods with backend data
        await StorageAdapter.replaceAllPeriods(userData.periods);

        UserDataSyncAdapter.logger.info('Periods synced successfully from backend');
      } else {
        // No periods on backend - add default period for new users
        UserDataSyncAdapter.logger.info('No periods found on backend, adding default period');

        const defaultPeriod = createDefaultPeriod();

        await StorageAdapter.savePeriod(defaultPeriod);
        UserDataSyncAdapter.logger.info('Default period added for new user');
      }
    } catch (error) {
      UserDataSyncAdapter.logger.error('Sync failed:', error);
      throw error;
    }
  }

  /**
   * Get user data from API
   *
   * @param userEmail User email
   * @param userId User ID
   * @returns Promise with user data or null if API key not configured
   */
  static async getUserData(
    userEmail: string,
    userId: string
  ): Promise<IUserDataSync.Response | null> {
    if (!userEmail && !userId) {
      throw new Error('At least one of userEmail or userId must be provided');
    }

    // Check if API key is configured
    if (!this.checkApiKey()) {
      return null;
    }

    const url = new URL(API_URLS.USER);

    if (userEmail) {
      url.searchParams.append('user_email', userEmail);
    }

    if (userId) {
      url.searchParams.append('user_id', userId);
    }

    UserDataSyncAdapter.logger.debug('Fetching user data from:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey,
      },
    });

    if (!response.ok) {
      UserDataSyncAdapter.logger.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        hasApiKey: !!API_CONFIG.apiKey,
      });
      throw new Error(`Failed to get user data: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data as IUserDataSync.Response;
  }

  /**
   * Create new user in API
   *
   * @param userEmail User email
   * @param userId User ID
   * @returns Promise that resolves when user is created or null if API key not configured
   */
  static async createUser(userEmail: string, userId: string): Promise<void | null> {
    // Check if API key is configured
    if (!this.checkApiKey()) {
      return null;
    }

    const url = API_URLS.USER;

    const requestBody: IUserDataSync.SaveRequest = {
      user_email: userEmail,
      user_id: userId,
      periods: [],
    };

    UserDataSyncAdapter.logger.debug('Creating user:', userEmail);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      UserDataSyncAdapter.logger.error('Create user failed:', {
        status: response.status,
        statusText: response.statusText,
        hasApiKey: !!API_CONFIG.apiKey,
      });
      throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
    }

    await response.json();
    UserDataSyncAdapter.logger.info('User created successfully');
  }

  /**
   * Save user data to API
   *
   * @param userEmail User email
   * @param userId User ID
   * @param periods Array of periods to save (default period will be filtered out)
   * @returns Promise that resolves when data is saved
   */
  static async saveUserData(
    userEmail: string,
    userId: string,
    periods: IFocus.Period[]
  ): Promise<void> {
    // Check if API key is configured
    if (!this.checkApiKey()) {
      return;
    }

    const url = API_URLS.USER;

    // Filter out default period - it should only exist locally
    const periodsToSync = periods.filter(p => p.id !== DEFAULT_PERIOD_ID);

    const requestBody: IUserDataSync.SaveRequest = {
      user_email: userEmail,
      user_id: userId,
      periods: periodsToSync,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to save user data: ${response.status} ${response.statusText}`);
    }

    await response.json();
    UserDataSyncAdapter.logger.info('User data saved successfully');
  }

  /**
   * Sync all periods to backend
   * Retrieves user credentials from storage and syncs all periods (excluding default period)
   *
   * @returns Promise that resolves when sync is complete
   */
  static async syncPeriodsToBackend(): Promise<void> {
    try {
      // Get user credentials from storage
      const result = await chrome.storage.local.get([
        CHROME_STORAGE_KEY_ENUM.USER_EMAIL,
        CHROME_STORAGE_KEY_ENUM.USER_ID,
      ]);

      const userEmail = result[CHROME_STORAGE_KEY_ENUM.USER_EMAIL] as string | undefined;
      const userId = result[CHROME_STORAGE_KEY_ENUM.USER_ID] as string | undefined;

      // If user is not logged in, skip sync
      if (!userEmail || !userId) {
        UserDataSyncAdapter.logger.debug('No user credentials found, skipping backend sync');
        return;
      }

      // Get all periods from local storage
      const periods = await StorageAdapter.getPeriods();

      // Filter out default period before syncing to backend
      const periodsToSync = periods.filter(p => p.id !== DEFAULT_PERIOD_ID);

      // Save to backend
      UserDataSyncAdapter.logger.info('Syncing periods to backend:', periodsToSync.length);
      await this.saveUserData(userEmail, userId, periodsToSync);
    } catch (error) {
      UserDataSyncAdapter.logger.error('Failed to sync periods to backend:', error);
      // Don't throw - this is a background operation and shouldn't block the main flow
    }
  }
}
