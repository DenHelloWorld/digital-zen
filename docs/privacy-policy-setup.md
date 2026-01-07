# Privacy Policy Setup - Quick Reference

This document provides a quick reference for the privacy policy setup and hosting.

## Files Created

### Privacy Policy Pages

- **`api/privacy-policy.php`** - English version of the privacy policy (hosted on PHP server)

Both versions include:

- Comprehensive privacy information required for Chrome Web Store
- Details about data collection, storage, and usage
- Explanation of Chrome permissions
- Information about Google OAuth integration
- Contact information

### Documentation

- **`docs/privacy-policy-hosting.md`** - Complete guide for hosting the privacy policy
- **`docs/privacy-policy.html`** - Original HTML version (kept for reference)

## Privacy Policy URLs

The privacy policy is hosted on the same server as the backend API:

- **URL:** `https://digital-zen.csmpoint.com/api/privacy-policy.php`

## Hosting Setup

### Current Hosting Service

The privacy policy is hosted on **digital-zen.csmpoint.com** - the same PHP server used for the backend API.

**Benefits:**
- ✅ Single hosting solution for both API and privacy policy
- ✅ No dependency on third-party hosting services (no Vercel needed)
- ✅ Easier to manage and update
- ✅ Consistent domain and SSL certificate

### File Location

Privacy policy files are located in the `/api/` directory:
```
api/
├── privacy-policy.php
└── .htaccess  # Configured to allow public access
```

### Access Configuration

The `.htaccess` file in the `/api/` directory includes rules to allow public access to the privacy policy files while keeping other files (like `config.php`) protected.

## Using the Privacy Policy URL

When submitting Digital Zen to the Chrome Web Store:

1. **Navigate to:** Chrome Web Store Developer Dashboard
2. **Find:** Privacy practices section
3. **Enter URL:** `https://digital-zen.csmpoint.com/api/privacy-policy.php`

The extension's footer also links to the privacy policy automatically.

## Updating the Privacy Policy

To update the privacy policy in the future:

### 1. Edit Locally

Edit the files:
- `api/privacy-policy.php`

Update the "Last Updated" date.

### 2. Upload to Server

Upload the updated files to the server using one of these methods:

**FTP/SFTP:**
1. Connect to `digital-zen.csmpoint.com`
2. Navigate to `/api/`
3. Upload the updated files

**cPanel File Manager:**
1. Log in to cPanel
2. Open File Manager
3. Navigate to `public_html/api/`
4. Upload or edit files

**SSH (if available):**
```bash
scp api/privacy-policy.php username@digital-zen.csmpoint.com:/path/to/api/
```

### 3. Verify

Visit the URLs to verify changes:
- `https://digital-zen.csmpoint.com/api/privacy-policy.php`

## Troubleshooting

### Privacy policy not accessible (403 Forbidden)

- **Verify:** `.htaccess` includes allow rules for privacy policy files
- **Check:** File permissions (should be 644)
- **Ensure:** Files are in `/api/` directory

### Changes not showing

- **Clear:** Browser cache (Ctrl+Shift+R)
- **Verify:** Files were uploaded successfully
- **Try:** Incognito/private browsing window

### 404 Not Found

- **Check:** File name is exactly `privacy-policy.php`
- **Verify:** Files are in the correct `/api/` directory
- **Ensure:** `.htaccess` is present and not corrupted

## Additional Resources

For detailed information, see:

- [Privacy Policy Hosting Guide](./privacy-policy-hosting.md) - Complete hosting instructions
- [API Deployment Guide](./api-deployment.md) - Server deployment instructions
- [Chrome Web Store Readiness Report](./chrome-web-store-readiness.md) - Publication requirements

---

**Created:** January 2, 2026  
**Updated:** January 7, 2026  
**Purpose:** Chrome Web Store publication requirement  
**Hosting:** PHP server (digital-zen.csmpoint.com)
