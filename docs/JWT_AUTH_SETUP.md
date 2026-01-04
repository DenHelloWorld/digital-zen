# JWT Authentication Setup Guide

This document explains how to configure and deploy the new JWT-based authentication system.

## Overview

The application now uses a JWT (JSON Web Token) based authentication system that supports multiple authentication providers while maintaining a unified session management approach.

### Architecture

**Old Flow (Google OAuth - deprecated):**
```
Frontend → Google OAuth Token → Backend validates with Google API on every request
```

**New Flow (JWT-based):**
```
1. Login:  Frontend → Google Token → Backend (/auth/google) → Validates with Google → Creates/gets user → Returns JWT
2. Requests: Frontend → JWT Token → Backend validates JWT locally (no external API calls)
```

## Backend Configuration

### Required Environment Variables

Add the following environment variable to your hosting environment (Hostinger):

```bash
JWT_SECRET=<your-secret-key-here>
```

**Generate a secure secret:**
```bash
openssl rand -base64 64
```

This generates a 64-character random secret suitable for production use.

### Setting Environment Variables on Hostinger

1. Log in to your Hostinger control panel
2. Navigate to your website's file manager or hosting settings
3. Look for "Environment Variables" or ".htaccess" configuration
4. Add the environment variable using one of these methods:

   **Option 1: .htaccess (Apache SetEnv)**
   ```apache
   SetEnv JWT_SECRET "your_generated_secret_here"
   ```
   
   **Option 2: PHP-FPM environment variables**
   Set `JWT_SECRET` in your hosting control panel's environment variables section.

Alternatively, if your hosting supports `.env` files, create one at `/api/v1/.env`:
```
JWT_SECRET=your_generated_secret_here
```

### API Endpoints

#### POST /auth/google
Exchange Google OAuth token for JWT token.

**Request:**
```http
POST /api/v1/auth/google
Authorization: Bearer <google_oauth_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "picture_url": "https://...",
      "created_at": "2024-01-01 00:00:00",
      "last_login_at": "2024-01-01 00:00:00"
    }
  }
}
```

## Frontend Configuration

### Token Storage

JWT tokens are stored in `chrome.storage.local` with the key `dz_jwt_token`.

### Authentication Flow

1. User clicks "Login with Google"
2. Chrome Identity API obtains Google OAuth token
3. Frontend calls `/auth/google` with Google token
4. Backend validates Google token, creates/gets user, returns JWT
5. Frontend stores JWT in chrome.storage.local
6. All subsequent API requests use the JWT token

### Token Lifetime

- JWT tokens expire after **7 days**
- Users will need to re-authenticate after expiration
- Future: Implement token refresh mechanism

## Testing

### 1. Test Login Flow

1. Build and load the extension
2. Click "Login with Google"
3. Check browser console for:
   ```
   [GoogleAuthService] JWT token obtained and stored
   [GoogleAuthService] User authenticated: { ... }
   ```

### 2. Test API Requests

1. After login, navigate through the extension
2. Check network tab - API requests should have `Authorization: Bearer eyJ...` header
3. Verify requests succeed with 200 status

### 3. Test Token Persistence

1. Login to the extension
2. Close and reopen the extension
3. User should remain authenticated (no re-login required)

### 4. Test Logout

1. Login to the extension
2. Click logout
3. Verify JWT token is removed from storage
4. Subsequent API requests should fail with 401

## Backward Compatibility

The system supports both JWT and Google OAuth tokens during the migration period:

- **JWT tokens** (new): Validated locally, fast, no external API calls
- **Google OAuth tokens** (legacy): Still supported via GoogleAuthService for backward compatibility

This allows gradual migration without breaking existing deployments.

## Security Considerations

1. **JWT Secret**: Must be strong and kept confidential
2. **Token Storage**: Stored in chrome.storage.local (browser-managed persistence; not encrypted by default—consider encrypting tokens before storage if required by your security model)
3. **HTTPS**: Always use HTTPS for API communication
4. **Token Expiration**: 7 days - adjust based on security requirements
5. **Audience Validation**: JWT tokens include user_id to prevent token reuse

## Future Improvements

1. **Token Refresh**: Implement refresh token mechanism for seamless re-authentication
2. **Token Blacklist**: Add logout functionality that invalidates tokens server-side
3. **Rate Limiting**: Protect auth endpoints from brute force attacks
4. **Multiple Providers**: Add email/password, GitHub OAuth, etc.

## Troubleshooting

### "JWT_SECRET not configured" error
- Ensure JWT_SECRET environment variable is set on the server
- Check server error logs for configuration issues

### "Invalid or expired token" error
- Token may have expired (7 days)
- User needs to re-login
- Check token expiration in payload

### "Authorization header missing" error
- Token may not be stored in chrome.storage.local
- Check if user completed login flow
- Verify auth interceptor is working

## Migration Plan

1. **Phase 1**: Deploy JWT system (current)
   - Both JWT and Google tokens supported
   - New logins use JWT flow
   
2. **Phase 2**: Monitor and test
   - Monitor error logs
   - Verify user authentication works
   - Test edge cases
   
3. **Phase 3**: Full migration
   - All users migrated to JWT
   - Remove Google OAuth token support
   - Update documentation

## Support

For issues or questions, check:
- Server error logs: `/api/v1/error.log`
- Browser console: Developer Tools → Console
- Network tab: Developer Tools → Network
