import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { createDefaultConfig } from '../src/config.js';
import { createS20Service } from '../src/s20-service.js';
import { createStorage } from '../src/storage.js';

function setup() {
  const tmpDir = path.resolve(import.meta.dirname, `../test-service-${Date.now()}`);

  fs.mkdirSync(tmpDir, { recursive: true });

  const config = createDefaultConfig(tmpDir);
  const storage = createStorage(config);
  const service = createS20Service({ config, storage });

  function cleanup() {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { force: true, recursive: true });
    }
  }

  return {
    cleanup,
    config,
    service,
    storage,
    tmpDir,
  };
}

describe('s20-service', () => {
  let env: ReturnType<typeof setup>;

  afterEach(() => {
    if (env) {
      env.cleanup();
    }
  });

  it('records event with calculated defaults when only task name is provided', async () => {
    env = setup();

    const event = await env.service.recordEvent({ task: 'Ticket 5260' });

    expect(event.id).toBe(1);
    expect(event.task).toBe('Ticket 5260');
    expect(event.isDone).toBe(true);
    expect(event.duration).toBe(1);
    expect(event.notes).toBe('');
    expect(event.start).toMatch(/^\d{2}:\d{2}$/);
    expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('records event with explicit start, duration, done status, and notes', async () => {
    env = setup();

    const event = await env.service.recordEvent({
      date: '2026-10-03',
      done: false,
      duration: '2.25',
      notes: 'Had to wait for permission from bob',
      start: '05:30',
      task: 'Ticket 5260',
    });

    expect(event.id).toBe(1);
    expect(event.task).toBe('Ticket 5260');
    expect(event.isDone).toBe(false);
    expect(event.duration).toBe(2.25);
    expect(event.start).toBe('05:30');
    expect(event.notes).toBe('Had to wait for permission from bob');
  });

  it('applies task-specific default duration when available in config', async () => {
    env = setup();

    const event = await env.service.recordEvent({ task: 'Break' });

    expect(event.task).toBe('Break');
    expect(event.duration).toBe(0.25);
  });

  it('lists recorded events and task records', async () => {
    env = setup();

    await env.service.recordEvent({ task: 'Task 1' });
    await env.service.recordEvent({ task: 'Task 2' });

    const events = await env.service.listEvents();
    const tasks = await env.service.listTasks();

    expect(events).toHaveLength(2);
    expect(tasks).toHaveLength(2);
  });
});
