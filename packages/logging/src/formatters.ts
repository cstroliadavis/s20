/**
 * @file Log event JSONL serialization formatter.
 */
import type { LogEvent } from './types.js';

/**
 * Serializes a log event directly to a single-line JSON string.
 *
 * @param event - Log event to serialize.
 * @returns Serialized JSON string.
 * @example
 * ```ts
 * const line = formatAsJson(event);
 * ```
 */
export function formatAsJson(event: LogEvent): string {
  return JSON.stringify(event);
}

