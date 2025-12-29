import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Factory function that creates a validator to check if an array has a minimum number of elements.
 * Returns a validator function that validates array length.
 *
 * @param min - The minimum required length for the array (defaults to 1)
 * @returns A validator function that returns a validation error if the array is too short
 *
 * @example
 * ```typescript
 * const control = new FormControl([], arrayMinLengthValidator(3));
 * // Returns { arrayTooShort: true } if array has fewer than 3 elements
 * // Returns null if array has 3 or more elements
 * ```
 */
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
