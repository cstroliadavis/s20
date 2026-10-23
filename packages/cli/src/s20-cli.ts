/**
 * @file S20 Command Line Interface (CLI) presentation adapter.
 *
 * Connects the @s20/cli command engine to the @s20/app application service layer.
 * Loads the YAML CLI schema, injects dynamic task completion providers, and
 * maps CLI events ('event-add' and 'event-list') to service operations with terminal output.
 */
import path from 'node:path';
import type { S20Service } from '@s20/app';
import { logger } from '@s20/logging';
import { createCliTool } from './cli-tool.js';
import { createConfigLoader } from './config-loader.js';
import type { CliConfig, CliToolInstance, CommandConfig, ParamConfig } from './types.js';

const log = logger({ category: 'cli', name: 's20-cli.ts' });

/**
 * External dependencies required to instantiate and execute the S20 CLI presentation adapter.
 */
export interface CliDependencies {
  /**
   * Optional custom filesystem path to the YAML CLI schema definition file.
   */
  configPath?: string;

  /**
   * Application service instance coordinating time calculations, storage, and suggestions.
   */
  service: S20Service;
}

/**
 * Locates default add command configuration from command list.
 */
function findAddCommand(commands: CommandConfig[]): CommandConfig | undefined {
  return commands.find((c) => c.name === 'add');
}

/**
 * Locates task parameter in command configuration.
 */
function findTaskParam(cmd?: CommandConfig): ParamConfig | undefined {
  return cmd?.params?.find((p) => p.name === 'task');
}

/**
 * Formats a single event record for display output.
 */
function formatEventSummary(id: number, task: string, start: string): string {
  return `Recorded event #${id}: ${task} at ${start}`;
}

/**
 * Injects dynamic provider functions into parsed schema parameters so that shell tab completion
 * and interactive prompts can query live task data from the application service.
 */
function injectDynamicProviders(schema: CliConfig, service: S20Service): void {
  const addCmd = findAddCommand(schema.commands);
  const taskParam = findTaskParam(addCmd);

  if (taskParam) {
    taskParam.items = () => service.getTaskSuggestions();
  }
}

/**
 * Loads the YAML CLI schema definition from disk using @s20/cli's config loader and injects dynamic
 * task suggestion providers before instantiation.
 */
function loadCliSchema(configPath: string | undefined, service: S20Service): CliConfig {
  const resolvedPath = resolveSchemaPath(configPath);
  const loader = createConfigLoader();
  const schema = loader.loadFromFile(resolvedPath);

  injectDynamicProviders(schema, service);

  return schema;
}

/**
 * Registers event listeners on the CLI tool instance for 'event-add' and 'event-list' actions,
 * coordinating service calls and console output formatting.
 */
function registerCliHandlers(cliTool: CliToolInstance, service: S20Service): void {
  cliTool.on('event-add', async ({ params }) => {
    const result = await service.recordEvent({
      date: params.date as Date | string | undefined,
      done: params.done as boolean | undefined,
      duration: params.duration as string | number | undefined,
      notes: params.notes as string | undefined,
      start: params.start as string | undefined,
      task: String(params.task ?? ''),
    });
    const summary = formatEventSummary(result.id, result.task, result.start);

    log.info('Executed event-add CLI command', { id: result.id, task: result.task });
    console.log(summary);

    return summary;
  });

  cliTool.on('event-list', async ({ params }) => {
    const events = await service.listEvents();
    const limit = Number(params.limit) || 10;
    const recent = events.slice(-limit);

    log.info('Executed event-list CLI command', { count: recent.length, limit });

    if (recent.length === 0) {
      console.log('No events recorded yet.');

      return recent;
    }

    console.table(recent);

    return recent;
  });
}

/**
 * Resolves the absolute filesystem path to the YAML CLI schema definition file, checking an
 * explicit path override or package root fallback.
 */
function resolveSchemaPath(configPath?: string): string {
  if (configPath) return configPath;

  return path.resolve(import.meta.dirname, '../cli.yaml');
}

/**
 * Creates and initializes an S20 Command Line Interface presentation instance from the YAML schema.
 *
 * @param deps Injected CLI dependencies including the application service and optional schema path
 * @returns Fully configured CLI tool instance ready for execution and shell completion
 * @example
 * ```ts
 * const config = createDefaultConfig();
 * const storage = createMemoryStorage();
 * const service = createS20Service({ config, storage });
 * const cli = createS20Cli({ service });
 *
 * await cli.execute(['Ticket 5260', '--duration=1.5']);
 * // Records an event for 'Ticket 5260' and logs confirmation to console
 * ```
 */
export function createS20Cli(deps: CliDependencies): CliToolInstance {
  const schema = loadCliSchema(deps.configPath, deps.service);
  const cliTool = createCliTool({ config: schema });

  registerCliHandlers(cliTool, deps.service);

  return cliTool;
}
