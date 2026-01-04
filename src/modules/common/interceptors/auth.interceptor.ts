import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URLS } from '../constants';
import { from, switchMap, catchError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

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
 * Check if the URL is the exact /auth/google endpoint which needs Google token.
 * Uses a boundary-aware check on the pathname to avoid matching similar routes
 * like /auth/google-analytics.
 */
const isAuthGoogleEndpoint = (url: string): boolean => {
  // Try to use the URL API for robust parsing
  try {
    const parsed = new URL(url, API_URLS.BACKEND.BASE_URL);
    return parsed.pathname.endsWith('/auth/google');
  } catch {
    // Fallback for non-standard/relative URLs: strip query/hash and check the path
    const path = url.split(/[?#]/)[0];
    return path.endsWith('/auth/google');
  }
};

/**
 * HTTP interceptor that adds Authorization header for backend API requests
 *
 * NEW FLOW (JWT-based):
 * - For most API requests, uses JWT token from TokenStorageService
 * - JWT tokens are fast to validate and work with any auth provider
 *
 * SPECIAL CASE:
 * - For /auth/google endpoint, uses Google OAuth token from Chrome Identity
 * - This endpoint exchanges Google token for JWT
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add Authorization header for backend API requests
  if (!isBackendApiUrl(req.url, API_URLS.BACKEND.BASE_URL)) {
    return next(req);
  }

  const tokenStorage = inject(TokenStorageService);

  // Special case: /auth/google endpoint needs Google OAuth token
  if (isAuthGoogleEndpoint(req.url)) {
    // Check if Chrome runtime is available
    if (typeof chrome === 'undefined' || !chrome?.identity) {
      return next(req);
    }

    // Get Google OAuth token and add it to the request
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
          '[authInterceptor] Failed to retrieve Google token via chrome.identity.getAuthToken:',
          error
        );
        return next(req);
      })
    );
  }

  // Default flow: use JWT token from storage
  return from(tokenStorage.getToken()).pipe(
    switchMap(jwtToken => {
      if (!jwtToken) {
        // No JWT token available, continue without auth header
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      return next(authReq);
    }),
    catchError(error => {
      console.error('[authInterceptor] Failed to retrieve JWT token from storage:', error);
      return next(req);
    })
  );
};
