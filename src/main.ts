import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { logger } from './modules/common/helpers/logger';

const appLogger = logger.createLogger('Bootstrap');

bootstrapApplication(App, appConfig).catch(err =>
  appLogger.error('Application bootstrap failed:', err)
);
