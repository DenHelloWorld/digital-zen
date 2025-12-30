import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ApiService } from './api.service';
import { ChromeStorageService } from './chrome-storage.service';
import { API_URLS } from '../constants';
import { CHROME_STORAGE_KEY_ENUM } from '../enums/chrome-storage-key.enum';

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

  readonly #isGitHubAuthenticated: WritableSignal<boolean> = signal(false);
  readonly #isPending: WritableSignal<boolean> = signal(false);
  readonly #userInfo: WritableSignal<IGitHubUserInfo | null> = signal(null);

  public isGitHubAuthenticated: Signal<boolean> = computed(() => this.#isGitHubAuthenticated());
  public isPending: Signal<boolean> = computed(() => this.#isPending());
  public userInfo: Signal<IGitHubUserInfo | null> = computed(() => this.#userInfo());

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
    const trimmedToken = token.trim();

    // Basic sanity check: must not be empty after trimming
    if (!trimmedToken) {
      return false;
    }

    // GitHub personal access tokens (classic and fine-grained) typically:
    // - start with one of: ghp_, gho_, ghu_, ghs_, ghr_
    // - are at least 40 characters long
    const MIN_TOKEN_LENGTH = 40;
    if (trimmedToken.length < MIN_TOKEN_LENGTH) {
      return false;
    }

    // Check if token starts with a known GitHub token prefix
    const githubTokenPrefixPattern = /^gh[pousr]_/;

    return githubTokenPrefixPattern.test(trimmedToken);
  }

  /**
   * Initiate GitHub OAuth login flow using chrome.identity.launchWebAuthFlow
   */
  public login(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);

    const redirectUri = this.#generateRedirectUri();
    const clientId = API_URLS.GITHUB.CLIENT_ID;
    // Request read access to user profile and email
    // - read:user: Read access to public profile information
    // - user:email: Read access to user email addresses (including private emails)
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

        this.#storeToken(token);
        this.#isGitHubAuthenticated.set(!!token);
        this.#getUserInfo(token);
      })
      .catch((error: unknown) => {
        console.error('GitHub authentication failed:', error);
        this.#isGitHubAuthenticated.set(false);
      })
      .finally(() => {
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
        this.#isGitHubAuthenticated.set(!!token);
        this.#getUserInfo(token);
      })
      .catch(error => {
        console.error('Failed to check existing GitHub auth:', error);
        this.#isGitHubAuthenticated.set(false);
      })
      .finally(() => this.#isPending.set(false));
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
   */
  #getUserInfo(token: string | undefined): void {
    if (!token) {
      return;
    }

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
        },
        error: (err: unknown) => {
          console.error('Failed to fetch GitHub user info', err);
        },
      });
  }

  /**
   * Store the GitHub access token in Chrome storage
   * @param {string} token - The access token to store
   */
  #storeToken(token: string): void {
    this.#chromeStorageService.set(CHROME_STORAGE_KEY_ENUM.GITHUB_ACCESS_TOKEN, token, () => {
      // Callback intentionally empty - ChromeStorageService logs errors internally
    });
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
   */
  #removeStoredToken(): void {
    this.#chromeStorageService.remove(CHROME_STORAGE_KEY_ENUM.GITHUB_ACCESS_TOKEN, () => {
      // Callback intentionally empty - ChromeStorageService logs errors internally
    });
  }

  /**
   * Complete the logout process by clearing all authentication state
   */
  #completeLogout(): void {
    this.#removeStoredToken();
    this.#isGitHubAuthenticated.set(false);
    this.#isPending.set(false);
    this.#userInfo.set(null);
  }
}
