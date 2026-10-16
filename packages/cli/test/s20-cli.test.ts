import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import type { AddEventOptions, EventRecord, S20Service, TaskRecord } from '@s20/app';
import { createS20Cli } from '../src/s20-cli.js';

function buildEventRecord(overrides: Partial<EventRecord> = {}, index = 0): EventRecord {
  return Object.freeze({
    id: overrides.id ?? index + 1,

    date: overrides.date ?? '2026-10-03',
    duration: overrides.duration ?? 1,
    isDone: overrides.isDone ?? false,
    notes: overrides.notes ?? '',
    start: overrides.start ?? '12:45',
    task: overrides.task ?? 'Ticket 5260',
  });
}

function setup(overrides: SetupOverrides = {}) {
  const recordedInputs: AddEventOptions[] = [];
  const storedEvents: EventRecord[] = (overrides.events ?? []).map((e, i) =>
    buildEventRecord(e, i),
  );
  const suggestions = overrides.suggestions ?? ['Ticket 5260'];

  const mockService: S20Service = Object.freeze({
    getTaskSuggestions: async () => [...suggestions],
    listEvents: async () => [...storedEvents],
    listTasks: async (): Promise<TaskRecord[]> => [],
    recordEvent: async (options: AddEventOptions): Promise<EventRecord> => {
      recordedInputs.push(options);

      const created = buildEventRecord(
        {
          duration: typeof options.duration === 'number' ? options.duration : 1,
          isDone: Boolean(options.done),
          notes: options.notes ?? '',
          start: options.start ?? '12:45',
          task: options.task,
        },
        storedEvents.length,
      );

      storedEvents.push(created);

      return created;
    },
  });

  const logSpy = spyOn(console, 'log').mockImplementation(() => {});
  const tableSpy = spyOn(console, 'table').mockImplementation(() => {});
  const cli = createS20Cli({ service: mockService });

  return Object.freeze({
    cli,
    logSpy,
    mockService,
    recordedInputs,
    tableSpy,
  });
}

describe('s20-cli', () => {
  afterEach(() => {
    // Ensure any console spies are restored if a test fails mid-execution
  });

  it('maps default positional task argument to service.recordEvent and prints summary', async () => {
    const { cli, logSpy, recordedInputs, tableSpy } = setup();

    try {
      await cli.execute(['Ticket 5260']);

      expect(recordedInputs).toHaveLength(1);
      expect(recordedInputs[0]?.task).toBe('Ticket 5260');
      expect(recordedInputs[0]?.done).toBe(false);
      expect(logSpy).toHaveBeenCalledWith('Recorded event #1: Ticket 5260 at 12:45');
    } finally {
      logSpy.mockRestore();
      tableSpy.mockRestore();
    }
  });

  it('passes done=true to service.recordEvent when --done flag is provided', async () => {
    const { cli, logSpy, recordedInputs, tableSpy } = setup();

    try {
      await cli.execute(['add', 'Completed Task', '--done']);

      expect(recordedInputs[0]?.task).toBe('Completed Task');
      expect(recordedInputs[0]?.done).toBe(true);
    } finally {
      logSpy.mockRestore();
      tableSpy.mockRestore();
    }
  });

  it('forwards explicit start, duration, and notes flags to service.recordEvent', async () => {
    const { cli, logSpy, recordedInputs, tableSpy } = setup();

    try {
      await cli.execute([
        'add',
        'Ticket 5260',
        '--start=05:30',
        '--duration=2.25',
        '--notes=Had to wait for permission from bob',
      ]);

      expect(recordedInputs[0]).toMatchObject({
        duration: '2.25',
        notes: 'Had to wait for permission from bob',
        start: '05:30',
        task: 'Ticket 5260',
      });
    } finally {
      logSpy.mockRestore();
      tableSpy.mockRestore();
    }
  });

  it('supports --no-done negator flag to set done to false', async () => {
    const { cli, logSpy, recordedInputs, tableSpy } = setup();

    try {
      await cli.execute(['add', 'Ongoing Task', '--no-done']);

      expect(recordedInputs[0]?.task).toBe('Ongoing Task');
      expect(recordedInputs[0]?.done).toBe(false);
    } finally {
      logSpy.mockRestore();
      tableSpy.mockRestore();
    }
  });

  it('formats recent events with console.table or logs empty message when none exist', async () => {
    const emptyEnv = setup({ events: [] });

    try {
      await emptyEnv.cli.execute(['list']);
      expect(emptyEnv.logSpy).toHaveBeenCalledWith('No events recorded yet.');
    } finally {
      emptyEnv.logSpy.mockRestore();
      emptyEnv.tableSpy.mockRestore();
    }

    const populatedEnv = setup({
      events: [{ task: 'Ticket 1' }, { task: 'Ticket 2' }],
    });

    try {
      await populatedEnv.cli.execute(['list', '--limit', '1']);
      expect(populatedEnv.tableSpy).toHaveBeenCalledTimes(1);
    } finally {
      populatedEnv.logSpy.mockRestore();
      populatedEnv.tableSpy.mockRestore();
    }
  });
});

/** Overrides for configuring isolated S20 CLI adapter test fixtures. */
interface SetupOverrides {
  events?: Partial<EventRecord>[];
  suggestions?: string[];
}
