# API Configuration Guide

## Overview

The Digital Zen extension communicates with a backend API for user data synchronization. This requires proper API key configuration.

## Configuration Steps

### 1. Set up Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

### 2. Configure API Secret Key

Edit the `.env` file and set the `API_SECRET_KEY`:

```env
# API Secret Key (must match the key in api/config.php on the server)
# Generate a strong random string (at least 32 characters)
# IMPORTANT: Use quotes if the key contains special characters like # or $
API_SECRET_KEY='your_random_secret_key_here'
```

**Important Notes:**

- This key must match the `API_SECRET_KEY` defined in `api/config.php` on your backend server
- **Always use quotes** around the value if it contains special characters (`#`, `$`, `{`, `}`, etc.)
- Without quotes, characters like `#` will be treated as comments and truncate the key

**Example:**

```env
# WRONG - will be truncated at #
API_SECRET_KEY=4vJxag1ilzIX6B#}H{hmYzVoQuLGu1+8

# CORRECT - quotes preserve special characters
API_SECRET_KEY='4vJxag1ilzIX6B#}H{hmYzVoQuLGu1+8'
```

### 3. Generate a Secure Key

Use one of these methods to generate a secure random key:

- Online: https://randomkeygen.com/
- Command line: `openssl rand -base64 32`
- Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### 4. Build for Production

Use the production build command which automatically patches the API configuration:

```bash
npm run build:prod
```

This command will:

1. Build the Angular application
2. Compile the background scripts
3. **Patch the API config** with your `API_SECRET_KEY` from `.env`
4. Patch the manifest with OAuth credentials

## How It Works

### Development Build

```bash
npm run build
```

- Does NOT patch API config
- Uses empty API key (API requests will fail with 401)
- Suitable for UI development without backend

### Production Build

```bash
npm run build:prod
```

- Patches API config with `API_SECRET_KEY` from `.env`
- Patches manifest with OAuth credentials
- Ready for deployment

## API Key Header

The extension sends the API key in the `X-API-Key` HTTP header:

```typescript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': API_CONFIG.apiKey,
}
```

The backend API validates this header against the configured `API_SECRET_KEY` in `api/config.php`.

## Troubleshooting

### 401 Unauthorized Error

**Symptoms:**

- Console shows: `Failed to get user data: 401 Unauthorized`
- API key is visible in request headers but still fails

**Solutions:**

1. **Check API key is configured:**

   ```bash
   grep API_SECRET_KEY .env
   ```

2. **Verify you used production build:**

   ```bash
   npm run build:prod
   ```

3. **Check compiled config has the key:**

   ```bash
   # For Chromium build
   grep apiKey dist/chromium/modules/common/constants/api-config.const.js
   # For Firefox build
   grep apiKey dist/firefox/modules/common/constants/api-config.const.js
   ```

   Should show: `apiKey: "your_actual_key_here"`

4. **Verify backend config matches:**
   - Check `api/config.php` on your server
   - Ensure `API_SECRET_KEY` matches exactly

5. **Check header case sensitivity:**
   - Header should be `X-API-Key` (with capital letters)
   - Case-insensitive in most servers, but some are strict

### Empty API Key in Requests

**Cause:** Using `npm run build` instead of `npm run build:prod`

**Solution:** Always use `npm run build:prod` for production builds

## Security Notes

- **Never commit** your `.env` file (it's in `.gitignore`)
- **Never share** your `API_SECRET_KEY` publicly
- **Use different keys** for development and production
- **Rotate keys** periodically for better security
- The API key is bundled in the extension code (not ideal for production)
  - Consider implementing OAuth or JWT tokens for better security
  - This is a known limitation of the current architecture

## Next Steps

For better security in production, consider:

1. Implementing OAuth 2.0 flow
2. Using JWT tokens with expiration
3. Moving API key validation to server-side only
4. Implementing rate limiting
