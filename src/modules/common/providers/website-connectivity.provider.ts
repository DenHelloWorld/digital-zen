export class WebsiteConnectivityProvider {
  static readonly #DEFAULT_TIMEOUT = 5000;

  static async isAlive(url: string, timeout = this.#DEFAULT_TIMEOUT): Promise<boolean> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(id);
    }
  }
}
