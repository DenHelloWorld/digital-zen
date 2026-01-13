# Digital Zen - Coding Guidelines

This document describes all coding patterns, conventions, and best practices used in the Digital Zen Chrome Extension project. These guidelines reflect the actual implementation in the codebase and serve as a reference for all development work.

**Primary Source:** We follow official Angular documentation for standard patterns. Custom guidelines (DZ_10-DZ_12, DZ_18-DZ_20) are project-specific conventions.

**Version:** 1.1.0  
**Last Updated:** January 13, 2026

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

0. [⚠️ Important: Angular Future Changes and Project Strategy](#️-important-angular-future-changes-and-project-strategy)
   - [Angular Component Structure Changes (2025+)](#angular-component-structure-changes-2025)
   - [Project Strategy: Template Fragments Over Components](#project-strategy-template-fragments-over-components)
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
6. [Icon Management](#icon-management)
   - [DZ_10.1: Icon Constants](#dz_101-icon-constants)
7. [Logging](#logging)
   - [DZ_11: Universal Logger Usage](#dz_11-universal-logger-usage)
8. [Styling](#styling)
   - [DZ_12: SCSS and BEM Naming Convention](#dz_12-scss-and-bem-naming-convention)
9. [HTTP & API](#http--api)
   - [DZ_13: Functional HTTP Interceptors](#dz_13-functional-http-interceptors)
10. [Routing & Guards](#routing--guards)

- [DZ_14: Functional Guards](#dz_14-functional-guards)

11. [Forms](#forms)
    - [DZ_15: Typed Reactive Forms](#dz_15-typed-reactive-forms)
    - [DZ_16: Custom Validators](#dz_16-custom-validators)
12. [Testing](#testing)
    - [DZ_17: Testing Guidelines](#dz_17-testing-guidelines)
13. [Component Organization](#component-organization)
    - [DZ_18: Organized Imports with Comment Markers](#dz_18-organized-imports-with-comment-markers)
    - [DZ_19: Import Organization with Barrel Exports](#dz_19-import-organization-with-barrel-exports)
14. [UI Components](#ui-components)
    - [DZ_20: Banner Styles for Messages](#dz_20-banner-styles-for-messages)
    - [DZ_21: Template Fragments for Code Reuse](#dz_21-template-fragments-for-code-reuse)

---

## ⚠️ Important: Angular Future Changes and Project Strategy

### Angular Component Structure Changes (2025+)

The Angular team has announced significant changes to component structure planned for 2025 and beyond:

#### Selectorless Components (Expected in Angular v20+)

The Angular team is developing **"selectorless components"** - a major change that will allow developers to use component class names directly in templates instead of selector strings.

**Current approach:**
```typescript
@Component({
  selector: 'app-alert',
  template: '<p>Alert!</p>',
})
```
Template: `<app-alert />`

**Future selectorless approach:**
```typescript
import { AlertComponent } from './alert.component';
@Component({
  template: '<AlertComponent />'
})
```

**Benefits:**
- Reduces boilerplate (no need to maintain selectors)
- Improves build performance (single-file compilation)
- Better tooling support
- Smaller bundles (no selector matching at runtime)

**Status:** Experimental feature in development, RFC expected in 2025, broader release in Angular v20+.

**Official References:**
- [Angular Roadmap](https://angular.dev/roadmap)
- [Selectorless Components Explanation (GitHub Gist)](https://gist.github.com/mgechev/1cba27ab086c567e0a29615430c99479)
- [Angular 2025 Vision](https://ipnet-ee.com/news/angular-team-reveals-2025-vision-focused-usability-innovation/)

### Project Strategy: Template Fragments Over Components

**Decision:** For code reuse in templates, we prefer using **ng-template fragments** over creating separate components.

**Rationale:**
1. **Future-proofing:** Avoids creating components that may need restructuring when selectorless components become standard
2. **Simplicity:** Template fragments are lightweight and avoid component overhead for simple reuse
3. **Flexibility:** Easier to refactor when Angular's component model stabilizes
4. **Performance:** No additional change detection overhead for simple template reuse

**When to use Template Fragments:**
- ✅ Repeated SVG icon patterns
- ✅ Repeated UI elements within same component (buttons, banners, etc.)
- ✅ Simple template snippets that don't require complex logic
- ✅ Code that appears multiple times in a single template

**When to use Components:**
- ✅ Complex reusable UI with its own state and logic
- ✅ Features that need to be shared across multiple parent components
- ✅ Elements that require lifecycle hooks
- ✅ Code that benefits from OnPush change detection isolation

**Example of Template Fragment (DZ_21):**

```html
<!-- Template fragment for icon -->
<ng-template #icon let-iconHref="href">
  <svg class="dz-icon" aria-hidden="true" focusable="false">
    <use [attr.href]="iconHref"></use>
  </svg>
</ng-template>

<!-- Usage -->
<ng-container *ngTemplateOutlet="icon; context: { href: icons.DELETE }"></ng-container>
```

**Note:** This strategy may be revised once Angular v20+ selectorless components are stable and their final implementation is clear.

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
  imports: [
    // angular modules
    CommonModule,
    // components
    OtherComponent,
    // directives
    SomeDirective,
  ],
})
export class ExampleComponent {
  // Component implementation
}
```

**Key Points:**

- ✅ Include `imports` array in `@Component` decorator
- ✅ Organize imports with comment markers (see [DZ_18](#dz_18-organized-imports-with-comment-markers))
- ✅ Import all dependencies directly in the component
- ❌ Do NOT create or use NgModules
- ❌ Do NOT use `declarations`, `providers` at module level

**See Also:** [DZ_03](#dz_03-change-detection-strategy-onpush), [DZ_18](#dz_18-organized-imports-with-comment-markers)

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

## Icon Management

### DZ_10.1: Icon Constants

**Guideline:** All icon identifiers must be extracted to the `ICONS` constant in `src/modules/common/constants/icons.const.ts`. No hardcoded icon references in templates or components.

**Rationale:** Centralizing icon identifiers prevents hardcoded strings, ensures type safety, and makes it easy to refactor or reorganize icons across the entire codebase.

**Implementation:**

**1. Icons are defined in the ICONS constant:**

```typescript
// src/modules/common/constants/icons.const.ts
export const ICONS = Object.freeze({
  PLUS: '#icon-plus',
  DELETE: '#icon-delete',
  EDIT: '#icon-edit',
  // ... all other icons
} as const);

export type IconType = (typeof ICONS)[keyof typeof ICONS];
```

**2. Use in component:**

```typescript
export class ExampleComponent {
  protected readonly icons = ICONS;
}
```

**3. Use in template:**

```html
<svg class="dz-icon" aria-hidden="true" focusable="false">
  <use [attr.href]="icons.PLUS"></use>
</svg>
```

**Key Points:**

- ✅ Use `ICONS` constant for all icon references
- ✅ Access via `protected readonly icons = ICONS` in component
- ✅ Icons are strongly typed via `IconType`
- ✅ All icons are SVG symbols defined in `index.html`
- ❌ Do NOT hardcode icon IDs like `#icon-plus` in templates
- ❌ Do NOT use string literals for icon references

**Benefits:**

- **Type Safety:** Icons are strongly typed and autocomplete-friendly
- **Refactoring:** Easy to rename or reorganize icons across the entire codebase
- **Consistency:** Prevents typos and ensures all icons reference valid SVG symbols
- **Discoverability:** All available icons are visible in one location

**File Location:** `src/modules/common/constants/icons.const.ts`

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
 * @see /docs/coding-guidelines.md#dz_16-custom-validators
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

## Testing

### DZ_17: Testing Guidelines

**Guideline:** Write comprehensive tests for all code following modern Angular testing patterns. All tests should be thorough, well-organized, and follow best practices.

**Official Documentation:** [Angular Testing Guide](https://angular.dev/guide/testing)

**Rationale:** Comprehensive testing ensures code quality, prevents regressions, improves maintainability, and enables confident refactoring.

---

#### General Testing Principles

**1. AAA Pattern (Arrange, Act, Assert)**

Every test should follow this structure:

```typescript
it('should validate correctly', () => {
  // Arrange - Set up test data and dependencies
  const validator = myValidator();
  const control = new FormControl('test');

  // Act - Execute the code under test
  const result = validator(control);

  // Assert - Verify the result
  expect(result).toBeNull();
});
```

**2. Test Organization**

Use nested `describe` blocks to group related tests logically:

```typescript
describe('MyComponent/Function/Service', () => {
  describe('Feature/Method A', () => {
    describe('Valid inputs', () => {
      it('should handle case 1', () => {});
      it('should handle case 2', () => {});
    });

    describe('Invalid inputs', () => {
      it('should handle error 1', () => {});
      it('should handle error 2', () => {});
    });

    describe('Edge cases', () => {
      it('should handle boundary condition', () => {});
    });
  });

  describe('Feature/Method B', () => {
    // Similar structure
  });
});
```

**3. Descriptive Test Names**

Use clear, behavior-focused test names with "should..." pattern:

✅ **Good:**

```typescript
it('should return error when start time equals end time', () => {});
it('should return null for valid non-empty string', () => {});
it('should transform URL to origin by removing path', () => {});
```

❌ **Bad:**

```typescript
it('test 1', () => {});
it('works', () => {});
it('validator test', () => {});
```

**4. Test Independence**

Each test should:

- Set up its own data
- Not depend on execution order
- Not share state with other tests
- Clean up after itself if needed

**5. Comprehensive Coverage**

Always test:

- ✅ **Valid inputs** - Expected behavior with correct data
- ✅ **Invalid inputs** - Error handling and validation
- ✅ **Null/undefined** - How code handles missing values
- ✅ **Edge cases** - Boundary conditions, empty strings, whitespace
- ✅ **Performance** - Consistent results for same input
- ✅ **Integration** - Works with other components/services

---

#### Testing Different Code Types

**Testing Pure Functions (Helpers, Utilities)**

Easiest to test - no dependencies, predictable output:

```typescript
describe('myHelper', () => {
  describe('Valid inputs', () => {
    it('should return expected result', () => {
      expect(myHelper('input')).toBe('expected');
    });
  });

  describe('Invalid inputs', () => {
    it('should return null for null input', () => {
      expect(myHelper(null)).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(myHelper('')).toBe('');
    });
  });
});
```

**Testing Validators**

Following DZ_16, validators are pure functions:

```typescript
describe('myValidator', () => {
  describe('Valid values', () => {
    it('should return null for valid input', () => {
      const control = new FormControl('valid');
      expect(myValidator(control)).toBeNull();
    });
  });

  describe('Invalid values', () => {
    it('should return error for invalid input', () => {
      const control = new FormControl('invalid');
      expect(myValidator(control)).toEqual({ errorKey: true });
    });
  });

  // If factory validator
  describe('Factory behavior', () => {
    it('should create independent instances', () => {
      const validator1 = myValidator(param1);
      const validator2 = myValidator(param2);
      // Test they work independently
    });
  });
});
```

**Testing Pipes**

Following DZ_01, pipes are standalone:

```typescript
describe('MyPipe', () => {
  let pipe: MyPipe;

  beforeEach(() => {
    pipe = new MyPipe();
  });

  describe('Valid transformations', () => {
    it('should transform input correctly', () => {
      expect(pipe.transform('input')).toBe('output');
    });
  });

  describe('Null/undefined handling', () => {
    it('should handle null', () => {
      expect(pipe.transform(null)).toBe('');
    });
  });
});
```

**Testing Components**

Following DZ_01, components are standalone:

```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent], // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Signals', () => {
    it('should update signal value', () => {
      component.mySignal.set('new value');
      expect(component.mySignal()).toBe('new value');
    });
  });

  describe('Template rendering', () => {
    it('should render title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Expected Text');
    });
  });
});
```

**Testing Services**

Services with dependency injection:

```typescript
describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', () => {
    const mockData = { id: 1, name: 'Test' };

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data');
    req.flush(mockData);
  });
});
```

---

#### Coverage Goals

| Component Type    | Target Coverage | Priority |
| ----------------- | --------------- | -------- |
| Helpers/Utilities | 95%+            | High     |
| Validators        | 95%+            | High     |
| Pipes             | 95%+            | High     |
| Services          | 85%+            | High     |
| Guards            | 90%+            | High     |
| Interceptors      | 90%+            | High     |
| Components        | 80%+            | Medium   |

**View Coverage:**

```bash
npm run test:ci
open coverage/digital-zen-extension/index.html
```

---

#### Common Jasmine Matchers

```typescript
// Equality
expect(value).toBe(expected); // Strict equality (===)
expect(value).toEqual(expected); // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Comparisons
expect(number).toBeGreaterThan(5);
expect(number).toBeLessThan(10);

// Strings
expect(string).toContain('substring');
expect(string).toMatch(/pattern/);

// Arrays/Objects
expect(array).toContain(item);
expect(obj).toEqual({ key: 'value' });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrowError(ErrorType);
```

---

#### Running Tests

```bash
# Run all tests with watch mode
npm test

# Run tests in CI mode (headless) with coverage
npm run test:ci

# Run tests without coverage
npm run test:headless

# Run specific test file
npm test -- --include='**/my-file.spec.ts'

# Run tests for specific directory
npm test -- --include='**/validators/*.spec.ts'
```

---

#### Best Practices Summary

**DO:**

- ✅ Write tests for all new code
- ✅ Use descriptive test names with "should..."
- ✅ Organize tests with nested `describe` blocks
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Test valid inputs, invalid inputs, and edge cases
- ✅ Keep tests simple and focused
- ✅ Test behavior, not implementation
- ✅ Use appropriate Jasmine matchers
- ✅ Aim for high coverage (80%+ minimum)

**DON'T:**

- ❌ Skip writing tests
- ❌ Write vague test names ("test 1", "it works")
- ❌ Create complex test setups
- ❌ Share state between tests
- ❌ Test private methods/implementation details
- ❌ Use `any` type in tests
- ❌ Ignore failing tests

---

#### Key Points

- ✅ Test files should be next to source files with `.spec.ts` extension
- ✅ Use modern Angular testing utilities (`TestBed`, `ComponentFixture`)
- ✅ Import standalone components in `TestBed.configureTestingModule()`
- ✅ Test Signals by calling them and verifying values
- ✅ Use `FormControl`/`FormGroup` for validator testing
- ✅ Mock external dependencies (HTTP, services)
- ✅ Clean up after tests (especially subscriptions)
- ❌ Don't use constructor injection in tests (use `TestBed.inject()`)

**Related Documentation:**

_DZ_17 is a high-level summary of testing expectations for this project. For canonical and more detailed testing guidance, use the documents below as your primary references._

- `/docs/testing-best-practices.md` - Canonical testing patterns and recommended practices
- `/docs/testing-guide.md` - Canonical testing setup, configuration, and tooling
- [Angular Testing Guide](https://angular.dev/guide/testing) - Primary external reference for Angular testing

---

## Component Organization

### DZ_18: Organized Imports with Comment Markers

**Guideline:** Always organize the `imports` array in component decorators with comment markers to categorize imports by type.

**Rationale:** Organizing imports with comment markers improves code readability, makes it easier to find specific imports, and provides clear structure for component dependencies. This pattern helps developers quickly understand what types of dependencies a component uses.

**Implementation:**

```typescript
@Component({
  selector: 'dz-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // angular modules
    CommonModule,
    ReactiveFormsModule,
    // pipes
    DatePipe,
    TitleCasePipe,
    CleanUrlPipe,
    // components
    LoaderComponent,
    ThemeSwitcherComponent,
    PeriodComponent,
  ],
})
export class ExampleComponent {
  // Component implementation
}
```

**Import Categories (in order):**

1. **`// angular modules`** - Angular built-in modules (CommonModule, ReactiveFormsModule, etc.)
2. **`// pipes`** - All pipes (both Angular built-in and custom pipes)
3. **`// components`** - All components (both custom and third-party)
4. **`// directives`** - Custom directives (if any)

**Key Points:**

- ✅ Always include the `imports` array, even if empty (`imports: []`)
- ✅ Group imports by category with comment markers
- ✅ Use lowercase comments with spaces: `// angular modules`, `// pipes`, `// components`
- ✅ Maintain consistent order: modules → pipes → components → directives
- ✅ Each category should be separated by its comment marker
- ✅ Omit category comments if that category is empty
- ❌ Do NOT mix different types of imports without organizing them
- ❌ Do NOT use different comment formats or inconsistent naming

**Examples:**

**Component with multiple categories:**

```typescript
imports: [
  // angular modules
  CommonModule,
  ReactiveFormsModule,
  // pipes
  DatePipe,
  // components
  LoaderComponent,
  PeriodFormComponent,
],
```

**Component with only components:**

```typescript
imports: [
  // components
  LoaderComponent,
  ThemeSwitcherComponent,
],
```

**Component with only pipes:**

```typescript
imports: [
  // pipes
  TitleCasePipe,
  DatePipe,
],
```

**Component with no imports:**

```typescript
imports: [],
```

**Benefits:**

- **Readability:** Clear visual separation of different import types
- **Maintainability:** Easy to add new imports in the correct category
- **Consistency:** Uniform structure across all components
- **Discoverability:** Quick identification of component dependencies

**Note on Prettier:**

Standard Prettier does not support enforcing comment-based organization of array elements. This pattern must be maintained manually by developers. Consider using ESLint custom rules if automatic enforcement is required in the future.

**See Also:** [DZ_01](#dz_01-standalone-components)

---

### DZ_19: Import Organization with Barrel Exports

**Guideline:** Use barrel exports (`index.ts` files) to organize and group imports from the `common` module. All imports from `common` should use the barrel export path, not direct file paths. Exception: Background module must import specific files directly.

**Rationale:** Barrel exports provide a clean, organized way to manage module exports and imports. They simplify import statements, make refactoring easier, and provide a single entry point for module dependencies. This pattern improves code maintainability and readability.

**Implementation:**

**✅ Good - Using barrel exports:**

```typescript
// In Angular components and services
import {
  LoaderComponent,
  UI_TEXT,
  ICONS,
  logger,
  IFocus,
  CleanUrlPipe,
  apiKeyInterceptor,
} from '../common';

// Or from deeper in the module tree
import {
  CHROME_COMMAND_ENUM,
  ThemeService,
  API_URLS,
} from '../../common';
```

**❌ Bad - Direct file imports (don't use this in Angular modules):**

```typescript
import { CleanUrlPipe } from '../common/pipes/clear-url.pipe';
import { apiKeyInterceptor } from '../common/interceptors/api-key.interceptor';
import { logger } from '../common/helpers/logger';
import { IFocus } from '../common/models/focus.model';
```

**⚠️ Exception - Background Module (required):**

The background module cannot import the entire common module barrel export because it would include Angular modules, which are not allowed in the background context. Background scripts must import specific files:

```typescript
// In src/background/*.ts files - REQUIRED approach
import { IFocus } from '../modules/common/models/focus.model';
import { QUICK_FOCUS_ID } from '../modules/common/constants/quick-focus-id.const';
import { CHROME_ALARM_ENUM } from '../modules/common/enums/chrome-alarm-name.enum';
import { logger } from '../modules/common/helpers/logger';
```

**Key Points:**

- ✅ Use barrel exports (`from '../common'`) for all Angular module imports
- ✅ Barrel exports are defined in `index.ts` files in each subdirectory
- ✅ The main `common` module re-exports all subdirectory barrel exports
- ✅ Background module MUST use direct file imports (no Angular modules allowed)
- ✅ Circular dependency detection is enabled via ESLint (`import-x/no-cycle`)
- ❌ Do NOT import specific file paths in Angular modules
- ❌ Do NOT import barrel exports in background module

**Barrel Export Structure:**

```
src/modules/common/
├── index.ts              # Main barrel export (re-exports all subdirectories)
├── components/
│   └── index.ts          # Exports all components
├── services/
│   └── index.ts          # Exports all services
├── helpers/
│   └── index.ts          # Exports all helpers
├── models/
│   └── index.ts          # Exports all models
├── constants/
│   └── index.ts          # Exports all constants
├── enums/
│   └── index.ts          # Exports all enums
├── validators/
│   └── index.ts          # Exports all validators
├── pipes/
│   └── index.ts          # Exports all pipes
└── interceptors/
    └── index.ts          # Exports all interceptors
```

**Circular Dependency Detection:**

The project uses `eslint-plugin-import-x` to detect and prevent circular dependencies:

```javascript
// In eslint.config.js
rules: {
  'import-x/no-cycle': ['error', { maxDepth: 10 }],
  'import-x/no-self-import': 'error',
}
```

**Benefits:**

- **Cleaner imports:** Shorter, more readable import statements
- **Better refactoring:** Change file structure without updating all imports
- **Single source of truth:** One place to manage module exports
- **Circular dependency prevention:** ESLint rules prevent import cycles
- **Consistent patterns:** All modules use the same import approach

**Migration Guide:**

When you find a direct file import in Angular modules:

1. Ensure the file is exported in its subdirectory's `index.ts`
2. Ensure the subdirectory is re-exported in `src/modules/common/index.ts`
3. Change the import to use the barrel export path
4. Run `npm run lint` to check for circular dependencies

**See Also:** 
- [DZ_01: Standalone Components](#dz_01-standalone-components)
- [ESLint Plugin Import-X Documentation](https://github.com/un-ts/eslint-plugin-import-x)

---

## UI Components

### DZ_20: Banner Styles for Messages

**Guideline:** Use `dz-banner` CSS classes for displaying messages with different severity levels in a consistent visual style.

**Project Pattern:** Digital Zen provides global `dz-banner` styles in `/src/styles/_components.scss` for consistent message display across the application.

**Rationale:** Consistent visual styling for messages (info, success, warning, error) improves user experience and maintainability. The banner styles are reusable and provide built-in support for icons and different severity levels.

**Implementation:**

```html
<!-- Basic banner structure -->
<div class="dz-banner dz-banner--info">
  <div class="dz-banner__icon">
    <svg class="dz-icon">
      <use [attr.href]="icons.INFO" />
    </svg>
  </div>
  <div class="dz-banner__content">
    <div class="dz-banner__message">Information message</div>
  </div>
</div>
```

**Available Severity Levels:**

- `dz-banner--info` - Blue accent color for informational messages
- `dz-banner--success` - Green color for success messages  
- `dz-banner--warn` - Yellow/orange color for warnings
- `dz-banner--error` - Red color for errors

**Available Sizes:**

- `dz-banner--sm` - Small banner (smaller padding and icons)
- Default - Medium banner (no modifier needed)
- `dz-banner--lg` - Large banner (larger padding and icons)

**Icon Mapping:**

Use the appropriate icon from `ICONS` constants (see [DZ_10.1](#dz_101-icon-constants)) for each message type:

- **INFO**: `ICONS.INFO` (`#icon-info`)
- **SUCCESS**: `ICONS.SUCCESS` (`#icon-success`)
- **WARN**: `ICONS.WARNING` (`#icon-warning`)
- **ERROR**: `ICONS.ERROR` (`#icon-error`)

**Complete Example (Toast Notification):**

```typescript
@Component({
  selector: 'dz-toast-container',
  template: `
    <div 
      class="dz-banner" 
      [class.dz-banner--info]="type === messageTypes.INFO"
      [class.dz-banner--success]="type === messageTypes.SUCCESS"
      [class.dz-banner--warn]="type === messageTypes.WARN"
      [class.dz-banner--error]="type === messageTypes.ERROR">
      
      <div class="dz-banner__icon">
        <svg class="dz-icon">
          <use [attr.href]="getIcon(type)" />
        </svg>
      </div>
      
      <div class="dz-banner__content">
        <div class="dz-banner__message">{{ message }}</div>
      </div>
    </div>
  `
})
export class ToastComponent {
  protected readonly icons = ICONS;
  protected readonly messageTypes = TOAST_TYPE_ENUM;

  protected getIcon(type: TOAST_TYPE_ENUM): string {
    switch (type) {
      case TOAST_TYPE_ENUM.INFO:
        return this.icons.INFO;
      case TOAST_TYPE_ENUM.SUCCESS:
        return this.icons.SUCCESS;
      case TOAST_TYPE_ENUM.WARN:
        return this.icons.WARNING;
      case TOAST_TYPE_ENUM.ERROR:
        return this.icons.ERROR;
      default:
        return this.icons.INFO;
    }
  }
}
```

**Key Points:**

- ✅ Use `dz-banner` as base class
- ✅ Add severity level modifier (`--info`, `--success`, `--warn`, `--error`)
- ✅ Include `dz-banner__icon` with appropriate icon
- ✅ Use `dz-banner__content` for message text
- ✅ Optionally add `dz-banner__title` for message title
- ✅ Match icon to severity level for consistency

**See Also:**
- [DZ_10.1: Icon Constants](#dz_101-icon-constants) - Icon management
- [DZ_12: SCSS and BEM Naming Convention](#dz_12-scss-and-bem-naming-convention) - Styling conventions
- `/src/styles/_components.scss` - Global banner styles
- `/src/modules/common/components/toast-container/` - Example usage

---

### DZ_21: Template Fragments for Code Reuse

**Guideline:** Use `ng-template` fragments for repeating template patterns within a single component instead of creating separate components.

**Rationale:** 
- Reduces boilerplate for simple template reuse
- Avoids creating components that may need refactoring when Angular's selectorless components become standard
- Lightweight solution for template-only patterns
- No additional change detection overhead

**Official Documentation:** [Angular ng-template](https://angular.dev/api/core/ng-template)

**Implementation:**

**Basic Template Fragment:**

```html
<!-- Define reusable template fragment -->
<ng-template #icon let-iconHref="href">
  <svg class="dz-icon" aria-hidden="true" focusable="false">
    <use [attr.href]="iconHref"></use>
  </svg>
</ng-template>

<!-- Use the fragment -->
<ng-container *ngTemplateOutlet="icon; context: { href: icons.DELETE }"></ng-container>
```

**Template Fragment with Multiple Parameters:**

```html
<!-- Define fragment with class and size parameters -->
<ng-template #icon let-iconHref="href" let-iconClass="class" let-width="width" let-height="height">
  <svg
    [class]="iconClass || 'dz-icon'"
    aria-hidden="true"
    focusable="false"
    [attr.width]="width"
    [attr.height]="height"
  >
    <use [attr.href]="iconHref" [attr.width]="width" [attr.height]="height" />
  </svg>
</ng-template>

<!-- Use with custom parameters -->
<ng-container
  *ngTemplateOutlet="
    icon;
    context: { href: icons.PLUS, class: 'dz-icon dz-icon--shadow', width: 20, height: 20 }
  "
></ng-container>
```

**Nested Template Fragments:**

```html
<!-- Base icon fragment -->
<ng-template #icon let-iconHref="href">
  <svg class="dz-icon" aria-hidden="true" focusable="false">
    <use [attr.href]="iconHref"></use>
  </svg>
</ng-template>

<!-- Banner icon fragment using base icon -->
<ng-template #bannerIcon let-iconHref="href">
  <div class="dz-banner__icon">
    <ng-container *ngTemplateOutlet="icon; context: { href: iconHref }"></ng-container>
  </div>
</ng-template>

<!-- Use nested fragment -->
<div class="dz-banner dz-banner--error">
  <ng-container *ngTemplateOutlet="bannerIcon; context: { href: icons.ERROR }"></ng-container>
  <div class="dz-banner__content">
    <div class="dz-banner__message">{{ errorMessage }}</div>
  </div>
</div>
```

**Key Points:**

- ✅ Use for repeated SVG icons, buttons, banners within same component
- ✅ Define template parameters with `let-paramName="paramName"`
- ✅ Pass context using `context: { paramName: value }`
- ✅ Use `*ngTemplateOutlet` to render the fragment
- ✅ Import `CommonModule` to use `*ngTemplateOutlet`
- ✅ Name fragments descriptively (e.g., `#icon`, `#bannerIcon`, `#errorBanner`)
- ❌ Don't overuse for complex logic (create component instead)
- ❌ Don't use across multiple components (create shared component instead)

**When NOT to use Template Fragments:**

Create a component instead when:
- Template has complex logic or state management
- Code needs to be shared across multiple parent components
- Lifecycle hooks are required
- Independent change detection is beneficial

**Examples in Codebase:**

- `src/modules/focus/components/period/period.component.html` - Icon fragment
- `src/modules/menu/components/period-form/period-form.component.html` - Error banner fragment
- `src/modules/common/components/dynamic-input/dynamic-input.component.html` - Icon fragment
- `src/modules/common/components/toast-container/toast-container.html` - Icon fragment

**See Also:**
- [Angular Future Changes and Project Strategy](#️-important-angular-future-changes-and-project-strategy) - Context for this pattern
- [DZ_01: Standalone Components](#dz_01-standalone-components) - When to use components instead

---

## Summary

This document covers all major coding patterns used in Digital Zen:

**Standard Angular Patterns (DZ_01-DZ_09, DZ_13-DZ_16):**

- Follow official Angular documentation as primary source
- See links to official docs at the top of this document

**Project-Specific Conventions (DZ_10-DZ_12, DZ_18-DZ_21):**

- UI Text Management (DZ_10) - Digital Zen specific
- Universal Logger (DZ_11) - Digital Zen specific
- BEM with dz- prefix (DZ_12) - Digital Zen specific
- Organized Imports (DZ_18) - Digital Zen specific
- Import Organization with Barrel Exports (DZ_19) - Digital Zen specific
- Banner Styles for Messages (DZ_20) - Digital Zen specific
- Template Fragments for Code Reuse (DZ_21) - Digital Zen specific

### When writing code:

1. **Reference official Angular docs** for standard patterns (Components, Signals, Forms, etc.)
2. **Follow project-specific guidelines** (DZ_10-DZ_12, DZ_18-DZ_21) for UI text, logging, styling, imports, and template reuse
3. **Use template fragments** (DZ_21) for simple code reuse within components
4. **Add JSDoc comments** with guideline references (e.g., `@guideline DZ_01, DZ_04`)
5. **Keep documentation synchronized** with actual code implementation

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
 * @see /docs/coding-guidelines.md
 * @see https://angular.dev/ (official docs)
 */
```

---

**Last Updated:** January 13, 2026  
**Maintained by:** Digital Zen Development Team  
**Primary Source:** [Angular Official Documentation](https://angular.dev/)
