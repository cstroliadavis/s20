import { afterEach, describe, expect, it } from 'bun:test';
import {
  createConfigManager,
  createEventEmitter,
  createMemorySink,
  isLevelEnabled,
  LOG_LEVEL_VALUES,
  type LogEvent,
  logger,
} from '../src/index.js';

describe('@s20/logging core logger', () => {
  const setup = () => {
    logger.reset();

    const memory = createMemorySink();
    const unsubscribe = logger.on('log', memory.handler);

    function buildLogEvent(overrides: Partial<LogEvent> = {}): LogEvent {
      return Object.freeze({
        eventType: 'info',
        level: 'info',
        message: 'default message',
        timestamp: '2026-10-15T00:00:00.000Z',
        ...overrides,
      });
    }

    return Object.freeze({
      buildLogEvent,
      memory,
      unsubscribe,
    });
  };

  afterEach(() => {
    logger.reset();
  });

  it('compares severity thresholds with isLevelEnabled and LOG_LEVEL_VALUES', () => {
    expect(LOG_LEVEL_VALUES.trace).toBeLessThan(LOG_LEVEL_VALUES.info);
    expect(isLevelEnabled('info', 'warn')).toBe(true);
    expect(isLevelEnabled('warn', 'debug')).toBe(false);
  });

  it('emits scoped log events with page and global metadata', () => {
    const { memory } = setup();

    logger.config({
      appName: 's20',
      appVersion: '0.1.0',
      environment: 'test',
      level: 'debug',
    });

    const log = logger({ category: 'storage', name: 'storage.ts' });

    log.info('Event added', { eventId: 42 });
    log.trace('Ignored below debug threshold');

    const events = memory.getEvents();

    expect(events).toHaveLength(1);
    expect(events[0]?.message).toBe('Event added');
    expect(events[0]?.level).toBe('info');
    expect(events[0]?.metadata).toEqual({ eventId: 42 });
    expect(events[0]?.logger?.category).toBe('storage');
    expect(events[0]?.logger?.name).toBe('storage.ts');
  });

  it('applies category and page level overrides in createConfigManager', () => {
    const manager = createConfigManager({
      categories: {
        storage: { level: 'debug' },
      },
      level: 'warn',
      pages: {
        'cli.ts': { level: 'trace' },
      },
    });

    expect(manager.resolveEffective().level).toBe('warn');
    expect(manager.resolveEffective({ category: 'storage' }).level).toBe('debug');
    expect(manager.resolveEffective({ category: 'storage', name: 'cli.ts' }).level).toBe('trace');
  });

  it('dispatches events to severity, aggregate log, and wildcard channels', () => {
    const { buildLogEvent } = setup();
    const emitter = createEventEmitter();
    const received: string[] = [];

    emitter.on('info', (e) => received.push(`info:${e.message}`));
    emitter.on('log', (e) => received.push(`log:${e.message}`));
    emitter.on('*', (e) => received.push(`*:${e.message}`));

    emitter.emit('info', buildLogEvent({ message: 'hello' }));

    expect(received).toEqual(['info:hello', 'log:hello', '*:hello']);
  });
});
