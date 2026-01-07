# Digital Zen - Coding Guidelines

This document describes all coding patterns, conventions, and best practices used in the Digital Zen Chrome Extension project. These guidelines reflect the actual implementation in the codebase and serve as a reference for all development work.

**Primary Source:** We follow official Angular documentation for standard patterns. Custom guidelines (DZ_10-DZ_16) are project-specific conventions.

**Version:** 1.0.1  
**Last Updated:** January 6, 2026

---

## Quick Links to Official Angular Documentation

- **[Angular Official Documentation](https://angular.dev/)** - Main documentation
- **[Standalone Components](https://angular.dev/guide/components/importing)** - Official guide for standalone components
- **[Dependency Injection](https://angular.dev/guide/di/dependency-injection)** - Official DI guide
- **[Signals](https://angular.dev/guide/signals)** - Official Signals guide
- **[Built-in Control Flow](https://angular.dev/guide/templates/control-flow)** - Official control flow syntax guide
- **[Change Detection](https://angular.dev/best-practices/skipping-subtrees)** - Official OnPush strategy guide
- **[Reactive Forms](https://angular.dev/guide/forms/typed-forms)** - Official typed forms guide

---

## Table of Contents

1. [Angular Patterns](#angular-patterns)
   - [DZ_01: Standalone Components](#dz_01-standalone-components)
   - [DZ_02: Dependency Injection with inject()](#dz_02-dependency-injection-with-inject)
   - [DZ_03: Change Detection Strategy OnPush](#dz_03-change-detection-strategy-onpush)
2. [Reactivity & State Management](#reactivity--state-management)
   - [DZ_04: Angular Signals for State](#dz_04-angular-signals-for-state)
   - [DZ_05: RxJS Usage Guidelines](#dz_05-rxjs-usage-guidelines)
3. [Template Syntax](#template-syntax)
   - [DZ_06: Built-in Control Flow](#dz_06-built-in-control-flow)
4. [TypeScript Conventions](#typescript-conventions)
   - [DZ_07: Strict TypeScript Mode](#dz_07-strict-typescript-mode)
   - [DZ_08: Private Fields with # Prefix](#dz_08-private-fields-with--prefix)
   - [DZ_09: Readonly for Injected Dependencies](#dz_09-readonly-for-injected-dependencies)
5. [UI Text Management](#ui-text-management)
   - [DZ_10: UI Text Constants](#dz_10-ui-text-constants)
6. [Logging](#logging)
   - [DZ_11: Universal Logger Usage](#dz_11-universal-logger-usage)
7. [Styling](#styling)
   - [DZ_12: SCSS and BEM Naming Convention](#dz_12-scss-and-bem-naming-convention)
8. [HTTP & API](#http--api)
   - [DZ_13: Functional HTTP Interceptors](#dz_13-functional-http-interceptors)
9. [Routing & Guards](#routing--guards)
   - [DZ_14: Functional Guards](#dz_14-functional-guards)
10. [Forms](#forms)
    - [DZ_15: Typed Reactive Forms](#dz_15-typed-reactive-forms)
    - [DZ_16: Custom Validators](#dz_16-custom-validators)

---

## Angular Patterns

### DZ_01: Standalone Components

**Guideline:** Always use Standalone Components (Angular 21+ feature). Never use NgModules.

**Official Documentation:** [Angular Standalone Components](https://angular.dev/guide/components/importing)

**Rationale:** Standalone components are the modern Angular approach, providing better tree-shaking, simpler dependencies, and improved developer experience.

**Implementation:**

```typescript
@Component({
  selector: 'dz-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, OtherComponent, SomeDirective],
})
export class ExampleComponent {
  // Component implementation
}
```

**Key Points:**

- ✅ Include `imports` array in `@Component` decorator
- ✅ Import all dependencies directly in the component
- ❌ Do NOT create or use NgModules
- ❌ Do NOT use `declarations`, `providers` at module level

**See Also:** [DZ_03](#dz_03-change-detection-strategy-onpush)

---

### DZ_02: Dependency Injection with inject()

**Guideline:** Use the `inject()` function for dependency injection. Never use constructor-based injection.

**Official Documentation:** [Angular Dependency Injection](https://angular.dev/guide/di/dependency-injection) and [inject() function](https://angular.dev/api/core/inject)

**Rationale:** The `inject()` function is the modern Angular approach that allows for more flexible and testable code. It works better with functional programming patterns and allows dependency injection outside of constructors.

**Implementation:**

```typescript
import { Component, inject } from '@angular/core';
import { SomeService } from './some.service';

@Component({
  selector: 'dz-example',
  // ...
})
export class ExampleComponent {
  readonly #someService = inject(SomeService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  // Component logic using injected dependencies
  ngOnInit(): void {
    this.#someService.doSomething();
  }
}
```

**Key Points:**

- ✅ Use `inject()` function from `@angular/core`
- ✅ Declare injected dependencies as class fields
- ✅ Combine with [DZ_08](#dz_08-private-fields-with--prefix) (private # prefix)
- ✅ Combine with [DZ_09](#dz_09-readonly-for-injected-dependencies) (readonly modifier)
- ❌ Do NOT use constructor injection: `constructor(private service: Service) {}`

**See Also:** [DZ_08](#dz_08-private-fields-with--prefix), [DZ_09](#dz_09-readonly-for-injected-dependencies)

---

### DZ_03: Change Detection Strategy OnPush

**Guideline:** Always use `ChangeDetectionStrategy.OnPush` for all components.

**Official Documentation:** [Angular Change Detection](https://angular.dev/best-practices/skipping-subtrees) and [OnPush Strategy](https://angular.dev/api/core/ChangeDetectionStrategy)

**Rationale:** OnPush change detection improves performance by reducing unnecessary change detection cycles. It works well with immutable data patterns and Angular Signals.

**Implementation:**

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dz-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    /* ... */
  ],
})
export class ExampleComponent {
  // Component implementation
}
```

**Key Points:**

- ✅ Set `changeDetection: ChangeDetectionStrategy.OnPush` in every component
- ✅ Works seamlessly with Signals (automatic change detection)
- ✅ Use with immutable data patterns
- ❌ Do NOT use default change detection strategy

**See Also:** [DZ_01](#dz_01-standalone-components), [DZ_04](#dz_04-angular-signals-for-state)

---

## Reactivity & State Management

### DZ_04: Angular Signals for State

**Guideline:** Use Angular Signals as the primary state management solution. Prefer Signals over RxJS for local and shared state.

**Official Documentation:** [Angular Signals](https://angular.dev/guide/signals) and [Signals API Reference](https://angular.dev/api/core/signal)

**Rationale:** Signals provide a simpler, more intuitive API for reactive state management with better performance and automatic change detection integration.

**Implementation:**

```typescript
import { Component, signal, computed, Signal, WritableSignal } from '@angular/core';

export class ExampleComponent {
  // Writable signal
  protected readonly count: WritableSignal<number> = signal(0);

  // Computed signal (derived state)
  protected readonly doubleCount: Signal<number> = computed(() => this.count() * 2);

  // Readonly signal from service
  protected readonly theme: Signal<ColorSchemaType> = this.#themeService.theme;

  increment(): void {
    this.count.update(value => value + 1);
  }
}
```

**Key Points:**

- ✅ Use `signal()` for writable state
- ✅ Use `computed()` for derived state
- ✅ Use `Signal<T>` type for readonly signals
- ✅ Use `WritableSignal<T>` type for mutable signals
- ✅ Update signals with `.set()` or `.update()`
- ✅ Read signals by calling them as functions: `count()`
- ❌ Do NOT use RxJS BehaviorSubject for simple state

**See Also:** [DZ_05](#dz_05-rxjs-usage-guidelines)

---

### DZ_05: RxJS Usage Guidelines

**Guideline:** Use RxJS only for specific use cases: HTTP requests, complex asynchronous streams, and event handling requiring operators like `debounceTime`, `switchMap`, etc.

**Official Documentation:** [RxJS in Angular](https://angular.dev/guide/rx) and [RxJS Official Docs](https://rxjs.dev/)

**Rationale:** While RxJS is powerful, Signals provide a simpler solution for most state management needs. RxJS should be reserved for cases where its stream operators provide clear benefits.

**Valid RxJS Use Cases:**

1. **HTTP Requests**

```typescript
export class DataService {
  readonly #http = inject(HttpClient);
  readonly #destroyRef = inject(DestroyRef);

  loadData(): void {
    this.#http
      .get<DataType>('/api/data')
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(data => {
        // Update signal or perform action
      });
  }
}
```

2. **Complex Event Streams**

```typescript
fromEvent(element, 'input')
  .pipe(
    debounceTime(300),
    map(event => (event.target as HTMLInputElement).value),
    distinctUntilChanged(),
    switchMap(query => this.searchService.search(query))
  )
  .subscribe(results => {
    // Handle results
  });
```

**Key Points:**

- ✅ Use RxJS for HTTP requests
- ✅ Use RxJS when you need operators like `debounceTime`, `switchMap`, `combineLatest`
- ✅ Always use `takeUntilDestroyed(this.#destroyRef)` for automatic unsubscription
- ❌ Do NOT use RxJS BehaviorSubject/Subject for simple state (use Signals instead)
- ❌ Do NOT use RxJS when a simple Signal would suffice

**See Also:** [DZ_04](#dz_04-angular-signals-for-state)

---

## Template Syntax

### DZ_06: Built-in Control Flow

**Guideline:** Always use Angular's new built-in control flow syntax (`@if`, `@for`, `@switch`, `@defer`). Never use legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).

**Official Documentation:** [Angular Built-in Control Flow](https://angular.dev/guide/templates/control-flow)

**Rationale:** The new control flow syntax is more performant, type-safe, and easier to read. It's the recommended approach in Angular 17+.

**Implementation:**

**Conditional Rendering:**

```html
@if (isLoggedIn()) {
<p>Welcome back, {{ userName() }}!</p>
} @else {
<p>Please log in</p>
}
```

**List Rendering:**

```html
@for (item of items(); track item.id) {
<div class="dz-item">{{ item.name }}</div>
} @empty {
<p>No items found</p>
}
```

**Switch Statement:**

```html
@switch (status()) { @case ('loading') {
<dz-loader />
} @case ('success') {
<p>Success!</p>
} @case ('error') {
<p>Error occurred</p>
} @default {
<p>Unknown status</p>
} }
```

**Lazy Loading:**

```html
@defer {
<dz-heavy-component />
}
```

**Key Points:**

- ✅ Use `@if` / `@else` for conditionals
- ✅ Use `@for` with `track` for lists
- ✅ Use `@empty` block for empty lists
- ✅ Use `@switch` / `@case` / `@default` for switch statements
- ✅ Use `@defer` for lazy loading
- ❌ Do NOT use `*ngIf`, `*ngFor`, `*ngSwitch` (legacy)

---

## TypeScript Conventions

### DZ_07: Strict TypeScript Mode

**Guideline:** Use strict TypeScript mode. Avoid `any` type. Prefer `unknown` if the type is truly unknown.

**Official Documentation:** [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict) and [Angular TypeScript Configuration](https://angular.dev/reference/configs/file-structure#typescript-configuration)

**Rationale:** Strict typing catches errors at compile time and improves code quality and maintainability.

**Implementation:**

```typescript
// ✅ Good: Explicit typing
function processData(data: UserData): ProcessedResult {
  return {
    /* ... */
  };
}

// ✅ Good: Use unknown for truly unknown types
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ Bad: Using any
function processData(data: any): any {
  return data;
}
```

**Key Points:**

- ✅ Always define explicit types
- ✅ Use interfaces or types for complex structures
- ✅ Use `unknown` instead of `any` when type is unknown
- ✅ Enable strict mode in `tsconfig.json`
- ❌ Do NOT use `any` type
- ❌ Do NOT use `@ts-ignore` or `@ts-expect-error` unless absolutely necessary

---

### DZ_08: Private Fields with # Prefix

**Guideline:** Use native JavaScript private fields with `#` prefix for all private class members.

**Official Documentation:** [JavaScript Private Fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties) and [TypeScript Private Fields](https://www.typescriptlang.org/docs/handbook/2/classes.html#private)

**Rationale:** Native private fields provide true privacy at runtime and better encapsulation compared to TypeScript's `private` keyword.

**Implementation:**

```typescript
export class ExampleComponent {
  // ✅ Good: Private field with # prefix
  readonly #someService = inject(SomeService);
  readonly #logger = logger.createLogger('ExampleComponent');

  #privateMethod(): void {
    // Private logic
  }
}
```

**Key Points:**

- ✅ Use `#` prefix for all private fields and methods
- ✅ Combine with `readonly` for immutable fields
- ✅ Use `protected` for fields accessed in templates
- ❌ Do NOT use TypeScript `private` keyword
- ❌ Do NOT make injected services public unless necessary

**See Also:** [DZ_09](#dz_09-readonly-for-injected-dependencies)

---

### DZ_09: Readonly for Injected Dependencies

**Guideline:** Mark all injected dependencies as `readonly`.

**Rationale:** Injected dependencies should not be reassigned after initialization, making them good candidates for `readonly`.

**Implementation:**

```typescript
export class ExampleComponent {
  readonly #themeService = inject(ThemeService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  // Component logic
}
```

**Key Points:**

- ✅ Always use `readonly` with injected dependencies
- ✅ Combine with [DZ_08](#dz_08-private-fields-with--prefix) private `#` prefix
- ❌ Do NOT reassign injected dependencies

**See Also:** [DZ_02](#dz_02-dependency-injection-with-inject), [DZ_08](#dz_08-private-fields-with--prefix)

---

## UI Text Management

### DZ_10: UI Text Constants

**Guideline:** All user-facing text strings must be extracted to the `UI_TEXT` constant in `src/modules/common/constants/ui-text.const.ts`. No hardcoded strings in templates or components.

**Rationale:** Centralizing UI text makes the application i18n-ready and ensures consistency across the application.

**Implementation:**

**1. Add text to UI_TEXT constant:**

```typescript
// src/modules/common/constants/ui-text.const.ts
export const UI_TEXT = Object.freeze({
  MY_FEATURE: {
    BUTTON_SAVE: 'Save',
    BUTTON_CANCEL: 'Cancel',
    ERROR_MESSAGE: 'An error occurred',
    ARIA_LABELS: {
      CLOSE_DIALOG: 'Close dialog',
    },
  },
});
```

**2. Use in component:**

```typescript
export class MyComponent {
  protected readonly uiText = UI_TEXT;
}
```

**3. Use in template:**

```html
<button>{{ uiText.MY_FEATURE.BUTTON_SAVE }}</button>
<input [placeholder]="uiText.MY_FEATURE.PLACEHOLDER" />
<button [attr.aria-label]="uiText.MY_FEATURE.ARIA_LABELS.CLOSE_DIALOG">×</button>
```

**Key Points:**

- ✅ Extract ALL user-facing text to UI_TEXT
- ✅ Organize by feature/component
- ✅ Include labels, buttons, placeholders, errors, ARIA labels
- ✅ Use property binding `[title]="uiText.X"` not attribute `title="text"`
- ✅ Access via `protected readonly uiText = UI_TEXT` in component
- ❌ Do NOT hardcode strings in templates
- ❌ Do NOT hardcode strings in components

**File Location:** `src/modules/common/constants/ui-text.const.ts`

---

## Logging

### DZ_11: Universal Logger Usage

**Guideline:** Use the universal logger (`logger`) for all logging. Never use `console.log()`, `console.error()`, etc.

**Rationale:** The universal logger works in both Angular and Chrome Extension background contexts, provides structured logging with module prefixes, and supports configurable log levels.

**Implementation:**

```typescript
import { logger } from '../common';

export class ExampleService {
  readonly #logger = logger.createLogger('ExampleService');

  doSomething(): void {
    this.#logger.info('Starting operation...');

    try {
      // Logic
      this.#logger.debug('Debug details:', { data: 123 });
    } catch (error) {
      this.#logger.error('Operation failed:', error);
    }
  }
}
```

**Key Points:**

- ✅ Use `logger.createLogger('ModuleName')` to create a named logger
- ✅ Store logger as `readonly #logger`
- ✅ Use appropriate log levels: `debug`, `info`, `warn`, `error`
- ✅ Use CamelCase for module names: 'AuthService', 'BackgroundService'
- ❌ Do NOT use `console.log()`, `console.error()`, etc.
- ❌ Do NOT use logger without a module name prefix

**Documentation:** See `/docs/logger.md` and `/docs/logger-quickstart.md`

**File Location:** `src/modules/common/helpers/logger.ts`

---

## Styling

### DZ_12: SCSS and BEM Naming Convention

**Guideline:** Use SCSS for all styles. Follow BEM (Block Element Modifier) naming convention with `dz-` prefix.

**Rationale:** BEM provides a clear, predictable naming structure. The `dz-` prefix prevents naming conflicts with other libraries.

**Implementation:**

```scss
// Component: period.component.scss
.dz-period {
  display: flex;

  &__header {
    font-weight: bold;
  }

  &__content {
    padding: 1rem;
  }

  &--active {
    background-color: var(--color-primary);
  }

  &--disabled {
    opacity: 0.5;
  }
}
```

```html
<div class="dz-period dz-period--active">
  <div class="dz-period__header">Title</div>
  <div class="dz-period__content">Content</div>
</div>
```

**BEM Structure:**

- **Block:** `.dz-period` (component root)
- **Element:** `.dz-period__header` (child element)
- **Modifier:** `.dz-period--active` (variant/state)

**Key Points:**

- ✅ Use SCSS for all component styles
- ✅ Prefix all classes with `dz-`
- ✅ Follow BEM naming: `block__element--modifier`
- ✅ Use CSS custom properties for theming
- ✅ Keep styles scoped to component files
- ❌ Do NOT use inline styles in templates
- ❌ Do NOT use random class names without BEM structure

---

## HTTP & API

### DZ_13: Functional HTTP Interceptors

**Guideline:** Use functional interceptors (`HttpInterceptorFn`) instead of class-based interceptors.

**Official Documentation:** [Angular HTTP Interceptors](https://angular.dev/guide/http/interceptors)

**Rationale:** Functional interceptors are simpler, more testable, and align with Angular's modern functional approach.

**Implementation:**

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
```

**Providing the interceptor:**

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
};
```

**Key Points:**

- ✅ Use `HttpInterceptorFn` type
- ✅ Use `inject()` for dependency injection
- ✅ Return `next(req)` or modified request
- ❌ Do NOT use class-based interceptors with `HttpInterceptor` interface

**Example:** `src/modules/common/interceptors/api-key.interceptor.ts`

---

## Routing & Guards

### DZ_14: Functional Guards

**Guideline:** Use functional guards (`CanActivateFn`, etc.) instead of class-based guards.

**Official Documentation:** [Angular Route Guards](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access)

**Rationale:** Functional guards are simpler, more composable, and align with Angular's modern functional approach.

**Implementation:**

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

**Using the guard:**

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
];
```

**Key Points:**

- ✅ Use functional guard types: `CanActivateFn`, `CanActivateChildFn`, etc.
- ✅ Use `inject()` for dependency injection
- ✅ Return `boolean`, `UrlTree`, or Observable/Promise of these
- ❌ Do NOT use class-based guards with `CanActivate` interface

---

## Forms

### DZ_15: Typed Reactive Forms

**Guideline:** Use typed Reactive Forms with explicit type annotations.

**Official Documentation:** [Angular Typed Forms](https://angular.dev/guide/forms/typed-forms)

**Rationale:** Typed forms provide type safety and better IDE support, catching errors at compile time.

**Implementation:**

```typescript
import { FormControl, FormGroup } from '@angular/forms';

export class UserFormComponent {
  readonly #fb = inject(FormBuilder);

  form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true }),
    email: new FormControl<string>('', { nonNullable: true }),
    age: new FormControl<number | null>(null),
  });

  // Or using FormBuilder
  form2 = this.#fb.group({
    name: this.#fb.control<string>('', { nonNullable: true }),
    email: this.#fb.control<string>('', { nonNullable: true }),
  });
}
```

**Key Points:**

- ✅ Use explicit type parameters: `FormControl<string>`
- ✅ Use `{ nonNullable: true }` for required fields
- ✅ Use `FormControl<Type | null>` for optional fields
- ❌ Do NOT use untyped forms
- ❌ Do NOT use `any` for form types

---

### DZ_16: Custom Validators

**Guideline:** Create reusable, well-typed custom validators for common validation logic.

**Official Documentation:** [Angular Form Validation](https://angular.dev/guide/forms/form-validation) and [Custom Validators](https://angular.dev/guide/forms/form-validation#defining-custom-validators)

**Rationale:** Custom validators promote code reuse and maintain type safety.

**Implementation:**

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator that checks if a string value is not empty or contains only whitespace.
 * @guideline DZ_16
 * @see /docs/CODING_GUIDELINES.md#dz_16-custom-validators
 */
export function requiredTrimmedValidator(control: AbstractControl): ValidationErrors | null {
  const value: typeof control.value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { required: true };
  }
  return null;
}
```

**Key Points:**

- ✅ Use `AbstractControl` for parameter type
- ✅ Return `ValidationErrors | null`
- ✅ Add JSDoc with guideline reference
- ✅ Create factory functions for parameterized validators
- ✅ Make validators pure functions

**Examples:** `src/modules/common/validators/`

---

## Summary

This document covers all major coding patterns used in Digital Zen:

**Standard Angular Patterns (DZ_01-DZ_09, DZ_13-DZ_16):**

- Follow official Angular documentation as primary source
- See links to official docs at the top of this document

**Project-Specific Conventions (DZ_10-DZ_12):**

- UI Text Management (DZ_10) - Digital Zen specific
- Universal Logger (DZ_11) - Digital Zen specific
- BEM with dz- prefix (DZ_12) - Digital Zen specific

### When writing code:

1. **Reference official Angular docs** for standard patterns (Components, Signals, Forms, etc.)
2. **Follow project-specific guidelines** (DZ_10-DZ_12) for UI text, logging, and styling
3. **Add JSDoc comments** with guideline references (e.g., `@guideline DZ_01, DZ_04`)
4. **Keep documentation synchronized** with actual code implementation

### Quick Reference for JSDoc

```typescript
/**
 * Component description
 *
 * @guidelines
 * - DZ_01: Standalone component - https://angular.dev/guide/components/importing
 * - DZ_03: OnPush change detection - https://angular.dev/best-practices/skipping-subtrees
 * - DZ_04: Angular Signals - https://angular.dev/guide/signals
 * - DZ_10: UI text constants (project-specific)
 *
 * @see /docs/CODING_GUIDELINES.md
 * @see https://angular.dev/ (official docs)
 */
```

---

**Last Updated:** January 6, 2026  
**Maintained by:** Digital Zen Development Team  
**Primary Source:** [Angular Official Documentation](https://angular.dev/)
