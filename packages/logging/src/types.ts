/**
 * @file Core type definitions for @s20/logging.
 *
 * Defines severity levels, structured log events, execution spans, logger configuration,
 * plugin contracts, and rotating JSONL file plugin options.
 */

/**
 * Severity levels supported for log messages and events.
 */
export type LogSeverityLevel = 'critical' | 'debug' | 'error' | 'info' | 'trace' | 'warn';

/**
 * Log severity levels ordered from lowest to highest priority, plus 'none' to mute output.
 */
export type LogLevel = LogSeverityLevel | 'none';

/**
 * Numeric priority weights for each {@link LogLevel}, used for threshold comparisons.
 */
export type LogLevelValues = Readonly<Record<LogLevel, number>>;

/**
 * Event names emitted for log messages.
 */
export type LogEventType = '*' | 'log' | LogSeverityLevel;

/**
 * Function that unsubscribes a previously registered event listener.
 */
export type Unsubscribe = () => void;

/**
 * Listener function called when a subscribed log event is emitted.
 */
export type LogHandler = (event: LogEvent) => void;

/**
 * Event subscription interface implemented by loggers and plugin targets.
 */
export interface LoggerTarget {
  /**
   * Removes a previously registered event listener.
   */
  off: (event: LogEventType, handler: LogHandler) => void;

  /**
   * Subscribes to log events on a specific severity, `'log'`, or `'*'` channel.
   */
  on: (event: LogEventType, handler: LogHandler) => Unsubscribe;
}

/**
 * Plugin function that extends a logger by listening to its event stream.
 */
export type LoggerPlugin<
  Options = unknown,
  Target extends LoggerTarget = LoggerTarget,
  Return = unknown,
> = (logger: Target, options?: Options) => Return;

/**
 * Configuration options for the rotating JSONL file output plugin.
 */
export interface JsonlFilePluginOptions {
  /**
   * Base filename prefix used when generating sequential `.jsonl` files. Defaults to `'s20'`.
   */
  baseName?: string;

  /**
   * Custom serializer converting a {@link LogEvent} into a single line of text.
   */
  formatter?: (event: LogEvent) => string;

  /**
   * Directory path where rotating `.jsonl` files are stored. Defaults to `'data/logs'`.
   */
  logDir?: string;

  /**
   * Maximum number of rows written to a single `.jsonl` file before rolling over. Defaults to `5000`.
   */
  maxRows?: number;
}

/**
 * Active logger settings after combining defaults and page/category rules.
 */
export interface EffectiveSettings {
  /**
   * Whether logging is currently enabled.
   */
  enabled: boolean;

  /**
   * Minimum severity level required to emit logs.
   */
  level: LogLevel;
}

/**
 * Metadata identifying the file, module, or subsystem running the code.
 */
export interface PageContext {
  /**
   * Application name configured on the logger.
   */
  appName?: string;

  /**
   * Application release version configured on the logger.
   */
  appVersion?: string;

  /**
   * Subsystem or category name, such as `'storage'` or `'cli'`.
   */
  category?: string;

  /**
   * Deployment environment name, such as `'production'` or `'development'`.
   */
  environment?: string;

  /**
   * File path or URL of the script.
   */
  location?: string;

  /**
   * Human-friendly label for the module or script.
   */
  name?: string;

  /**
   * Prefix for grouping related loggers together.
   */
  namespace?: string;

  /**
   * Host or server instance name emitting the log.
   */
  serverName?: string;

  /**
   * Additional custom context fields.
   */
  [key: string]: unknown;
}

/**
 * Error details captured when an error is logged.
 */
export interface LogErrorInfo {
  /**
   * Error constructor name, such as `'TypeError'` or `'RangeError'`.
   */
  kind?: string;

  /**
   * Error message string.
   */
  message: string;

  /**
   * Stack trace captured from the error.
   */
  stack?: string;
}

/**
 * Metadata describing the logger that emitted an event.
 */
export interface LogLoggerMetadata {
  /**
   * Application name configured on the logger.
   */
  appName?: string;

  /**
   * Application release version configured on the logger.
   */
  appVersion?: string;

