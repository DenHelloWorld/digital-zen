# Hostinger Deployment Guide for Digital Zen Backend

## Quick Deployment Steps

### Step 1: Build Deployment Package

Use the automated build script to create a deployment-ready package:

```bash
# Navigate to the backend directory
cd backend

# Run the build script
./build-for-deploy.sh
```

This will:
- Install production dependencies
- Clear caches
- Create a deployment package at `../backend-hostinger.zip`
- Exclude unnecessary files (vendor, node_modules, .env, tests, etc.)

> **Note:** The vendor directory is excluded and will be reinstalled on the server to match the server's PHP version.

### Step 2: Upload to Hostinger

**Option A: Using File Manager (Recommended for beginners)**

1. Log in to your Hostinger control panel (hPanel)
2. Go to **Files** → **File Manager**
3. Navigate to `public_html` (or your desired directory)
4. Upload `backend-hostinger.zip`
5. Right-click the zip file and select **Extract**
6. Rename the extracted `backend-deploy` folder to `api` (or your preferred name)

**Option B: Using FTP**

1. Use an FTP client (FileZilla, etc.)
2. Connect to your Hostinger account
3. Upload `backend-hostinger.zip` to `public_html/`
4. Extract it via hPanel File Manager
5. Rename `backend-deploy` to `api`

### Step 3: Connect to Server

Connect to your server via **SSH** (enable in hPanel if not already):

```bash
ssh your-username@your-domain.com
cd public_html/api
```

### Step 4: Install Dependencies on Server

```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Verify installation
php artisan --version
```

### Step 5: Configure Environment

First, get your database credentials from Hostinger:

1. Log in to **hPanel**
2. Go to **Databases** → **MySQL Databases**
3. **If using existing database:** Note the database name, username, and password
4. **If creating new database:** Click **Create Database**, note the credentials

Now configure your backend:

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

Update the following in `.env`:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name     # From hPanel → Databases
DB_USERNAME=your_database_user     # From hPanel → Databases
DB_PASSWORD=your_database_password # From hPanel → Databases
```

> **Important:** 
> - Use your **existing** database if you already have one (as mentioned by the user)
> - Or create a **new** database in hPanel → Databases if needed
> - Double-check database credentials from hPanel

### Step 6: Generate Application Key

```bash
php artisan key:generate
```

### Step 7: Set Permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R your-username:your-username storage bootstrap/cache
```

### Step 8: Configure Web Server

In Hostinger hPanel:

1. Go to **Advanced** → **PHP Configuration**
2. Ensure PHP version is 8.2 or higher

Set up your domain to point to the `public` directory:

**Option A: Main Domain**
- In hPanel, go to **Domains**
- Edit domain settings
- Set document root to: `/public_html/api/public`

**Option B: Subdomain (e.g., api.yourdomain.com)**
- Create a subdomain in hPanel
- Point it to `/public_html/api/public`

### Step 9: Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 10: Test Your API

Visit: `https://your-domain.com/api/v1/health`

You should see:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-01-05T12:00:00+00:00"
}
```

## Troubleshooting

### Error: "500 Internal Server Error"

1. Check file permissions:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```

2. Check `.env` file exists and has correct database credentials

3. Clear cache:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

### Error: "Composer not found"

Hostinger has Composer installed. Use the full path:
```bash
/usr/local/bin/composer install --optimize-autoloader --no-dev
```

### Database Connection Error

1. Verify database exists in hPanel → Databases
2. Check username and password
3. Ensure database user has permissions

## About Frontend Files

Laravel comes with frontend build tools (Vite, Tailwind, package.json) by default. **These are NOT needed for API-only usage.**

These files are only used for:
- The default Laravel welcome page (`resources/views/welcome.blade.php`)
- Any future frontend components (which you don't need for API)

**You can safely ignore:**
- `package.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `resources/css/`
- `resources/js/`

**DO NOT run `npm install` - it's not needed for the backend API.**

## Updating Your Backend

When you make changes:

1. Update files locally
2. Upload changed files via FTP/SSH
3. Clear cache on server:
   ```bash
   php artisan cache:clear
   php artisan config:cache
   php artisan route:cache
   ```

## Security Checklist

- ✅ Set `APP_DEBUG=false` in production
- ✅ Use strong database passwords
- ✅ Keep Laravel and dependencies updated
- ✅ Enable HTTPS (usually automatic on Hostinger)
- ✅ Never commit `.env` file to git
- ✅ Set proper file permissions (755 for directories, 644 for files)
