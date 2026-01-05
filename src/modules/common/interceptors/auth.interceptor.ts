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
 * Returns whether the given URL targets the `/auth/google` endpoint that
 * exchanges a Google OAuth token for a JWT.
 *
 * The URL is parsed using the WHATWG `URL` API with `API_URLS.BACKEND.BASE_URL`
 * as the base, so both absolute and relative URLs are supported. The check is
 * based on the pathname only and requires that it matches `/auth/google`
 * exactly (ignoring a trailing slash).
 *
 * Examples (ignoring query string and hash):
 * - Returns true:
 *   - `https://api.example.com/auth/google`
 *   - `/auth/google`
 *   - `/auth/google/` (trailing slash is normalized)
 * - Returns false:
 *   - `https://api.example.com/auth/google-analytics`
 *   - `/auth/google/callback`
 *   - `/v1/auth/google`
 */
const isAuthGoogleEndpoint = (url: string): boolean => {
  // Validate input
  if (!url || typeof url !== 'string') {
    return false;
  }

  /**
   * Normalize a path by removing trailing slashes.
   * If the path is just '/', it becomes '' after replace, then '/' via fallback,
   * which correctly does NOT match '/auth/google'.
   */
  const normalizePath = (path: string): string => path.replace(/\/+$/, '') || '/';

  // Try to use the URL API for robust parsing
  try {
    const parsed = new URL(url, API_URLS.BACKEND.BASE_URL);
    return normalizePath(parsed.pathname) === '/auth/google';
  } catch {
    // Fallback for non-standard/relative URLs: strip query/hash and, if the
    // remaining string looks like a pathname, check it against `/auth/google`.
    const rawPath = url.split(/[?#]/)[0];

    // Be conservative: only treat clearly path-like values as paths.
    // - Must start with '/'
    // - Must not contain '://' (to avoid misinterpreting full URLs)
    if (!rawPath.startsWith('/') || rawPath.includes('://')) {
      return false;
    }
    return normalizePath(rawPath) === '/auth/google';
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
          console.warn('[authInterceptor] Authentication token not available');
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
        console.error('[authInterceptor] Failed to retrieve authentication token:', error);
        return next(req);
      })
    );
  }

  // Default flow: use JWT token from storage
  return from(tokenStorage.getToken()).pipe(
    switchMap(jwtToken => {
      if (!jwtToken) {
        // No token available - proceed without authentication
        console.warn('[authInterceptor] No authentication token found');
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
      // This path represents an unexpected storage failure in TokenStorageService,
      // which is different from the normal "no token present" case handled above.
      // We log detailed context for monitoring, but still proceed without an
      // Authorization header so the request can continue as unauthenticated.
      const errorDetails =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : { value: error };
      console.error(
        '[authInterceptor] Unexpected storage error while calling TokenStorageService.getToken()',
        {
          request: { url: req.url, method: req.method },
          error: errorDetails,
        }
      );
      return next(req);
    })
  );
};
