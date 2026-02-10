import { App } from './app/app';
import { appConfig } from './app/app.config';
import { logger } from './modules/common/helpers/logger';
import { bootstrapApplication } from '@angular/platform-browser';

const appLogger = logger.createLogger('Bootstrap');

bootstrapApplication(App, appConfig).catch(err =>
  appLogger.error('Application bootstrap failed:', err)
);
