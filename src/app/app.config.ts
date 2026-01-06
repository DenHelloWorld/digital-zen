import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiKeyInterceptor } from '../modules/common/interceptors/api-key.interceptor';
import { UserDataSyncService } from '../modules/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([apiKeyInterceptor])),
    provideAppInitializer(() => {
      inject(UserDataSyncService);
    }),
  ],
};
