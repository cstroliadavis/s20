/**
 * @file Global logger singleton and scoped logger factory.
 */
import { createConfigManager } from './config.js';
import { createEventEmitter } from './events.js';
import { createLogFunction } from './log-function.js';
import type {
  LogEventType,
  LogFunction,
  LogHandler,
  LoggerConfig,
  LoggerSingleton,
  PageContext,
  Unsubscribe,
} from './types.js';

const PAGE_CONTEXT_KEYS = new Set(['category', 'location', 'name', 'namespace']);

const _ = {
  configManager: createConfigManager(),
  emitter: createEventEmitter(),
  rootLog: null as LogFunction | null,
};

/**
 * Applies configuration updates when a settings object is provided.
 */
function applyConfig(config?: Partial<LoggerConfig>): void {
  if (config) {
    _.configManager.updateConfig(config);
  }
}

/**
 * Lazily creates the shared root log function or returns the existing instance.
 */
function getOrCreateRootLog(): LogFunction {
  if (_.rootLog) return _.rootLog;

  _.rootLog = createLogFunction({
    configManager: _.configManager,
    emitter: _.emitter,
  });

  return _.rootLog;
}

/**
 * Checks if an object has context properties like name, location, or category.
 */
function hasPageKey(val: object): boolean {
  return Object.keys(val).some((key) => PAGE_CONTEXT_KEYS.has(key));
}

/**
 * Checks if an argument is a page context object rather than configuration.
 */
function isPageContext(val: unknown): val is PageContext {
  if (!val || typeof val !== 'object') return false;

  return hasPageKey(val);
}

/**
 * Scopes the logger to a page context or updates global configuration.
 */
function loggerCallable(
  pageOrConfig?: PageContext | Partial<LoggerConfig>,
  config?: Partial<LoggerConfig>,
): LogFunction {
  applyConfig(config);

  if (isPageContext(pageOrConfig)) return getOrCreateRootLog().forPage(pageOrConfig);

  applyConfig(pageOrConfig);

  return getOrCreateRootLog();
}

/**
 * Clears event listeners and restores default logger configuration.
 */
function resetSingletonState(): void {
  _.emitter.clear();
  _.configManager.reset();
}

/**
 * Global logger instance for logging, updating configuration, and registering plugins.
 *
 * Can be called as a function with a page context to create a scoped logger:
 * `const log = logger({ name: 'storage.ts' })`.
 *
 * @example
 * ```ts
 * import { logger } from '@s20/logging';
 *
 * const log = logger({ name: 'storage.ts' });
 * log.info('Event persisted', { id: 1 });
 * ```
 */
export const logger: LoggerSingleton = Object.assign(loggerCallable, {
  config: (options?: Partial<LoggerConfig>): LogFunction => {
    if (options) {
      _.configManager.updateConfig(options);
    }

    return getOrCreateRootLog();
  },
  configure: (options?: Partial<LoggerConfig>): LogFunction => {
    if (options) {
      _.configManager.updateConfig(options);
    }

    return getOrCreateRootLog();
  },
  critical: (message: string, data?: unknown): void => {
    getOrCreateRootLog().critical(message, data);
  },
  debug: (message: string, data?: unknown): void => {
    getOrCreateRootLog().debug(message, data);
  },
  error: (message: string, data?: unknown): void => {
    getOrCreateRootLog().error(message, data);
  },
  forPage: (page: PageContext): LogFunction => getOrCreateRootLog().forPage(page),
  getConfig: (): LoggerConfig => _.configManager.getConfig(),
  info: (message: string, data?: unknown): void => {
    getOrCreateRootLog().info(message, data);
  },
  get log(): LogFunction {
    return getOrCreateRootLog();
  },
  off: (event: LogEventType, handler: LogHandler): void => {
    _.emitter.off(event, handler);
  },
  on: (event: LogEventType, handler: LogHandler): Unsubscribe => _.emitter.on(event, handler),
  reset: (): void => {
    resetSingletonState();
  },
  trace: (message: string, data?: unknown): void => {
    getOrCreateRootLog().trace(message, data);
  },
  use: ((plugin, options) => plugin(logger, options)) as LoggerSingleton['use'],
  warn: (message: string, data?: unknown): void => {
    getOrCreateRootLog().warn(message, data);
  },
});

/**
 * Root logging function.
 *
 * Prefer obtaining a scoped log function via `const log = logger({ name: ... })`
 * or `const log = logger.config(...)` to preserve module context.
 */
export const log: LogFunction = getOrCreateRootLog();
