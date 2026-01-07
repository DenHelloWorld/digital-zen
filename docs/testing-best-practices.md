# Testing Guidelines & Best Practices for Digital Zen

## Modern Angular Testing Patterns (Angular 21+)

This document outlines testing best practices for the Digital Zen project, aligned with modern Angular patterns and our coding guidelines.

---

## Table of Contents

1. [Testing Helper Functions](#testing-helper-functions)
2. [Testing Standalone Components](#testing-standalone-components)
3. [Testing with Signals](#testing-with-signals)
4. [Testing with inject()](#testing-with-inject)
5. [Testing Patterns](#testing-patterns)
6. [Code Coverage Goals](#code-coverage-goals)

---

## Testing Helper Functions

### Pattern: Pure Function Testing

Helper functions are pure functions that transform inputs to outputs without side effects. They are the easiest to test.

**Example:**

```typescript
// is-http-url.helper.ts
export const isHttpUrl = (url: string | null | undefined): boolean => {
  if (!url) {
    return false;
  }
  return url.startsWith('http://') || url.startsWith('https://');
};

// is-http-url.helper.spec.ts
import { isHttpUrl } from './is-http-url.helper';

describe('isHttpUrl', () => {
  describe('Valid HTTP/HTTPS URLs', () => {
    it('should return true for http:// URLs', () => {
      expect(isHttpUrl('http://example.com')).toBe(true);
    });

    it('should return true for https:// URLs', () => {
      expect(isHttpUrl('https://example.com')).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    it('should return false for null', () => {
      expect(isHttpUrl(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isHttpUrl(undefined)).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isHttpUrl('')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long URLs', () => {
      const longUrl = 'http://example.com/' + 'a'.repeat(1000);
      expect(isHttpUrl(longUrl)).toBe(true);
    });
  });
});
```

### Testing Checklist for Helpers

- ✅ Test happy path (valid inputs)
- ✅ Test null and undefined
- ✅ Test empty strings and whitespace
- ✅ Test edge cases (very long strings, special characters)
- ✅ Test boundary conditions
- ✅ Test consistency (same input = same output)
- ✅ Test performance (rapid successive calls)

---

## Testing Standalone Components

### Pattern: Modern Component Testing (DZ_01)

Following **DZ_01: Standalone Components**, all components are standalone and use the `imports` array.

**Example:**

```typescript
// my-component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dz-my-component',
  templateUrl: './my-component.html',
  styleUrls: ['./my-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MyComponent {
  title = 'Digital Zen';
}

// my-component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent], // ✅ Standalone component in imports
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toBe('Digital Zen');
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Digital Zen');
  });
});
```

---

## Testing with Signals

### Pattern: Signal State Testing (DZ_04)

Following **DZ_04: Angular Signals for State**, use Signals for reactive state management.

**Example:**

```typescript
// counter.component.ts
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'dz-counter',
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Double: {{ doubleCount() }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `,
  imports: [],
})
export class CounterComponent {
  protected readonly count = signal(0);
  protected readonly doubleCount = computed(() => this.count() * 2);

  increment(): void {
    this.count.update(c => c + 1);
  }
}

// counter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize count to 0', () => {
    expect(component.count()).toBe(0);
  });

  it('should compute double count correctly', () => {
    expect(component.doubleCount()).toBe(0);

    component.count.set(5);
    expect(component.doubleCount()).toBe(10);
  });

  it('should increment count', () => {
    component.increment();
    expect(component.count()).toBe(1);
    expect(component.doubleCount()).toBe(2);
  });

  it('should update UI when count changes', () => {
    component.increment();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Count: 1');
    expect(compiled.textContent).toContain('Double: 2');
  });
});
```

---

## Testing with inject()

### Pattern: Dependency Injection Testing (DZ_02)

Following **DZ_02: Dependency Injection with inject()**, use the `inject()` function instead of constructor injection.

**Example:**

```typescript
// user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly #http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.#http.get<User[]>('/api/users');
  }
}

// user.component.ts
import { Component, inject, signal } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'dz-user-list',
  template: `
    <div>
      @for (user of users(); track user.id) {
        <p>{{ user.name }}</p>
      }
    </div>
  `,
  imports: [],
})
export class UserListComponent {
  readonly #userService = inject(UserService);
  protected readonly users = signal<User[]>([]);

