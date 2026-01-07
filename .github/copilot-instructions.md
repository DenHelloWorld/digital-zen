# GitHub Copilot Instructions for Digital Zen

## Angular Project Configuration (v21)

This project uses **modern Angular (v21)** with the latest features and best practices. All code generation must follow these guidelines.

**📚 Complete Guidelines:** See `/docs/coding-guidelines.md` for the full coding guidelines with references to official Angular documentation.

**🔗 Primary Source:** We follow [official Angular documentation](https://angular.dev/) for standard patterns.

---

## 🔧 Core Principles

For detailed explanations and official Angular documentation links, refer to `/docs/coding-guidelines.md`.

### 1. Component Pattern (DZ_01, DZ_03)

- **ALWAYS** use **Standalone Components** - [Angular Docs](https://angular.dev/guide/components/importing)
- Components should NOT use NgModules
- Import dependencies directly in the component's `imports` array
- **ALWAYS** use `ChangeDetectionStrategy.OnPush` - [Angular Docs](https://angular.dev/best-practices/skipping-subtrees)

```typescript
@Component({
  selector: 'dz-example',
  templateUrl: './example.html',
  styleUrls: ['./example.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, OtherComponent],
})
export class ExampleComponent {
  // ...
}
```

### 2. Dependency Injection (DZ_02, DZ_08, DZ_09)

- **ALWAYS** use the `inject()` function - [Angular Docs](https://angular.dev/guide/di/dependency-injection)
- **NEVER** use constructor-based injection
- Mark injected services as `readonly` and use private fields with `#` prefix

```typescript
export class ExampleComponent {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
}
```

### 3. Reactivity (DZ_04, DZ_05)

- **PRIORITIZE Angular Signals** for local and shared state management - [Angular Docs](https://angular.dev/guide/signals)
- Use `signal()` for writable signals, `computed()` for derived state
- Use RxJS **ONLY** for - [Angular Docs](https://angular.dev/guide/rx):
  - Complex asynchronous streams
  - HTTP requests
  - Event handling that requires operators like `debounceTime`, `switchMap`, etc.

```typescript
export class ExampleComponent {
  // Signals for state
  protected readonly count = signal(0);
  protected readonly doubleCount = computed(() => this.count() * 2);

  // RxJS for HTTP requests (one of the valid use cases)
  readonly #http = inject(HttpClient);
  readonly #destroyRef = inject(DestroyRef);

  loadData(): void {
    this.#http
      .get<Array<{ id: number; name: string }>>('/api/data')
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(data => {
        this.count.set(data.length);
      });
  }
}
```

### 4. Template Syntax (DZ_06)

- **ALWAYS** use the new **Built-in Control Flow** - [Angular Docs](https://angular.dev/guide/templates/control-flow)
- **NEVER** use `*ngIf`, `*ngFor`, `*ngSwitch` (legacy directives)
- Use `@if`, `@for`, `@switch`, `@defer` instead

```html
<!-- Conditional rendering -->
@if (isLoggedIn()) {
<p>Welcome back!</p>
} @else {
<p>Please log in</p>
}

<!-- List rendering -->
@for (item of items(); track item.id) {
<div>{{ item.name }}</div>
} @empty {
<p>No items found</p>
}

<!-- Switch statement -->
@switch (status()) { @case ('loading') {
<dz-loader />
} @case ('success') {
<p>Success!</p>
} @default {
<p>Unknown status</p>
} }

<!-- Lazy loading -->
@defer {
<dz-heavy-component />
}
```

### 5. Change Detection (DZ_03)

- **ALWAYS** use `ChangeDetectionStrategy.OnPush` - [Angular Docs](https://angular.dev/best-practices/skipping-subtrees)
- This is the default strategy for all components in this project

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

### 6. TypeScript & Forms (DZ_07, DZ_15)

- Use **Strict TypeScript** mode - [TypeScript Docs](https://www.typescriptlang.org/tsconfig#strict)
- Use **Typed Forms** (Reactive Forms with strong typing) - [Angular Docs](https://angular.dev/guide/forms/typed-forms)
- Avoid using `any` type - prefer `unknown` if type is truly unknown

```typescript
form = new FormGroup<{ name: FormControl<string>; email: FormControl<string> }>({
  name: new FormControl<string>('', { nonNullable: true }),
  email: new FormControl<string>('', { nonNullable: true }),
});
```

---

## 🎨 Styling (DZ_12)

- Use **SCSS** for styles
- Follow BEM naming convention: `dz-block__element--modifier`
- Component-specific styles should be in separate `.scss` files

---

## 🛠️ Additional Patterns

### Functional Interceptors (DZ_13)

Use functional interceptors instead of class-based interceptors - [Angular Docs](https://angular.dev/guide/http/interceptors):

```typescript
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

### Functional Guards (DZ_14)

Use functional guards instead of class-based guards - [Angular Docs](https://angular.dev/guide/routing/common-router-tasks#preventing-unauthorized-access):

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

---

## 📁 Project Structure

- Components should be organized by feature modules in `src/modules/`
- Shared utilities and common components should be in `src/modules/common/`
- Services should be in feature-specific directories
- Use barrel exports (`index.ts`) for cleaner imports

---

## 📚 Documentation & Guidelines

**Complete Coding Guidelines:** `/docs/coding-guidelines.md`
- Comprehensive guide with all DZ_XX patterns
- Direct links to official Angular documentation
- Project-specific conventions (UI text, logger, BEM)

**Quick Start for Developers:** `/docs/README.md`

**Logger Documentation:** `/docs/logger.md` and `/docs/logger-quickstart.md`

---

## ✅ Code Quality Checklist

When generating code, ensure:

- ✅ Standalone component with `imports` array (DZ_01)
- ✅ Dependencies injected using `inject()`, not constructor (DZ_02)
- ✅ Signals used for state (`signal()`, `computed()`) (DZ_04)
- ✅ New control flow syntax (`@if`, `@for`, `@switch`) (DZ_06)
- ✅ `ChangeDetectionStrategy.OnPush` enabled (DZ_03)
- ✅ Strict TypeScript typing with no `any` (DZ_07)
- ✅ SCSS with BEM naming convention (DZ_12)
- ✅ Functional interceptors and guards (if applicable) (DZ_13, DZ_14)
- ✅ UI text extracted to UI_TEXT constants (DZ_10)
- ✅ Universal logger usage instead of console (DZ_11)

**For detailed explanations, see `/docs/coding-guidelines.md`**

---

## 🚫 Anti-Patterns to Avoid

- ❌ NgModules (use standalone components)
- ❌ Constructor-based injection (use `inject()`)
- ❌ Legacy control flow (`*ngIf`, `*ngFor`, `*ngSwitch`)
- ❌ Default change detection (always use `OnPush`)
- ❌ Excessive use of RxJS for simple state (use Signals)
- ❌ Class-based interceptors/guards (use functional)
- ❌ `any` type (use strict typing)

---

**Note:** This project is a Chrome extension built with Angular. Keep browser extension APIs and manifest requirements in mind when generating extension-specific code.
