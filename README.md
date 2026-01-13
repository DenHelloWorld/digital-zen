# Digital Zen

> A cross-browser extension to improve your focus by blocking distracting websites and managing focus sessions.

Digital Zen is a productivity browser extension built with Angular that helps you maintain concentration by blocking distracting websites during focus sessions. It provides an intuitive interface for managing blocked sites, tracking focus time, and staying productive throughout your workday.

**Cross-Browser Support:** Works on Chrome, Edge, Brave, Firefox, and other Chromium-based browsers.

**Note:** Firefox requires a small manifest modification for development. See the [Browser Installation Guide](./docs/browser-installation.md#mozilla-firefox) for details.

## Authors

- **Denis Saveliev (DenHelloWorld)** - Project Creator & Lead Developer - [GitHub Profile](https://github.com/DenHelloWorld)
- **dan (self-destructed)** - Collaborator - [GitHub Profile](https://github.com/self-destructed)

## Technology Stack

This project is built with modern web technologies and follows best practices for code quality:

### Core Technologies

- **Framework:** [Angular](https://angular.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** Angular Signals + [RxJS](https://rxjs.dev/)
- **Extension API:** Chrome Extension Manifest V3

### Development Tools

- **Build Tool:** Angular CLI
- **Linting:** [ESLint](https://eslint.org/) with Angular ESLint
- **Code Formatting:** [Prettier](https://prettier.io/)
- **Code Quality:** ESLint + Prettier integration

### Additional Libraries

- **Chrome Types:** @types/chrome
- **Environment Variables:** dotenv-cli
- **TypeScript Path Aliases:** tsc-alias

## Development Guidelines

This project follows modern Angular 21 patterns and best practices. **Before contributing, please read:**

📖 **[Complete Coding Guidelines](./docs/coding-guidelines.md)** - Comprehensive guide covering:

- Standalone Components & Dependency Injection
- Signals for State Management
- Template Syntax (Built-in Control Flow)
- TypeScript Conventions
- UI Text & Icon Management
- Testing Best Practices

For quick reference, see the [Quick Start Guide for Developers](./docs/README.md).

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (comes with Node.js) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/DenHelloWorld/digital-zen.git
cd digital-zen
```

2. **Install dependencies**

```bash
npm install
```

or if you prefer pnpm:

```bash
pnpm install
```

3. **Set up OAuth Client ID** (Required for Google authentication)

Create a `.env` file in the root directory (copy from `.env.example`):

```env
OAUTH_CLIENT_ID=your_google_oauth_client_id
PUBLIC_KEY=your_chrome_extension_public_key
API_URL=https://your-api-url.com/api
API_SECRET_KEY='your_secret_key'
```

Get your OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/).

> **Important:**
>
> - Never commit your `.env` file to git! It's already in `.gitignore`
> - OAuth Client ID is required for Google authentication features
> - The extension will work without it, but Google login won't be available

4. **Build the extension**

For **Chrome, Edge, Brave, Opera, Vivaldi**:

```bash
npm run build
```

For **Firefox**: The same command builds Firefox version too:

```bash
npm run build
```

This will compile the Angular application and background scripts into both `dist/chromium/` and `dist/firefox/` folders.
Both commands run tests automatically before building.

5. **Load the extension in your browser**

For detailed installation instructions for different browsers (Chrome, Edge, Brave, Firefox, Opera, Vivaldi), see the **[Browser Installation Guide](./docs/browser-installation.md)**.

**Quick start for Chrome:**

- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" (toggle in the top-right corner)
- Click "Load unpacked" and select the `dist/browser` folder from your project directory

6. **(Optional) Run development server for live reload**

If you want to develop with live reload, you can run:

```bash
npm start
```

This starts the Angular development server at `http://localhost:4200/`. While this is useful for rapid development with hot reload, remember that for testing the actual Chrome extension functionality, you'll need to rebuild using `npm run build` and reload the extension in Chrome.

## Build and Deployment

Digital Zen uses a **dual-build system** that creates separate, optimized builds for Chromium browsers and Firefox.

📖 **[Complete Build System Documentation](./docs/build-system.md)** - Detailed guide covering all build options, architecture, and troubleshooting.

### Quick Start

**Build for all browsers:**
```bash
npm run build
```

This creates:
- `dist/chromium/` - For Chrome, Edge, Brave, Opera, Vivaldi
- `dist/firefox/` - For Firefox (includes .zip archive)

**Production build:**
```bash
npm run build:prod
```

This builds for both browsers with production patches applied (OAuth credentials and API keys from `.env` file).

### Output Directories

| Directory | Browser | Description |
|-----------|---------|-------------|
| `dist/chromium/` | Chrome, Edge, Brave, Opera, Vivaldi | Chromium build with service worker |
| `dist/firefox/` | Firefox | Firefox build with bundled background script |
| `dist/firefox/web-ext-artifacts/*.zip` | Firefox | Firefox archive ready for distribution |

### Testing the Build Locally

After building the extension, you can test it locally in any supported browser.

**Supported Browsers:** Chrome, Edge, Brave, Firefox, Opera, Vivaldi, and other Chromium-based browsers.

For detailed installation instructions for each browser, see the **[Browser Installation Guide](./docs/browser-installation.md)**.

**Quick start for Chrome:**

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/chromium/` folder from your project directory
6. The extension icon should appear in your Chrome toolbar

**Quick start for Firefox:**

1. Build the extension: `npm run build`
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select `dist/firefox/manifest.json`
5. The extension should load successfully

## Available Scripts

The following npm scripts are available in this project:

| Script | Description |
|--------|-------------|
| `start` | Starts the Angular development server for local development |
| `build` | Builds for both Chromium and Firefox → `dist/chromium/` + `dist/firefox/` (includes tests) |
| `build:prod` | Production build for both browsers with environment patching (includes tests) |
| `test` | Runs unit tests with Karma in watch mode |
| `test:ci` | Runs tests once in headless mode with coverage (for CI/CD) |
| `test:headless` | Runs tests once in headless mode without coverage |
| `lint` | Runs ESLint to check code quality and style issues |
| `lint:fix` | Runs ESLint and automatically fixes fixable issues |
| `format` | Formats all code files using Prettier |
| `format:check` | Checks if all files are formatted according to Prettier rules |
| `ng` | Access to Angular CLI commands |

📖 **[Complete Build Documentation](./docs/build-system.md)** - For detailed build system architecture and troubleshooting.

## Development Workflow

### Code Quality

This project uses ESLint and Prettier to maintain consistent code quality:

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check
```

### Running Tests

Execute the unit test suite:

```bash
npm test
```

## Troubleshooting

### Environment Variables Not Found

If you encounter errors related to missing environment variables during production build:

**Problem:** `OAUTH_CLIENT_ID` or `PUBLIC_KEY` not found

**Solution:**

1. Create a `.env` file in the project root
2. Add your Google OAuth Client ID and Chrome Extension Public Key:
   ```env
   OAUTH_CLIENT_ID=your_actual_client_id_here
   PUBLIC_KEY=your_actual_public_key_here
   ```
3. These values are obtained from:
   - **OAUTH_CLIENT_ID:** [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
   - **PUBLIC_KEY:** Generated when you first publish your extension to Chrome Web Store

> **Note:** The `.env` file should never be committed to version control. It's already included in `.gitignore`.

### Extension Not Loading in Chrome

**Problem:** Chrome shows "Manifest file is missing or unreadable"

**Solution:**

1. Make sure you've run the build command first
2. Verify that `dist/browser` folder contains `manifest.json`
3. Check that the manifest.json is valid JSON (build process should validate this)

### OAuth Authentication Issues

**Problem:** Google authentication button doesn't work or shows "redirect_uri_mismatch" error

**⚠️ This is the most common issue with OAuth setup!**

See our detailed troubleshooting guide:

📖 **[Troubleshooting OAuth redirect_uri_mismatch](./docs/troubleshooting-oauth-redirect-uri.md)**

**Quick Fix:**

1. Open extension popup and inspect it (right-click → Inspect)
2. Click Google login button and check Console for redirect URL
3. Copy the URL (e.g., `https://xxxxx.chromiumapp.org/oauth2`)
4. Add it to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs
5. Save and wait 5-10 minutes

**Other OAuth Issues:**

1. Verify OAuth client ID is configured in `.env` file
2. Check that redirect URI is properly configured in Google Cloud Console (see guide above)
3. Ensure the extension ID matches the redirect URI in Google Cloud Console
4. Make sure you selected "Chrome App" (not "Web application") when creating OAuth credentials

For detailed OAuth setup instructions, including cross-browser support, refer to:

- **[OAuth Cross-Browser Setup Guide](./docs/oauth-setup-cross-browser.md)** - Comprehensive guide for configuring Google OAuth to work across different browsers
- **[Troubleshooting OAuth redirect_uri_mismatch](./docs/troubleshooting-oauth-redirect-uri.md)** - Detailed guide for fixing the most common OAuth error

### Development Server Not Starting

**Problem:** `ng serve` fails or port is already in use

**Solution:**

1. Ensure all dependencies are installed: `npm install`
2. If port 4200 is in use, specify a different port: `ng serve --port 4201`
3. Clear Angular cache: `rm -rf .angular/cache`

## Project Structure

```
digital-zen/
├── src/
│   ├── app/              # Main Angular application component
│   ├── background/       # Background service worker scripts
│   ├── modules/          # Feature modules (standalone components)
│   │   ├── common/       # Shared utilities, components, and services
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── constants/    # Application constants (UI_TEXT, ICONS, etc.)
│   │   │   ├── enums/        # Enumerations
│   │   │   ├── helpers/      # Helper functions and utilities
│   │   │   ├── interceptors/ # HTTP interceptors
│   │   │   ├── models/       # TypeScript interfaces and types
│   │   │   ├── pipes/        # Custom Angular pipes
│   │   │   ├── services/     # Shared services
│   │   │   └── validators/   # Form validators
│   │   ├── auth/         # Authentication feature
│   │   ├── focus/        # Focus mode feature
│   │   └── menu/         # Menu feature
│   ├── styles/           # Global styles and SCSS files
│   ├── manifest.json     # Chrome extension manifest (Manifest V3)
│   ├── main.ts           # Application entry point
│   └── background.ts     # Background service worker entry point
├── api/                  # Backend PHP API (optional for data sync)
├── docs/                 # Documentation files
├── public/               # Static assets (icons, images)
├── scripts/              # Build and utility scripts
│   ├── patch-manifest.js # Patches manifest.json with OAuth credentials
│   └── patch-api-config.js # Patches API config with credentials
├── dist/                 # Build output directory (generated)
└── package.json          # Project dependencies and scripts
```

For detailed architecture patterns and coding conventions, see the [Coding Guidelines](./docs/coding-guidelines.md).

## Chrome Web Store Publication

Planning to publish Digital Zen to the Chrome Web Store? Check out our comprehensive deployment readiness documentation:

- **[Chrome Web Store Readiness Report](./docs/chrome-web-store-readiness.md)** - Complete analysis and requirements
- **[Publication Checklist](./docs/publication-checklist.md)** - Actionable task list
- **[Readiness Report (Russian)](./docs/chrome-web-store-readiness-ru.md)** - Brief summary in Russian
- **[Privacy Policy Setup](./docs/privacy-policy-setup.md)** - Quick reference for hosting the privacy policy
- **[Privacy Policy Hosting Guide](./docs/privacy-policy-hosting.md)** - Complete guide for hosting options

These documents provide detailed guidance on assets, legal requirements, testing, and the complete publication process.

### Privacy Policy

The privacy policy is available in English and Russian versions in the `docs/` folder:

- `docs/privacy-policy.html` - English version
- `docs/privacy-policy-ru.html` - Russian version

To host the privacy policy publicly (required for Chrome Web Store), see the [Privacy Policy Hosting Guide](./docs/privacy-policy-hosting.md) for free hosting options that keep your source code private.

## Backend API

Digital Zen includes a PHP backend API for storing user data (periods and websites) on a server. This allows users to sync their data across devices.

### Quick Links

- 🚀 **[Quick Start (Russian)](./docs/api-quick-start-ru.md)** - Fastest way to deploy the API
- 📖 **[Deployment Guide](./docs/api-deployment.md)** - Detailed step-by-step instructions
- 🔑 **[API Key Generation](./docs/api-key-generation.md)** - Security best practices
- 💻 **[Usage Examples](./docs/api-usage-example.md)** - How to use the API in Angular
- 📚 **[API Documentation](./api/README.md)** - Full API reference

### Features

- ✅ Secure API key authentication
- ✅ MySQL database for data persistence
- ✅ CORS protection (Chrome extension only)
- ✅ Simple PHP code (easy to understand and modify)
- ✅ No password storage (only email and user ID)

### Setup Summary

1. Generate API secret key
2. Configure `api/config.php` with database credentials and API key
3. Upload API files to hosting server
4. Create database tables using `api/database.sql`
5. Configure extension with API URL and key in `api-config.const.ts`

See [API Quick Start Guide](./docs/api-quick-start-ru.md) for complete instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Additional Resources

**Official Documentation:**

- [Angular Documentation](https://angular.dev/) - Primary source for Angular patterns
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Angular CLI Command Reference](https://angular.dev/tools/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

**Project Guidelines:**

- [Digital Zen Coding Guidelines](./docs/coding-guidelines.md) - Complete reference for development patterns
- [Logger Documentation](./docs/logger.md) - Universal logger usage guide
