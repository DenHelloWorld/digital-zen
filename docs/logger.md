# Universal Logger

Universal logger for Digital Zen that works in both Angular context and background script (Chrome Extension Service Worker).

## Features

- ✅ Works in Angular components and services
- ✅ Works in background script (Chrome Extension Service Worker)
- ✅ Supports log levels (DEBUG, INFO, WARN, ERROR)
- ✅ Module prefix configuration via `createLogger()`
- ✅ Optional timestamps in logs
- ✅ Configurable minimum log level
- ✅ TypeScript strict mode compatible
- ✅ Unified API for all contexts (no separate Angular service needed)

## Usage

### In Angular Components and Services

Import `logger` directly from common/helpers:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { logger } from '../common';

@Component({
  selector: 'dz-my-component',
  templateUrl: './my-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent {
  readonly #logger = logger.createLogger('MyComponent');

  ngOnInit(): void {
    this.#logger.info('Component initialized');
  }

  handleAction(): void {
    this.#logger.debug('Action triggered');
  }
}
```

### In Angular Services

```typescript
import { Injectable } from '@angular/core';
import { logger } from '../common';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  readonly #logger = logger.createLogger('MyService');

  performAction(): void {
    this.#logger.info('Performing action...');
  }
}
```

### In Background Script

Use `logger` directly from helpers:

```typescript
import { logger } from '../modules/common/helpers/logger';

export class BackgroundService {
  readonly #logger = logger.createLogger('BackgroundService');

  constructor() {
    this.#logger.info('Background service started');
  }

  async processData(): Promise<void> {
    try {
      this.#logger.debug('Processing data...');
      // ... logic
    } catch (error) {
      this.#logger.error('Failed to process data:', error);
    }
  }
}
```

## API

### logger (Universal)

```typescript
// Direct logging methods (with prefix)
logger.debug(prefix: string, ...args: unknown[]): void;
logger.info(prefix: string, ...args: unknown[]): void;
logger.warn(prefix: string, ...args: unknown[]): void;
logger.error(prefix: string, ...args: unknown[]): void;

// Create named logger for module (recommended)
logger.createLogger(prefix: string): ModuleLogger;

// Configuration
logger.configure(config: Partial<LoggerConfig>): void;
logger.getConfig(): LoggerConfig;
```

## Configuration

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}
```

### Setting Log Level

```typescript
import { logger, LogLevel } from '../common';

// Show only WARNING and ERROR
logger.configure({
  level: LogLevel.WARN,
});
```

### Disabling Timestamp

```typescript
logger.configure({
  enableTimestamp: false,
});
```

## Output Examples

### With Timestamp (Default)

```
[2026-01-06T22:30:00.000Z] [INFO] [BackgroundService] Starting sync...
[2026-01-06T22:30:01.234Z] [ERROR] [UserDataSyncAdapter] Sync failed: Network error
```

### Without Timestamp

```
[INFO] [BackgroundService] Starting sync...
[ERROR] [UserDataSyncAdapter] Sync failed: Network error
```

## Best Practices

### 1. Use createLogger for Modules

Instead of passing prefix every time:

```typescript
// ❌ Not recommended
logger.info('AuthService', 'User logged in');
logger.info('AuthService', 'Token refreshed');

// ✅ Recommended
readonly #logger = logger.createLogger('AuthService');

this.#logger.info('User logged in');
this.#logger.info('Token refreshed');
```

### 2. Use Appropriate Levels

- **DEBUG**: Detailed debug information (disabled in production)
- **INFO**: General application flow information
- **WARN**: Warnings, non-critical issues
- **ERROR**: Errors requiring attention

### 3. Readonly for Logger

Always declare logger as `readonly`:

```typescript
readonly #logger = logger.createLogger('ModuleName');
```

### 4. Private Fields with # Prefix

Follow project conventions:

```typescript
readonly #logger = logger.createLogger('ModuleName');  // ✅
readonly logger = logger.createLogger('ModuleName');   // ❌
```

## Replacing console.log/console.error

Use logger instead of direct console calls throughout the project:

```typescript
// ❌ Old way
console.log('[MyService] Action completed');
console.error('[MyService] Error:', error);

// ✅ New way
readonly #logger = logger.createLogger('MyService');
this.#logger.info('Action completed');
this.#logger.error('Error:', error);
```

## Integration with Existing Code

Logger is already integrated in:

- ✅ BackgroundServiceMV3
- ✅ UserDataSyncAdapter
- ✅ StorageAdapter
- ✅ AuthService
- ✅ GoogleAuthService
- ✅ Bootstrap (main.ts)

## Architecture

```
src/modules/common/
└── helpers/
    └── logger.ts              # Universal implementation for all contexts

src/background/
├── background-service-MV3.ts  # Uses logger directly
├── storage-adapter.ts         # Uses logger directly
└── user-data-sync-adapter.ts  # Uses logger directly

src/modules/auth/services/
├── auth.service.ts            # Uses logger directly
└── google-auth.service.ts     # Uses logger directly
```

## TypeScript Types

```typescript
interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
}

type ModuleLogger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};
```

## Imports

```typescript
// From any module in src/modules/
import { logger, LogLevel } from '../common';
// or more specifically
import { logger, LogLevel } from '../common/helpers/logger';

// From background script
import { logger } from '../modules/common/helpers/logger';
```
