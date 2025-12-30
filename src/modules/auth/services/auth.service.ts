import { inject, Injectable, Signal } from '@angular/core';
import {
  GoogleAuthService,
  GitHubAuthService,
  IGitHubUserInfo,
  IGoogleUserInfo,
} from '../../common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #googleAuthService: GoogleAuthService = inject(GoogleAuthService);
  readonly #githubAuthService: GitHubAuthService = inject(GitHubAuthService);

  public isGoogleAuthenticated: Signal<boolean> = this.#googleAuthService.isGoogleAuthenticated;
  public isGoogleAuthPending: Signal<boolean> = this.#googleAuthService.isPending;
  public googleUserInfo: Signal<IGoogleUserInfo | null> = this.#googleAuthService.userInfo;

  public isGitHubAuthenticated: Signal<boolean> = this.#githubAuthService.isGitHubAuthenticated;
  public isGitHubAuthPending: Signal<boolean> = this.#githubAuthService.isPending;
  public gitHubUserInfo: Signal<IGitHubUserInfo | null> = this.#githubAuthService.userInfo;

  public loginWithGoogle(): void {
    this.#googleAuthService.login();
  }

  public logoutFromGoogle(): void {
    this.#googleAuthService.logout();
  }

  public loginWithGitHub(): void {
    this.#githubAuthService.login();
  }

  public logoutFromGitHub(): void {
    this.#githubAuthService.logout();
  }
}
