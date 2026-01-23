/**
 * AlarmAdapter — adapter for managing Chrome extension alarms
 * Follows DZ_XX standards, stateless, only static methods
 */

export type AlarmHandler = (alarm: chrome.alarms.Alarm) => void | Promise<void>;

export class AlarmAdapter {
  private static handlers: AlarmHandler[] = [];

  /**
   * Adds a handler for Chrome alarm events
   * @param handler Function to handle alarm events
   */
  static addListener(handler: AlarmHandler): void {
    if (this.handlers.length === 0) {
      chrome.alarms.onAlarm.addListener(alarm => this.dispatch(alarm));
    }
    this.handlers.push(handler);
  }

  /**
   * Creates a new Chrome alarm
   * @param name Alarm name
   * @param info Alarm creation options
   */
  static create(name: string, info: chrome.alarms.AlarmCreateInfo): void {
    chrome.alarms.create(name, info);
  }

  /**
   * Clears a Chrome alarm by name
   * @param name Alarm name
   */
  static clear(name: string): void {
    chrome.alarms.clear(name);
  }

  /**
   * Dispatches alarm events to all registered handlers
   * @param alarm Chrome alarm event
   */
  private static async dispatch(alarm: chrome.alarms.Alarm) {
    if (!this.handlers) {
      console.warn('AlarmAdapter: handlers is undefined');
      return;
    }

    for (const handler of this.handlers) {
      await handler(alarm);
    }
  }
}
