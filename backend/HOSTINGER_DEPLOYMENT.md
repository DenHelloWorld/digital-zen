# Hostinger Deployment Guide for Digital Zen Backend

## Quick Deployment Steps

### Step 1: Prepare Your Files

Before uploading to Hostinger, you need to prepare your backend files:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies locally (if not already done)
composer install --optimize-autoloader --no-dev
```

### Step 2: Create a Deployment Package

Create a zip file with only the necessary files (excluding vendor and node_modules):

```bash
# From the backend directory, create a zip excluding unnecessary files
cd ..
zip -r backend-deploy.zip backend/ \
  -x "backend/vendor/*" \
  -x "backend/node_modules/*" \
  -x "backend/.git/*" \
  -x "backend/storage/logs/*" \
  -x "backend/.env"
```

### Step 3: Upload to Hostinger

**Option A: Using File Manager (Recommended for beginners)**

1. Log in to your Hostinger control panel (hPanel)
2. Go to **Files** → **File Manager**
3. Navigate to `public_html` (or your desired directory)
4. Upload `backend-deploy.zip`
5. Right-click the zip file and select **Extract**
6. Rename the extracted `backend` folder to `api` (or your preferred name)

**Option B: Using FTP**

1. Use an FTP client (FileZilla, etc.)
2. Connect to your Hostinger account
3. Upload the entire `backend` folder to `public_html/api/`

**Option C: Using SSH (Advanced)**

```bash
# From your local machine
scp -r backend/ your-username@your-domain.com:~/public_html/api/
```

### Step 4: Configure on Hostinger

Connect to your server via **SSH** (enable in hPanel if not already):

```bash
ssh your-username@your-domain.com
cd public_html/api
```

### Step 5: Install Dependencies on Server

```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Verify installation
php artisan --version
```

### Step 6: Configure Environment

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
DB_DATABASE=your_existing_db_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
```

**Important:** Use your existing Hostinger MySQL database credentials (from hPanel → Databases)

### Step 7: Generate Application Key

```bash
php artisan key:generate
```

### Step 8: Set Permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R your-username:your-username storage bootstrap/cache
```

### Step 9: Configure Web Server

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

### Step 10: Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 11: Test Your API

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
