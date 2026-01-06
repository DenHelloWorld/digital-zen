# Universal Logger

Универсальный логгер для Digital Zen, который работает как в Angular-контексте, так и в background script (service worker) расширения Chrome.

## Возможности

- ✅ Работает в Angular компонентах и сервисах
- ✅ Работает в background script (Chrome Extension Service Worker)
- ✅ Поддержка уровней логирования (DEBUG, INFO, WARN, ERROR)
- ✅ Настройка префиксов для модулей
- ✅ Опциональные timestamp в логах
- ✅ Конфигурируемый минимальный уровень логирования
- ✅ TypeScript strict mode совместимость

## Использование

### В Angular компонентах и сервисах

Используйте `LoggerService` через dependency injection:

```typescript
import { Component, inject } from '@angular/core';
import { LoggerService } from '../common';

@Component({
  selector: 'dz-my-component',
  templateUrl: './my-component.html',
})
export class MyComponent {
  readonly #logger = inject(LoggerService);

  ngOnInit(): void {
    this.#logger.info('MyComponent', 'Component initialized');
  }

  handleAction(): void {
    this.#logger.debug('MyComponent', 'Action triggered');
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

### LoggerService (Angular)

```typescript
class LoggerService {
  // Прямые методы логирования
  public debug(prefix: string, ...args: unknown[]): void;
  public info(prefix: string, ...args: unknown[]): void;
  public warn(prefix: string, ...args: unknown[]): void;
  public error(prefix: string, ...args: unknown[]): void;

  // Создать именованный логгер для модуля
  public createLogger(prefix: string): {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };

  // Конфигурация
  public configure(config: Partial<LoggerConfig>): void;
  public getConfig(): LoggerConfig;
}
```

### logger (Universal)

Те же методы, что и у `LoggerService`, но без Angular DI.

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
import { LoggerService, LogLevel } from '../common';

export class AppComponent {
  readonly #logger = inject(LoggerService);

  constructor() {
    // Показывать только WARNING и ERROR
    this.#logger.configure({
      level: LogLevel.WARN,
    });
  }
}
```

### Отключение timestamp

```typescript
this.#logger.configure({
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
this.#logger.info('AuthService', 'User logged in');
this.#logger.info('AuthService', 'Token refreshed');

// ✅ Рекомендуется
readonly #moduleLogger = this.#logger.createLogger('AuthService');

this.#moduleLogger.info('User logged in');
this.#moduleLogger.info('Token refreshed');
```

### 2. Используйте подходящие уровни

- **DEBUG**: Детальная отладочная информация (отключена в продакшене)
- **INFO**: Общая информация о работе приложения
- **WARN**: Предупреждения, не критичные проблемы
- **ERROR**: Ошибки, требующие внимания

### 3. Readonly для logger

Всегда объявляйте logger как `readonly`:

```typescript
readonly #logger = inject(LoggerService);
// или
readonly #logger = logger.createLogger('ModuleName');
```

### 4. Private fields с # prefix

Следуйте соглашениям проекта:

```typescript
readonly #logger = inject(LoggerService);  // ✅
readonly logger = inject(LoggerService);   // ❌
```

## Замена console.log/console.error

Везде в проекте используйте logger вместо прямых вызовов console:

```typescript
// ❌ Старый способ
console.log('[MyService] Action completed');
console.error('[MyService] Error:', error);

// ✅ Новый способ
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
├── helpers/
│   └── logger.ts              # Универсальная реализация
└── services/
    └── logger.service.ts      # Angular wrapper

src/background/
├── background-service-MV3.ts  # Использует logger напрямую
├── storage-adapter.ts         # Использует logger напрямую
└── user-data-sync-adapter.ts  # Использует logger напрямую
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
