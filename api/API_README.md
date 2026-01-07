# Digital Zen Backend API

Simple PHP backend for storing user data (periods and websites).

## Quick Links

- 🚀 **[Quick Start (Russian)](../docs/api-quick-start-ru.md)** - Fastest way to get started
- 📖 **[Deployment Guide](../docs/api-deployment.md)** - Detailed step-by-step deployment
- 🔑 **[API Key Generation](../docs/api-key-generation.md)** - How to generate secure keys
- 💻 **[Usage Examples](../docs/api-usage-example.md)** - Angular code examples
- 📚 **[API Documentation](README.md)** - Full API reference

## Files in this Directory

```
api/
├── config.example.php  # Example configuration (copy to config.php)
├── helpers.php         # Helper functions
├── user       # Main API endpoint
└── database.sql        # Database schema
```

## What You Need

1. **Hosting server**: `digital-zen.csmpoint.com`
2. **MySQL database**: `u387418961_digital_zen_db`
3. **Database user**: `u387418961_dz_user`
4. **Database password**: (from your hosting provider)
5. **API secret key**: (generate with https://randomkeygen.com/)

## Installation

### 1. Configure

```bash
cp config.example.php config.php
# Edit config.php and fill in DB_PASS and API_SECRET_KEY
```

### 2. Upload to Server

Upload these files to your hosting:
- `config.php`
- `helpers.php`
- `user`

### 3. Create Database Tables

Run `database.sql` in phpMyAdmin

### 4. Test

Visit: `https://digital-zen.csmpoint.com/api/user`

Should return:
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

## API Endpoints

### GET /user

Get user data by email or user_id

**Query parameters:**
- `user_email` - User email
- `user_id` - User ID

**Headers:**
- `X-API-Key: your_secret_key`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "user_id": "123456"
    },
    "periods": [...]
  }
}
```

### POST /user

Save user data

**Headers:**
- `X-API-Key: your_secret_key`
- `Content-Type: application/json`

**Body:**
```json
{
  "user_email": "user@example.com",
  "user_id": "123456",
  "periods": [
    {
      "id": "period-1",
      "name": "Work Time",
      "webSites": [...],
      "focusedTimes": [...]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Data saved successfully",
    "user_id": 1
  }
}
```

## Security Features

✅ **API Key Authentication** - All requests require `X-API-Key` header  
✅ **CORS Protection** - Only Chrome extensions allowed  
✅ **SQL Injection Protection** - Prepared statements  
✅ **No password storage** - Only email and user_id stored  

## Database Schema

### users
- `id` - Auto increment
- `user_email` - User email (unique)
- `user_external_id` - User ID from auth provider (unique)
- `created_at`, `updated_at` - Timestamps

### periods
- `id` - Period ID
- `user_id` - FK to users
- `period_name`, `period_description`
- `start_from`, `end_to` - Date/time
- `days_of_week` - JSON array
- `is_focused` - Boolean
- `session_start_time` - DateTime

### websites
- `id` - Website ID
- `period_id` - FK to periods
- `website_name`, `website_url`
- `website_type` - 'Default' or 'Social Media'
- `is_blocked` - Boolean

### focused_times
- `id` - Time ID
- `period_id` - FK to periods
- `start_from`, `end_to` - Time

## Troubleshooting

See [Deployment Guide](../docs/api-deployment.md#troubleshooting)

## License

MIT
