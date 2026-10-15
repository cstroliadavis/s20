/**
 * @file Severity level priority weights and threshold comparison utilities.
 */
import type { LogLevel, LogLevelValues } from './types.js';

/**
 * Numeric weights used to compare {@link LogLevel} priorities during filtering.
 *
 * Higher numbers mean higher severity. The logger emits a message when its weight
 * meets or exceeds the active threshold:
 * `LOG_LEVEL_VALUES[messageLevel] >= LOG_LEVEL_VALUES[configuredLevel]`.
 */
export const LOG_LEVEL_VALUES: LogLevelValues = Object.freeze({
  critical: 60,
  debug: 20,
  error: 50,
  info: 30,
  none: 70,
  trace: 10,
  warn: 40,
});

/**
 * Checks if a log level meets or exceeds the active threshold.
 *
 * @param configuredLevel - Minimum threshold required to emit logs.
 * @param messageLevel - Severity of the incoming log message or event.
 * @returns True if the message should be logged.
 * @example
 * ```ts
 * isLevelEnabled('info', 'warn');
 * // returns true
 * ```
 */
export function isLevelEnabled(configuredLevel: LogLevel, messageLevel: LogLevel): boolean {
  return LOG_LEVEL_VALUES[messageLevel] >= LOG_LEVEL_VALUES[configuredLevel];
}

