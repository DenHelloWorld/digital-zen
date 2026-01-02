import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Factory function that creates a validator to check if a time range is valid.
 * Validates that the start time is before the end time in a form group.
 *
 * @param startKey - The key name of the start time field in the form group
 * @param endKey - The key name of the end time field in the form group
 * @returns A validator function that returns a validation error if the time range is invalid
 *
 * @example
 * ```typescript
 * const form = new FormGroup({
 *   startTime: new FormControl('10:00'),
 *   endTime: new FormControl('09:00')
 * }, { validators: timeRangeValidator('startTime', 'endTime') });
 * // Returns { invalidTimeRange: true } if start time >= end time
 * // Returns null if start time < end time
 * ```
 */
export function timeRangeValidator(
  startKey: string,
  endKey: string
): (group: AbstractControl) => ValidationErrors | null {
  return (group: AbstractControl): ValidationErrors | null => {
    const start: string = group.get(startKey)?.value;
    const end: string = group.get(endKey)?.value;

    // If only one is provided, it's invalid
    if (!start || !end) {
      return { invalidTimeRange: true };
    }

    if (start >= end) {
      return { invalidTimeRange: true };
    }

    return null;
  };
}
