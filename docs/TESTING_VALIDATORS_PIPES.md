# Testing Validators and Pipes in Digital Zen

This guide provides best practices and examples for testing custom validators and pipes in the Digital Zen Chrome Extension project, following modern Angular patterns (Angular 21+).

**Version:** 1.0.0  
**Last Updated:** January 7, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Custom Validators](#testing-custom-validators)
3. [Testing Pipes](#testing-pipes)
4. [Best Practices](#best-practices)
5. [Test Coverage Goals](#test-coverage-goals)
6. [Running Tests](#running-tests)

---

## Overview

This document covers testing patterns for:
- **Custom Form Validators** (`*.validators.ts`) - Functions that validate form inputs
- **Pipes** (`*.pipe.ts`) - Functions that transform data for display in templates

All tests follow the guidelines from [TESTING_BEST_PRACTICES.md](./TESTING_BEST_PRACTICES.md) and align with [CODING_GUIDELINES.md](./CODING_GUIDELINES.md).

### Key Principles

✅ **Comprehensive Coverage** - Test valid inputs, invalid inputs, edge cases, and boundary conditions  
✅ **Modern Angular Patterns** - Use standalone components, typed forms, and signals where applicable  
✅ **Descriptive Test Names** - Use clear, behavior-focused test names  
✅ **AAA Pattern** - Arrange, Act, Assert structure  
✅ **Isolation** - Each test should be independent

---

## Testing Custom Validators

### Validator Pattern Overview

Following **DZ_16: Custom Validators**, our validators are:
- Pure functions that return `ValidationErrors | null`
- Use `AbstractControl` for parameter types
- Can be simple validators or factory functions (for parameterized validators)

### Example: Testing a Simple Validator

**Source:** `required-trimmed.validator.ts`

```typescript
export function requiredTrimmedValidator(control: AbstractControl): ValidationErrors | null {
  const value: typeof control.value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { required: true };
  }
  return null;
}
```

**Test:** `required-trimmed.validator.spec.ts`

```typescript
import { FormControl } from '@angular/forms';
import { requiredTrimmedValidator } from './required-trimmed.validator';

describe('requiredTrimmedValidator', () => {
  describe('Valid non-empty strings', () => {
    it('should return null for non-empty string', () => {
      const control = new FormControl('valid text');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for string with whitespace but content', () => {
      const control = new FormControl('  text  ');
      expect(requiredTrimmedValidator(control)).toBeNull();
    });
  });

  describe('Invalid empty or whitespace-only strings', () => {
    it('should return error for empty string', () => {
      const control = new FormControl('');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });

    it('should return error for whitespace-only strings', () => {
      const control = new FormControl('   ');
      expect(requiredTrimmedValidator(control)).toEqual({ required: true });
    });
  });

  describe('Non-string values', () => {
    it('should return null for null', () => {
      const control = new FormControl(null);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });

    it('should return null for number', () => {
      const control = new FormControl(123);
      expect(requiredTrimmedValidator(control)).toBeNull();
    });
  });
});
```

### Example: Testing a Factory Validator

**Source:** `array-min-length.validator.ts`

```typescript
export function arrayMinLengthValidator(
  min = 1
): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: typeof control.value = control.value;
    if (!Array.isArray(value) || value.length < min) {
      return { arrayTooShort: true };
    }
    return null;
  };
}
```

**Test:** `array-min-length.validator.spec.ts`

```typescript
describe('arrayMinLengthValidator', () => {
  describe('Valid arrays', () => {
    it('should return null for array with minimum length', () => {
      const validator = arrayMinLengthValidator(3);
      const control = new FormControl([1, 2, 3]);
      expect(validator(control)).toBeNull();
    });
  });

  describe('Invalid arrays', () => {
    it('should return error for array shorter than minimum', () => {
      const validator = arrayMinLengthValidator(3);
      const control = new FormControl([1, 2]);
      expect(validator(control)).toEqual({ arrayTooShort: true });
    });
  });

  describe('Factory function behavior', () => {
    it('should create independent validator instances', () => {
      const validator1 = arrayMinLengthValidator(2);
      const validator2 = arrayMinLengthValidator(3);
      const control = new FormControl([1, 2]);

      expect(validator1(control)).toBeNull();
      expect(validator2(control)).toEqual({ arrayTooShort: true });
    });
  });
});
```

### Validator Testing Checklist

When testing validators, ensure you cover:

- ✅ **Valid inputs** - Values that should pass validation
- ✅ **Invalid inputs** - Values that should fail validation
- ✅ **Null/undefined** - How the validator handles missing values
- ✅ **Edge cases** - Boundary conditions, empty strings, whitespace
- ✅ **Type safety** - Non-expected types (if validator is type-flexible)
- ✅ **Performance** - Consistent results for same input
- ✅ **Factory behavior** - If using factory pattern, test parameter variations
- ✅ **Integration** - Test with FormControl/FormGroup

### Example Test Structure for Validators

```typescript
describe('validatorName', () => {
  describe('Valid inputs', () => {
    // Tests that should return null
  });

  describe('Invalid inputs', () => {
    // Tests that should return validation errors
  });

  describe('Null, undefined, and empty values', () => {
    // Tests for missing or empty values
  });

  describe('Edge cases', () => {
    // Boundary conditions, special characters, etc.
  });

  describe('Performance and consistency', () => {
    // Consistent results, rapid validations
  });

  describe('Factory function behavior', () => {
    // If using factory pattern
  });

  describe('Integration with FormControl', () => {
    // Real-world usage scenarios
  });
});
```

---

## Testing Pipes

### Pipe Pattern Overview

Following **DZ_01: Standalone Components**, all pipes are standalone with the `standalone: true` flag.

Pipes transform input values for display in templates. They implement `PipeTransform` interface.

### Example: Testing a Pipe

**Source:** `clear-url.pipe.ts`

```typescript
@Pipe({
  name: 'cleanUrl',
  standalone: true,
})
export class CleanUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return cleanUrlHelper(value);
  }
}
```

**Test:** `clear-url.pipe.spec.ts`

```typescript
import { CleanUrlPipe } from './clear-url.pipe';

describe('CleanUrlPipe', () => {
  let pipe: CleanUrlPipe;

  beforeEach(() => {
    pipe = new CleanUrlPipe();
  });

  describe('Pipe instantiation', () => {
    it('should create an instance', () => {
      expect(pipe).toBeTruthy();
    });
  });

  describe('Valid URLs', () => {
    it('should transform URLs to origin', () => {
      expect(pipe.transform('https://example.com/path')).toBe('https://example.com');
    });

    it('should remove query parameters', () => {
      expect(pipe.transform('https://example.com?param=value')).toBe('https://example.com');
    });
  });

  describe('Null and undefined', () => {
    it('should handle null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should handle undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results', () => {
      const url = 'https://example.com/page';
      expect(pipe.transform(url)).toBe(pipe.transform(url));
    });
  });
});
```

### Pipe Testing Checklist

When testing pipes, ensure you cover:

- ✅ **Instantiation** - Pipe can be created
- ✅ **Valid inputs** - Expected transformations
- ✅ **Invalid inputs** - How pipe handles malformed data
- ✅ **Null/undefined** - Default/fallback values
- ✅ **Edge cases** - Extreme values, special characters
- ✅ **Performance** - Consistent results (pure pipes)
- ✅ **Multiple instances** - Independence across instances
- ✅ **Integration** - Works with helper functions (if applicable)

### Example Test Structure for Pipes

```typescript
describe('PipeName', () => {
  let pipe: PipeName;

  beforeEach(() => {
    pipe = new PipeName();
  });

  describe('Pipe instantiation', () => {
    // Creation and metadata tests
  });

  describe('Valid inputs', () => {
    // Expected transformations
  });

  describe('Invalid inputs', () => {
    // Error handling, malformed data
  });

  describe('Null, undefined, and empty values', () => {
    // Missing or empty values
  });

  describe('Edge cases', () => {
    // Boundary conditions
  });

  describe('Performance and consistency', () => {
    // Pure pipe behavior
  });

  describe('Integration', () => {
    // Works with other functions/services
  });
});
```

---

## Best Practices

### 1. Organize Tests Logically

Use nested `describe` blocks to group related tests:

```typescript
describe('MyValidator', () => {
  describe('Valid inputs', () => { /* ... */ });
  describe('Invalid inputs', () => { /* ... */ });
  describe('Edge cases', () => { /* ... */ });
});
```

### 2. Use Descriptive Test Names

✅ **Good:**
```typescript
it('should return error when start time equals end time', () => { /* ... */ });
```

❌ **Bad:**
```typescript
it('test 1', () => { /* ... */ });
```

### 3. Test Boundary Conditions

Always test:
- Minimum valid value
- Maximum valid value
- Just below minimum (should fail)
- Just above maximum (should fail)
- Empty/null/undefined

### 4. Keep Tests Independent

Each test should:
- Set up its own data
- Not depend on other tests
- Clean up after itself (if needed)

### 5. Use AAA Pattern

```typescript
it('should validate correctly', () => {
  // Arrange
  const validator = myValidator();
  const control = new FormControl('test');

  // Act
  const result = validator(control);

  // Assert
  expect(result).toBeNull();
});
```

### 6. Test Error Messages

Ensure validation errors return the correct error structure:

```typescript
expect(validator(control)).toEqual({ errorKey: true });
```

### 7. Document Limitations

If your validator or pipe has known limitations, document them in tests:

```typescript
it('should handle hash fragments (known limitation)', () => {
  // Note: Hash fragments are not removed by split('?')
  expect(isImageIcon('image.png#section')).toBe(false);
});
```

---

## Test Coverage Goals

### Target Coverage

Following [TESTING_BEST_PRACTICES.md](./TESTING_BEST_PRACTICES.md):

| Component Type | Target Coverage | Priority |
|----------------|-----------------|----------|
| Validators     | 95%+           | High     |
| Pipes          | 95%+           | High     |

### Measuring Coverage

Run tests with coverage:

```bash
npm run test:ci
```

View coverage report:

```bash
open coverage/digital-zen-extension/index.html
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in CI Mode (with coverage)

```bash
npm run test:ci
```

### Run Specific Test File

```bash
npm test -- --include='**/array-min-length.validator.spec.ts'
```

### Run Tests for Validators Only

```bash
npm test -- --include='**/validators/*.spec.ts'
```

### Run Tests for Pipes Only

```bash
npm test -- --include='**/pipes/*.spec.ts'
```

---

## Examples in This Project

### Validator Tests

1. **`array-min-length.validator.spec.ts`** - Factory validator with parameterization
2. **`required-trimmed.validator.spec.ts`** - Simple validator with string trimming
3. **`time-range.validator.spec.ts`** - Group validator checking time range validity
4. **`unique-period-name.validator.spec.ts`** - Complex validator with edit mode support

### Pipe Tests

1. **`clear-url.pipe.spec.ts`** - URL transformation pipe with helper integration

---

## Quick Reference

### Common Jasmine Matchers

```typescript
// Equality
expect(value).toBe(expected);        // Strict equality (===)
expect(value).toEqual(expected);     // Deep equality

// Truthiness
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Objects
expect(obj).toEqual({ key: 'value' });
```

### FormControl Creation

```typescript
// Simple control
const control = new FormControl('value');

// Control with validator
const control = new FormControl('value', myValidator);

// Typed control (recommended)
const control = new FormControl<string>('value', { nonNullable: true });
```

### FormGroup with Group Validator

```typescript
const group = new FormGroup(
  {
    startTime: new FormControl('09:00'),
    endTime: new FormControl('17:00'),
  },
  { validators: timeRangeValidator('startTime', 'endTime') }
);
```

---

## Summary

Testing validators and pipes ensures:

- ✅ Form validation works correctly
- ✅ Data transformations are accurate
- ✅ Edge cases are handled gracefully
- ✅ Code is maintainable and refactorable
- ✅ Regressions are caught early

Follow the patterns in this guide to write comprehensive, maintainable tests for all validators and pipes in Digital Zen.

---

**Related Documentation:**
- [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) - Full coding guidelines
- [TESTING_BEST_PRACTICES.md](./TESTING_BEST_PRACTICES.md) - General testing best practices
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Complete testing guide

**Official Angular Resources:**
- [Angular Form Validation](https://angular.dev/guide/forms/form-validation)
- [Custom Validators](https://angular.dev/guide/forms/form-validation#defining-custom-validators)
- [Angular Pipes](https://angular.dev/guide/templates/pipes)
