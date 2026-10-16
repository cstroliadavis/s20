/**
 * @file In-memory log event sink for unit testing and inspection.
 */
import type { LogEvent } from './types.js';

/**
 * Creates an in-memory sink that stores log events for test assertions or buffering.
 *
 * @returns Sink object with handlers to record, read, and clear logs.
 * @example
 * ```ts
 * const memory = createMemorySink();
 * logger.on('log', memory.handler);
 * const captured = memory.getEvents();
 * ```
 */
export function createMemorySink() {
  const _ = {
    events: [] as LogEvent[],
  };

  function clear(): void {
    _.events.length = 0;
  }

  function getEvents(): LogEvent[] {
    return [..._.events];
  }

  function handler(event: LogEvent): void {
    _.events.push(event);
  }

  return {
    clear,
    getEvents,
    handler,
  };
}
