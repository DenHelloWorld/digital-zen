/** Configuration for value increments and bounds in steppers */

export interface IStepConfig {
  /** Standard increment value (e.g., via keyboard arrows) */
  step: number;
  /** Large increment value (e.g., via +/- 5 min buttons) */
  quickStep: number;
  /** Minimum allowed value */
  min: number;
  /** Maximum allowed value */
  max: number;
}
