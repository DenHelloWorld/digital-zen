# Digital Zen

> A Chrome extension to improve your focus by blocking distracting websites and managing focus sessions.

Digital Zen is a productivity browser extension built with Angular that helps you maintain concentration by blocking distracting websites during focus sessions. It provides an intuitive interface for managing blocked sites, tracking focus time, and staying productive throughout your workday.

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

3. **Set up environment variables** (Optional for development)

Create a `.env` file in the root directory with the following variables:

```env
OAUTH_CLIENT_ID=your_google_oauth_client_id
GITHUB_CLIENT_ID=your_github_oauth_client_id
PUBLIC_KEY=your_chrome_extension_public_key
```

> **Note:** These environment variables are only required for production builds. You can run the development server without them.

4. **Build the extension for development**

```bash
npm run build
```

This will compile the Angular application and background scripts into the `dist/browser` folder.

5. **Load the extension in Chrome**

Since this is a Chrome extension, you'll need to load it in Chrome:

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

### Building for Production

To create a production build of the extension:

```bash
npm run build:prod
```

This command will:

1. Compile the Angular application
2. Compile the background service worker with TypeScript
3. Resolve TypeScript path aliases
4. Patch the manifest.json with OAuth credentials from environment variables

The compiled extension will be available in the `dist/browser` directory.

### Building for Development

For a development build without environment variable patching:

```bash
npm run build
```

## OAuth Setup

This extension supports authentication with both Google and GitHub. To enable these features in production, you'll need to set up OAuth applications.

### Setting up GitHub OAuth

1. **Create a GitHub OAuth App:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "OAuth Apps" → "New OAuth App"
2. **Configure the OAuth App:**
   - **Application name:** Digital Zen (or your preferred name)
   - **Homepage URL:** Your extension's homepage or GitHub repository URL
   - **Application description:** (Optional) A Chrome extension for focus and productivity
   - **Authorization callback URL:** `https://<your-extension-id>.chromiumapp.org/`

     **Important:** You need your Chrome extension ID first:
     - Build your extension: `npm run build`
     - Load it in Chrome (`chrome://extensions/` → Load unpacked → select `dist/browser`)
     - Copy the Extension ID shown in Chrome
     - Go back to your GitHub OAuth App settings and update the **Authorization callback URL** with your actual extension ID (for example, `https://abcdefghijklmnop.chromiumapp.org/`)

#### Security note

This extension uses the OAuth **implicit flow** (`response_type=token`) for GitHub authentication. The implicit flow is generally considered less secure than the authorization code flow because access tokens are returned directly to the client.

For Chrome extensions, the security considerations are:

- **Authorization Code + PKCE is more secure:** Chrome extensions can technically use the authorization code flow with PKCE (Proof Key for Code Exchange), which is more secure because the access token is obtained via a code exchange and the code is bound to a one-time verifier.
- **Why this project uses implicit flow:** This extension uses the implicit flow because it is simpler to implement in a pure front-end Chrome extension and does **not** require a separate backend or proxy service to perform the code exchange.
- **Chrome's recommended pattern:** For GitHub OAuth specifically, Google's `chrome.identity.launchWebAuthFlow` API is designed to work seamlessly with the implicit flow for public clients like Chrome extensions.
- **Security trade-offs:** While the extension runs in a sandboxed environment providing some isolation, tokens are stored in `chrome.storage.local` which could be accessed if the extension is compromised. For most use cases, this is an acceptable trade-off given the simplicity benefit.

3. **Get your Client ID:**
   - After creating the app, you'll see your **Client ID** on the app details page
   - Copy this Client ID
4. **Add to .env file:**
   ```env
   GITHUB_CLIENT_ID=your_github_client_id_here
   ```

### Setting up Google OAuth

1. **Create a Google OAuth Client:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Chrome extension" as the application type
2. **Add to .env file:**
   ```env
   OAUTH_CLIENT_ID=your_google_oauth_client_id_here
   ```

### Complete .env Example

```env
# Google OAuth
OAUTH_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.1234567890abcdef

# Chrome Web Store (for production releases)
PUBLIC_KEY=your_chrome_extension_public_key_here
```

> **Security Note:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

### Testing the Build Locally

After building the extension, you can test it locally in Chrome:

1. Build the extension using one of the commands above
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/browser` folder from your project directory
6. The extension icon should appear in your Chrome toolbar

## Available Scripts

The following npm scripts are available in this project:

| Script           | Command                                                                                                          | Description                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `start`          | `ng serve`                                                                                                       | Starts the Angular development server for local development                   |
| `build`          | `ng build && tsc -p tsconfig.background.json && tsc-alias -p tsconfig.background.json`                           | Builds the project for development                                            |
| `build:prod`     | `ng build && tsc -p tsconfig.background.json && tsc-alias -p tsconfig.background.json && npm run patch-manifest` | Builds the project for production and patches manifest with OAuth credentials |
| `patch-manifest` | `dotenv -- node -e "..."`                                                                                        | Patches the manifest.json with environment variables                          |
| `test`           | `ng test`                                                                                                        | Runs unit tests using Karma test runner                                       |
| `lint`           | `ng lint`                                                                                                        | Runs ESLint to check code quality and style issues                            |
| `lint:fix`       | `ng lint --fix`                                                                                                  | Runs ESLint and automatically fixes fixable issues                            |
| `format`         | `npx prettier --write .`                                                                                         | Formats all code files using Prettier                                         |
| `format:check`   | `npx prettier --check .`                                                                                         | Checks if all files are formatted according to Prettier rules                 |
| `ng`             | `ng`                                                                                                             | Access to Angular CLI commands                                                |

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

**Problem:** `OAUTH_CLIENT_ID`, `GITHUB_CLIENT_ID`, or `PUBLIC_KEY` not found

**Solution:**

1. Create a `.env` file in the project root
2. Add your OAuth Client IDs and Chrome Extension Public Key:
   ```env
   OAUTH_CLIENT_ID=your_google_oauth_client_id
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   PUBLIC_KEY=your_actual_public_key_here
   ```
3. These values are obtained from:
   - **OAUTH_CLIENT_ID (Google):** [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
   - **GITHUB_CLIENT_ID:** [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New OAuth App
     - Application name: Digital Zen (or your preferred name)
     - Homepage URL: Your extension's homepage or GitHub repository URL
     - Authorization callback URL: `https://<your-extension-id>.chromiumapp.org/`
       - Note: You'll need to update this after building your extension, as the extension ID is generated
       - Find your extension ID in `chrome://extensions/` after loading your unpacked extension
   - **PUBLIC_KEY:** Generated when you first publish your extension to Chrome Web Store

> **Note:** The `.env` file should never be committed to version control. It's already included in `.gitignore`.

### Extension Not Loading in Chrome

**Problem:** Chrome shows "Manifest file is missing or unreadable"

**Solution:**

1. Make sure you've run the build command first
2. Verify that `dist/browser` folder contains `manifest.json`
3. Check that the manifest.json is valid JSON (build process should validate this)

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
│   ├── app/              # Angular application components
│   ├── background/       # Background service worker scripts
│   ├── modules/          # Shared Angular modules
│   ├── styles/           # Global styles
│   ├── manifest.json     # Chrome extension manifest
│   └── main.ts           # Application entry point
├── public/               # Static assets
├── dist/                 # Build output directory
└── package.json          # Project dependencies and scripts
```

## License

This project is currently in development. License information will be provided upon release.

## Additional Resources

- [Angular Documentation](https://angular.dev/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Angular CLI Command Reference](https://angular.dev/tools/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
