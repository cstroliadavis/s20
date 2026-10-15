/**
 * @file Asynchronous execution span context store powered by AsyncLocalStorage.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import type { ContextStore, CreateSpanOptions, ExecutionSpan } from './types.js';

/**
 * Parsed span options ready for child span creation.
 */
interface NormalizedSpanOptions {
  className?: string;
  corrGen?: () => string;
  functionName?: string;
  parentSpan?: ExecutionSpan;
  spanGen?: () => string;
}

/**
 * Generates a UUID for trace correlation or span IDs.
 */
function generateDefaultId(): string {
  return crypto.randomUUID();
}

/**
 * Checks if an object has the spanId and depth fields of an existing span.
 */
function isExecutionSpan(val: object): boolean {
  return 'spanId' in val && 'depth' in val;
}

/**
 * Checks if an argument contains span configuration options instead of a parent span.
 */
function isSpanOptions(val: unknown): val is CreateSpanOptions {
  if (!val || typeof val !== 'object') return false;

  return !isExecutionSpan(val);
}

/**
 * Extracts span options whether passed as an options object or positional arguments.
 */
function normalizeSpanOptions(
  arg?: CreateSpanOptions | ExecutionSpan,
  corrGen?: () => string,
  spanGen?: () => string,
): NormalizedSpanOptions {
  if (isSpanOptions(arg)) {
    return {
      className: arg.className,
      corrGen: arg.correlationIdGenerator,
      functionName: arg.functionName,
      parentSpan: arg.parentSpan,
      spanGen: arg.spanIdGenerator,
    };
  }

  return {
    className: undefined,
    corrGen,
    functionName: undefined,
    parentSpan: arg,
    spanGen,
  };
}

/**
 * Inherits a parent correlation ID or generates a new one for a root trace.
 */
function resolveCorrelationId(parent?: ExecutionSpan, generator?: () => string): string {
  if (parent) return parent.correlationId;
  if (generator) return generator();

  return generateDefaultId();
}

/**
 * Generates a span ID using a custom generator when provided, or a random UUID.
 */
function resolveSpanId(generator?: () => string): string {
  if (generator) return generator();

  return generateDefaultId();
}

/**
 * Creates an AsyncLocalStorage store for tracking active execution spans across async calls.
 *
 * @returns Context store providing span creation, active span retrieval, and scope execution.
 * @example
 * ```ts
 * const contextStore = createContextStore();
 * const childSpan = contextStore.createChildSpan();
 * contextStore.runWithSpan(childSpan, () => {
 *   const active = contextStore.getActiveSpan();
 * });
 * ```
 */
export function createContextStore(): ContextStore {
  const _ = {
    storage: new AsyncLocalStorage<ExecutionSpan>(),
  };

  function createChildSpan(
    parentSpanOrOptions?: CreateSpanOptions | ExecutionSpan,
    correlationIdGenerator?: () => string,
    spanIdGenerator?: () => string,
  ): ExecutionSpan {
    const opts = normalizeSpanOptions(parentSpanOrOptions, correlationIdGenerator, spanIdGenerator);
    const correlationId = resolveCorrelationId(opts.parentSpan, opts.corrGen);
    const spanId = resolveSpanId(opts.spanGen);
    const depth = opts.parentSpan ? opts.parentSpan.depth + 1 : 0;
    const parentSpanId = opts.parentSpan ? opts.parentSpan.spanId : undefined;
    const startTime = performance.now();

    return {
      className: opts.className,
      correlationId,
      depth,
      functionName: opts.functionName,
      parentSpanId,
      spanId,
      startTime,
    };
  }

  function getActiveSpan(): ExecutionSpan | undefined {
    return _.storage.getStore();
  }

  function runWithSpan<T>(span: ExecutionSpan, callback: () => T): T {
    return _.storage.run(span, callback);
  }

  return {
    createChildSpan,
    getActiveSpan,
    runWithSpan,
  };
}

/**
 * Default context store tracking active execution spans across asynchronous calls.
 */
export const defaultContextStore: ContextStore = createContextStore();

