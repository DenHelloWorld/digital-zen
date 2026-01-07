# Руководство по тестированию Digital Zen

## Содержание
1. [Быстрый старт](#быстрый-старт)
2. [Запуск тестов](#запуск-тестов)
3. [Структура тестов](#структура-тестов)
4. [Написание тестов](#написание-тестов)
5. [Лучшие практики](#лучшие-практики)
6. [Настройка окружения](#настройка-окружения)
7. [Отладка тестов](#отладка-тестов)
8. [Покрытие кода](#покрытие-кода)

---

## Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск всех тестов
```bash
npm test
```

### Запуск тестов в CI режиме (headless)
```bash
npm run test:ci
```

---

## Запуск тестов

### Доступные команды

| Команда | Описание |
|---------|----------|
| `npm test` | Запускает тесты в браузере с watch режимом |
| `npm run test:ci` | Запускает тесты в headless режиме с coverage |
| `npm run test:headless` | Запускает тесты в headless режиме без coverage |

### Билд с тестами

По умолчанию, тесты запускаются перед каждым билдом:

```bash
# Билд с запуском тестов (рекомендуется)
npm run build

# Билд production с запуском тестов
npm run build:prod
```

### Билд без тестов

Если нужно пропустить тесты (например, для быстрой проверки):

```bash
# Билд без тестов
npm run build:skip-tests

# Production билд без тестов
npm run build:prod:skip-tests
```

**⚠️ Внимание:** Пропуск тестов не рекомендуется для production билдов. Используйте эту опцию только для локальной разработки.

### Фильтрация тестов

Запуск конкретных тестов:

```bash
# Только тесты для helpers
npm test -- --include='**/helpers/*.spec.ts'

# Только конкретный файл
npm test -- --include='**/is-image-icon.helper.spec.ts'
```

---

## Структура тестов

### Расположение тестов

Тесты располагаются рядом с тестируемыми файлами:

```
src/
  modules/
    common/
      helpers/
        is-image-icon.helper.ts          ← Исходный файл
        is-image-icon.helper.spec.ts     ← Тест файл
```

### Именование тестов

- Тестовые файлы должны заканчиваться на `.spec.ts`
- Имя теста должно соответствовать имени тестируемого файла
- Пример: `my-helper.ts` → `my-helper.spec.ts`

### Структура теста

```typescript
import { myFunction } from './my-helper';

describe('myFunction', () => {
  describe('Valid inputs', () => {
    it('should return true for valid input', () => {
      expect(myFunction('valid')).toBe(true);
    });
  });

  describe('Invalid inputs', () => {
    it('should return false for null', () => {
      expect(myFunction(null)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      expect(myFunction('')).toBe(false);
    });
  });
});
```

---

## Написание тестов

### Тестирование Helper функций

Helper функции - это чистые функции, которые легко тестировать:

```typescript
import { isImageIcon } from './is-image-icon.helper';

describe('isImageIcon', () => {
  it('should return true for .png files', () => {
    expect(isImageIcon('https://example.com/favicon.png')).toBe(true);
  });

  it('should return false for null', () => {
    expect(isImageIcon(null)).toBe(false);
  });

  it('should handle query parameters', () => {
    expect(isImageIcon('https://example.com/icon.png?size=32')).toBe(true);
  });
});
```

### Тестирование Angular компонентов (Standalone)

Для компонентов Angular 21+ используйте современный подход с Standalone Components:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent], // Standalone компонент в imports
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Тестирование с Signals

```typescript
import { signal, computed } from '@angular/core';

describe('Signal-based state', () => {
  it('should update computed value when signal changes', () => {
    const count = signal(0);
    const double = computed(() => count() * 2);

    expect(double()).toBe(0);

    count.set(5);
    expect(double()).toBe(10);
  });
});
```

### Тестирование с dependency injection (inject)

```typescript
import { TestBed } from '@angular/core/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService],
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## Лучшие практики

### 1. Организация тестов

✅ **Хорошо:**
```typescript
describe('myFunction', () => {
  describe('Valid inputs', () => {
    it('should handle positive numbers', () => {});
    it('should handle zero', () => {});
  });

  describe('Invalid inputs', () => {
    it('should handle null', () => {});
    it('should handle undefined', () => {});
  });

  describe('Edge cases', () => {
    it('should handle very large numbers', () => {});
  });
});
```

❌ **Плохо:**
```typescript
describe('myFunction', () => {
  it('test 1', () => {});
  it('test 2', () => {});
  it('test 3', () => {});
});
```

### 2. Именование тестов

✅ **Хорошо:**
```typescript
it('should return true for valid HTTP URLs', () => {});
it('should return false for null input', () => {});
it('should handle URLs with query parameters', () => {});
```

❌ **Плохо:**
```typescript
it('works', () => {});
it('returns result', () => {});
it('test case 1', () => {});
```

### 3. Тестируйте граничные случаи

```typescript
describe('isHttpUrl', () => {
  // Обычные случаи
  it('should return true for http:// URLs', () => {});

  // Граничные случаи
  it('should return false for null', () => {});
  it('should return false for undefined', () => {});
  it('should return false for empty strings', () => {});
  it('should handle very long URLs', () => {});
  it('should handle special characters', () => {});
});
```

### 4. Один assert на тест (когда возможно)

✅ **Хорошо:**
```typescript
it('should return true for .png files', () => {
  expect(isImageIcon('image.png')).toBe(true);
});

it('should return true for .jpg files', () => {
  expect(isImageIcon('image.jpg')).toBe(true);
});
```

✅ **Допустимо для связанных проверок:**
```typescript
it('should handle international domain names correctly', () => {
  const result = cleanUrlHelper('http://例え.jp/path');
  expect(result).toBe('http://xn--r8jz45g.jp');
  expect(result).toContain('xn--');
});
```

### 5. Используйте правильные matchers

```typescript
// Для булевых значений
expect(value).toBe(true);
expect(value).toBe(false);

// Для null/undefined
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Для строк
expect(str).toContain('substring');
expect(str).toMatch(/pattern/);

// Для чисел
expect(num).toBeGreaterThan(5);
expect(num).toBeLessThan(10);
expect(num).toBeCloseTo(10.5, 1);

// Для массивов
expect(arr).toEqual([1, 2, 3]);
expect(arr).toContain(item);
```

### 6. Тестируйте производительность и консистентность

```typescript
describe('Performance and consistency', () => {
  it('should return consistent results for the same input', () => {
    const url = 'https://example.com/test.png';
    const result1 = isImageIcon(url);
    const result2 = isImageIcon(url);
    expect(result1).toBe(result2);
  });

  it('should handle rapid successive calls', () => {
    const urls = ['url1.png', 'url2.jpg', 'url3.txt'];
    const results = urls.map(url => isImageIcon(url));
    expect(results).toEqual([true, true, false]);
  });
});
```

---

## Настройка окружения

### Karma Configuration

Настройки Karma находятся в файле `karma.conf.js`:

```javascript
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    // ... остальные настройки
  });
};
```

### TypeScript Configuration

Настройки TypeScript для тестов в `tsconfig.spec.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jasmine"]
  },
  "include": ["src/**/*.ts"]
}
```

### Angular Configuration

Настройки тестов в `angular.json`:

```json
{
  "test": {
    "builder": "@angular/build:karma",
    "options": {
      "tsConfig": "tsconfig.spec.json",
      "inlineStyleLanguage": "scss",
      "assets": [
        {
          "glob": "**/*",
          "input": "public"
        }
      ],
      "styles": ["src/styles.scss"]
    }
  }
}
```

---

## Отладка тестов

### Отладка в браузере

1. Запустите тесты в watch режиме:
   ```bash
   npm test
   ```

2. Откройте Chrome DevTools в окне Karma

3. Используйте `debugger;` в вашем тесте:
   ```typescript
   it('should debug this test', () => {
     debugger; // Выполнение остановится здесь
     expect(myFunction()).toBe(true);
   });
   ```

### Использование fit и fdescribe

```typescript
// Запустит только этот тест
fit('should run only this test', () => {
  expect(true).toBe(true);
});

// Запустит только тесты в этом блоке
fdescribe('Only this suite', () => {
  it('test 1', () => {});
  it('test 2', () => {});
});
```

### Пропуск тестов

```typescript
// Пропустить конкретный тест
xit('should skip this test', () => {
  expect(true).toBe(true);
});

// Пропустить весь блок
xdescribe('Skip this suite', () => {
  it('test 1', () => {});
  it('test 2', () => {});
});
```

---

## Покрытие кода

### Генерация отчёта о покрытии

```bash
npm run test:ci
```

Отчёт будет сохранён в `coverage/digital-zen-extension/index.html`

### Просмотр отчёта

```bash
# Откройте в браузере
open coverage/digital-zen-extension/index.html

# Или используйте Python HTTP server
cd coverage/digital-zen-extension
python3 -m http.server 8080
# Откройте http://localhost:8080
```

### Настройка минимального покрытия

Настройте в `karma.conf.js`:

```javascript
coverageReporter: {
  dir: require('path').join(__dirname, './coverage/digital-zen-extension'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
    { type: 'lcovonly' }
  ],
  check: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
```

---

## Troubleshooting

### Проблема: Тесты не запускаются

**Решение:**
```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Chrome не найден

**Решение:**
```bash
# Используйте ChromeHeadless
npm run test:headless
```

### Проблема: Порт уже используется

**Решение:**
Karma использует порт 9876 по умолчанию. Измените в `karma.conf.js`:
```javascript
port: 9877,
```

### Проблема: Timeout в тестах

**Решение:**
Увеличьте timeout в `karma.conf.js`:
```javascript
browserNoActivityTimeout: 60000,
```

---

## Дополнительные ресурсы

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [Testing Best Practices](https://angular.dev/guide/testing/best-practices)

---

## Контрольный список для новых тестов

- [ ] Тест имеет описательное имя
- [ ] Тестируются обычные случаи
- [ ] Тестируются граничные случаи (null, undefined, пустые строки)
- [ ] Тестируются edge cases (очень длинные строки, специальные символы)
- [ ] Используются правильные matchers
- [ ] Тесты независимы друг от друга
- [ ] Тесты организованы в логические группы (describe блоки)
- [ ] Все тесты проходят успешно
- [ ] Покрытие кода адекватное (> 80%)