  ngOnInit(): void {
    this.#userService.getUsers().subscribe(users => {
      this.users.set(users);
    });
  }
}

// user.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load users on init', () => {
    const mockUsers = [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' },
    ];

    fixture.detectChanges(); // triggers ngOnInit

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);

    expect(component.users()).toEqual(mockUsers);
  });
});
```

---

## Testing Patterns

### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate total price correctly', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(35);
});
```

### 2. Test Organization

Group related tests using nested `describe` blocks:

```typescript
describe('MyComponent', () => {
  describe('Initialization', () => {
    it('should initialize with default values', () => {});
    it('should load data on init', () => {});
  });

  describe('User interactions', () => {
    it('should handle button click', () => {});
    it('should update form on input', () => {});
  });

  describe('Edge cases', () => {
    it('should handle empty data', () => {});
    it('should handle errors gracefully', () => {});
  });
});
```

### 3. Testing Async Code

Use `fakeAsync` and `tick` for testing async operations:

```typescript
import { fakeAsync, tick } from '@angular/core/testing';

it('should debounce search input', fakeAsync(() => {
  component.searchInput.set('test');

  tick(300); // Simulate 300ms passing

  expect(component.searchResults()).toHaveLength(5);
}));
```

### 4. Testing Error Handling

```typescript
it('should handle HTTP errors gracefully', () => {
  component.loadData();

  const req = httpMock.expectOne('/api/data');
  req.error(new ErrorEvent('Network error'));

  expect(component.error()).toBe('Failed to load data');
  expect(component.isLoading()).toBe(false);
});
```

---

## Code Coverage Goals

### Minimum Coverage Targets

- **Statements:** 80%
- **Branches:** 80%
- **Functions:** 80%
- **Lines:** 80%

### Coverage by File Type

| File Type    | Target | Priority |
| ------------ | ------ | -------- |
| Helpers      | 95%+   | High     |
| Services     | 85%+   | High     |
| Components   | 80%+   | Medium   |
| Guards       | 90%+   | High     |
| Interceptors | 90%+   | High     |
| Utilities    | 95%+   | High     |

### Viewing Coverage

```bash
# Generate coverage report
npm run test:ci

# Open coverage report
open coverage/digital-zen-extension/index.html
```

---

## Anti-Patterns to Avoid

### ❌ Don't use NgModules in tests

```typescript
// ❌ BAD - Using NgModule
TestBed.configureTestingModule({
  declarations: [MyComponent],
  imports: [CommonModule],
});

// ✅ GOOD - Using Standalone Component
TestBed.configureTestingModule({
  imports: [MyComponent],
});
```

### ❌ Don't test implementation details

```typescript
// ❌ BAD - Testing private methods
expect(component['privateMethod']()).toBe(true);

// ✅ GOOD - Testing public behavior
component.publicMethod();
expect(component.result()).toBe(expectedValue);
```

### ❌ Don't write overly complex tests

```typescript
// ❌ BAD - Too complex
it('should do many things', () => {
  // 50 lines of setup
  // Multiple assertions
  // Testing multiple features
});

// ✅ GOOD - Simple and focused
it('should update count on increment', () => {
  component.increment();
  expect(component.count()).toBe(1);
});
```

---

## Quick Reference

### Common Jasmine Matchers

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Comparisons
expect(number).toBeGreaterThan(5);
expect(number).toBeLessThan(10);
expect(number).toBeCloseTo(10.5, 1);

// Strings
expect(string).toContain('substring');
expect(string).toMatch(/pattern/);

// Arrays
expect(array).toContain(item);
expect(array).toEqual([1, 2, 3]);

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrowError(ErrorType);
```

### Angular Testing Utilities

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
```

---

## Conclusion

By following these testing guidelines, you ensure:

- ✅ High code quality and reliability
- ✅ Easier refactoring and maintenance
- ✅ Better documentation through tests
- ✅ Confidence in deployments
- ✅ Alignment with modern Angular best practices

For more details, see [testing-guide.md](./testing-guide.md) and [coding-guidelines.md](./coding-guidelines.md).
