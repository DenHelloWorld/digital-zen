import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator that checks if a string value is not empty or contains only whitespace.
 * Trims the input value and returns a validation error if the trimmed string is empty.
 *
 * @param control - The form control to validate
 * @returns Validation error object with `required: true` if validation fails, otherwise `null`
 *
 * @example
 * ```typescript
 * const control = new FormControl('', requiredTrimmedValidator);
 * // Returns { required: true } for empty or whitespace-only strings
 * // Returns null for valid non-empty strings
 * ```
 */
export function requiredTrimmedValidator(control: AbstractControl): ValidationErrors | null {
  const value: typeof control.value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { required: true };
  }
  return null;
}
