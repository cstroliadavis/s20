/**
 * @file S20 domain data types and persistence port contracts.
 *
 * Defines platform-agnostic TypeScript interfaces for time events, aggregate tasks,
 * and the abstract storage repository port implemented by persistence adapters.
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
 * Domain representation of a tracked event record.
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
 * Persistence port contract for reading and persisting S20 events and tasks across any storage backend.
 */
export interface S20Storage {
  /**
   * Appends a newly created event record to persistent storage.
   */
  appendEvent: (event: EventRecord) => Promise<void>;

  /**
   * Appends a newly created task record to persistent storage.
   */
  appendTask: (task: TaskRecord) => Promise<void>;

  /**
   * Retrieves all chronological event records from storage.
   */
  getEvents: () => Promise<EventRecord[]>;

  /**
   * Retrieves all aggregate task records from storage.
   */
  getTasks: () => Promise<TaskRecord[]>;

  /**
   * Initializes the underlying storage backend if needed.
   */
  init: () => Promise<void>;

  /**
   * Saves the updated collection of aggregate task records to storage.
   */
  saveTasks: (tasks: TaskRecord[]) => Promise<void>;
}

/**
 * Domain representation of an aggregate tracked task.
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
