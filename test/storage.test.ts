import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { createDefaultConfig } from '../src/config.js';
import { createStorage } from '../src/storage.js';

function setupTestEnvironment() {
  const tmpDir = path.resolve(import.meta.dirname, `../test-data-${Date.now()}`);

  fs.mkdirSync(tmpDir, { recursive: true });

  const config = createDefaultConfig(tmpDir);
  const storage = createStorage(config);

  function cleanup() {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { force: true, recursive: true });
    }
  }

  return {
    cleanup,
    config,
    storage,
    tmpDir,
  };
}

describe('storage', () => {
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
    expect(fs.existsSync(env.config.eventsFilePath)).toBe(true);
    expect(fs.existsSync(env.config.tasksFilePath)).toBe(true);
  });

  it('adds an event and creates new task record when task does not exist', async () => {
    env = setupTestEnvironment();

    const createdEvent = await env.storage.addEvent({
      date: '2026-10-03',
      duration: 1.5,
      isDone: true,
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

  it('accumulates total time and updates status when adding to existing task', async () => {
    env = setupTestEnvironment();

    await env.storage.addEvent({
      date: '2026-10-03',
      duration: 1,
      isDone: true,
      notes: 'First part',
      start: '09:00',
      task: 'Ticket 5260',
    });

    const secondEvent = await env.storage.addEvent({
      date: '2026-10-03',
      duration: 0.5,
      isDone: false,
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

  it('returns task suggestions with unfinished tasks prioritized first', async () => {
    env = setupTestEnvironment();

    // Done task
    await env.storage.addEvent({
      date: '2026-10-03',
      duration: 1,
      isDone: true,
      notes: '',
      start: '08:00',
      task: 'Completed Task',
    });

    // Unfinished task
    await env.storage.addEvent({
      date: '2026-10-03',
      duration: 1,
      isDone: false,
      notes: '',
      start: '09:00',
      task: 'Active Task',
    });

    const suggestions = await env.storage.getTaskSuggestions();

    expect(suggestions[0]).toBe('Active Task');
    expect(suggestions[1]).toBe('Completed Task');
  });
});
