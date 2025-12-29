# GitHub Copilot Instructions for Digital Zen

## Angular Project Configuration (v21)

This project uses **modern Angular (v21)** with the latest features and best practices. All code generation must follow these guidelines.

---

## 🔧 Core Principles

### 1. Component Pattern
- **ALWAYS** use **Standalone Components**
- Components should NOT use NgModules
- Import dependencies directly in the component's `imports` array

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

### 2. Dependency Injection
- **ALWAYS** use the `inject()` function
- **NEVER** use constructor-based injection
- Mark injected services as `readonly` and use private fields with `#` prefix

```typescript
export class ExampleComponent {
  readonly #authService: AuthService = inject(AuthService);
  readonly #router: Router = inject(Router);
}
```

### 3. Reactivity
- **PRIORITIZE Angular Signals** for local and shared state management
- Use `signal()` for writable signals, `computed()` for derived state
- Use RxJS **ONLY** for:
  - Complex asynchronous streams
  - HTTP requests
  - Event handling that requires operators like `debounceTime`, `switchMap`, etc.

```typescript
export class ExampleComponent {
  // Signals for state
  protected readonly count = signal(0);
  protected readonly doubleCount = computed(() => this.count() * 2);
  
  // RxJS for HTTP requests (one of the valid use cases)
  readonly #http: HttpClient = inject(HttpClient);
  
  loadData(): void {
    this.#http.get<Data[]>('/api/data').subscribe(data => {
      this.count.set(data.length);
    });
  }
}
```

### 4. Template Syntax
- **ALWAYS** use the new **Built-in Control Flow**
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
@switch (status()) {
  @case ('loading') {
    <dz-loader />
  }
  @case ('success') {
    <p>Success!</p>
  }
  @default {
    <p>Unknown status</p>
  }
}

<!-- Lazy loading -->
@defer {
  <dz-heavy-component />
}
```

### 5. Change Detection
- **ALWAYS** use `ChangeDetectionStrategy.OnPush`
- This is the default strategy for all components in this project

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

### 6. TypeScript & Forms
- Use **Strict TypeScript** mode
- Use **Typed Forms** (Reactive Forms with strong typing)
- Avoid using `any` type - prefer `unknown` if type is truly unknown

```typescript
form = new FormGroup<{ name: FormControl<string>; email: FormControl<string> }>({
  name: new FormControl<string>('', { nonNullable: true }),
  email: new FormControl<string>('', { nonNullable: true }),
});
```

---

## 🎨 Styling

- Use **SCSS** for styles
- Follow BEM naming convention: `dz-block__element--modifier`
- Component-specific styles should be in separate `.scss` files

---

## 🛠️ Additional Patterns

### Functional Interceptors
Use functional interceptors instead of class-based interceptors:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (!token) {
    return next(req);
  }
  
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(authReq);
};
```

### Functional Guards
Use functional guards instead of class-based guards:

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

## ✅ Code Quality Checklist

When generating code, ensure:
- ✅ Standalone component with `imports` array
- ✅ Dependencies injected using `inject()`, not constructor
- ✅ Signals used for state (`signal()`, `computed()`)
- ✅ New control flow syntax (`@if`, `@for`, `@switch`)
- ✅ `ChangeDetectionStrategy.OnPush` enabled
- ✅ Strict TypeScript typing with no `any`
- ✅ SCSS with BEM naming convention
- ✅ Functional interceptors and guards (if applicable)

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
