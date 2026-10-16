import { describe, expect, it } from 'bun:test';
import { createDefaultConfig, createMemoryStorage, createS20Service } from '@s20/app';
import { createS20Cli } from '../src/s20-cli.js';

function setup() {
  const config = createDefaultConfig();
  const storage = createMemoryStorage();
  const service = createS20Service({ config, storage });
  const cli = createS20Cli({ service });

  return {
    cli,
    config,
    service,
    storage,
  };
}

describe('s20-cli', () => {
  it('executes default add command with single positional task argument', async () => {
    const env = setup();

    await env.cli.execute(['Ticket 5260']);

    const events = await env.service.listEvents();
    const tasks = await env.service.listTasks();

    expect(events).toHaveLength(1);
    expect(events[0]?.task).toBe('Ticket 5260');
    expect(events[0]?.isDone).toBe(false);
    expect(tasks[0]?.finished).toBe('');
  });

  it('marks event as completed when --done flag is provided', async () => {
    const env = setup();

    await env.cli.execute(['add', 'Completed Task', '--done']);

    const events = await env.service.listEvents();
    const tasks = await env.service.listTasks();

    expect(events).toHaveLength(1);
    expect(events[0]?.isDone).toBe(true);
    expect(tasks[0]?.finished).not.toBe('');
  });

  it('executes add command with explicit start, duration, and notes flags', async () => {
    const env = setup();

    await env.cli.execute([
      'add',
      'Ticket 5260',
      '--start=05:30',
      '--duration=2.25',
      '--notes=Had to wait for permission from bob',
    ]);

    const events = await env.service.listEvents();

    expect(events).toHaveLength(1);
    expect(events[0]?.task).toBe('Ticket 5260');
    expect(events[0]?.start).toBe('05:30');
    expect(events[0]?.duration).toBe(2.25);
    expect(events[0]?.notes).toBe('Had to wait for permission from bob');
  });

  it('supports --no-done negator flag to set isDone to false', async () => {
    const env = setup();

    await env.cli.execute(['add', 'Ongoing Task', '--no-done']);

    const events = await env.service.listEvents();

    expect(events).toHaveLength(1);
    expect(events[0]?.task).toBe('Ongoing Task');
    expect(events[0]?.isDone).toBe(false);
  });

  it('executes list command without errors', async () => {
    const env = setup();

    await env.cli.execute(['Ticket 1']);
    await env.cli.execute(['Ticket 2']);

    const output = await env.cli.execute(['list']);

    expect(output).toBeDefined();
  });
});
