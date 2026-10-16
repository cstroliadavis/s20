import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { createDefaultConfig, createS20Service, type EventRecord, type TaskRecord } from '@s20/app';
import { createCsvStorage, createDefaultStoragePaths } from '../src/index.js';

describe('csv-storage', () => {
  const tempDirs: string[] = [];

  function buildEvent(overrides: Partial<EventRecord> = {}): EventRecord {
    return Object.freeze({
      id: 1,

      date: '2026-10-03',
      duration: 1,
      isDone: false,
      notes: '',
      start: '09:00',
      task: 'Default Task',
      ...overrides,
    });
  }

  function buildTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
    return Object.freeze({
      id: 1,

      category: 'work',
      config: '{}',
      details: '',
      finished: '',
      importance: '',
      metadata: '{}',
      priority: '',
      started: '2026-10-03 09:00',
      task: 'Default Task',
      totalTime: 1,
      urgency: '',
      ...overrides,
    });
  }

  function setup() {
    const tmpDir = path.resolve(
      import.meta.dirname,
      `../test-data-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );

    tempDirs.push(tmpDir);
    fs.mkdirSync(tmpDir, { recursive: true });

    const config = Object.freeze(createDefaultConfig());
    const paths = Object.freeze(createDefaultStoragePaths(tmpDir));
    const storage = Object.freeze(createCsvStorage(paths));
    const service = Object.freeze(createS20Service({ config, storage }));

    return Object.freeze({
      buildEvent,
      buildTask,
      config,
      paths,
      service,
      storage,
      tmpDir,
    });
  }

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();

      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { force: true, recursive: true });
      }
    }
  });

  it('initializes empty events and tasks files with headers', async () => {
    const { paths, storage } = setup();

    const events = await storage.getEvents();
    const tasks = await storage.getTasks();

    expect(events).toEqual([]);
    expect(tasks).toEqual([]);
    expect(fs.existsSync(paths.eventsFilePath)).toBe(true);
    expect(fs.existsSync(paths.tasksFilePath)).toBe(true);
  });

  it('appends and reads back event and task records directly from CSV files', async () => {
    const { buildEvent, buildTask, storage } = setup();

    await storage.appendEvent(buildEvent({ duration: 2.5, isDone: true, task: 'Ticket 900' }));
    await storage.appendTask(buildTask({ task: 'Ticket 900', totalTime: 2.5 }));

    const events = await storage.getEvents();
    const tasks = await storage.getTasks();

    expect(events[0]?.task).toBe('Ticket 900');
    expect(events[0]?.duration).toBe(2.5);
    expect(events[0]?.isDone).toBe(true);
    expect(tasks[0]?.task).toBe('Ticket 900');
    expect(tasks[0]?.totalTime).toBe(2.5);
  });

  it('overwrites tasks file when saveTasks is called', async () => {
    const { buildTask, storage } = setup();

    await storage.appendTask(buildTask({ id: 1, task: 'Initial', totalTime: 1 }));
    await storage.saveTasks([
      buildTask({ finished: '2026-10-03 11:00', id: 1, task: 'Initial', totalTime: 3 }),
    ]);

    const tasks = await storage.getTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.totalTime).toBe(3);
    expect(tasks[0]?.finished).toBe('2026-10-03 11:00');
  });

  it('integrates with createS20Service to persist events and synchronize task totals on disk', async () => {
    const { service, storage } = setup();

    await service.recordEvent({
      date: '2026-10-03',
      done: true,
      duration: 1.5,
      start: '13:00',
      task: 'Ticket 5260',
    });

    await service.recordEvent({
      date: '2026-10-03',
      done: false,
      duration: 0.5,
      start: '15:00',
      task: 'Ticket 5260',
    });

    const events = await storage.getEvents();
    const tasks = await storage.getTasks();

    expect(events).toHaveLength(2);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.totalTime).toBe(2);
    expect(tasks[0]?.started).toBe('2026-10-03 13:00');
    expect(tasks[0]?.finished).toBe('');
  });
});
