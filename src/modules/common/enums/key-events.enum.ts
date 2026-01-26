/**
 * KEY_EVENTS_ENUM — enumeration of commonly used keyboard keys for keyboard event handling.
 * Used for typing and unifying work with KeyboardEvent.key in the Digital Zen application.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key#specifications
 *
 * KeyEventsType — type that unites all supported key values from KEY_EVENTS_ENUM.
 * Used for strict typing of keyboard event handlers and to improve code readability.
 */

export enum KEY_EVENTS_ENUM {
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  ENTER = 'Enter',
  ESCAPE = 'Escape',
}
export type KeyEventsType =
  | KEY_EVENTS_ENUM.ARROW_DOWN
  | KEY_EVENTS_ENUM.ARROW_UP
  | KEY_EVENTS_ENUM.ARROW_LEFT
  | KEY_EVENTS_ENUM.ARROW_RIGHT
  | KEY_EVENTS_ENUM.ENTER
  | KEY_EVENTS_ENUM.ESCAPE;
