# Universal Logger - Quick Start

## Quick Start

### In Any Part of the Project (Angular or Background)

```typescript
import { logger } from '../common';

export class MyService {
  readonly #logger = logger.createLogger('MyService');

  doSomething(): void {
    this.#logger.info('Doing something...');
    this.#logger.error('Oops, error occurred!');
  }
}
```

## Core Principles

1. **One universal logger** - works the same everywhere
2. **Use `createLogger()`** - create a named logger for your module
3. **Always readonly** - `readonly #logger = logger.createLogger('Name')`
4. **Private with #** - follow project standards

## Usage Examples

### Angular Component

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
}
```

### Angular Service

```typescript
import { Injectable } from '@angular/core';
import { logger } from '../common';

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly #logger = logger.createLogger('DataService');

  fetchData(): void {
    this.#logger.debug('Fetching data...');
  }
}
```

### Background Script

```typescript
import { logger } from '../modules/common/helpers/logger';

export class BackgroundService {
  readonly #logger = logger.createLogger('BackgroundService');

  constructor() {
    this.#logger.info('Service started');
  }
}
```

## API Reference

```typescript
// Create named logger (recommended)
const myLogger = logger.createLogger('MyModule');
myLogger.debug('Debug message');
myLogger.info('Info message');
myLogger.warn('Warning message');
myLogger.error('Error message', errorObject);

// Direct usage with prefix
logger.info('MyModule', 'Direct info message');

// Configuration
logger.configure({
  level: LogLevel.WARN, // Show only WARN and ERROR
  enableTimestamp: false, // Disable timestamps
});
```

## Log Levels

```typescript
enum LogLevel {
  DEBUG = 0, // Debug information
  INFO = 1, // General information
  WARN = 2, // Warnings
  ERROR = 3, // Errors
  NONE = 4, // Disable all logs
}
```

## Full Documentation

See [docs/logger.md](./logger.md) for detailed documentation.

## Usage Checklist

- [ ] Import `logger` from `../common`
- [ ] Create `readonly #logger = logger.createLogger('ModuleName')`
- [ ] Use `this.#logger.info()`, `this.#logger.error()`, etc.
- [ ] DO NOT use `console.log()` or `console.error()`
- [ ] Module name in CamelCase (e.g., 'AuthService', 'BackgroundService')
