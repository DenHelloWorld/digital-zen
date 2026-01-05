# Digital Zen API Documentation

## Overview

The Digital Zen API is a RESTful backend service for the Digital Zen Chrome extension. It provides secure data synchronization across devices using MySQL database storage.

## Base URL

Production: `https://digital-zen.csmpoint.com/api/v1`

## Authentication

The API uses a two-layer authentication system:

### 1. API Key Authentication (Required for all requests)

All requests must include the API secret key in the `X-API-Key` header. This ensures only authorized clients (the Digital Zen extension) can access the API.

**Header:**
```
X-API-Key: your-secret-api-key
```

### 2. User Authentication (Required for user-specific endpoints)

After user login, requests must include a JWT token in the `Authorization` header.

**Header:**
```
Authorization: Bearer <jwt-token>
```

## Security Implementation

### Secret Key

The API uses a secret key to prevent unauthorized access. This key should be:

1. **Generated securely**: Use a strong random string (at least 32 characters)
2. **Stored securely**: Set as environment variable on the hosting server
3. **Embedded in extension**: Include in the Chrome extension's environment configuration

**Alternatives to Secret Key:**

1. **OAuth 2.0**: Implement full OAuth flow (more complex but more secure)
2. **API Key + Domain Whitelist**: Validate requests by origin domain
3. **Certificate Pinning**: Use SSL certificates for validation
4. **HMAC Signatures**: Sign each request with timestamp to prevent replay attacks

### Recommended: HMAC Request Signing (Advanced)

For enhanced security, you can implement HMAC request signing:

```typescript
// Client side (Angular)
const timestamp = Date.now();
const message = `${method}:${url}:${timestamp}`;
const signature = await crypto.subtle.sign('HMAC', key, message);
headers['X-Signature'] = signature;
headers['X-Timestamp'] = timestamp;
```

```php
// Server side (PHP)
$timestamp = $_SERVER['HTTP_X_TIMESTAMP'];
$signature = $_SERVER['HTTP_X_SIGNATURE'];

// Reject old requests (prevent replay attacks)
if (abs(time() - $timestamp) > 300) { // 5 minutes
    Response::error('Request expired', 403);
}

// Verify signature
$message = "{$method}:{$url}:{$timestamp}";
$expectedSignature = hash_hmac('sha256', $message, API_SECRET_KEY);

if ($signature !== $expectedSignature) {
    Response::error('Invalid signature', 403);
}
```

## Database Setup

### 1. Create Database and User

The database and user should already exist:
- Database: `u387418961_digital_zen_db`
- User: `u387418961_dz_user`

### 2. Import Schema

Execute the SQL schema file to create tables:

```bash
mysql -u u387418961_dz_user -p u387418961_digital_zen_db < api/v1/database/schema.sql
```

Or via phpMyAdmin:
1. Login to phpMyAdmin
2. Select the `u387418961_digital_zen_db` database
3. Go to "Import" tab
4. Upload and execute `api/v1/database/schema.sql`

### 3. Configure Environment Variables

Create a `.env` file or set environment variables on your hosting:

```env
DB_HOST=localhost
DB_NAME=u387418961_digital_zen_db
DB_USER=u387418961_dz_user
DB_PASSWORD=your-database-password
API_SECRET_KEY=your-generated-secret-key
DEBUG_MODE=false
```

**For Hostinger:**
1. Go to hosting control panel
2. Navigate to "Advanced" → "PHP Configuration" or similar
3. Add environment variables
4. Alternatively, edit the `config/config.php` file directly (less secure)

## API Endpoints

### Authentication

#### POST /auth/google

Register or login user with Google account.

**Request:**
```json
{
  "google_id": "string",
  "email": "string",
  "name": "string",
  "picture": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "https://..."
    }
  }
}
```

#### GET /auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

### Periods

#### GET /periods

