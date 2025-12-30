import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ApiService } from './api.service';
import { ChromeStorageService } from './chrome-storage.service';
import { API_URLS } from '../constants';
import { CHROME_STORAGE_KEY_ENUM } from '../enums/chrome-storage-key.enum';
import { DzToastService } from '../components/toast-container/toast.service';
import { TOAST_TYPE_ENUM } from '../enums';

export interface IGitHubUserInfo {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  bio?: string;
  twitter_username?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class GitHubAuthService {
  readonly #apiService: ApiService = inject(ApiService);
  readonly #chromeStorageService: ChromeStorageService = inject(ChromeStorageService);
  readonly #toastService: DzToastService = inject(DzToastService);

  readonly #isGitHubAuthenticated: WritableSignal<boolean> = signal(false);
  readonly #isPending: WritableSignal<boolean> = signal(false);
  readonly #userInfo: WritableSignal<IGitHubUserInfo | null> = signal(null);
  readonly #error: WritableSignal<string | null> = signal(null);

  public isGitHubAuthenticated: Signal<boolean> = computed(() => this.#isGitHubAuthenticated());
  public isPending: Signal<boolean> = computed(() => this.#isPending());
  public userInfo: Signal<IGitHubUserInfo | null> = computed(() => this.#userInfo());
  public error: Signal<string | null> = computed(() => this.#error());

  constructor() {
    this.checkExistingGitHubAuth();
  }

  /**
   * Generate the redirect URI for GitHub OAuth in Chrome extensions.
   * Chrome extensions use a special redirect URI format.
   * @returns {string} The redirect URI for GitHub OAuth
   */
  #generateRedirectUri(): string {
    // For Chrome extensions, the redirect URI is in the format:
    // https://<extension-id>.chromiumapp.org/
    const extensionId = chrome.runtime.id;

    if (!extensionId) {
      throw new Error('Extension ID is not available');
    }

    return `https://${extensionId}.chromiumapp.org/`;
  }

  /**
   * Validate the GitHub access token format
   * @param {string} token - The token to validate
   * @returns {boolean} True if the token appears valid
   */
  #isValidToken(token: string): boolean {
    // GitHub tokens should be non-empty strings with meaningful content
    return token.trim().length > 0;
  }

  /**
   * Initiate GitHub OAuth login flow using chrome.identity.launchWebAuthFlow
   */
  public login(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);
    this.#error.set(null);

    const redirectUri = this.#generateRedirectUri();
    const clientId = API_URLS.GITHUB.CLIENT_ID;
    const scope = 'read:user user:email';

    // Build GitHub OAuth authorization URL
    const url = new URL(API_URLS.GITHUB.AUTHORIZE);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', scope);
    url.searchParams.set('response_type', 'token');
    const authUrl = url.toString();

    chrome.identity
      .launchWebAuthFlow({
        url: authUrl,
        interactive: true,
      })
      .then((responseUrl: string | undefined) => {
        if (!responseUrl) {
          throw new Error('No response URL received');
        }

        // Extract access token from the redirect URL
        const token = this.#extractTokenFromUrl(responseUrl);

        if (!token) {
          throw new Error('Failed to extract token from response URL');
        }

        // Validate token before storing
        if (!this.#isValidToken(token)) {
          throw new Error('Invalid token format received');
        }

        this.#error.set(null);
        this.#storeToken(token);

        // Only mark as authenticated after successfully fetching user info
        this.#getUserInfo(token)
          .then(() => {
            this.#isGitHubAuthenticated.set(true);
          })
          .catch((error: unknown) => {
            // If getUserInfo fails, the token might be invalid
            console.error('Failed to verify token with user info fetch:', error);
            this.#error.set('Failed to verify GitHub token');
            this.#toastService.show({
              message: 'GitHub authentication failed. Please try again.',
              type: TOAST_TYPE_ENUM.ERROR,
            });
          })
          .finally(() => {
            this.#isPending.set(false);
          });
      })
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'GitHub authentication failed';
        console.error('GitHub authentication failed:', error);
        this.#error.set(errorMessage);

        // Don't clear authentication if user was already authenticated
        // This prevents unintended logouts if OAuth flow fails (network issue, user cancels, etc.)
        if (!this.#isGitHubAuthenticated()) {
          this.#isGitHubAuthenticated.set(false);
        }

        // Show user-friendly error notification
        this.#toastService.show({
          message: 'GitHub authentication failed. Please try again.',
          type: TOAST_TYPE_ENUM.ERROR,
        });

        this.#isPending.set(false);
      });
  }

  /**
   * Logout from GitHub by clearing stored credentials.
   * Note: For OAuth implicit flow in Chrome extensions, we clear the token locally.
   * Users can revoke access through their GitHub account settings.
   */
  public logout(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);

    // For Chrome extension OAuth implicit flow, we simply clear local storage
    // Users can revoke app access at https://github.com/settings/applications
    this.#completeLogout();
  }

  /**
   * Check if user has an existing GitHub authentication session
   */
  public checkExistingGitHubAuth(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);

    this.#getStoredToken()
      .then(token => {
        if (token && this.#isValidToken(token)) {
          this.#isGitHubAuthenticated.set(true);
          // Clear any previous error when successfully validating stored token
          this.#error.set(null);
          this.#getUserInfo(token).catch(() => {
            // If getUserInfo fails, authentication state was already handled in #getUserInfo
          });
        } else {
          this.#isGitHubAuthenticated.set(false);
        }
      })
      .catch(() => {
        this.#isGitHubAuthenticated.set(false);
      })
      .finally(() => {
        this.#isPending.set(false);
      });
  }

  /**
   * Extract the access token from the OAuth redirect URL
   * @param {string} url - The redirect URL containing the token
   * @returns {string | null} The extracted token or null
   */
  #extractTokenFromUrl(url: string): string | null {
    try {
      // GitHub returns token in fragment (after #)
      // Format: https://extension-id.chromiumapp.org/#access_token=TOKEN&token_type=bearer
      const fragment = url.split('#')[1];
      if (!fragment) {
        return null;
      }

      const params = new URLSearchParams(fragment);
      return params.get('access_token');
    } catch (error) {
      console.error('Failed to extract token from URL:', error);
      return null;
    }
  }

  /**
   * Fetch GitHub user information using the access token
   * @param {string} token - The GitHub access token
   * @returns {Promise<void>} Resolves when user info is fetched successfully
   */
  #getUserInfo(token: string): Promise<void> {
    if (!token) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.#apiService
        .get<IGitHubUserInfo>(
          API_URLS.GITHUB.USER_INFO,
          {},
          {
            Authorization: `Bearer ${token}`,
          }
        )
        .subscribe({
          next: info => {
            this.#userInfo.set(info);
            resolve();
          },
          error: (err: unknown) => {
            console.error('Failed to fetch GitHub user info', err);

            // If we get a 401, the token is invalid - clear auth state
            if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
              this.#isGitHubAuthenticated.set(false);
              this.#userInfo.set(null);
              // ChromeStorageService.remove() logs its own errors; this Promise never rejects.
              void this.#removeStoredToken();
              this.#toastService.show({
                message: 'GitHub session expired. Please log in again.',
                type: TOAST_TYPE_ENUM.WARN,
              });
            }
            // Match GoogleAuthService pattern: don't clear userInfo on non-401 errors
            reject(err);
          },
        });
    });
  }

  /**
   * Store the GitHub access token in Chrome storage
   * @param {string} token - The access token to store
   */
  #storeToken(token: string): void {
    this.#chromeStorageService.set(CHROME_STORAGE_KEY_ENUM.GITHUB_ACCESS_TOKEN, token);
  }

  /**
   * Retrieve the stored GitHub access token from Chrome storage
   * @returns {Promise<string | null>} The stored token or null
   */
  #getStoredToken(): Promise<string | null> {
    return new Promise(resolve => {
      this.#chromeStorageService.get<string>(
        CHROME_STORAGE_KEY_ENUM.GITHUB_ACCESS_TOKEN,
        (token: string | null) => {
          resolve(token);
        }
      );
    });
  }

  /**
   * Remove the stored GitHub access token from Chrome storage
   * @returns {Promise<void>} Resolves when the token is removed
   */
  #removeStoredToken(): Promise<void> {
    return new Promise(resolve => {
      this.#chromeStorageService.remove(CHROME_STORAGE_KEY_ENUM.GITHUB_ACCESS_TOKEN, () => {
        resolve();
      });
    });
  }

  /**
   * Complete the logout process by clearing all authentication state
   */
  async #completeLogout(): Promise<void> {
    // ChromeStorageService.remove logs errors and always invokes its callback;
    // storage failures here do not reject this Promise and do not block logout.
    await this.#removeStoredToken();

    // Always clear in-memory state for security, even if storage removal fails
    this.#isGitHubAuthenticated.set(false);
    this.#userInfo.set(null);
    this.#error.set(null);
    this.#isPending.set(false);
  }
}
