/**
 * @file S20 domain data types and CSV column definitions.
 *
 * Defines TypeScript interfaces for time events and aggregate tasks, along with the canonical
 * column order lists matching the CSV schemas on disk.
 */

/**
 * Parameter payload for recording a new event.
 */
export interface EventInput {
  /**
   * Date string in YYYY-MM-DD format.
   */
  date: string;

  /**
   * Event duration in decimal hours (e.g. 1.5).
   */
  duration: number;

  /**
   * Whether the event represents completed work.
   */
  isDone: boolean;

  /**
   * Contextual notes or reasoning.
   */
  notes: string;

  /**
   * Start time in 24-hour HH:MM format.
   */
  start: string;

  /**
   * Task name or ticket identifier.
   */
  task: string;
}

/**
 * Domain representation of a tracked event stored in events.csv.
 */
export interface EventRecord {
  /**
   * Date string in YYYY-MM-DD format.
   */
  date: string;

  /**
   * Event duration in decimal hours.
   */
  duration: number;

  /**
   * Auto-incrementing unique event identifier.
   */
  id: number;

  /**
   * Completion status of the event.
   */
  isDone: boolean;

  /**
   * Contextual notes.
   */
  notes: string;

  /**
   * Start time in 24-hour HH:MM format.
   */
  start: string;

  /**
   * Task name or ticket identifier.
   */
  task: string;
}

/**
 * Domain representation of an aggregate tracked task stored in tasks.csv.
 */
export interface TaskRecord {
  /**
   * Associated project or work category.
   */
  category: string;

  /**
   * JSON configuration string for task-level options.
   */
  config: string;

  /**
   * Optional long-form details description.
   */
  details: string;

  /**
   * Completion timestamp (YYYY-MM-DD HH:MM) or empty string if in progress.
   */
  finished: string;

  /**
   * Auto-incrementing unique task identifier.
   */
  id: number;

  /**
   * Importance rating or indicator.
   */
  importance: string;

  /**
   * JSON metadata string for extensibility.
   */
  metadata: string;

  /**
   * Priority designation.
   */
  priority: string;

  /**
   * Timestamp when work was first recorded (YYYY-MM-DD HH:MM).
   */
  started: string;

  /**
   * Unique task name or ticket identifier.
   */
  task: string;

  /**
   * Cumulative hours logged across all events for this task.
   */
  totalTime: number;

  /**
   * Urgency rating or indicator.
   */
  urgency: string;
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
