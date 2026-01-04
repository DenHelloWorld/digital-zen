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
   * Validate a JWT token from storage.
   *
   * This performs a minimal validation by checking:
   * - The token has three parts (header.payload.signature)
   * - The payload is valid JSON
   * - If an `exp` claim is present, it has not expired
   *
   * Tokens without an `exp` claim are treated as valid.
   *
   * @param token The JWT token string to validate
   * @returns true if the token appears structurally valid and not expired, false otherwise
   */
  private isTokenValid(token: string): boolean {
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.warn('[TokenStorageService] Invalid JWT format in storage');
      return false;
    }

    const payloadPart = parts[1];

    try {
      // JWT payload is base64url-encoded; normalize to standard base64 before decoding.
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const payloadJson = atob(paddedBase64);
      const payload = JSON.parse(payloadJson) as { exp?: number };

      if (typeof payload.exp !== 'number') {
        // No expiration claim present; treat as valid.
        return true;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      return payload.exp > nowInSeconds;
    } catch (error) {
      console.warn('[TokenStorageService] Failed to parse JWT from storage', error);
      return false;
    }
  }

  /**
   * Check if a valid (non-expired) token exists in storage
   *
   * This validates that:
   * - A token exists in storage
   * - The token has a valid JWT structure
   * - The token is not expired (if it has an exp claim)
   *
   * @returns Promise that resolves with true if a valid token exists, false otherwise
   */
  public async hasStoredToken(): Promise<boolean> {
    const token = await this.getToken();

    if (!token) {
      return false;
    }

    return this.isTokenValid(token);
  }
}