  /**
   * Category name set on the emitting logger.
   */
  category?: string;

  /**
   * Deployment environment name.
   */
  environment?: string;

  /**
   * File location or URL set on the emitting logger.
   */
  location?: string;

  /**
   * Name set on the emitting logger.
   */
  name?: string;

  /**
   * Namespace grouping prefix set on the emitting logger.
   */
  namespace?: string;

  /**
   * Host or server instance name emitting the log.
   */
  serverName?: string;
}

/**
 * Structured payload for a log message event.
 */
export interface LogEvent {
  /**
   * Enclosing module or component name.
   */
  className?: string;

  /**
   * Trace correlation ID linking related spans and log calls.
   */
  correlationId?: string;

  /**
   * Nesting depth of the call when the event was emitted.
   */
  depth?: number;

  /**
   * Elapsed execution time in milliseconds when measured.
   */
  duration?: number;

  /**
   * Error details if the event records a failure.
   */
  error?: LogErrorInfo;

  /**
   * Event channel type.
   */
  eventType: LogEventType;

  /**
   * Name of the function that logged the message.
   */
  functionName?: string;

  /**
   * Severity level of this log entry.
   */
  level: LogLevel;

  /**
   * Metadata from the logger that emitted this event.
   */
  logger?: LogLoggerMetadata;

  /**
   * Log message text.
   */
  message: string;

  /**
   * Custom structured data passed to the log call.
   */
  metadata?: Record<string, unknown>;

  /**
   * Span ID of the caller span, if nested.
   */
  parentSpanId?: string;

  /**
   * Span ID for the current execution context.
   */
  spanId?: string;

  /**
   * ISO 8601 timestamp string when the event was created.
   */
  timestamp: string;
}

/**
 * Filter overrides applied to loggers matching a specific page or category.
 */
export interface PageFilterConfig {
  /**
   * Category override applied to matching loggers.
   */
  category?: string;

  /**
   * Minimum log level required to emit logs for matching loggers.
   */
  level?: LogLevel;
}

/**
 * Global logger configuration options, filters, and ID generators.
 */
export interface LoggerConfig {
  /**
   * Application name for identifying the service across log events.
   */
  appName?: string;

  /**
   * Application release version.
   */
  appVersion?: string;

  /**
   * Filter rules keyed by category name.
   */
  categories?: Record<string, PageFilterConfig>;

  /**
   * Custom function generating correlation IDs for root traces.
   */
  correlationIdGenerator?: () => string;

  /**
   * Default minimum log level when no specific level is set.
   */
  defaultLevel?: LogLevel;

  /**
   * Whether logging is enabled across the application.
   */
  enabled?: boolean;

  /**
   * Deployment environment name.
   */
  environment?: string;

  /**
   * Default formatter for converting log events to text.
   */
  formatter?: (event: LogEvent) => string;

  /**
   * Minimum severity level required to emit logs.
   */
  level?: LogLevel;

  /**
   * Filter rules keyed by page name or file path.
   */
  pages?: Record<string, PageFilterConfig>;

  /**
   * Host or server instance name emitting log events.
   */
  serverName?: string;

  /**
   * Custom function generating span IDs.
   */
  spanIdGenerator?: () => string;
}

/**
 * Call signature for emitting a log message at a fixed severity level.
 */
export type LogMethodCallable = (message: string, data?: unknown) => void;

/**
 * Call signature for invoking a log function directly (defaults to `'info'`).
 */
export type LogFunctionCallable = (message: string, data?: unknown) => void;

/**
 * Severity helpers, configuration methods, and event hooks attached to the log function.
 */
export interface LogFunctionExtensions {
  /**
   * Alias for configure. Updates logger settings and returns this log function.
   */
  config: (options?: Partial<LoggerConfig>) => LogFunction;

  /**
   * Updates logger configuration settings and returns this log function.
   */
  configure: (options?: Partial<LoggerConfig>) => LogFunction;

  /**
   * Logs critical errors at `'critical'` severity.
   */
  critical: LogMethodCallable;

  /**
   * Logs diagnostic details at `'debug'` severity.
   */
  debug: LogMethodCallable;

