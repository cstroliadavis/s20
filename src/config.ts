import path from 'node:path';
import process from 'node:process';

/**
 * Supported rounding directions for time rounding.
 */
export type RoundingDirection = 'down' | 'nearest' | 'up';

/**
 * Task-specific default settings.
 */
export interface TaskDefaultConfig {
  category?: string;
  duration?: string;
}

/**
 * Configuration options for S20 time tracking.
 */
export interface S20Config {
  categoryFilePath: string;
  dataDir: string;
  defaultCategory: string;
  defaultDuration: string;
  eventsFilePath: string;
  projectFilePath: string;
  roundingDirection: RoundingDirection;
  roundingIncrement: number;
  taskDefaults: Record<string, TaskDefaultConfig>;
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
