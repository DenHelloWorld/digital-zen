# Digital Zen API

This is a simple PHP API for Digital Zen Chrome extension to store user data on the server.

## Features

- **Secure API**: Uses secret key authentication
- **User data storage**: Saves periods and websites for each user
- **Simple structure**: Easy to understand PHP code
- **MySQL database**: Compatible with most hosting providers

## Files Structure

```
api/
├── .htaccess          # URL rewriting for clean REST endpoints
├── config.example.php # Example configuration (copy to config.php)
├── helpers.php        # Helper functions
├── user.php           # User data endpoint (accessed as /api/user)
├── periods.php        # Periods CRUD endpoint (accessed as /api/periods)
├── database.sql       # Database schema
└── README.md          # This file
```

## Installation Steps

### 1. Upload Files to Server

Upload all files from the `api/` folder to your hosting server at `digital-zen.csmpoint.com`:

```
digital-zen.csmpoint.com/api/.htaccess
digital-zen.csmpoint.com/api/config.php
digital-zen.csmpoint.com/api/helpers.php
digital-zen.csmpoint.com/api/user.php
```

### 2. Setup Database

1. Open your hosting control panel (cPanel or similar)
2. Go to phpMyAdmin
3. Select database: `u387418961_digital_zen_db`
4. Click on "SQL" tab
5. Copy content from `database.sql` file
6. Paste it and click "Go" to create tables

**For existing databases:** If you already have the database installed before this update, you need to run the migration script to fix the `focused_times` table schema:

1. In phpMyAdmin, select your database
2. Click on "SQL" tab
3. Copy content from `migrate-focused-times.sql` file
4. Paste it and click "Go" to update the table schema

### 3. Configure API

1. Copy `config.example.php` to `config.php`:

   ```bash
   cp config.example.php config.php
   ```

2. Edit `config.php` file and fill in these values:

```php
// Database password (get it from your hosting provider)
define('DB_PASS', 'your_database_password_here');

// Generate a random secret key (example: use random string generator)
// This key will be used in Chrome extension to authenticate requests
define('API_SECRET_KEY', 'your_random_secret_key_here');
```

**How to generate API_SECRET_KEY:**

- Go to https://randomkeygen.com/
- Copy "Fort Knox Password" value
- Or generate your own random string (at least 32 characters)

### 4. Test API

Test if API is working by visiting:

```
https://digital-zen.csmpoint.com/api/user
```

You should see:

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

This means API is working (it rejects request without API key).

## API Usage

### Get User Data

**Endpoint:** `GET /api/user`

**Headers:**

```
X-API-Key: your_secret_key
Content-Type: application/json
```

**Query Parameters:**

```
GET /api/user?user_email=user@example.com
```

