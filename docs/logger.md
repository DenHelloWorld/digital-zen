# Universal Logger

Универсальный логгер для Digital Zen, который работает как в Angular-контексте, так и в background script (service worker) расширения Chrome.

## Возможности

- ✅ Работает в Angular компонентах и сервисах
- ✅ Работает в background script (Chrome Extension Service Worker)
- ✅ Поддержка уровней логирования (DEBUG, INFO, WARN, ERROR)
- ✅ Настройка префиксов для модулей через `createLogger()`
- ✅ Опциональные timestamp в логах
- ✅ Конфигурируемый минимальный уровень логирования
- ✅ TypeScript strict mode совместимость
- ✅ Единый API для всех контекстов (без отдельного Angular сервиса)

## Использование

### В Angular компонентах и сервисах

Импортируйте `logger` напрямую из common/helpers:

```typescript
import { Component } from '@angular/core';
import { logger } from '../common';

@Component({
  selector: 'dz-my-component',
  templateUrl: './my-component.html',
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

### В Angular сервисах

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

### В background script

Используйте напрямую `logger` из helpers:

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
// Прямые методы логирования (с префиксом)
logger.debug(prefix: string, ...args: unknown[]): void;
logger.info(prefix: string, ...args: unknown[]): void;
logger.warn(prefix: string, ...args: unknown[]): void;
logger.error(prefix: string, ...args: unknown[]): void;

// Создать именованный логгер для модуля (рекомендуется)
logger.createLogger(prefix: string): {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

// Конфигурация
logger.configure(config: Partial<LoggerConfig>): void;
logger.getConfig(): LoggerConfig;
```

## Конфигурация

### Уровни логирования

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}
```

### Настройка уровня логирования

```typescript
import { logger, LogLevel } from '../common';

// Показывать только WARNING и ERROR
logger.configure({
  level: LogLevel.WARN,
});
```

### Отключение timestamp

```typescript
logger.configure({
  enableTimestamp: false,
});
```

## Примеры вывода

### С timestamp (по умолчанию)

```
[2026-01-06T22:30:00.000Z] [INFO] [BackgroundService] Starting sync...
[2026-01-06T22:30:01.234Z] [ERROR] [UserDataSyncAdapter] Sync failed: Network error
```

### Без timestamp

```
[INFO] [BackgroundService] Starting sync...
[ERROR] [UserDataSyncAdapter] Sync failed: Network error
```

## Best Practices

### 1. Используйте createLogger для модулей

Вместо того чтобы передавать префикс каждый раз:

```typescript
// ❌ Не рекомендуется
logger.info('AuthService', 'User logged in');
logger.info('AuthService', 'Token refreshed');

// ✅ Рекомендуется
readonly #logger = logger.createLogger('AuthService');

this.#logger.info('User logged in');
this.#logger.info('Token refreshed');
```

### 2. Используйте подходящие уровни

- **DEBUG**: Детальная отладочная информация (отключена в продакшене)
- **INFO**: Общая информация о работе приложения
- **WARN**: Предупреждения, не критичные проблемы
- **ERROR**: Ошибки, требующие внимания

### 3. Readonly для logger

Всегда объявляйте logger как `readonly`:

```typescript
readonly #logger = logger.createLogger('ModuleName');
```

### 4. Private fields с # prefix

Следуйте соглашениям проекта:

```typescript
readonly #logger = logger.createLogger('ModuleName');  // ✅
readonly logger = logger.createLogger('ModuleName');   // ❌
```

## Замена console.log/console.error

Везде в проекте используйте logger вместо прямых вызовов console:

```typescript
// ❌ Старый способ
console.log('[MyService] Action completed');
console.error('[MyService] Error:', error);

// ✅ Новый способ
readonly #logger = logger.createLogger('MyService');
this.#logger.info('Action completed');
this.#logger.error('Error:', error);
```

## Интеграция с существующим кодом

Logger уже интегрирован в:

- ✅ BackgroundServiceMV3
- ✅ UserDataSyncAdapter
- ✅ StorageAdapter
- ✅ AuthService
- ✅ GoogleAuthService
- ✅ Bootstrap (main.ts)

## Архитектура

```
src/modules/common/
└── helpers/
    └── logger.ts              # Универсальная реализация для всех контекстов

src/background/
├── background-service-MV3.ts  # Использует logger напрямую
├── storage-adapter.ts         # Использует logger напрямую
└── user-data-sync-adapter.ts  # Использует logger напрямую

src/modules/auth/services/
├── auth.service.ts            # Использует logger напрямую
└── google-auth.service.ts     # Использует logger напрямую
```

## TypeScript типы

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

## Импорты

```typescript
// Из любого модуля в src/modules/
import { logger, LogLevel } from '../common';
// или более специфично
import { logger, LogLevel } from '../common/helpers/logger';

// Из background script
import { logger } from '../modules/common/helpers/logger';
```
