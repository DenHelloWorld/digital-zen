import { HttpInterceptorFn } from '@angular/common/http';
import { API_URLS } from '../constants';
import { from, switchMap, catchError } from 'rxjs';

/**
 * Determines whether the given URL targets the backend API, using a
 * boundary-aware prefix match on the configured base URL.
 */
const isBackendApiUrl = (url: string, baseUrl: string): boolean => {
  if (!url.startsWith(baseUrl)) {
    return false;
  }

  if (url.length === baseUrl.length) {
    return true;
  }

  const nextChar = url.charAt(baseUrl.length);
  return nextChar === '/' || nextChar === '?' || nextChar === '#';
};

/**
 * HTTP interceptor that adds Authorization header with Google OAuth token
 * for requests to the backend API.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add Authorization header for backend API requests
  if (!isBackendApiUrl(req.url, API_URLS.BACKEND.BASE_URL)) {
    return next(req);
  }

  // Check if Chrome runtime is available
  if (typeof chrome === 'undefined' || !chrome?.identity) {
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
    catchError(error => {
      // If token retrieval fails, log the error and continue without auth header
      console.error(
        '[authInterceptor] Failed to retrieve auth token via chrome.identity.getAuthToken:',
        error
      );
      return next(req);
    })
  );
};
