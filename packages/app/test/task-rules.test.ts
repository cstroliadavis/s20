import { describe, expect, it } from 'bun:test';
import { createDefaultConfig, type S20Config } from '../src/config.js';
import {
  applyEventToTask,
  computeNextId,
  createNewTaskRecord,
  rankTaskSuggestions,
} from '../src/task-rules.js';
import type { EventInput, TaskRecord } from '../src/types.js';

function setup(overrides: SetupOverrides = {}) {
  const config = Object.freeze(createDefaultConfig(overrides.config));

  function buildEvent(eventOverrides: Partial<EventInput> = {}): EventInput {
    return Object.freeze({
      date: '2026-10-03',
      duration: 1,
      isDone: false,
      notes: '',
      start: '09:00',
      task: 'Default Task',
      ...eventOverrides,
    });
  }

  function buildTask(taskOverrides: Partial<TaskRecord> = {}): TaskRecord {
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
      ...taskOverrides,
    });
  }

  return Object.freeze({
    buildEvent,
    buildTask,
    config,
  });
}

describe('task-rules', () => {
  it('computes next sequential ID starting at 1 when collection is empty', () => {
    expect(computeNextId([])).toBe(1);
    expect(computeNextId([{ id: 2 }, { id: 7 }, { id: 4 }])).toBe(8);
  });

  it('creates new open task with default category when isDone is false', () => {
    const { buildEvent, config } = setup({ config: { defaultCategory: 'engineering' } });
    const event = buildEvent({ date: '2026-10-03', duration: 1.5, isDone: false, start: '13:00' });

    const task = createNewTaskRecord(event, 4, config);

    expect(task.id).toBe(4);
    expect(task.category).toBe('engineering');
    expect(task.started).toBe('2026-10-03 13:00');
    expect(task.finished).toBe('');
    expect(task.totalTime).toBe(1.5);
  });

  it('creates new completed task with task-specific category and finish timestamp', () => {
    const { buildEvent, config } = setup({
      config: {
        taskDefaults: {
          Deploy: { category: 'ops' },
        },
      },
    });
    const event = buildEvent({
      date: '2026-10-03',
      duration: 0.5,
      isDone: true,
      start: '14:00',
      task: 'Deploy',
    });

    const task = createNewTaskRecord(event, 1, config);

    expect(task.category).toBe('ops');
    expect(task.finished).toBe('2026-10-03 14:30');
  });

  it('matches task-specific category presets case-insensitively', () => {
    const { buildEvent, config } = setup({
      config: {
        taskDefaults: {
          Deploy: { category: 'ops' },
        },
      },
    });
    const event = buildEvent({ task: 'deploy' });

    const task = createNewTaskRecord(event, 1, config);

    expect(task.category).toBe('ops');
  });

  it('rounds accumulated totalTime to 4 decimal places to prevent floating-point drift', () => {
    const { buildEvent, buildTask } = setup();
    const existing = buildTask({ totalTime: 0.1 });
    const event = buildEvent({ duration: 0.2 });

    const updated = applyEventToTask(existing, event);

    expect(updated.totalTime).toBe(0.3);
  });

  it('accumulates duration and updates finished timestamp without mutating original task', () => {
    const { buildEvent, buildTask } = setup();
    const existing = buildTask({ finished: '', totalTime: 2 });
    const event = buildEvent({ date: '2026-10-03', duration: 0.75, isDone: true, start: '10:00' });

    const updated = applyEventToTask(existing, event);

    expect(existing.totalTime).toBe(2);
    expect(updated.totalTime).toBe(2.75);
    expect(updated.finished).toBe('2026-10-03 10:45');
  });

  it('clears finished timestamp when subsequent event on completed task is not done', () => {
    const { buildEvent, buildTask } = setup();
    const existing = buildTask({ finished: '2026-10-03 10:00', totalTime: 1 });
    const event = buildEvent({ duration: 0.5, isDone: false });

    const updated = applyEventToTask(existing, event);

    expect(updated.totalTime).toBe(1.5);
    expect(updated.finished).toBe('');
  });

  it('ranks unfinished tasks in reverse order ahead of finished tasks and deduplicates names', () => {
    const { buildTask } = setup();
    const tasks = [
      buildTask({ finished: '2026-10-03 09:00', task: 'Done Old' }),
      buildTask({ finished: '', task: 'Open Old' }),
      buildTask({ finished: '', task: 'Open Old' }),
      buildTask({ finished: '2026-10-03 11:00', task: 'Done Recent' }),
      buildTask({ finished: '', task: '  Open Recent  ' }),
    ];

    const ranked = rankTaskSuggestions(tasks);

    expect(ranked).toEqual(['Open Recent', 'Open Old', 'Done Recent', 'Done Old']);
  });
});

/** Overrides for configuring isolated task-rules test fixtures. */
interface SetupOverrides {
  config?: Partial<S20Config>;
}
