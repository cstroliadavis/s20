/**
 * @file Local filesystem path resolution for S20 persistence and log files.
 *
 * Resolves default directory and file paths for local CSV data stores and rotating JSONL logs.
 */
import path from 'node:path';
import process from 'node:process';
import type { StoragePaths } from './types.js';

/**
 * Creates default local filesystem storage paths resolved against a base directory.
 *
 * @param baseDir Base root directory for data file resolution (defaults to process.cwd())
 * @returns Resolved StoragePaths configuration
 * @example
 * ```ts
 * const paths = createDefaultStoragePaths('/path/to/project');
 * // Returns paths with eventsFilePath resolving to '/path/to/project/data/events.csv'
 * ```
 */
export function createDefaultStoragePaths(baseDir: string = process.cwd()): StoragePaths {
  const dataDir = path.resolve(baseDir, 'data');

  return {
    categoryFilePath: path.join(dataDir, 'category.csv'),
    dataDir,
    eventsFilePath: path.join(dataDir, 'events.csv'),
    logDir: path.join(dataDir, 'logs'),
    logMaxRows: 5000,
    projectFilePath: path.join(dataDir, 'project.csv'),
    tasksFilePath: path.join(dataDir, 'tasks.csv'),
  };
}
