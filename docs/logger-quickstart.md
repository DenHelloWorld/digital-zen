# Universal Logger - Quick Start

## Быстрый старт

### В любом месте проекта (Angular или Background)

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

## Основные принципы

1. **Один универсальный logger** - работает везде одинаково
2. **Используйте `createLogger()`** - создайте именованный logger для вашего модуля
3. **Всегда readonly** - `readonly #logger = logger.createLogger('Name')`
4. **Private с #** - следуйте стандартам проекта

## Примеры использования

### Angular Component
```typescript
import { Component } from '@angular/core';
import { logger } from '../common';

@Component({
  selector: 'dz-my-component',
  template: '...',
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

## API Референс

```typescript
// Создать именованный logger (рекомендуется)
const myLogger = logger.createLogger('MyModule');
myLogger.debug('Debug message');
myLogger.info('Info message');
myLogger.warn('Warning message');
myLogger.error('Error message', errorObject);

// Прямое использование с префиксом
logger.info('MyModule', 'Direct info message');

// Конфигурация
logger.configure({
  level: LogLevel.WARN,      // Показывать только WARN и ERROR
  enableTimestamp: false,    // Отключить timestamps
});
```

## Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,  // Отладочная информация
  INFO = 1,   // Общая информация
  WARN = 2,   // Предупреждения
  ERROR = 3,  // Ошибки
  NONE = 4,   // Отключить все логи
}
```

## Полная документация

См. [docs/logger.md](./logger.md) для подробной документации.

## Checklist для использования

- [ ] Импортировать `logger` из `../common`
- [ ] Создать `readonly #logger = logger.createLogger('ModuleName')`
- [ ] Использовать `this.#logger.info()`, `this.#logger.error()`, etc.
- [ ] НЕ использовать `console.log()` или `console.error()`
- [ ] Название модуля в CamelCase (e.g., 'AuthService', 'BackgroundService')
