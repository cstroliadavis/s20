import { describe, expect, it } from 'bun:test';
import { createDefaultConfig, type S20Config } from '../src/config.js';
import { type AddEventOptions, createS20Service } from '../src/s20-service.js';
import type { EventRecord, S20Storage, TaskRecord } from '../src/types.js';

function buildSeedEvent(partial: Partial<EventRecord>, index: number): EventRecord {
  return {
    id: partial.id ?? index + 1,

    date: partial.date ?? '2026-10-03',
    duration: partial.duration ?? 1,
    isDone: partial.isDone ?? false,
    notes: partial.notes ?? '',
    start: partial.start ?? '09:00',
    task: partial.task ?? `Task ${index + 1}`,
  };
}

function buildSeedTask(partial: Partial<TaskRecord>, index: number): TaskRecord {
  return {
    id: partial.id ?? index + 1,

    category: partial.category ?? 'work',
    config: partial.config ?? '{}',
    details: partial.details ?? '',
    finished: partial.finished ?? '',
    importance: partial.importance ?? '',
    metadata: partial.metadata ?? '{}',
    priority: partial.priority ?? '',
    started: partial.started ?? '2026-10-03 09:00',
    task: partial.task ?? `Task ${index + 1}`,
    totalTime: partial.totalTime ?? 1,
    urgency: partial.urgency ?? '',
  };
}

function setup(overrides: SetupOverrides = {}) {
  const events: EventRecord[] = (overrides.initialEvents ?? []).map(buildSeedEvent);
  const tasks: TaskRecord[] = (overrides.initialTasks ?? []).map(buildSeedTask);
  const calls = {
    appendEvent: [] as EventRecord[],
    appendTask: [] as TaskRecord[],
    initCount: 0,
    saveTasks: [] as TaskRecord[][],
  };

  const mockStorage: S20Storage = Object.freeze({
    appendEvent: async (event: EventRecord) => {
      calls.appendEvent.push(event);
      events.push({ ...event });
    },
    appendTask: async (task: TaskRecord) => {
      calls.appendTask.push(task);
      tasks.push({ ...task });
    },
    getEvents: async () => events.map((e) => ({ ...e })),
    getTasks: async () => tasks.map((t) => ({ ...t })),
    init: async () => {
      calls.initCount += 1;
    },
    saveTasks: async (updated: TaskRecord[]) => {
      calls.saveTasks.push(updated);
      tasks.length = 0;
      tasks.push(...updated.map((t) => ({ ...t })));
    },
  });

  const config = Object.freeze(createDefaultConfig(overrides.config));
  const service = Object.freeze(createS20Service({ config, storage: mockStorage }));

  function recordTestEvent(eventOverrides: Partial<AddEventOptions> = {}) {
    return service.recordEvent({
      task: 'Ticket 5260',
      ...eventOverrides,
    });
  }

  return Object.freeze({
    calls,
    config,
    mockStorage,
    recordTestEvent,
    service,
  });
}

describe('s20-service', () => {
  it('records event with calculated defaults when only task name is provided', async () => {
    const { calls, service } = setup();

    const event = await service.recordEvent({ task: 'Ticket 5260' });

    expect(calls.initCount).toBe(1);
    expect(event.id).toBe(1);
    expect(event.task).toBe('Ticket 5260');
    expect(event.isDone).toBe(false);
    expect(event.duration).toBe(1);
    expect(event.notes).toBe('');
    expect(event.start).toMatch(/^\d{2}:\d{2}$/);
    expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(calls.appendTask[0]?.finished).toBe('');
  });

  it('marks task finished and sets finish timestamp when done is true', async () => {
    const { calls, recordTestEvent } = setup();

    const event = await recordTestEvent({ done: true });

    expect(event.isDone).toBe(true);
    expect(calls.appendTask[0]?.finished).not.toBe('');
  });

  it('records event with explicit start, duration, done status, and notes', async () => {
    const { service } = setup();

    const event = await service.recordEvent({
      date: '2026-10-03',
      done: false,
      duration: '2.25',
      notes: 'Had to wait for permission from bob',
      start: '05:30',
      task: 'Ticket 5260',
    });

    expect(event).toEqual({
      id: 1,

      date: '2026-10-03',
      duration: 2.25,
      isDone: false,
      notes: 'Had to wait for permission from bob',
      start: '05:30',
      task: 'Ticket 5260',
    });
  });

  it('formats Date object input into YYYY-MM-DD date string', async () => {
    const { recordTestEvent } = setup();

    const event = await recordTestEvent({ date: new Date('2026-10-03T12:00:00Z') });

    expect(event.date).toBe('2026-10-03');
  });

  it('applies task-specific default duration when configured', async () => {
    const { service } = setup({
      config: {
        taskDefaults: {
          Break: { duration: '15m' },
        },
      },
    });

    const event = await service.recordEvent({ task: 'Break' });

    expect(event.duration).toBe(0.25);
  });

  it('accumulates total time and updates existing task when case-insensitive match exists', async () => {
    const { calls, recordTestEvent } = setup({
      initialTasks: [{ finished: '2026-10-03 10:00', task: 'ticket 5260', totalTime: 1 }],
    });

    await recordTestEvent({ done: false, duration: 0.5 });

    expect(calls.appendTask).toHaveLength(0);
    expect(calls.saveTasks).toHaveLength(1);
    expect(calls.saveTasks[0]?.[0]?.totalTime).toBe(1.5);
    expect(calls.saveTasks[0]?.[0]?.finished).toBe('');
  });

  it('returns task suggestions with unfinished tasks prioritized first', async () => {
    const { service } = setup({
      initialTasks: [
        { finished: '2026-10-03 09:00', task: 'Completed Task' },
        { finished: '', task: 'Active Task' },
      ],
    });

    const suggestions = await service.getTaskSuggestions();

    expect(suggestions).toEqual(['Active Task', 'Completed Task']);
  });

  it('lists recorded events and task records from storage', async () => {
    const { service } = setup({
      initialEvents: [{ task: 'Task 1' }, { task: 'Task 2' }],
      initialTasks: [{ task: 'Task 1' }, { task: 'Task 2' }],
    });

    const events = await service.listEvents();
    const tasks = await service.listTasks();

    expect(events.map((e) => e.task)).toEqual(['Task 1', 'Task 2']);
    expect(tasks.map((t) => t.task)).toEqual(['Task 1', 'Task 2']);
  });
});

/** Overrides for configuring isolated s20-service test fixtures. */
interface SetupOverrides {
  config?: Partial<S20Config>;
  initialEvents?: Partial<EventRecord>[];
  initialTasks?: Partial<TaskRecord>[];
}
