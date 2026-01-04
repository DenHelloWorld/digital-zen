import { Injectable } from '@angular/core';

/**
 * Interface for JWT authentication response
 */
export interface IJWTAuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    picture_url: string;
    created_at: string;
    last_login_at: string;
  };
}

/**
 * Service for managing JWT token storage using Chrome Storage API
 *
 * The JWT token is stored in chrome.storage.local for persistence
 * across extension restarts and updates.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'dz_jwt_token';

  /**
   * Check if Chrome storage API is available
   */
  readonly #isChromeStorage: boolean =
    typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;

  /**
   * Save JWT token to storage
   *
   * @param token JWT token to store
   * @returns Promise that resolves when token is saved
   */
  public async saveToken(token: string): Promise<void> {
    if (!this.#isChromeStorage) {
      console.warn(
        '[TokenStorageService] Chrome storage not available, using sessionStorage fallback'
      );
      sessionStorage.setItem(this.TOKEN_KEY, token);
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [this.TOKEN_KEY]: token }, () => {
        if (chrome.runtime.lastError) {
          console.error('[TokenStorageService] Failed to save token:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get JWT token from storage
   *
   * @returns Promise that resolves with the token or null if not found
   */
  public async getToken(): Promise<string | null> {
    if (!this.#isChromeStorage) {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      return Promise.resolve(token);
    }

    return new Promise<string | null>((resolve, reject) => {
      chrome.storage.local.get([this.TOKEN_KEY], result => {
        if (chrome.runtime.lastError) {
          console.error('[TokenStorageService] Failed to get token:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          const token = result[this.TOKEN_KEY];
          resolve(typeof token === 'string' ? token : null);
        }
      });
    });
  }

  /**
   * Remove JWT token from storage
   *
   * @returns Promise that resolves when token is removed
   */
  public async removeToken(): Promise<void> {
    if (!this.#isChromeStorage) {
      sessionStorage.removeItem(this.TOKEN_KEY);
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.remove([this.TOKEN_KEY], () => {
        if (chrome.runtime.lastError) {
          console.error('[TokenStorageService] Failed to remove token:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Check if a valid token exists
   *
   * @returns Promise that resolves with true if token exists, false otherwise
   */
  public async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}
