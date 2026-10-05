/**
 * @file S20 Command Line Interface (CLI) module.
 *
 * Integrates the @s20/cli command engine with the S20 application service layer.
 * Loads the YAML CLI schema, injects dynamic task completion providers, and
 * maps CLI events ('event-add' and 'event-list') to service operations with terminal output.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  type CliConfig,
  type CommandConfig,
  createColiner,
  createConfigLoader,
  type ParamConfig,
} from '@s20/cli';
import type { S20Config } from './config.js';
import type { createS20Service } from './s20-service.js';
import type { createStorage } from './storage.js';

/**
 * External dependencies required to instantiate and execute the S20 CLI.
 */
export interface CliDependencies {
  /**
   * Runtime configuration containing CSV storage file paths and rounding rules.
   */
  config: S20Config;

  /**
   * Optional custom filesystem path to the YAML CLI schema definition file.
   */
  configPath?: string;

  /**
   * Application service instance coordinating time calculations, storage, and suggestions.
   */
  service: ReturnType<typeof createS20Service>;

  /**
   * CSV storage engine instance for direct data inspection and persistence operations.
   */
  storage: ReturnType<typeof createStorage>;
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
function injectDynamicProviders(
  schema: CliConfig,
  service: ReturnType<typeof createS20Service>,
): void {
  const addCmd = findAddCommand(schema.commands);
  const taskParam = findTaskParam(addCmd);

  if (taskParam) {
    taskParam.items = () => service.getTaskSuggestions();
  }
}

/**
 * Loads the YAML CLI schema definition from disk using Coliner's config loader and injects dynamic
 * task suggestion providers before instantiation.
 */
function loadCliSchema(
  configPath: string | undefined,
  service: ReturnType<typeof createS20Service>,
): CliConfig {
  const resolvedPath = resolveSchemaPath(configPath);
  const loader = createConfigLoader();
  const schema = loader.loadFromFile(resolvedPath);

  injectDynamicProviders(schema, service);

  return schema;
}

/**
 * Registers event listeners on the Coliner instance for 'event-add' and 'event-list' actions,
 * coordinating service calls and console output formatting.
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
    const summary = formatEventSummary(result.id, result.task, result.start);

    console.log(summary);

    return summary;
  });

  coliner.on('event-list', async ({ params }) => {
    const events = await service.listEvents();
    const limit = Number(params.limit) || 10;
    const recent = events.slice(-limit);

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
 * explicit path override, current directory, or package root fallback.
 */
function resolveSchemaPath(configPath?: string): string {
  if (configPath) return configPath;

  const localPath = path.resolve(import.meta.dirname, 'cli.yaml');

  if (fs.existsSync(localPath)) return localPath;

  return path.resolve(import.meta.dirname, '../cli.yaml');
}

/**
 * Creates and initializes an S20 Command Line Interface application instance from the YAML schema.
 *
 * @param deps Injected CLI dependencies including service, storage, and configuration options
 * @returns Fully configured Coliner CLI instance ready for execution and shell completion
 * @example
 * ```ts
 * const config = createDefaultConfig();
 * const storage = createStorage(config);
 * const service = createS20Service({ config, storage });
 * const cli = createS20Cli({ config, service, storage });
 *
 * await cli.execute(['Ticket 5260', '--duration=1.5']);
 * // Records an event for 'Ticket 5260' and logs confirmation to console
 * ```
 */
export function createS20Cli(deps: CliDependencies) {
  const schema = loadCliSchema(deps.configPath, deps.service);
  const coliner = createColiner({ config: schema });

  registerCliHandlers(coliner, deps.service);

  return coliner;
}
