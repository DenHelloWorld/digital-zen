# API Deployment Guide

## Common API Key Issues

If you're getting "Invalid API key" errors even though the key appears correct, check these potential issues:

### 1. Header Case Sensitivity

The API now checks for the `X-API-Key` header in a case-insensitive manner, but ensure your server is configured correctly.

### 2. Whitespace in API Key

Make sure there's no whitespace before or after the API key in both:
- Frontend `.env` file: `API_SECRET_KEY='your_key_here'`  
- Backend `api/config.php`: `define('API_SECRET_KEY', 'your_key_here');`

### 3. Special Characters

If your API key contains special characters, ensure:
- Frontend: Use quotes in `.env` file: `API_SECRET_KEY='key#with$pecial'`
- Backend: Use quotes in PHP: `define('API_SECRET_KEY', 'key#with$pecial');`

### 4. Key Length Verification

Both keys should have the exact same length. You can verify:

**Frontend (in browser console after build:prod):**
```javascript
// Check in compiled background script
console.log('API Key length:', API_CONFIG.apiKey.length);
```

**Backend (add to helpers.php temporarily for debugging):**
```php
error_log('API_SECRET_KEY length: ' . strlen(API_SECRET_KEY));
error_log('Received key length: ' . strlen($receivedKey));
```

### 5. Updated helpers.php

The `helpers.php` file has been updated to:
- Handle case-insensitive header lookup
- Trim whitespace from received keys
- Log debug information (key length comparison)

Make sure to upload the updated `helpers.php` to your server.

### 6. Verify Server Configuration

1. **Check config.php exists and has the key:**
   ```php
   define('API_SECRET_KEY', '4vJxag1ilzIX6B#}H{hmYzVoQuLGu1+8');
   ```

2. **Verify file permissions:**
   - `config.php` should be readable by PHP (644 or 600)
   - Should NOT be publicly accessible (use .htaccess to protect it)

3. **Check error logs:**
   - Look in your hosting panel's error logs
   - The updated helpers.php logs key length mismatches

### 7. Common Mistakes

❌ **Wrong**: Using `"` quotes in .env but `'` in PHP (or vice versa) - shouldn't matter but be consistent
❌ **Wrong**: Copy-paste adding invisible characters
❌ **Wrong**: Not running `npm run build:prod` after changing .env
❌ **Wrong**: Not uploading updated helpers.php to server

✅ **Correct**: Same exact string in both places with proper quotes

### Testing API Key Matching

Create a test script to verify keys match:

**test-key.php** (upload to server, then delete after testing):
```php
<?php
require_once 'config.php';

echo "API_SECRET_KEY is configured: " . (!empty(API_SECRET_KEY) ? 'Yes' : 'No') . "\n";
echo "API_SECRET_KEY length: " . strlen(API_SECRET_KEY) . "\n";
echo "First 10 chars: " . substr(API_SECRET_KEY, 0, 10) . "...\n";
echo "Last 10 chars: ..." . substr(API_SECRET_KEY, -10) . "\n";
?>
```

Compare this output with your frontend key to ensure they match.
