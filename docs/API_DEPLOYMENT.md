# API Deployment Guide

This guide explains how to deploy Digital Zen API to your hosting server.

## Prerequisites

- Access to hosting control panel (cPanel or similar)
- MySQL database already created:
  - Database name: `u387418961_digital_zen_db`
  - Database user: `u387418961_dz_user`
  - Database password (you should have this from your hosting provider)
- Domain: `digital-zen.csmpoint.com`

## Step 1: Generate API Secret Key

1. Go to https://randomkeygen.com/
2. Copy one of the "Fort Knox Passwords" (long random string)
3. Save this key - you will need it in multiple places

Example: `k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6`

## Step 2: Configure Backend API

1. On your local computer, go to `api/` folder
2. Copy `config.example.php` to `config.php`:
   ```bash
   cp config.example.php config.php
   ```

3. Open file `config.php`
4. Find this line:
   ```php
   define('DB_PASS', '');
   ```
3. Replace with your database password:
   ```php
   define('DB_PASS', 'your_actual_database_password');
   ```

4. Find this line:
   ```php
   define('API_SECRET_KEY', '');
   ```
5. Replace with the secret key you generated in Step 1:
   ```php
   define('API_SECRET_KEY', 'k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6');
   ```

## Step 3: Upload API Files to Server

Upload these files to your hosting server:

```
digital-zen.csmpoint.com/
└── api/
    ├── .htaccess
    ├── config.php
    ├── helpers.php
    ├── user-data.php
    └── README.md
```

You can use:
- **FTP client** (FileZilla, WinSCP)
- **cPanel File Manager**
- **SSH/SFTP** if available

### Important: Set File Permissions

After uploading, set correct permissions:

**Using FTP Client (FileZilla):**
1. Right-click on `api` folder → Properties
2. Set permissions to `755` (drwxr-xr-x)
3. Right-click each `.php` file → Properties  
4. Set permissions to `644` (-rw-r--r--)

**Using cPanel File Manager:**
1. Select `api` folder → Permissions
2. Set to `755`
3. Select all `.php` files → Permissions
4. Set to `644`

**Using SSH:**
```bash
chmod 755 api/
chmod 644 api/*.php
```

## Step 4: Create Database Tables

1. Log in to your hosting control panel
2. Open **phpMyAdmin**
3. Select database `u387418961_digital_zen_db` from left sidebar
4. Click on **SQL** tab at the top
5. Open file `api/database.sql` from your computer
6. Copy ALL content from that file
7. Paste into SQL query box in phpMyAdmin
8. Click **Go** button to execute

You should see message: "4 rows affected" or similar.

## Step 5: Test API Connection

1. Open browser
2. Go to: `https://digital-zen.csmpoint.com/api/user-data.php`
3. You should see JSON response:
   ```json
   {
     "success": false,
     "error": "Invalid API key"
   }
   ```

This means API is working! (It rejects request because no API key was sent)

## Step 6: Configure Chrome Extension

1. Open file `src/modules/common/constants/api-config.const.ts`
2. Find these lines:
   ```typescript
   export const API_CONFIG: ApiConfig = {
     apiUrl: 'https://digital-zen.csmpoint.com/api',
     apiKey: '',
   };
   ```
3. Replace with the same secret key from Step 1:
   ```typescript
   export const API_CONFIG: ApiConfig = {
     apiUrl: 'https://digital-zen.csmpoint.com/api',
     apiKey: 'k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6',
   };
   ```

**IMPORTANT**: The API key in Chrome extension MUST match the API_SECRET_KEY in `api/config.php`

## Step 7: Build and Test Extension

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist/browser` folder

3. Test the extension with API

## Troubleshooting

### Cannot Connect to Database

**Problem**: Error "Failed to connect to database"

**Solution**:
- Check database password in `api/config.php`
- Verify database exists in phpMyAdmin
- Check database name and username are correct

### Invalid API Key Error in Extension

**Problem**: Extension cannot save data to API

**Solution**:
- Make sure API key in `api-config.const.ts` matches `API_SECRET_KEY` in `api/config.php`
- Both keys must be EXACTLY the same (including case)
- Rebuild extension after changing the key

### CORS Errors

**Problem**: Browser shows CORS errors in console

**Solution**:
- API is configured to only accept requests from Chrome extensions
- Make sure you're using the extension, not testing from browser console
- Check that request is coming from `chrome-extension://` URL

### Error: 403 Forbidden (HTML response)

**This is the most common issue!** The 403 error means the web server is blocking access to the PHP files.

**Quick fixes:**
1. **Check file permissions** (most common cause):
   - Directory: `755`
   - PHP files: `644`

2. **Make sure `.htaccess` file is uploaded** to the api folder

3. **Access the full file path**: 
   - ✅ `https://digital-zen.csmpoint.com/api/user-data.php`
   - ❌ `https://digital-zen.csmpoint.com/api/`

**See detailed troubleshooting guide:** [TROUBLESHOOTING_403.md](./TROUBLESHOOTING_403.md)

**Common causes:**
- File permissions are incorrect (need 644 for .php files)
- ModSecurity is blocking requests (contact hosting support)
- PHP version is too old (need PHP 7.4+)
- Server doesn't allow .htaccess (contact hosting support)

### Tables Not Created

**Problem**: phpMyAdmin shows no tables

**Solution**:
- Make sure you selected correct database before running SQL
- Check if there were any error messages in phpMyAdmin
- Try running SQL statements one by one

## Security Notes

1. **Never commit API key to Git**
   - The `.gitignore` file already excludes `.env` files
   - Keep API key secure and private

2. **Use strong API key**
   - At least 32 characters
   - Mix of letters, numbers, and symbols
   - Generate new key for production

3. **Backup your database**
   - Regular backups through hosting control panel
   - Save SQL dumps locally

## Next Steps

After successful deployment:
1. Test saving and loading user data
2. Monitor database size
3. Set up regular backups
4. Consider adding database cleanup for old data

## Support

If you have issues:
1. Check browser console for errors
2. Check PHP error logs on server
3. Test API endpoint directly in browser
4. Verify all configuration values are correct
