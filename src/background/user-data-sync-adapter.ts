/// <reference types="chrome"/>
import { API_URLS } from '../modules/common/constants/api-urls.const';
import { API_CONFIG } from '../modules/common/constants/api-config.const';
import { IUserDataSync } from '../modules/common/models/user-data-sync.model';
import { IFocus } from '../modules/common/models/focus.model';
import { StorageAdapter } from './storage-adapter';

/**
 * User Data Sync Adapter for Background Service
 * Handles synchronization of user data with backend API in background context
 */
export class UserDataSyncAdapter {
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
      console.log('[UserDataSyncAdapter] Starting sync for:', userEmail);

      // Get user data from API
      const userData = await this.getUserData(userEmail, userId);

      // If user doesn't exist, create new user
      if (!userData.user) {
        console.log('[UserDataSyncAdapter] User not found, creating new user');
        await this.createUser(userEmail, userId);
      } else {
        console.log('[UserDataSyncAdapter] User found, sync complete');
      }

      // Sync periods if needed
      if (userData.periods && userData.periods.length > 0) {
        console.log('[UserDataSyncAdapter] Syncing periods from backend');
        // Store periods in local storage
        for (const period of userData.periods) {
          await StorageAdapter.savePeriod(period);
        }
      }
    } catch (error) {
      console.error('[UserDataSyncAdapter] Sync failed:', error);
      throw error;
    }
  }

  /**
   * Get user data from API
   *
   * @param userEmail User email
   * @param userId User ID
   * @returns Promise with user data
   */
  static async getUserData(userEmail: string, userId: string): Promise<IUserDataSync.Response> {
    if (!userEmail && !userId) {
      throw new Error('At least one of userEmail or userId must be provided');
    }

    const url = new URL(API_URLS.USER);

    if (userEmail) {
      url.searchParams.append('user_email', userEmail);
    }

    if (userId) {
      url.searchParams.append('user_id', userId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.apiKey,
      },
    });

    if (!response.ok) {
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
   * @returns Promise that resolves when user is created
   */
  static async createUser(userEmail: string, userId: string): Promise<void> {
    const url = API_URLS.USER;

    const requestBody: IUserDataSync.SaveRequest = {
      user_email: userEmail,
      user_id: userId,
      periods: [],
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
      throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
    }

    await response.json();
    console.log('[UserDataSyncAdapter] User created successfully');
  }

  /**
   * Save user data to API
   *
   * @param userEmail User email
   * @param userId User ID
   * @param periods Array of periods to save
   * @returns Promise that resolves when data is saved
   */
  static async saveUserData(
    userEmail: string,
    userId: string,
    periods: IFocus.Period[]
  ): Promise<void> {
    const url = API_URLS.USER;

    const requestBody: IUserDataSync.SaveRequest = {
      user_email: userEmail,
      user_id: userId,
      periods: periods,
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
    console.log('[UserDataSyncAdapter] User data saved successfully');
  }
}
