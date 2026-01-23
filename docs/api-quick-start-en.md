# API Quick Start (English)

> This document provides a quick guide for deploying the API for user data storage and synchronization.

## 🚀 Quick Start (5 Steps)

### 1. Generate a Secret Key

Go to https://randomkeygen.com/ and copy one of the "Fort Knox Passwords".

Example: `k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6`

### 2. Backend Setup

1. In the `api/` folder, copy `config.example.php` to `config.php`
2. Open `config.php`
3. Fill in:
   ```php
   define('DB_PASS', 'your_database_password');
   define('API_SECRET_KEY', 'k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6');
   ```

### 3. Upload Files to Hosting

Upload these files to `digital-zen.csmpoint.com`:

```
digital-zen.csmpoint.com/api/
├── .htaccess
├── config.php
├── helpers.php
└── user
```

**IMPORTANT: Set correct permissions!**

After uploading via FTP or File Manager:

- `api/` folder: permissions `755`
- `.php` files: permissions `644`

### 4. Configure Environment Variables

Copy `.env.example` to `.env` in the project root and set your API key:

```env
API_SECRET_KEY='k8jH#mP9$nQ2*rT5&vW7@xY0!zA3^bC6'
```

### 5. Test the API

- Use Postman or browser to test `/api/user` endpoint
- Check for correct API key usage and permissions

---

_Last updated: January 2026_