  /**
   * Logs errors at `'error'` severity.
   */
  error: LogMethodCallable;

  /**
   * Creates a logger scoped to a specific file or page context.
   */
  forPage: (page: PageContext) => LogFunction;

  /**
   * Logs informational messages at `'info'` severity.
   */
  info: LogMethodCallable;

  /**
   * Self-reference to this log function for destructuring.
   */
  log: LogFunction;

  /**
   * Removes a registered event listener.
   */
  off: (event: LogEventType, handler: LogHandler) => void;

  /**
   * Subscribes to log events for this logger.
   */
  on: (event: LogEventType, handler: LogHandler) => Unsubscribe;

  /**
   * Logs trace details at `'trace'` severity.
   */
  trace: LogMethodCallable;

  /**
   * Registers a plugin with this log function.
   */
  use: <Options, Return = Unsubscribe | void>(
    plugin: LoggerPlugin<Options, LogFunction, Return>,
    options?: Options,
  ) => Return;

  /**
   * Logs warnings at `'warn'` severity.
   */
  warn: LogMethodCallable;
}

/**
 * Callable logger supporting direct invocation and severity helpers.
 */
export type LogFunction = LogFunctionCallable & LogFunctionExtensions;

/**
 * Global logger object for configuring settings, subscribing to events, and creating scoped loggers.
 */
export interface LoggerSingleton {
  /**
   * Scopes a logger to a page context or updates global configuration.
   */
  (pageOrConfig?: PageContext | Partial<LoggerConfig>, config?: Partial<LoggerConfig>): LogFunction;

  /**
   * Alias for configure. Updates global configuration settings and returns the root log function.
   */
  config: (options?: Partial<LoggerConfig>) => LogFunction;

  /**
   * Updates global logger configuration settings and returns the root log function.
   */
  configure: (options?: Partial<LoggerConfig>) => LogFunction;

  /**
   * Logs critical errors at `'critical'` severity.
   */
  critical: LogMethodCallable;

  /**
   * Logs diagnostic messages at `'debug'` severity.
   */
  debug: LogMethodCallable;

  /**
   * Logs errors at `'error'` severity.
   */
  error: LogMethodCallable;

  /**
   * Creates a child logger scoped to a file or page context.
   */
  forPage: (page: PageContext) => LogFunction;

  /**
   * Returns a copy of the active configuration.
   */
  getConfig: () => LoggerConfig;

  /**
   * Logs informational messages at `'info'` severity.
   */
  info: LogMethodCallable;

  /**
   * Self-reference to the root log function for destructuring.
   */
  log: LogFunction;

  /**
   * Removes a registered event listener.
   */
  off: (event: LogEventType, handler: LogHandler) => void;

  /**
   * Subscribes to global log events.
   */
  on: (event: LogEventType, handler: LogHandler) => Unsubscribe;

  /**
   * Clears event listeners and resets configuration to defaults.
   */
  reset: () => void;

  /**
   * Logs trace details at `'trace'` severity.
   */
  trace: LogMethodCallable;

  /**
   * Registers a plugin with the global logger.
   */
  use: <Options, Return = Unsubscribe | void>(
    plugin: LoggerPlugin<Options, LoggerSingleton, Return>,
    options?: Options,
  ) => Return;

  /**
   * Logs warnings at `'warn'` severity.
   */
  warn: LogMethodCallable;
}

/**
 * Dependencies supplied when creating a log function instance.
 */
export interface LogFunctionDeps {
  /**
   * Configuration manager for updating and resolving active logger settings.
   */
  configManager: {
    getConfig: () => LoggerConfig;
    resolveEffective: (page?: PageContext) => EffectiveSettings;
    updateConfig: (patch: Partial<LoggerConfig>) => LoggerConfig;
  };

  /**
   * Event bus for emitting and subscribing to log events.
   */
  emitter: {
    emit: (event: LogEventType, payload: LogEvent) => void;
    off: (event: LogEventType, handler: LogHandler) => void;
    on: (event: LogEventType, handler: LogHandler) => Unsubscribe;
  };

  /**
   * Page or file context bound to this log instance.
   */
  page?: PageContext;
}
