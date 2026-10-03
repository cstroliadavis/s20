/**
 * Parameter payload for recording a new event.
 */
export interface EventInput {
  date: string;
  duration: number;
  isDone: boolean;
  notes: string;
  start: string;
  task: string;
}

/**
 * Domain representation of a tracked event.
 */
export interface EventRecord {
  date: string;
  duration: number;
  id: number;
  isDone: boolean;
  notes: string;
  start: string;
  task: string;
}

/**
 * Domain representation of a tracked task.
 */
export interface TaskRecord {
  category: string;
  config: string;
  details: string;
  finished: string;
  id: number;
  importance: string;
  metadata: string;
  priority: string;
  started: string;
  task: string;
  totalTime: number;
  urgency: string;
}

export const EVENT_COLUMNS = ['id', 'date', 'start', 'duration', 'task', 'is done', 'notes'];

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
