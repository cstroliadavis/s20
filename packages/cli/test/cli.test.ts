import { describe, expect, it } from 'bun:test';
import { createCliTool } from '../src/index.js';

describe('cli workspace engine', () => {
  it('parses commands, coerces parameters, and triggers events', async () => {
    let handled = false;
    let receivedTask = '';
    let receivedDone = false;

    const cli = createCliTool({
      config: {
        commands: [
          {
            description: 'Add an event',
            isDefault: true,
            name: 'add',
            params: [
              { name: 'task', type: 'text' },
              { name: 'done', negator: true, type: 'flag' },
            ],
            triggers: 'event-add',
          },
        ],
        name: 'test-cli',
      },
    });

    cli.on('event-add', ({ params }) => {
      handled = true;
      receivedTask = params.task as string;
      receivedDone = params.done as boolean;
    });

    await cli.execute(['Ticket 123']);

    expect(handled).toBe(true);
    expect(receivedTask).toBe('Ticket 123');
    expect(receivedDone).toBe(false);
  });

  it('handles explicit flag parameters correctly', async () => {
    let receivedDone = false;

    const cli = createCliTool({
      config: {
        commands: [
          {
            description: 'Add an event',
            name: 'add',
            params: [
              { name: 'task', type: 'text' },
              { name: 'done', negator: true, type: 'flag' },
            ],
            triggers: 'event-add',
          },
        ],
        name: 'test-cli',
      },
    });

    cli.on('event-add', ({ params }) => {
      receivedDone = params.done as boolean;
    });

    await cli.execute(['add', 'Finished Task', '--done']);

    expect(receivedDone).toBe(true);
  });
});
