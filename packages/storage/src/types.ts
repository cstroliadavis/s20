/**
 * @file S20 persistence layer configuration types and CSV column schemas.
 *
 * Defines filesystem storage paths and the canonical CSV column headers for events.csv
 * and tasks.csv.
 */

/**
 * Local filesystem paths and rotation limits for CSV persistence and logging.
 */
export interface StoragePaths {
  /**
   * Path to the category CSV file.
   */
  categoryFilePath: string;

  /**
   * Root directory housing all CSV storage files.
   */
  dataDir: string;

  /**
   * Path to the events chronological log CSV file.
   */
  eventsFilePath: string;

  /**
   * Directory path where rotating JSONL application logs are stored.
   */
  logDir: string;

  /**
   * Maximum number of rows per JSONL log file before rotating to a new file.
   */
  logMaxRows: number;

  /**
   * Path to the project definitions CSV file.
   */
  projectFilePath: string;

  /**
   * Path to the aggregate tasks status CSV file.
   */
  tasksFilePath: string;
}

/**
 * Canonical column header order for events.csv.
 */
export const EVENT_COLUMNS = ['id', 'date', 'start', 'duration', 'task', 'is done', 'notes'];

/**
 * Canonical column header order for tasks.csv.
 */
export const TASK_COLUMNS = [
  'id',
  'task',
  'details',
  'started',
  'finished',
  'total time',
  'priority',
  'urgency',
  'importance',
  'category',
  'metadata',
  'config',
];
