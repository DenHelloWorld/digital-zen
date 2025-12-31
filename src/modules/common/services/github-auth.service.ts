import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { ChromeStorageService } from './chrome-storage.service';
import { API_URLS } from '../constants';
import { CHROME_STORAGE_KEY_ENUM } from '../enums/chrome-storage-key.enum';

export interface IGitHubUserInfo {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
  bio: string;
}

interface IDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface ITokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GitHubAuthService {
  readonly #chromeStorageService: ChromeStorageService = inject(ChromeStorageService);

  readonly #isGitHubAuthenticated: WritableSignal<boolean> = signal(false);
  readonly #isPending: WritableSignal<boolean> = signal(false);
  readonly #userInfo: WritableSignal<IGitHubUserInfo | null> = signal(null);
  readonly #deviceCode: WritableSignal<string | null> = signal(null);
  readonly #userCode: WritableSignal<string | null> = signal(null);
  readonly #verificationUri: WritableSignal<string | null> = signal(null);

  #pollInterval: number | null = null;

  public isGitHubAuthenticated: Signal<boolean> = computed(() => this.#isGitHubAuthenticated());
  public isPending: Signal<boolean> = computed(() => this.#isPending());
  public userInfo: Signal<IGitHubUserInfo | null> = computed(() => this.#userInfo());
  public userCode: Signal<string | null> = computed(() => this.#userCode());
  public verificationUri: Signal<string | null> = computed(() => this.#verificationUri());

  constructor() {
    this.checkExistingGitHubAuth();
  }

  public login(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);
    this.#initiateDeviceFlow();
  }

  public logout(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);

    // Stop polling if active
    if (this.#pollInterval !== null) {
      window.clearInterval(this.#pollInterval);
      this.#pollInterval = null;
    }

    // Remove token from storage
    this.#chromeStorageService.remove(CHROME_STORAGE_KEY_ENUM.GITHUB_TOKEN, () => {
      this.#completeLogout();
    });
  }

  public checkExistingGitHubAuth(): void {
    if (this.#isPending()) {
      return;
    }

    this.#isPending.set(true);

    this.#chromeStorageService.get<string>(CHROME_STORAGE_KEY_ENUM.GITHUB_TOKEN, token => {
      if (token) {
        this.#isGitHubAuthenticated.set(true);
        this.#getUserInfo(token);
      } else {
        this.#isGitHubAuthenticated.set(false);
      }
      this.#isPending.set(false);
    });
  }

  #initiateDeviceFlow(): void {
    // Use fetch directly for GitHub API which requires specific headers
    fetch(API_URLS.GITHUB.DEVICE_CODE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: API_URLS.GITHUB.CLIENT_ID,
        scope: 'user:email read:user',
      }),
    })
      .then(response => response.json())
      .then((data: IDeviceCodeResponse) => {
        this.#deviceCode.set(data.device_code);
        this.#userCode.set(data.user_code);
        this.#verificationUri.set(data.verification_uri);

        // Open verification URL in new tab
        chrome.tabs.create({ url: data.verification_uri });

        // Start polling for access token
        this.#startPolling(data.device_code, data.interval);
      })
      .catch(err => {
        console.error('Failed to initiate device flow', err);
        this.#isPending.set(false);
      });
  }

  #startPolling(deviceCode: string, interval: number): void {
    this.#pollInterval = window.setInterval(() => {
      this.#pollForToken(deviceCode);
    }, interval * 1000);
  }

  #pollForToken(deviceCode: string): void {
    fetch(API_URLS.GITHUB.ACCESS_TOKEN, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: API_URLS.GITHUB.CLIENT_ID,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    })
      .then(response => response.json())
      .then((data: ITokenResponse) => {
        if (data.access_token) {
          // Success! Stop polling and save token
          if (this.#pollInterval !== null) {
            window.clearInterval(this.#pollInterval);
            this.#pollInterval = null;
          }

          this.#chromeStorageService.set(
            CHROME_STORAGE_KEY_ENUM.GITHUB_TOKEN,
            data.access_token,
            () => {
              this.#isGitHubAuthenticated.set(true);
              this.#getUserInfo(data.access_token!);
              this.#deviceCode.set(null);
              this.#userCode.set(null);
              this.#verificationUri.set(null);
              this.#isPending.set(false);
            }
          );
        } else if (data.error === 'authorization_pending') {
          // Continue polling
        } else if (data.error === 'slow_down') {
          // Increase polling interval - this is handled by GitHub's recommended interval
          // Just continue with current interval
        } else if (data.error === 'expired_token') {
          // Token expired, stop polling
          if (this.#pollInterval !== null) {
            window.clearInterval(this.#pollInterval);
            this.#pollInterval = null;
          }
          this.#isPending.set(false);
          console.error('Device code expired');
        } else if (data.error === 'access_denied') {
          // User denied access
          if (this.#pollInterval !== null) {
            window.clearInterval(this.#pollInterval);
            this.#pollInterval = null;
          }
          this.#isPending.set(false);
          console.error('User denied access');
        } else {
          // Unknown error
          if (this.#pollInterval !== null) {
            window.clearInterval(this.#pollInterval);
            this.#pollInterval = null;
          }
          this.#isPending.set(false);
          console.error('Unknown error during polling', data);
        }
      })
      .catch(err => {
        console.error('Failed to poll for token', err);
        if (this.#pollInterval !== null) {
          window.clearInterval(this.#pollInterval);
          this.#pollInterval = null;
        }
        this.#isPending.set(false);
      });
  }

  #getUserInfo(token: string): void {
    if (!token) {
      return;
    }

    fetch(API_URLS.GITHUB.USER_INFO, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then((data: IGitHubUserInfo) => {
        this.#userInfo.set(data);
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch GitHub user info', err);
      });
  }

  #completeLogout(): void {
    this.#isGitHubAuthenticated.set(false);
    this.#isPending.set(false);
    this.#userInfo.set(null);
    this.#deviceCode.set(null);
    this.#userCode.set(null);
    this.#verificationUri.set(null);
  }
}