Get all periods for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "period-id",
      "name": "Work Focus",
      "description": "Focus period for work",
      "startFrom": "2024-01-01T09:00:00Z",
      "endTo": "2024-01-01T17:00:00Z",
      "daysOfWeek": [1, 2, 3, 4, 5],
      "isFocused": false,
      "sessionStartTime": null,
      "webSites": [
        {
          "id": "site-id",
          "name": "Facebook",
          "url": "facebook.com",
          "isBlocked": true,
          "type": "Social Media"
        }
      ],
      "focusedTimes": []
    }
  ]
}
```

#### GET /periods/:id

Get single period by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "period-id",
    "name": "Work Focus",
    ...
  }
}
```

#### POST /periods

Create new period.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "id": "period-id",
  "name": "Work Focus",
  "description": "Focus period for work",
  "startFrom": "2024-01-01T09:00:00Z",
  "endTo": "2024-01-01T17:00:00Z",
  "daysOfWeek": [1, 2, 3, 4, 5],
  "isFocused": false,
  "sessionStartTime": null,
  "webSites": [
    {
      "id": "site-id",
      "name": "Facebook",
      "description": "",
      "url": "facebook.com",
      "imageUrl": "",
      "iconUrl": "",
      "type": "Social Media",
      "isBlocked": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "period-id"
  }
}
```

#### PUT /periods/:id

Update existing period.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "period-id"
  }
}
```

#### DELETE /periods/:id

Delete period.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "period-id"
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (missing authentication)
- `403` - Forbidden (invalid credentials)
- `404` - Not Found (resource doesn't exist)
- `405` - Method Not Allowed (wrong HTTP method)
- `500` - Internal Server Error

## Deployment Steps

### 1. Upload Files

Upload the `api` folder to your Hostinger hosting:

```
public_html/
  └── api/
      └── v1/
          ├── config/
          ├── controllers/
          ├── database/
          ├── middleware/
          ├── models/
          ├── utils/
          ├── .htaccess
          └── index.php
```

### 2. Set Permissions

Ensure proper file permissions:
```bash
chmod 755 api/v1
chmod 644 api/v1/*.php
chmod 644 api/v1/**/*.php
```

### 3. Configure Database

1. Import schema: `mysql -u u387418961_dz_user -p u387418961_digital_zen_db < api/v1/database/schema.sql`
2. Verify tables are created

### 4. Set Environment Variables

Option A - Control Panel:
1. Login to Hostinger control panel
2. Set environment variables

Option B - Direct Configuration:
1. Edit `api/v1/config/config.php`
2. Replace default values with production values

### 5. Generate Secret Key

Generate a secure random key:

```bash
# Linux/Mac
openssl rand -base64 32

# Or use online generator
# https://randomkeygen.com/
```

### 6. Test API

Test the API endpoint:

```bash
curl -X GET https://digital-zen.csmpoint.com/api/v1/auth/me \
  -H "X-API-Key: your-secret-key" \
  -H "Authorization: Bearer test-token"
```

## Integration with Chrome Extension

### 1. Update Environment Configuration

Add API configuration to `.env`:

```env
API_URL=https://digital-zen.csmpoint.com/api/v1
API_SECRET_KEY=your-generated-secret-key
```

### 2. Create HTTP Interceptor

The interceptor will be created to automatically add the API key to all requests.

### 3. Update API Service

Update the API service to use the new backend URL.

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Secret Key Rotation**: Rotate the API secret key periodically
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: All inputs are validated before processing
5. **SQL Injection Prevention**: Using prepared statements (PDO)
6. **XSS Prevention**: Output is JSON-encoded
7. **CSRF Protection**: Not needed for API (no cookies/sessions)

## Monitoring and Maintenance

1. **Error Logs**: Check PHP error logs regularly
2. **Database Backups**: Set up automated MySQL backups
3. **Performance**: Monitor API response times
4. **Security Updates**: Keep PHP and MySQL updated

## Support

For issues or questions, please contact the development team or create an issue on GitHub.
