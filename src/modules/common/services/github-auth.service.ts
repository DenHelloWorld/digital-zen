import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ApiService } from './api.service';
import { API_URLS } from '../constants';

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
  name: string;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
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
   * Initiate GitHub OAuth login flow using chrome.identity.launchWebAuthFlow
   */
  public login(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);

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

        if (token) {
          this.#isGitHubAuthenticated.set(true);
          this.#storeToken(token);
          this.#getUserInfo(token);
        } else {
          throw new Error('Failed to extract token from response URL');
        }
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
        if (token) {
          this.#isGitHubAuthenticated.set(true);
          this.#getUserInfo(token);
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
   */
  #getUserInfo(token: string): void {
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
    chrome.storage.local.set({ github_access_token: token });
  }

  /**
   * Retrieve the stored GitHub access token from Chrome storage
   * @returns {Promise<string | null>} The stored token or null
   */
  #getStoredToken(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['github_access_token'], result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve((result['github_access_token'] as string | undefined) || null);
        }
      });
    });
  }

  /**
   * Remove the stored GitHub access token from Chrome storage
   */
  #removeStoredToken(): void {
    chrome.storage.local.remove(['github_access_token']);
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
