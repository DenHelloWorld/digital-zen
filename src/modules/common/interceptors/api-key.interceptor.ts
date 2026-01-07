import { HttpInterceptorFn } from '@angular/common/http';
import { API_CONFIG } from '../constants';
import { logger } from '../helpers/logger';

const interceptorLogger = logger.createLogger('ApiKeyInterceptor');

/**
 * API Key Interceptor - Functional HTTP interceptor
 * Adds X-API-Key header to requests going to our API
 *
 * @guidelines
 * - DZ_13: Functional HTTP interceptor pattern
 * - DZ_11: Universal Logger usage
 *
 * @see /docs/coding-guidelines.md#dz_13-functional-http-interceptors
 * @see https://angular.dev/guide/http/interceptors (Angular HTTP Interceptors)
 *
 * @example
 * ```typescript
 * // app.config.ts
 * provideHttpClient(
 *   withInterceptors([apiKeyInterceptor])
 * )
 * ```
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(API_CONFIG.apiUrl);

  if (!isApiRequest) {
    return next(req);
  }

  if (!API_CONFIG.apiKey) {
    interceptorLogger.warn('API key is not configured');
    return next(req);
  }

  const requestWithApiKey = req.clone({
    setHeaders: {
      'X-API-Key': API_CONFIG.apiKey,
    },
  });

  return next(requestWithApiKey);
};
