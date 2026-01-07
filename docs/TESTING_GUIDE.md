# Digital Zen Testing Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Best Practices](#best-practices)
6. [Environment Setup](#environment-setup)
7. [Debugging Tests](#debugging-tests)
8. [Code Coverage](#code-coverage)

---

## Quick Start

### Installing Dependencies

```bash
npm install
```

### Running All Tests

```bash
npm test
```

### Running Tests in CI Mode (Headless)

```bash
npm run test:ci
```

---

## Running Tests

### Available Commands

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm test`              | Runs tests in browser with watch mode        |
| `npm run test:ci`       | Runs tests in headless mode with coverage    |
| `npm run test:headless` | Runs tests in headless mode without coverage |

### Build with Tests

By default, tests run before each build:

```bash
# Build with tests (recommended)
npm run build

# Production build with tests
npm run build:prod
```

### Build without Tests

If you need to skip tests (e.g., for quick verification):

```bash
# Build without tests
npm run build:skip-tests

# Production build without tests
npm run build:prod:skip-tests
```

**⚠️ Warning:** Skipping tests is not recommended for production builds. Use this option only for local development.

### Filtering Tests

Running specific tests:

```bash
# Only tests for helpers
npm test -- --include='**/helpers/*.spec.ts'

# Only a specific file
npm test -- --include='**/is-image-icon.helper.spec.ts'
```

---

## Test Structure

### Test Location

Tests are located next to the files they test:

```
src/
  modules/
    common/
      helpers/
        is-image-icon.helper.ts          ← Source file
        is-image-icon.helper.spec.ts     ← Test file
```

### Test Naming

- Test files must end with `.spec.ts`
- Test name should match the source file name
- Example: `my-helper.ts` → `my-helper.spec.ts`

### Test Structure

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

## Writing Tests

### Testing Helper Functions

Helper functions are pure functions that are easy to test:

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

### Testing Angular Components (Standalone)

For Angular 21+ components, use the modern approach with Standalone Components:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent], // Standalone component in imports
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

### Testing with Signals

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

### Testing with Dependency Injection (inject)

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

## Best Practices

### 1. Test Organization

✅ **Good:**

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

❌ **Bad:**

```typescript
describe('myFunction', () => {
  it('test 1', () => {});
  it('test 2', () => {});
  it('test 3', () => {});
});
```

### 2. Test Naming

✅ **Good:**

```typescript
it('should return true for valid HTTP URLs', () => {});
it('should return false for null input', () => {});
it('should handle URLs with query parameters', () => {});
```

❌ **Bad:**

```typescript
it('works', () => {});
it('returns result', () => {});
it('test case 1', () => {});
```

### 3. Test Boundary Cases

```typescript
describe('isHttpUrl', () => {
  // Normal cases
  it('should return true for http:// URLs', () => {});

  // Boundary cases
  it('should return false for null', () => {});
  it('should return false for undefined', () => {});
  it('should return false for empty strings', () => {});
  it('should handle very long URLs', () => {});
  it('should handle special characters', () => {});
});
```

### 4. One Assertion Per Test (When Possible)

✅ **Good:**

```typescript
it('should return true for .png files', () => {
  expect(isImageIcon('image.png')).toBe(true);
});

it('should return true for .jpg files', () => {
  expect(isImageIcon('image.jpg')).toBe(true);
});
```

✅ **Acceptable for Related Checks:**

```typescript
it('should handle international domain names correctly', () => {
  const result = cleanUrlHelper('http://例え.jp/path');
  expect(result).toBe('http://xn--r8jz45g.jp');
  expect(result).toContain('xn--');
});
```

### 5. Use Proper Matchers

```typescript
// For boolean values
expect(value).toBe(true);
expect(value).toBe(false);

// For null/undefined
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// For strings
expect(str).toContain('substring');
expect(str).toMatch(/pattern/);

// For numbers
expect(num).toBeGreaterThan(5);
expect(num).toBeLessThan(10);
expect(num).toBeCloseTo(10.5, 1);

// For arrays
expect(arr).toEqual([1, 2, 3]);
expect(arr).toContain(item);
```

### 6. Test Performance and Consistency

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

## Environment Setup

### Karma Configuration

Karma settings are in the `karma.conf.js` file:

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
    // ... other settings
  });
};
```

### TypeScript Configuration

TypeScript settings for tests in `tsconfig.spec.json`:

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

Test settings in `angular.json`:

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

## Debugging Tests

### Debugging in Browser

1. Run tests in watch mode:

   ```bash
   npm test
   ```

2. Open Chrome DevTools in the Karma window

3. Use `debugger;` in your test:
   ```typescript
   it('should debug this test', () => {
     debugger; // Execution will stop here
     expect(myFunction()).toBe(true);
   });
   ```

### Using fit and fdescribe

```typescript
// Run only this test
fit('should run only this test', () => {
  expect(true).toBe(true);
});

// Run only tests in this block
fdescribe('Only this suite', () => {
  it('test 1', () => {});
  it('test 2', () => {});
});
```

### Skipping Tests

```typescript
// Skip a specific test
xit('should skip this test', () => {
  expect(true).toBe(true);
});

// Skip entire block
xdescribe('Skip this suite', () => {
  it('test 1', () => {});
  it('test 2', () => {});
});
```

---

## Code Coverage

### Generating Coverage Report

```bash
npm run test:ci
```

Report will be saved in `coverage/digital-zen-extension/index.html`

### Viewing Report

```bash
# Open in browser
open coverage/digital-zen-extension/index.html

# Or use Python HTTP server
cd coverage/digital-zen-extension
python3 -m http.server 8080
# Open http://localhost:8080
```

### Configuring Minimum Coverage

Configure in `karma.conf.js`:

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

### Issue: Tests Don't Run

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Chrome Not Found

**Solution:**

```bash
# Use ChromeHeadless
npm run test:headless
```

### Issue: Port Already in Use

**Solution:**
Karma uses port 9876 by default. Change in `karma.conf.js`:

```javascript
port: 9877,
```

### Issue: Test Timeout

**Solution:**
Increase timeout in `karma.conf.js`:

```javascript
browserNoActivityTimeout: 60000,
```

---

## Additional Resources

- [Angular Testing Guide](https://angular.dev/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [Testing Best Practices](https://angular.dev/guide/testing/best-practices)

---

## Checklist for New Tests

- [ ] Test has descriptive name
- [ ] Normal cases are tested
- [ ] Boundary cases are tested (null, undefined, empty strings)
- [ ] Edge cases are tested (very long strings, special characters)
- [ ] Proper matchers are used
- [ ] Tests are independent of each other
- [ ] Tests are organized in logical groups (describe blocks)
- [ ] All tests pass successfully
- [ ] Code coverage is adequate (> 80%)
