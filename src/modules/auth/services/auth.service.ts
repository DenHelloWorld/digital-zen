import { inject, Injectable, Signal } from '@angular/core';
import { GoogleAuthService } from '../../common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #googleAuthService: GoogleAuthService = inject(GoogleAuthService);

  public isGoogleAuthenticated: Signal<boolean> = this.#googleAuthService.isGoogleAuthenticated;
  public isGoogleAuthPending: Signal<boolean> = this.#googleAuthService.isPending;

  public loginWithGoogle(): void {
    this.#googleAuthService.login();
  }

  public logoutFromGoogle(): void {
    this.#googleAuthService.logout();
  }
}
