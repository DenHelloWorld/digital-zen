/**
 * Universal Logger
 *
 * A logger that works in both Angular and Chrome Extension background contexts.
 * Provides structured logging with module prefixes and log levels.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
}

class UniversalLogger {
  #config: LoggerConfig = {
    level: LogLevel.INFO,
    enableTimestamp: true,
  };

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.#config = { ...this.#config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.#config };
  }

  /**
   * Create a prefixed logger for a specific module
   */
  createLogger(prefix: string) {
    return {
      debug: (...args: unknown[]) => this.#log(LogLevel.DEBUG, prefix, ...args),
      info: (...args: unknown[]) => this.#log(LogLevel.INFO, prefix, ...args),
      warn: (...args: unknown[]) => this.#log(LogLevel.WARN, prefix, ...args),
      error: (...args: unknown[]) => this.#log(LogLevel.ERROR, prefix, ...args),
    };
  }

  /**
   * Log at DEBUG level
   */
  debug(prefix: string, ...args: unknown[]): void {
    this.#log(LogLevel.DEBUG, prefix, ...args);
  }

  /**
   * Log at INFO level
   */
  info(prefix: string, ...args: unknown[]): void {
    this.#log(LogLevel.INFO, prefix, ...args);
  }

  /**
   * Log at WARN level
   */
  warn(prefix: string, ...args: unknown[]): void {
    this.#log(LogLevel.WARN, prefix, ...args);
  }

  /**
   * Log at ERROR level
   */
  error(prefix: string, ...args: unknown[]): void {
    this.#log(LogLevel.ERROR, prefix, ...args);
  }

  #log(level: LogLevel, prefix: string, ...args: unknown[]): void {
    if (level < this.#config.level) {
      return;
    }

    const timestamp = this.#config.enableTimestamp ? `[${new Date().toISOString()}]` : '';
    const levelStr = this.#getLevelString(level);
    const prefixStr = prefix ? `[${prefix}]` : '';
    const logPrefix = [timestamp, levelStr, prefixStr].filter(Boolean).join(' ');

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(logPrefix, ...args);
        break;
      case LogLevel.WARN:
        console.warn(logPrefix, ...args);
        break;
      case LogLevel.ERROR:
        console.error(logPrefix, ...args);
        break;
    }
  }

  #getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '[DEBUG]';
      case LogLevel.INFO:
        return '[INFO]';
      case LogLevel.WARN:
        return '[WARN]';
      case LogLevel.ERROR:
        return '[ERROR]';
      default:
        return '';
    }
  }
}

/**
 * Global logger instance
 * Can be used directly in both Angular and background contexts
 */
export const logger = new UniversalLogger();
