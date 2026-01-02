import { AbstractControl, ValidationErrors } from '@angular/forms';
import { IFocus } from '../models/focus.model';

/**
 * Factory function that creates a validator to check if a period name is unique.
 * Compares the trimmed, case-insensitive period name against existing periods.
 *
 * @param existingPeriods - Array of existing periods to check against
 * @param currentPeriodId - Optional ID of the current period being edited (to exclude from uniqueness check)
 * @returns A validator function that returns a validation error if the name already exists
 *
 * @example
 * ```typescript
 * const periods = [{ id: '1', name: 'Work Period', ... }];
 * const control = new FormControl('Work Period', uniquePeriodNameValidator(periods));
 * // Returns { duplicatePeriodName: true } if name already exists
 * // Returns null if name is unique
 * ```
 */
export function uniquePeriodNameValidator(
  existingPeriods: IFocus.Period[] | null,
  currentPeriodId?: string
): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;

    // If no value or value is not a string or no periods to check, validation passes
    if (!value || typeof value !== 'string' || !existingPeriods || existingPeriods.length === 0) {
      return null;
    }

    const trimmedValue = value.trim().toLowerCase();

    // Check if a period with the same name already exists
    const isDuplicate = existingPeriods.some(period => {
      // Skip the current period when in edit mode
      if (currentPeriodId && period.id === currentPeriodId) {
        return false;
      }

      return period.name.trim().toLowerCase() === trimmedValue;
    });

    return isDuplicate ? { duplicatePeriodName: true } : null;
  };
}
