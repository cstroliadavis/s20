/**
 * @file Factory for creating scoped and root callable log functions.
 */
import { buildLoggerMetadata } from './config.js';
import { isLevelEnabled } from './levels.js';
import type {
  LogEvent,
  LogFunction,
  LogFunctionDeps,
  LogFunctionExtensions,
  LogMethodCallable,
  LogSeverityLevel,
} from './types.js';

/**
 * Fields needed to build and emit a direct log event.
 */
interface EmitLogParams {
  data?: unknown;
  deps: LogFunctionDeps;
  level: LogSeverityLevel;
  message: string;
}

/**
 * Builds a log event from a direct log call.
 */
function createDirectLogEvent(params: EmitLogParams): LogEvent {
  const config = params.deps.configManager.getConfig();

  return {
    eventType: params.level,
    level: params.level,
    logger: buildLoggerMetadata(params.deps.page, config),
    message: params.message,
    metadata: normalizeMetadata(params.data),
    timestamp: Temporal.Now.instant().toString(),
  };
}

/**
 * Returns a log handler bound to a fixed severity level like debug, warn, or error.
 */
function createLevelMethod(level: LogSeverityLevel, deps: LogFunctionDeps): LogMethodCallable {
  return function methodHandler(message: string, data?: unknown): void {
    emitDirectLog({ data, deps, level, message: String(message) });
  };
}

/**
 * Emits a log event if the severity level meets the active threshold.
 */
function emitDirectLog(params: EmitLogParams): void {
  const effective = params.deps.configManager.resolveEffective(params.deps.page);
  const enabled = effective.enabled && isLevelEnabled(effective.level, params.level);

  if (!enabled) return;

  const event = createDirectLogEvent(params);

  params.deps.emitter.emit(params.level, event);
}

/**
 * Checks if data is a non-null object that can serve as log metadata.
 */
function isObjectData(data: unknown): data is Record<string, unknown> {
  if (!data) return false;

  return typeof data === 'object';
}

/**
 * Formats user-supplied metadata into an object, wrapping primitive values in `{ value }`.
 */
function normalizeMetadata(data: unknown): Record<string, unknown> | undefined {
  if (data === undefined) return undefined;
  if (isObjectData(data)) return data;

  return { value: data };
}

/**
 * Creates the primary log function, binding severity methods and plugin hooks.
 *
 * @param deps - Emitter, configuration manager, and context store dependencies.
 * @returns Callable log function with attached severity helpers and plugin hooks.
 * @example
 * ```ts
 * const log = createLogFunction(deps);
 * log('Application started');
 * log.info('Event recorded', { id: 1 });
 * ```
 */
export function createLogFunction(deps: LogFunctionDeps): LogFunction {
  function callable(message: string, data?: unknown): void {
    emitDirectLog({ data, deps, level: 'info', message: String(message) });
  }

  const extensions: LogFunctionExtensions = {
    config: (patch) => {
      if (patch) {
        deps.configManager.updateConfig(patch);
      }

      return instance;
    },
    configure: (patch) => {
      if (patch) {
        deps.configManager.updateConfig(patch);
      }

      return instance;
    },
    critical: createLevelMethod('critical', deps),
    debug: createLevelMethod('debug', deps),
    error: createLevelMethod('error', deps),
    forPage: (page) => createLogFunction({ ...deps, page }),
    info: createLevelMethod('info', deps),
    log: callable as LogFunction,
    off: (event, handler) => deps.emitter.off(event, handler),
    on: (event, handler) => deps.emitter.on(event, handler),
    trace: createLevelMethod('trace', deps),
    use: (plugin, options) => plugin(instance, options),
    warn: createLevelMethod('warn', deps),
  };

  const instance = Object.assign(callable, extensions) as LogFunction;

  extensions.log = instance;

  return instance;
}
