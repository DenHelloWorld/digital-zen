import { Injectable } from '@angular/core';
import { logger, LoggerConfig, LogLevel } from '../helpers/logger';

/**
 * Angular Logger Service
 *
 * Injectable wrapper around the universal logger for use in Angular components and services.
 * Provides the same logging interface that works in both Angular and background contexts.
 *
 * @example
 * ```typescript
 * export class MyComponent {
 *   readonly #logger = inject(LoggerService);
 *
 *   ngOnInit() {
 *     this.#logger.info('MyComponent', 'Component initialized');
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  /**
   * Configure the logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    logger.configure(config);
  }

  /**
   * Get current configuration
   */
  public getConfig(): LoggerConfig {
    return logger.getConfig();
  }

  /**
   * Create a prefixed logger for a specific module
   *
   * @example
   * ```typescript
   * const moduleLogger = this.#logger.createLogger('AuthService');
   * moduleLogger.info('User logged in');
   * ```
   */
  public createLogger(prefix: string): {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  } {
    return logger.createLogger(prefix);
  }

  /**
   * Log at DEBUG level
   */
  public debug(prefix: string, ...args: unknown[]): void {
    logger.debug(prefix, ...args);
  }

  /**
   * Log at INFO level
   */
  public info(prefix: string, ...args: unknown[]): void {
    logger.info(prefix, ...args);
  }

  /**
   * Log at WARN level
   */
  public warn(prefix: string, ...args: unknown[]): void {
    logger.warn(prefix, ...args);
  }

  /**
   * Log at ERROR level
   */
  public error(prefix: string, ...args: unknown[]): void {
    logger.error(prefix, ...args);
  }
}

// Re-export for convenience
export { LogLevel };
export type { LoggerConfig };
