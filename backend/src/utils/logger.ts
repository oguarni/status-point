/**
 * Logger interface for dependency injection
 */
export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

/**
 * Console-based logger implementation
 */
export class ConsoleLogger implements ILogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log info message
   * @param message - Log message
   * @param meta - Optional metadata
   */
  info(message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [INFO] [${this.context}] ${message}${metaStr}`);
  }

  /**
   * Log error message
   * @param message - Log message
   * @param error - Optional error object
   */
  error(message: string, error?: Error): void {
    const timestamp = new Date().toISOString();
    const errorStr = error ? ` ${error.message}\n${error.stack}` : '';
    console.error(`[${timestamp}] [ERROR] [${this.context}] ${message}${errorStr}`);
  }

  /**
   * Log warning message
   * @param message - Log message
   * @param meta - Optional metadata
   */
  warn(message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.warn(`[${timestamp}] [WARN] [${this.context}] ${message}${metaStr}`);
  }

  /**
   * Log debug message (only in development)
   * @param message - Log message
   * @param meta - Optional metadata
   */
  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
      console.debug(`[${timestamp}] [DEBUG] [${this.context}] ${message}${metaStr}`);
    }
  }
}

/**
 * Create a logger instance with a specific context
 * @param context - Logger context (e.g., service or class name)
 * @returns Logger instance
 */
export function createLogger(context: string): ILogger {
  return new ConsoleLogger(context);
}
