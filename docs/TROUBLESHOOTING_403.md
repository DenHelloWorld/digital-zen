# 403 Forbidden Error - Troubleshooting Guide

If you're getting a **403 Forbidden** error when accessing the API, this is a **server configuration issue**, not a code problem. Here's how to fix it:

## Special Case: Accessing /api/ Root

If you get 403 when accessing `https://digital-zen.csmpoint.com/api/` (the root), but `/api/user` works:

**Solution:**
1. Make sure `index.php` is uploaded to the api folder
2. Check that `.htaccess` has `DirectoryIndex index.php`
3. Verify `index.php` has 644 permissions
4. Some servers block directory access - this is normal if `/api/user` works

**Note:** The root `/api/` endpoint is optional. If `/api/user` works, the API is functioning correctly.

## Common Causes and Solutions

### 1. File Permissions (Most Common)

The server needs to be able to read the PHP files.

**Solution:**
```bash
# Set correct permissions for API files
chmod 644 api/*.php
chmod 755 api/
```

Or through FTP/File Manager:
- API directory: `755` (drwxr-xr-x)
- PHP files: `644` (-rw-r--r--)

### 2. Directory Index Not Allowed

Some servers don't allow directory browsing and might block access.

**Solution:**
Make sure you're accessing the file directly:
- ✅ `https://digital-zen.csmpoint.com/api/user`
- ❌ `https://digital-zen.csmpoint.com/api/`

### 3. ModSecurity Rules

Some hosting providers have ModSecurity that blocks certain requests.

**Solution:**
Contact your hosting support and ask them to:
- Check ModSecurity logs
- Whitelist your API directory
- Or disable ModSecurity for the API folder

### 4. .htaccess Conflicts

Existing `.htaccess` rules might block access.

**Solution:**
1. Check if there's a `.htaccess` file in the parent directory
2. The API directory now has its own `.htaccess` file
3. If issues persist, try temporarily renaming parent `.htaccess` to test

### 5. PHP Version

Some servers require PHP 7.4+ for the code to work properly.

**Solution:**
- Check PHP version in hosting control panel
- Set PHP version to 7.4 or higher for the `api/` directory

### 6. AllowOverride Settings

Server might not allow `.htaccess` overrides.

**Solution:**
Contact hosting support and ask them to check:
```apache
<Directory /path/to/digital-zen.csmpoint.com/api>
    AllowOverride All
</Directory>
```

## Testing Steps

### Step 1: Test Simple PHP
Create `test.php` in the api directory:
```php
<?php
echo "PHP is working!";
phpinfo();
?>
```

Access: `https://digital-zen.csmpoint.com/api/test.php`

**If this works:** PHP is fine, issue is with the API code or dependencies  
**If this fails:** Server configuration issue

### Step 2: Check Error Logs

In cPanel or hosting control panel:
1. Go to **Error Logs**
2. Look for recent 403 errors
3. The log will show the exact reason

Common messages:
- "Permission denied" → File permissions issue
- "ModSecurity" → Security module blocking
- "htaccess" → .htaccess configuration issue

### Step 3: Test Without API Key

The API should return a JSON error, not HTML 403:

Expected response (without API key):
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

If you get HTML 403 instead, the PHP file isn't being executed at all.

## Quick Fix Checklist

- [ ] File permissions set to 644 for `.php` files
- [ ] Directory permission set to 755 for `api/` folder
- [ ] Accessing full file path: `.../api/user`
- [ ] PHP version is 7.4 or higher
- [ ] `.htaccess` file is present in api directory
- [ ] No parent `.htaccess` blocking access
- [ ] Checked error logs for specific error message

## Contact Hosting Support

If none of the above works, contact your hosting support with this information:

```
Subject: 403 Forbidden Error on API Directory

I'm getting a 403 Forbidden error when accessing:
https://digital-zen.csmpoint.com/api/user

The file exists and has correct permissions (644).
The directory has 755 permissions.

Could you please check:
1. ModSecurity logs for any blocks
2. Apache/Nginx error logs for the exact error
3. If AllowOverride is enabled for this directory
4. If there are any server-level restrictions on this path

Thank you!
```

## For Developers: Testing Locally

The 403 error only occurs on the hosting server, not locally. To test locally:

1. Install local PHP server (XAMPP, MAMP, or similar)
2. Copy API files to local server
3. Update `config.php` with local database credentials
4. Access via `http://localhost/api/user`

## Alternative: Test with Simple Script

Replace contents of `user-data.php` temporarily with:
```php
<?php
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'API is accessible!',
    'server' => $_SERVER['SERVER_SOFTWARE'],
    'php_version' => PHP_VERSION
]);
?>
```

This will confirm if PHP execution works at all.

## Summary

The 403 Forbidden error is a **server configuration issue**, not a problem with the API code. Most commonly it's:

1. **File permissions** (fix with chmod 644)
2. **ModSecurity** blocking (contact hosting support)
3. **Directory access** (use full file path)

The API code itself is working fine - it's just that the server isn't allowing access to the PHP files.
