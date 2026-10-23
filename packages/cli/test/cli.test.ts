import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import {
  type CommandConfig,
  coerceTime,
  createCliTool,
  createParamCoercer,
  generateCompletionScript,
  resolveCompletions,
} from '../src/index.js';

function setup(overrides: SetupOverrides = {}) {
  const events: Record<string, unknown>[] = [];
  const defaultCommand: CommandConfig = {
    name: 'add',

    description: 'Add an event',
    isDefault: true,
    params: [
      { name: 'task', type: 'text' },
      { alias: 'd', default: 1, name: 'duration', type: 'number' },
      { name: 'done', negator: true, type: 'flag' },
      { alias: 's', name: 'start', type: 'time' },
    ],
    triggers: 'event-add',
    ...overrides.command,
  };

  const cli = createCliTool({
    config: {
      commands: [defaultCommand],
      name: 'test-cli',
    },
  });

  cli.on(defaultCommand.triggers, ({ params }) => {
    events.push({ ...params });
  });

  return Object.freeze({
    cli,
    coercer: createParamCoercer(),
    events,
  });
}

describe('cli workspace engine', () => {
  afterEach(() => {
    // Restore any console spies if used
  });

  it('parses default command positional arguments and applies default parameter values', async () => {
    const { cli, events } = setup();

    await cli.execute(['Ticket 123']);

    expect(events).toHaveLength(1);
    expect(events[0]?.task).toBe('Ticket 123');
    expect(events[0]?.duration).toBe(1);
    expect(events[0]?.done).toBe(false);
  });

  it('coerces explicit flags, short aliases, and boolean negators', async () => {
    const { cli, events } = setup({ command: { isDefault: false } });

    await cli.execute(['add', 'Finished Task', '-d', '2.5', '-s', '1:30pm', '--done']);
    await cli.execute(['add', 'Ongoing Task', '--no-done']);

    expect(events[0]?.task).toBe('Finished Task');
    expect(events[0]?.duration).toBe(2.5);
    expect(events[0]?.start).toBe('13:30');
    expect(events[0]?.done).toBe(true);
    expect(events[1]?.done).toBe(false);
  });

  it('coerces 12-hour and 24-hour time strings into normalized HH:MM format', () => {
    expect(coerceTime('5:30pm', 'start')).toBe('17:30');
    expect(coerceTime('12:00am', 'start')).toBe('00:00');
    expect(coerceTime('12:15pm', 'start')).toBe('12:15');
    expect(coerceTime('09:05', 'start')).toBe('09:05');
  });

  it('coerces YYYY-MM-DD date strings without UTC timezone day shifting', () => {
    const { coercer } = setup();

    const dateStr = coercer.coerce({ name: 'date', type: 'date' }, '2026-10-03');

    expect(dateStr).toBe('2026-10-03');
  });

  it('renders help text when --help flag is passed', async () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    const { cli } = setup();

    try {
      const result = await cli.execute(['--help']);

      expect(result.triggers).toBe('help');
      expect(String(result.params.text)).toContain('test-cli');
      expect(logSpy).toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });

  it('generates shell completion scripts and resolves dynamic parameter completions', async () => {
    const { cli } = setup({
      command: {
        params: [{ items: () => ['Ticket 100', 'Ticket 200'], name: 'task', type: 'text' }],
      },
    });

    const zshScript = generateCompletionScript('zsh', 's20');
    const bashScript = generateCompletionScript('bash', 's20');
    const completions = await resolveCompletions(cli.getConfig(), ['add', '--task', 'Ticket 2']);
    const rootCompletions = await resolveCompletions(cli.getConfig(), ['Ticket']);
    const allRoot = await resolveCompletions(cli.getConfig(), ['']);

    expect(zshScript).toContain('#compdef s20');
    expect(bashScript).toContain("local IFS=$'\\n'");
    expect(completions.map((c) => c.value)).toEqual(['Ticket 200']);
    expect(rootCompletions.map((c) => c.value)).toEqual(['Ticket 100', 'Ticket 200']);
    expect(allRoot.map((c) => c.value)).not.toContain('--config');
  });
});

/** Overrides for configuring isolated CLI engine test fixtures. */
interface SetupOverrides {
  command?: Partial<CommandConfig>;
}
