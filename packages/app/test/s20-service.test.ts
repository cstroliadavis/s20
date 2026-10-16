import { describe, expect, it } from 'bun:test';
import { createDefaultConfig } from '../src/config.js';
import { createMemoryStorage } from '../src/memory-storage.js';
import { createS20Service } from '../src/s20-service.js';

function setup() {
  const config = createDefaultConfig();
  const storage = createMemoryStorage();
  const service = createS20Service({ config, storage });

  return {
    config,
    service,
    storage,
  };
}

describe('s20-service', () => {
  it('records event with calculated defaults when only task name is provided', async () => {
    const env = setup();

    const event = await env.service.recordEvent({ task: 'Ticket 5260' });
    const tasks = await env.service.listTasks();

    expect(event.id).toBe(1);
    expect(event.task).toBe('Ticket 5260');
    expect(event.isDone).toBe(false);
    expect(event.duration).toBe(1);
    expect(event.notes).toBe('');
    expect(event.start).toMatch(/^\d{2}:\d{2}$/);
    expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tasks[0]?.finished).toBe('');
  });

  it('marks task finished and sets finish timestamp when done is true', async () => {
    const env = setup();

    const event = await env.service.recordEvent({ done: true, task: 'Ticket 5260' });
    const tasks = await env.service.listTasks();

    expect(event.isDone).toBe(true);
    expect(tasks[0]?.finished).not.toBe('');
  });

  it('records event with explicit start, duration, done status, and notes', async () => {
    const env = setup();

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
    const env = setup();

    const event = await env.service.recordEvent({ task: 'Break' });

    expect(event.task).toBe('Break');
    expect(event.duration).toBe(0.25);
  });

  it('accumulates total time and updates status when adding to existing task', async () => {
    const env = setup();

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

    const tasks = await env.service.listTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.totalTime).toBe(1.5);
    expect(tasks[0]?.finished).toBe('');
  });

  it('returns task suggestions with unfinished tasks prioritized first', async () => {
    const env = setup();

    await env.service.recordEvent({
      date: '2026-10-03',
      done: true,
      duration: 1,
      notes: '',
      start: '08:00',
      task: 'Completed Task',
    });

    await env.service.recordEvent({
      date: '2026-10-03',
      done: false,
      duration: 1,
      notes: '',
      start: '09:00',
      task: 'Active Task',
    });

    const suggestions = await env.service.getTaskSuggestions();

    expect(suggestions[0]).toBe('Active Task');
    expect(suggestions[1]).toBe('Completed Task');
  });

  it('lists recorded events and task records', async () => {
    const env = setup();

    await env.service.recordEvent({ task: 'Task 1' });
    await env.service.recordEvent({ task: 'Task 2' });

    const events = await env.service.listEvents();
    const tasks = await env.service.listTasks();

    expect(events).toHaveLength(2);
    expect(tasks).toHaveLength(2);
  });
});
