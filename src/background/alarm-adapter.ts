export type AlarmHandler = (alarm: chrome.alarms.Alarm) => void | Promise<void>;

export class AlarmAdapter {
  private static handlers: AlarmHandler[] = [];

  static addListener(handler: AlarmHandler): void {
    if (this.handlers.length === 0) {
      chrome.alarms.onAlarm.addListener(this.dispatch);
    }
    this.handlers.push(handler);
  }

  static create(name: string, info: chrome.alarms.AlarmCreateInfo): void {
    chrome.alarms.create(name, info);
  }

  static clear(name: string): void {
    chrome.alarms.clear(name);
  }

  private static async dispatch(alarm: chrome.alarms.Alarm) {
    for (const handler of this.handlers) {
      await handler(alarm);
    }
  }
}
