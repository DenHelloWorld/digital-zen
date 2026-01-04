import { HttpInterceptorFn } from '@angular/common/http';
import { API_URLS } from '../constants/api-urls.const';
import { from, switchMap, catchError } from 'rxjs';

/**
 * HTTP interceptor that adds Authorization header with Google OAuth token
 * for requests to the backend API.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add Authorization header for backend API requests
  if (!req.url.startsWith(API_URLS.BACKEND.BASE_URL)) {
    return next(req);
  }

  // Check if Chrome runtime is available
  if (typeof chrome === 'undefined' || !chrome.identity) {
    return next(req);
  }

  // Get auth token and add it to the request
  return from(chrome.identity.getAuthToken({ interactive: false })).pipe(
    switchMap(result => {
      // Defensive checks for both result object and token property
      if (!result || !result.token || typeof result.token !== 'string') {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${result.token}`,
        },
      });

      return next(authReq);
    }),
    catchError(() => {
      // If token retrieval fails, continue without auth header
      return next(req);
    })
  );
};
