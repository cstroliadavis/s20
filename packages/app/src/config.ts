/**
 * @file S20 configuration module.
 *
 * Defines configuration interfaces, supported rounding directions, default task durations,
 * and the default configuration factory resolving filesystem paths for CSV data stores.
 */
import path from 'node:path';
import process from 'node:process';

/**
 * Supported rounding directions for time rounding calculations.
 */
export type RoundingDirection = 'down' | 'nearest' | 'up';

/**
 * Task-specific default settings overriding global tracking defaults.
 */
export interface TaskDefaultConfig {
  /**
   * Default category name assigned to events for this task.
   */
  category?: string;

  /**
   * Default duration string for this task (e.g. '15m', '1h').
   */
  duration?: string;
}

/**
 * Global configuration options for S20 time tracking.
 */
export interface S20Config {
  /**
   * Path to the category CSV file.
   */
  categoryFilePath: string;

  /**
   * Root directory housing all CSV storage files.
   */
  dataDir: string;

  /**
   * Default category assigned to new tasks when unconfigured.
   */
  defaultCategory: string;

  /**
   * Default duration string when none is provided on the command line or in task defaults.
   */
  defaultDuration: string;

  /**
   * Path to the events chronological log CSV file.
   */
  eventsFilePath: string;

  /**
   * Path to the project definitions CSV file.
   */
  projectFilePath: string;

  /**
   * Direction used for rounding start times ('nearest', 'up', or 'down').
   */
  roundingDirection: RoundingDirection;

  /**
   * Minute increment step for rounding calculations (e.g. 15 for quarter-hour rounding).
   */
  roundingIncrement: number;

  /**
   * Map of task names to specific duration and category overrides.
   */
  taskDefaults: Record<string, TaskDefaultConfig | undefined>;

  /**
   * Path to the aggregate tasks status CSV file.
   */
  tasksFilePath: string;
}

const DEFAULT_TASK_DEFAULTS: Record<string, TaskDefaultConfig> = {
  Break: { duration: '15m' },
  'Check Email': { duration: '15m' },
  Lunch: { duration: '1h' },
  Meeting: { duration: '30m' },
};

/**
 * Creates default configuration instance resolved against base directory.
 *
 * @param baseDir Base root directory for data file resolution
 * @returns Configured S20 options
 * @example
 * ```ts
 * const config = createDefaultConfig('/path/to/project');
 * // Returns config with eventsFilePath resolving to '/path/to/project/data/events.csv'
 * ```
 */
export function createDefaultConfig(baseDir: string = process.cwd()): S20Config {
  const dataDir = path.resolve(baseDir, 'data');

  return {
    categoryFilePath: path.join(dataDir, 'category.csv'),
    dataDir,
    defaultCategory: 'work',
    defaultDuration: '1h',
    eventsFilePath: path.join(dataDir, 'events.csv'),
    projectFilePath: path.join(dataDir, 'project.csv'),
    roundingDirection: 'nearest',
    roundingIncrement: 15,
    taskDefaults: { ...DEFAULT_TASK_DEFAULTS },
    tasksFilePath: path.join(dataDir, 'tasks.csv'),
  };
}
