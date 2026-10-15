/**
 * @file Event emitter bus for broadcasting and subscribing to log events.
 */
import type { LogEvent, LogEventType, LogHandler, Unsubscribe } from './types.js';

/**
 * Sends events to aggregate channels like `'log'` and wildcard listeners (`'*'`).
 */
function dispatchSecondaryEvents(
  listeners: Map<LogEventType, Set<LogHandler>>,
  event: LogEventType,
  payload: LogEvent,
): void {
  if (isLogSeverityEvent(event)) {
    emitToBucket(listeners.get('log'), payload);
  }

  if (event !== '*') {
    emitToBucket(listeners.get('*'), payload);
  }
}

/**
 * Invokes all registered handlers in a listener set.
 */
function emitToBucket(bucket: Set<LogHandler> | undefined, payload: LogEvent): void {
  if (!bucket) return;

  for (const handler of bucket) {
    handler(payload);
  }
}

/**
 * Gets the listener set for an event type, creating one if needed.
 */
function getOrCreateBucket(
  listeners: Map<LogEventType, Set<LogHandler>>,
  event: LogEventType,
): Set<LogHandler> {
  const existing = listeners.get(event);

  if (existing) return existing;

  const bucket = new Set<LogHandler>();

  listeners.set(event, bucket);

  return bucket;
}

/**
 * Checks if an event is a log severity level rather than an aggregate channel.
 */
function isLogSeverityEvent(event: LogEventType): boolean {
  return !['*', 'log'].includes(event);
}

/**
 * Removes a handler from a listener set.
 */
function removeHandler(bucket: Set<LogHandler> | undefined, handler: LogHandler): void {
  if (!bucket) return;

  bucket.delete(handler);
}

/**
 * Creates an event bus for subscribing to and broadcasting log events.
 *
 * @returns An emitter with subscription and dispatch methods.
 * @example
 * ```ts
 * const emitter = createEventEmitter();
 * const unsubscribe = emitter.on('log', (event) => {
 *   console.log(event.message);
 * });
 * emitter.emit('info', eventPayload);
 * unsubscribe();
 * ```
 */
export function createEventEmitter() {
  const _ = {
    listeners: new Map<LogEventType, Set<LogHandler>>(),
  };

  function clear(): void {
    _.listeners.clear();
  }

  function emit(event: LogEventType, payload: LogEvent): void {
    emitToBucket(_.listeners.get(event), payload);
    dispatchSecondaryEvents(_.listeners, event, payload);
  }

  function listenerCount(event: LogEventType): number {
    const bucket = _.listeners.get(event);

    return bucket ? bucket.size : 0;
  }

  function off(event: LogEventType, handler: LogHandler): void {
    removeHandler(_.listeners.get(event), handler);
  }

  function on(event: LogEventType, handler: LogHandler): Unsubscribe {
    const bucket = getOrCreateBucket(_.listeners, event);

    bucket.add(handler);

    return () => {
      off(event, handler);
    };
  }

  return {
    clear,
    emit,
    listenerCount,
    off,
    on,
  };
}

