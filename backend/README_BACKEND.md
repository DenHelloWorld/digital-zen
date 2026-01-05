# Digital Zen - Laravel Backend

This is the Laravel backend API for the Digital Zen Chrome extension. It provides a REST API for data persistence and synchronization.

## Requirements

- PHP 8.2 or higher
- Composer
- MySQL 5.7+ or MariaDB 10.3+

## Installation

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Configure Environment

Copy the `.env.example` file to `.env` and update the database configuration:

```bash
cp .env.example .env
```

Update the following environment variables in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=digital_zen
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Migrations (Optional)

If you need to create the default Laravel tables, run migrations:

```bash
php artisan migrate
```

> **Note:** If you already have an existing database with tables, you can skip this step or selectively run only the migrations you need.

## Running the Development Server

Start the Laravel development server:

```bash
php artisan serve
```

The backend will be available at `http://127.0.0.1:8000`

## API Endpoints

### Health Check

Check if the backend is running:

**GET** `/api/v1/health`

**Response:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-01-05T10:27:02+00:00"
}
```

**GET** `/up` (Built-in Laravel health check)

Returns an HTML page indicating the application status.

## Deployment to Hostinger

### Prerequisites

1. **Hostinger Hosting Plan**: Ensure you have a hosting plan that supports PHP 8.2+ and MySQL
2. **SSH Access**: Enable SSH access in your Hostinger control panel
3. **Composer**: Hostinger typically has Composer installed

### Deployment Steps

#### 1. Upload Files via FTP/SSH

Upload the `backend` directory to your Hostinger public_html or a subdirectory:

```bash
# Using SCP (from your local machine)
scp -r backend/ user@your-domain.com:/home/user/public_html/api/
```

Or use Hostinger's File Manager to upload the files.

#### 2. Configure Environment

On the server, copy and configure your `.env` file:

```bash
cd /home/user/public_html/api
cp .env.example .env
nano .env
```

Update with your Hostinger MySQL credentials:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_hostinger_db_name
DB_USERNAME=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password
```

#### 3. Install Dependencies

```bash
cd /home/user/public_html/api
composer install --optimize-autoloader --no-dev
```

#### 4. Set Permissions

```bash
chmod -R 755 storage bootstrap/cache
```

#### 5. Generate Application Key

```bash
php artisan key:generate
```

#### 6. Run Migrations (Optional)

If you need to set up the default Laravel tables, run:

```bash
php artisan migrate --force
```

> **Note:** Skip this step if you're connecting to an existing database with tables already created.

#### 7. Configure Web Server

For **Apache** (common on Hostinger), create or update `.htaccess` in your public directory.

The Laravel installation already includes a `.htaccess` file in the `public/` directory.

Update your document root to point to the `public/` folder, or create a symbolic link:

```bash
# If your domain points to public_html, you might need to adjust
ln -s /home/user/public_html/api/public /home/user/public_html
```

#### 8. Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Security Considerations

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Set proper file permissions**: Files should be 644, directories 755
3. **Disable debug mode** in production (`APP_DEBUG=false`)
4. **Use HTTPS** for all API communications
5. **Keep Laravel and dependencies updated**

## Testing

Run the test suite:

```bash
php artisan test
```

## Code Quality

Check code style with Laravel Pint:

```bash
./vendor/bin/pint
```

## Troubleshooting

### Storage Permission Issues

If you encounter permission errors:

```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Database Connection Issues

1. Verify MySQL service is running
2. Check database credentials in `.env`
3. Ensure the database exists
4. Check firewall settings

### Composer Issues

If Composer packages fail to install, try:

```bash
composer install --no-scripts
composer dump-autoload
```

## Additional Resources

- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [Hostinger PHP Hosting](https://www.hostinger.com/php-hosting)
- [Laravel Deployment Guide](https://laravel.com/docs/11.x/deployment)

## License

This backend API is part of the Digital Zen project and is licensed under the MIT License.
