import { HttpInterceptorFn } from '@angular/common/http';
import { API_CONFIG } from '../constants';

/**
 * API Key Interceptor
 * Adds X-API-Key header to requests going to our API
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(API_CONFIG.apiUrl);

  if (!isApiRequest) {
    return next(req);
  }

  if (!API_CONFIG.apiKey) {
    console.warn('API key is not configured');
    return next(req);
  }

  const requestWithApiKey = req.clone({
    setHeaders: {
      'X-API-Key': API_CONFIG.apiKey,
    },
  });

  return next(requestWithApiKey);
};
