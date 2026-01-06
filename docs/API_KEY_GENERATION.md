# How to Generate API Secret Key

The API secret key is used to secure communication between your Chrome extension and the backend API. Only requests with the correct key will be accepted.

## Step 1: Generate a Strong Random Key

You have several options:

### Option 1: Online Generator (Easiest)

1. Go to **https://randomkeygen.com/**
2. Copy one of the **"Fort Knox Passwords"** (these are very strong)
3. Example: `k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6`

### Option 2: Using Node.js (Command Line)

If you have Node.js installed:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
a7f9c8e2b1d4f6e9a3c5d7b2e4f8a1c3d5e7b9f1c3e5d7b9f2a4c6e8f0a2b4d6
```

### Option 3: Using OpenSSL (Linux/Mac)

```bash
openssl rand -hex 32
```

### Option 4: Using Python

```python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 2: Use the Same Key in Two Places

The API key **MUST BE EXACTLY THE SAME** in both:

### Backend (PHP) - `api/config.php`

```php
define('API_SECRET_KEY', 'k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6');
```

### Frontend (TypeScript) - `src/modules/common/constants/api-config.const.ts`

```typescript
export const API_CONFIG: ApiConfig = {
  apiUrl: 'https://digital-zen.csmpoint.com/api',
  apiKey: 'k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6',
};
```

## Step 3: Keep It Secret

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Never commit the key to Git**
   - The `.gitignore` already excludes `.env` files
   - Don't push `api-config.const.ts` with real key to public repos

2. **Use different keys for development and production**
   - Generate one key for local testing
   - Generate another key for production server

3. **Don't share the key**
   - Keep it secret like a password
   - Only people who need access should know it

4. **Change the key if compromised**
   - If someone gets your key, generate a new one immediately
   - Update both backend and frontend

## Key Requirements

- **Minimum length**: 32 characters (recommended)
- **Character types**: Mix of letters, numbers, and symbols
- **Uniqueness**: Don't use common words or patterns
- **Randomness**: Use a secure random generator

## Good Examples

✓ `7mK#9pL$2nQ@5tR&8wX*0yZ!3aC^6dF`
✓ `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`
✓ `Xk9@mP#7nQ$2tR&5wX*8yZ!0aC^3dF~6eG`

## Bad Examples

✗ `password123` (too simple)
✗ `12345678` (too short)
✗ `myapikey` (not random)
✗ `digitalzen` (predictable)

## Testing Your Key

After setting up the key, test it:

1. **Backend test**: Visit your API in browser
   ```
   https://digital-zen.csmpoint.com/api/user
   ```
   
   You should see:
   ```json
   {
     "success": false,
     "error": "Invalid API key"
   }
   ```
   
   This means the API is working (it rejects requests without the key).

2. **Frontend test**: Build and load the extension
   ```bash
   npm run build
   ```
   
   The extension should be able to make API calls successfully.

## Troubleshooting

### "Invalid API key" error in extension

**Problem**: Extension gets 401 error

**Cause**: Keys don't match

**Solution**: 
1. Check `api/config.php` - copy the exact key
2. Check `api-config.const.ts` - paste the exact same key
3. Make sure there are no extra spaces
4. Rebuild the extension: `npm run build`

### API key is empty

**Problem**: `API_SECRET_KEY` is empty string

**Cause**: You forgot to set it

**Solution**: 
1. Generate a key (see above)
2. Set it in `api/config.php`
3. Set the same key in `api-config.const.ts`

## Alternative: Using Environment Variables (Advanced)

For better security in production, you can use environment variables:

### Backend `.htaccess` (if using Apache)

```apache
SetEnv API_SECRET_KEY "k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6"
```

### Backend `config.php`

```php
define('API_SECRET_KEY', getenv('API_SECRET_KEY'));
```

### Frontend `.env`

```env
API_SECRET_KEY=k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6
```

Then you would need to update the build process to inject this value during build time.

## Summary

1. ✅ Generate a strong random key (32+ characters)
2. ✅ Set the same key in both backend and frontend
3. ✅ Keep the key secret (don't commit to Git)
4. ✅ Test that API rejects requests without the key
5. ✅ Test that extension can make API calls with the key
