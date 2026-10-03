import { type CliConfig, type CommandConfig, createColiner } from 'coliner';
import type { S20Config } from './config.js';
import type { createS20Service } from './s20-service.js';
import type { createStorage } from './storage.js';

export interface CliDependencies {
  config: S20Config;
  service: ReturnType<typeof createS20Service>;
  storage: ReturnType<typeof createStorage>;
}

/**
 * Builds command schema for recording time events.
 */
function buildAddCommand(service: ReturnType<typeof createS20Service>): CommandConfig {
  return {
    description: 'Record a time tracking event',
    isDefault: true,
    name: 'add',
    params: [
      {
        description: 'Task description or ticket identifier',
        items: () => service.getTaskSuggestions(),
        name: 'task',
        type: 'text',
      },
      {
        alias: 's',
        description: 'Start time (e.g. 13:00 or 5:30pm)',
        name: 'start',
        type: 'time',
      },
      {
        alias: 'd',
        description: 'Duration (e.g. 15m, 1h, 2.25)',
        name: 'duration',
        type: 'text',
      },
      {
        default: true,
        description: 'Mark event as completed',
        name: 'done',
        negator: true,
        type: 'flag',
      },
      {
        alias: 'n',
        description: 'Context or circumstance notes',
        name: 'notes',
        type: 'text',
      },
      {
        description: 'Event date (YYYY-MM-DD)',
        name: 'date',
        type: 'date',
      },
    ],
    triggers: 'event-add',
  };
}

/**
 * Builds declarative Coliner CLI schema definition.
 */
function buildCliConfig(service: ReturnType<typeof createS20Service>): CliConfig {
  return {
    commands: [buildAddCommand(service), buildListCommand()],
    description: 'S20 (Spouse Two Point Oh) CLI time tracking tool',
    name: 's20',
    version: '0.1.0',
  };
}

/**
 * Builds command schema for listing recorded events.
 */
function buildListCommand(): CommandConfig {
  return {
    description: 'List tracked events',
    name: 'list',
    params: [
      {
        alias: 'l',
        default: 10,
        description: 'Maximum events to display',
        name: 'limit',
        type: 'number',
      },
    ],
    triggers: 'event-list',
  };
}

/**
 * Formats a single event record for display output.
 */
function formatEventSummary(id: number, task: string, start: string): string {
  return `Recorded event #${id}: ${task} at ${start}`;
}

/**
 * Registers event listeners on coliner instance for add and list actions.
 */
function registerCliHandlers(
  coliner: ReturnType<typeof createColiner>,
  service: ReturnType<typeof createS20Service>,
): void {
  coliner.on('event-add', async ({ params }) => {
    const result = await service.recordEvent({
      date: params.date as Date | string | undefined,
      done: params.done as boolean | undefined,
      duration: params.duration as string | number | undefined,
      notes: params.notes as string | undefined,
      start: params.start as string | undefined,
      task: String(params.task ?? ''),
    });

    return formatEventSummary(result.id, result.task, result.start);
  });

  coliner.on('event-list', async ({ params }) => {
    const events = await service.listEvents();
    const limit = Number(params.limit) || 10;

    return events.slice(-limit);
  });
}

/**
 * Creates S20 Command Line Interface application instance.
 *
 * @param deps CLI dependencies including service and config
 * @returns Configured Coliner CLI application
 */
export function createS20Cli(deps: CliDependencies) {
  const schema = buildCliConfig(deps.service);
  const coliner = createColiner({ config: schema });

  registerCliHandlers(coliner, deps.service);

  return coliner;
}
