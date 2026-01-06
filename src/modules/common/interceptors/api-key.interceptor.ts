import { HttpInterceptorFn } from '@angular/common/http';
import { API_CONFIG } from '../constants';

/**
 * API Key Interceptor
 * Adds X-API-Key header to requests going to our API
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if request is going to our API
  const isApiRequest = req.url.startsWith(API_CONFIG.apiUrl);
  
  // If not our API request, continue without modification
  if (!isApiRequest) {
    return next(req);
  }
  
  // Check if API key is configured
  if (!API_CONFIG.apiKey) {
    console.warn('API key is not configured');
    return next(req);
  }
  
  // Clone request and add API key header
  const requestWithApiKey = req.clone({
    setHeaders: {
      'X-API-Key': API_CONFIG.apiKey,
    },
  });
  
  return next(requestWithApiKey);
};
