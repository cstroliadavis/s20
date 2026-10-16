import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { createDefaultConfig, createS20Service } from '@s20/app';
import { createCsvStorage, createDefaultStoragePaths } from '../src/index.js';

function setupTestEnvironment() {
  const tmpDir = path.resolve(import.meta.dirname, `../test-data-${Date.now()}`);

  fs.mkdirSync(tmpDir, { recursive: true });

  const config = createDefaultConfig();
  const paths = createDefaultStoragePaths(tmpDir);
  const storage = createCsvStorage(paths);
  const service = createS20Service({ config, storage });

  function cleanup() {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { force: true, recursive: true });
    }
  }

  return {
    cleanup,
    config,
    paths,
    service,
    storage,
    tmpDir,
  };
}

describe('csv-storage', () => {
  let env: ReturnType<typeof setupTestEnvironment>;

  afterEach(() => {
    if (env) {
      env.cleanup();
    }
  });

  it('initializes empty events and tasks files with headers', async () => {
    env = setupTestEnvironment();

    const events = await env.storage.getEvents();
    const tasks = await env.storage.getTasks();

    expect(events).toEqual([]);
    expect(tasks).toEqual([]);
    expect(fs.existsSync(env.paths.eventsFilePath)).toBe(true);
    expect(fs.existsSync(env.paths.tasksFilePath)).toBe(true);
  });

  it('persists an event and creates new task record when task does not exist', async () => {
    env = setupTestEnvironment();

    const createdEvent = await env.service.recordEvent({
      date: '2026-10-03',
      done: true,
      duration: 1.5,
      notes: 'Initial ticket work',
      start: '13:00',
      task: 'Ticket 5260',
    });

    expect(createdEvent.id).toBe(1);
    expect(createdEvent.task).toBe('Ticket 5260');

    const events = await env.storage.getEvents();

    expect(events).toHaveLength(1);
    expect(events[0]?.id).toBe(1);
    expect(events[0]?.isDone).toBe(true);

    const tasks = await env.storage.getTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.id).toBe(1);
    expect(tasks[0]?.task).toBe('Ticket 5260');
    expect(tasks[0]?.totalTime).toBe(1.5);
    expect(tasks[0]?.started).toBe('2026-10-03 13:00');
    expect(tasks[0]?.finished).toBe('2026-10-03 14:30');
  });

  it('persists updated task total time and status when adding to existing task', async () => {
    env = setupTestEnvironment();

    await env.service.recordEvent({
      date: '2026-10-03',
      done: true,
      duration: 1,
      notes: 'First part',
      start: '09:00',
      task: 'Ticket 5260',
    });

    const secondEvent = await env.service.recordEvent({
      date: '2026-10-03',
      done: false,
      duration: 0.5,
      notes: 'Follow-up part',
      start: '10:00',
      task: 'Ticket 5260',
    });

    expect(secondEvent.id).toBe(2);

    const tasks = await env.storage.getTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.totalTime).toBe(1.5);
    expect(tasks[0]?.finished).toBe('');
  });
});
