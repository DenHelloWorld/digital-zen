/**
 * NotificationAdapter — адаптер для работы с системными уведомлениями Chrome.
 * Инкапсулирует логику отображения баннеров.
 */
export class NotificationAdapter {
  private static readonly DEFAULT_ICON = 'icon-spa-colored-128x128.png';
  /**
   * Показывает системное уведомление
   * @param id Уникальный ID уведомления
   * @param title Заголовок
   * @param message Текст сообщения
   */
  static show(id: string, title: string, message: string): void {
    chrome.notifications.clear(id, () => {
      chrome.notifications.create(id, {
        type: 'basic',
        iconUrl: this.DEFAULT_ICON,
        title: title,
        message: message,
        priority: 2,
      });
    });
  }

  /**
   * Очищает уведомление по ID
   */
  static clear(id: string): void {
    chrome.notifications.clear(id);
  }
}
