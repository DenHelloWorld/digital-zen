/**
 * Validation Error Keys Constants
 *
 * Centralized constants for form validation error keys.
 * These keys are used by validators to return specific error objects
 * and by templates to check for specific validation errors.
 *
 * @guideline DZ_07 - Strict TypeScript typing
 * @see /docs/coding-guidelines.md#dz_07-strict-typescript-mode
 *
 * @example
 * ```typescript
 * // In validator
 * return { [VALIDATION_ERROR_KEYS.UNBLOCKABLE_NOT_ALLOWED]: true };
 *
 * // In template
 * form.controls.webSites.hasError(VALIDATION_ERROR_KEYS.UNBLOCKABLE_NOT_ALLOWED)
 * ```
 */
export const VALIDATION_ERROR_KEYS = Object.freeze({
  /** Array has fewer elements than required minimum */
  ARRAY_TOO_SHORT: 'arrayTooShort',
  /** Period name already exists */
  DUPLICATE_PERIOD_NAME: 'duplicatePeriodName',
  /** Time range is invalid (start >= end) */
  INVALID_TIME_RANGE: 'invalidTimeRange',
  /** Field is required but empty or whitespace only */
  REQUIRED: 'required',
  UNACTIVATABLE_NOT_ALLOWED: 'unactivatableNotAllowed',
} as const);

/**
 * Type for validation error keys
 * Ensures type safety when using error keys
 */
export type ValidationErrorKey = (typeof VALIDATION_ERROR_KEYS)[keyof typeof VALIDATION_ERROR_KEYS];
