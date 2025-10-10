import {AbstractControl, ValidationErrors} from '@angular/forms';

export function requiredTrimmedValidator(control: AbstractControl): ValidationErrors | null {
  const value: typeof control.value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { required: true };
  }
  return null;
}

export function arrayMinLengthValidator(min = 1): ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: typeof control.value = control.value;
    if (!Array.isArray(value) || value.length < min) {
      return { arrayTooShort: true };
    }
    return null;
  };
}

export function timeRangeValidator(startKey: string, endKey: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const start: string = group.get(startKey)?.value;
    const end: string = group.get(endKey)?.value;

    if (start && end && start >= end) {
      return { invalidTimeRange: true };
    }

    return null;
  };
}