**Note:** Use query parameters to specify user email or user ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "user_id": "123456789"
    },
    "periods": [
      {
        "id": "period-1",
        "name": "Work Time",
        "description": "Focus on work",
        "startFrom": "2024-01-01 09:00:00",
        "endTo": "2024-01-01 17:00:00",
        "daysOfWeek": ["Monday", "Tuesday"],
        "isFocused": false,
        "sessionStartTime": null,
        "webSites": [
          {
            "id": "site-1",
            "name": "Facebook",
            "url": "facebook.com",
            "isBlocked": true
          }
        ],
        "focusedTimes": []
      }
    ]
  }
}
```

### Save User Data

**Endpoint:** `POST /api/user`

**Headers:**

```
X-API-Key: your_secret_key
Content-Type: application/json
```

**Body:**

```json
{
  "user_email": "user@example.com",
  "user_id": "123456789",
  "periods": [
    {
      "id": "period-1",
      "name": "Work Time",
      "description": "Focus on work",
      "startFrom": "2024-01-01T09:00:00Z",
      "endTo": "2024-01-01T17:00:00Z",
      "daysOfWeek": ["Monday", "Tuesday"],
      "isFocused": false,
      "sessionStartTime": null,
      "webSites": [
        {
          "id": "site-1",
          "name": "Facebook",
          "description": "Social media",
          "url": "facebook.com",
          "imageUrl": "",
          "iconUrl": "https://facebook.com/favicon.ico",
          "type": "Social Media",
          "isBlocked": true
        }
      ],
      "focusedTimes": [
        {
          "id": "time-1",
          "periodId": "period-1",
          "startFrom": "09:00:00",
          "endTo": "17:00:00"
        }
      ]
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

## Periods API

The Periods API provides CRUD (Create, Read, Update, Delete) operations for managing periods independently.

### Get Periods

**Endpoint:** `GET /api/periods`

**Headers:**

```
X-API-Key: your_secret_key
Content-Type: application/json
```

**Query Parameters:**

```
GET /api/periods?user_email=user@example.com
```

or

```
GET /api/periods?user_id=123456789
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "user_id": "123456789"
    },
    "periods": [
      {
        "id": "period-1",
        "name": "Work Time",
        "description": "Focus on work",
        "startFrom": "2024-01-01 09:00:00",
        "endTo": "2024-01-01 17:00:00",
        "daysOfWeek": ["Monday", "Tuesday"],
        "isFocused": false,
        "sessionStartTime": null,
        "webSites": [],
        "focusedTimes": []
      }
    ]
  }
}
```

### Create Period

**Endpoint:** `POST /api/periods`

**Headers:**

```
X-API-Key: your_secret_key
Content-Type: application/json
```

**Body:**

```json
{
  "user_email": "user@example.com",
  "period": {
    "id": "period-1",
    "name": "Work Time",
    "description": "Focus on work",
    "startFrom": "2024-01-01T09:00:00Z",
    "endTo": "2024-01-01T17:00:00Z",
    "daysOfWeek": ["Monday", "Tuesday"],
    "isFocused": false,
    "sessionStartTime": null,
    "webSites": [
      {
        "id": "site-1",
        "name": "Facebook",
        "description": "Social media",
        "url": "facebook.com",
        "imageUrl": "",
        "iconUrl": "https://facebook.com/favicon.ico",
        "type": "Social Media",
        "isBlocked": true
      }
    ],
    "focusedTimes": [
      {
        "id": "time-1",
        "startFrom": "09:00:00",
        "endTo": "17:00:00"
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Period created successfully",
    "period_id": "period-1"
  }
}
```

### Update Period

**Endpoint:** `PUT /api/periods`

**Headers:**

```
X-API-Key: your_secret_key
Content-Type: application/json
```

**Body:**

```json
{
  "period_id": "period-1",
  "period": {
    "name": "Updated Work Time",
    "description": "Updated description",
    "startFrom": "2024-01-01T08:00:00Z",
    "endTo": "2024-01-01T18:00:00Z",
    "daysOfWeek": ["Monday", "Tuesday", "Wednesday"],
    "isFocused": true,
    "sessionStartTime": "2024-01-01T09:00:00Z",
    "webSites": [
      {
        "id": "site-1",
        "name": "Facebook",
        "description": "Social media",
        "url": "facebook.com",
        "imageUrl": "",
        "iconUrl": "https://facebook.com/favicon.ico",
        "type": "Social Media",
        "isBlocked": true
      }
    ],
    "focusedTimes": [
      {
        "id": "time-1",
        "startFrom": "08:00:00",
        "endTo": "18:00:00"
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Period updated successfully",
    "period_id": "period-1"
  }
}
```

### Delete Period

**Endpoint:** `DELETE /api/periods`

**Headers:**

```
X-API-Key: your_secret_key
Content-Type: application/json
```

**Query Parameters:**

```
DELETE /api/periods?period_id=period-1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Period deleted successfully",
    "period_id": "period-1"
  }
}
```

## Security

- **API Key Authentication**: Every request must include `X-API-Key` header
- **CORS Protection**: Only Chrome extension can make requests
- **SQL Injection Protection**: All queries use prepared statements
- **No password storage**: API only stores email and user ID

## Database Tables

### users

- `id` - Auto increment ID
- `user_email` - User email (unique)
- `user_external_id` - User external ID (unique, can be from any auth provider)
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### periods

- `id` - Period ID (from extension)
- `user_id` - Foreign key to users table
- `period_name` - Period name
- `period_description` - Period description
- `start_from` - Start date/time
- `end_to` - End date/time
- `days_of_week` - JSON array of days
- `is_focused` - Boolean if currently focused
- `session_start_time` - When focus session started
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### websites

- `id` - Website ID (from extension)
- `period_id` - Foreign key to periods table
- `website_name` - Website name
- `website_description` - Website description
- `website_url` - Website URL
- `image_url` - Website image
- `icon_url` - Website icon
- `website_type` - Type (Default, Social Media, etc.)
- `is_blocked` - Boolean if blocked
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### focused_times

- `id` - Time ID (from extension)
- `period_id` - Foreign key to periods table
- `start_from` - Start time
- `end_to` - End time
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

## Troubleshooting

### Error: "Failed to connect to database"

- Check database password in `config.php`
- Verify database name and username are correct
- Make sure database exists

### Error: "Invalid API key"

- Check that `API_SECRET_KEY` is set in `config.php`
- Verify that extension is sending correct key in `X-API-Key` header

### Error: "Method not allowed"

- API only accepts GET and POST requests
- Check request method

### Tables not created

- Make sure you ran `database.sql` in phpMyAdmin
- Check if you selected correct database
- Check for SQL errors in phpMyAdmin

## Notes

- API deletes all existing periods when saving new data (full replace)
- All dates should be in ISO format (YYYY-MM-DD HH:MM:SS)
- Times should be in format HH:MM:SS
- Boolean values are stored as 0 (false) or 1 (true)
