import fs from 'node:fs';
import path from 'node:path';
import {
  type CliConfig,
  type CommandConfig,
  createColiner,
  createConfigLoader,
  type ParamConfig,
} from 'coliner';
import type { S20Config } from './config.js';
import type { createS20Service } from './s20-service.js';
import type { createStorage } from './storage.js';

export interface CliDependencies {
  config: S20Config;
  configPath?: string;
  service: ReturnType<typeof createS20Service>;
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
 * Injects dynamic provider functions into parsed schema parameters.
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
 * Loads YAML CLI schema from disk and injects dynamic service providers.
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
 * Resolves filesystem path to the YAML CLI schema file.
 */
function resolveSchemaPath(configPath?: string): string {
  if (configPath) return configPath;

  const localPath = path.resolve(import.meta.dirname, 'cli.yaml');

  if (fs.existsSync(localPath)) return localPath;

  return path.resolve(import.meta.dirname, '../cli.yaml');
}

/**
 * Creates S20 Command Line Interface application instance from YAML schema.
 *
 * @param deps CLI dependencies including service and config
 * @returns Configured Coliner CLI application
 */
export function createS20Cli(deps: CliDependencies) {
  const schema = loadCliSchema(deps.configPath, deps.service);
  const coliner = createColiner({ config: schema });

  registerCliHandlers(coliner, deps.service);

  return coliner;
}
