# Privacy Policy Hosting Guide

This guide provides instructions for hosting the Digital Zen privacy policy on the current PHP hosting server.

## Table of Contents

- [Overview](#overview)
- [Current Hosting Setup](#current-hosting-setup)
- [Privacy Policy File](#privacy-policy-file)
- [Updating the Privacy Policy](#updating-the-privacy-policy)
- [Troubleshooting](#troubleshooting)

---

## Overview

The privacy policy is now hosted on the same PHP server as the backend API at **digital-zen.csmpoint.com**. This eliminates the need for Vercel or other third-party hosting services.

**Privacy Policy File:**

- `api/privacy-policy.php` - English version

---

## Current Hosting Setup

### Hosting Server

The privacy policy is hosted on the same server as the Digital Zen backend API:

- **Server:** digital-zen.csmpoint.com
- **Location:** `/api/` directory
- **Access:** Public (configured in `.htaccess`)

### Privacy Policy URL

The privacy policy is accessible at:

- **URL:** `https://digital-zen.csmpoint.com/api/privacy-policy.php`

This URL is used in:
1. Chrome Web Store submission (privacy policy URL field)
2. Extension footer link (in `src/app/app.html`)

---

## Privacy Policy File

### File Structure

```
api/
├── privacy-policy.php     # English version
└── .htaccess              # Server configuration (allows public access)
```

### Access Configuration

The `.htaccess` file includes rules to allow public access to the privacy policy file:

```apache
# Allow access to privacy-policy.php
<Files "privacy-policy.php">
    Order allow,deny
    Allow from all
</Files>
```

---

## Updating the Privacy Policy

When you need to update the privacy policy:

### 1. Edit the File

Edit the privacy policy file locally:
- `api/privacy-policy.php`

Update the "Last Updated" date.

### 2. Upload to Server

Upload the updated file to the server:

**Option A: Using FTP/SFTP Client (FileZilla, WinSCP, etc.)**
1. Connect to `digital-zen.csmpoint.com` using your FTP/SFTP credentials
2. Navigate to the `/api/` directory
3. Upload the updated `privacy-policy.php` file

**Option B: Using cPanel File Manager**
1. Log in to cPanel at your hosting provider
2. Open File Manager
3. Navigate to `public_html/api/` (or equivalent path)
4. Upload or edit the privacy policy file

**Option C: Using SSH/Terminal (if available)**
```bash
# Connect to server
ssh your-username@digital-zen.csmpoint.com

# Navigate to api directory
cd /path/to/public_html/api/

# Upload file using scp from local machine
scp api/privacy-policy.php your-username@digital-zen.csmpoint.com:/path/to/public_html/api/
```

### 3. Verify Changes

After uploading, verify the changes are live:

1. Visit `https://digital-zen.csmpoint.com/api/privacy-policy.php` in your browser
2. Verify the "Last Updated" date is correct
3. Check that the content changes are visible

---

## Troubleshooting

### Issue: Privacy policy not accessible (403 Forbidden)

**Solution:**

- Verify `.htaccess` file includes the allow rules for privacy policy file
- Check file permissions (should be 644 for .php files)
- Ensure the file is in the correct directory (`/api/`)
- Contact hosting provider if issue persists

### Issue: Changes not showing after update

**Solution:**

- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Verify the file was uploaded successfully
- Check file modification timestamp on the server
- Try accessing the URL in an incognito/private browsing window

### Issue: File not found (404 error)

**Possible causes and solutions:**

1. **Incorrect file path:**
   - Verify the file is in the `/api/` directory on the server
   - Check file name is exactly `privacy-policy.php`

2. **Server configuration issue:**
   - Verify `.htaccess` is present and not corrupted
   - Check that mod_rewrite is enabled on the server

3. **Wrong URL:**
   - Ensure you're using the correct domain: `digital-zen.csmpoint.com`
   - Verify the path includes `/api/`

### Issue: Internal Server Error (500)

**Solution:**

- Check `.htaccess` syntax is correct
- Review PHP error logs in cPanel or server logs
- Verify PHP version is compatible (PHP 7.4+ recommended)
- Ensure file permissions are correct (644 for .php files, 755 for directories)

---

## For Chrome Web Store Submission

When submitting Digital Zen to the Chrome Web Store:

1. **Navigate to:** Chrome Web Store Developer Dashboard
2. **Find:** Privacy practices section
3. **Enter Privacy Policy URL:** 
   - `https://digital-zen.csmpoint.com/api/privacy-policy.php`

**Important:** The privacy policy must be publicly accessible. Test the URL in an incognito browser window before submitting to Chrome Web Store.

---

## Migration from Vercel (Historical Note)

**Previous setup:** Privacy policy was hosted on Vercel at `https://digital-zen-five.vercel.app/`

**Current setup:** Privacy policy is now hosted on the PHP server at `https://digital-zen.csmpoint.com/api/`

**Benefits of current setup:**
- ✅ Single hosting solution for both API and privacy policy
- ✅ No dependency on third-party hosting services
- ✅ Easier to manage and update
- ✅ Consistent domain and SSL certificate

---

## Additional Resources

- [API Deployment Guide](./api-deployment.md) - Server deployment instructions
- [Chrome Web Store Privacy Policy Requirements](https://developer.chrome.com/docs/webstore/program-policies/)

---

**Last Updated:** January 7, 2026
