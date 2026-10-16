/**
 * @file S20 application service layer.
 *
 * Coordinates between user input options, configuration defaults, time utility rounding,
 * task domain rules, and the abstract S20Storage port. Exposes methods for logging events
 * and querying tasks across any presentation or persistence layer.
 */
import { logger } from '@s20/logging';
import type { S20Config } from './config.js';
import {
  applyEventToTask,
  computeNextId,
  createNewTaskRecord,
  rankTaskSuggestions,
} from './task-rules.js';
import {
  calculateDefaultStartTime,
  getCurrentTimeString,
  getTodayDateString,
  parseDuration,
} from './time-utils.js';
import type { EventInput, EventRecord, S20Storage, TaskRecord } from './types.js';

const log = logger({ category: 'service', name: 's20-service.ts' });

/**
 * Input options for adding a new tracking event via the service.
 */
export interface AddEventOptions {
  /**
   * Explicit event date (Date instance or YYYY-MM-DD string). Defaults to current date.
   */
  date?: string | Date;

  /**
   * Completion flag. When true, records a finished timestamp on the task. Defaults to false.
   */
  done?: boolean;

  /**
   * Event duration string ('15m', '1h', '2.25') or decimal hours number.
   */
  duration?: string | number;

  /**
   * Optional notes or contextual reason for the event.
   */
  notes?: string;

  /**
   * 24-hour start time string (HH:MM). When omitted, calculated from duration and rounding rules.
   */
  start?: string;

  /**
   * Task title or ticket identifier.
   */
  task: string;
}

/**
 * Public contract of the S20 application service.
 */
export interface S20Service {
  /**
   * Retrieves ranked unique task names with unfinished tasks prioritized first.
   */
  getTaskSuggestions: () => Promise<string[]>;

  /**
   * Lists all chronological event records.
   */
  listEvents: () => Promise<EventRecord[]>;

  /**
   * Lists all aggregate task records.
   */
  listTasks: () => Promise<TaskRecord[]>;

  /**
   * Records a new tracking event and synchronizes the aggregate task state.
   */
  recordEvent: (options: AddEventOptions) => Promise<EventRecord>;
}

/**
 * Service dependencies bundle required to instantiate the S20 service.
 */
export interface ServiceDependencies {
  /**
   * Global configuration containing rounding rules, durations, and category defaults.
   */
  config: S20Config;

  /**
   * Persistence port implementation for storing and querying events and tasks.
   */
  storage: S20Storage;
}

/**
 * Builds normalized EventInput payload ready for persistence.
 */
function buildEventPayload(options: AddEventOptions, config: S20Config): EventInput {
  const duration = resolveDuration(options.task, options.duration, config);
  const start = resolveStartTime(options.start, duration, config);
  const date = resolveDateString(options.date);
  const isDone = Boolean(options.done);
  const notes = options.notes ?? '';

  return {
    date,
    duration,
    isDone,
    notes,
    start,
    task: options.task,
  };
}

/**
 * Formats a Date instance into YYYY-MM-DD string.
 */
function formatDateObject(date: Date): string {
  return getTodayDateString(date);
}

/**
 * Retrieves default duration string for a task or general fallback.
 */
function getTaskDefaultDuration(task: string, config: S20Config): string {
  const taskDef = config.taskDefaults[task];

  if (!taskDef) return config.defaultDuration;

  return taskDef.duration ?? config.defaultDuration;
}

/**
 * Assigns next incremental ID to event input and appends it to storage.
 */
async function persistEventRecord(event: EventInput, storage: S20Storage): Promise<EventRecord> {
  const existingEvents = await storage.getEvents();
  const nextId = computeNextId(existingEvents);
  const record: EventRecord = {
    id: nextId,

    date: event.date,
    duration: event.duration,
    isDone: event.isDone,
    notes: event.notes,
    start: event.start,
    task: event.task,
  };

  await storage.appendEvent(record);

  return record;
}

/**
 * Resolves event date from input with fallback to today's date.
 */
function resolveDateString(dateVal?: string | Date): string {
  if (dateVal instanceof Date) return formatDateObject(dateVal);
  if (dateVal) return String(dateVal);

  return getTodayDateString();
}

/**
 * Resolves event duration using user value, task configuration, or global default.
 */
function resolveDuration(
  task: string,
  userDuration: string | number | undefined,
  config: S20Config,
): number {
  if (userDuration !== undefined) return parseDuration(userDuration);

  return parseDuration(getTaskDefaultDuration(task, config));
}

/**
 * Resolves event start time using user value or calculating rounded past time.
 */
function resolveStartTime(
  userStart: string | undefined,
  duration: number,
  config: S20Config,
): string {
  if (userStart) return userStart;

  const refTime = getCurrentTimeString();

  return calculateDefaultStartTime(refTime, duration, {
    direction: config.roundingDirection,
    increment: config.roundingIncrement,
  });
}

/**
 * Synchronizes task state in storage by creating a new task or updating an existing match.
 */
async function syncTaskRecord(
  event: EventInput,
  config: S20Config,
  storage: S20Storage,
): Promise<void> {
  const tasks = await storage.getTasks();
  const matchIndex = tasks.findIndex((t) => t.task.toLowerCase() === event.task.toLowerCase());

  if (matchIndex === -1) {
    const newTask = createNewTaskRecord(event, computeNextId(tasks), config);

    await storage.appendTask(newTask);

    return;
  }

  const updatedTask = applyEventToTask(tasks[matchIndex], event);
  const updatedTasks = tasks.with(matchIndex, updatedTask);

  await storage.saveTasks(updatedTasks);
}

/**
 * Creates S20 application service coordinating time calculations, task rules, and storage.
 *
 * @param deps Config and storage port dependencies
 * @returns Application service instance
 * @example
 * ```ts
 * const config = createDefaultConfig();
 * const storage = createMemoryStorage();
 * const service = createS20Service({ config, storage });
 *
 * const event = await service.recordEvent({ task: 'Ticket 5260' });
 * // Records event and updates aggregate task via the injected storage port
 * ```
 */
export function createS20Service(deps: ServiceDependencies): S20Service {
  const _ = {
    config: deps.config,
    storage: deps.storage,
  };

  /**
   * Records an event and synchronizes aggregate task state.
   */
  async function recordEvent(options: AddEventOptions): Promise<EventRecord> {
    await _.storage.init();

    const payload = buildEventPayload(options, _.config);

    log.info('Recording event', {
      duration: payload.duration,
      start: payload.start,
      task: payload.task,
    });

    const record = await persistEventRecord(payload, _.storage);

    await syncTaskRecord(payload, _.config, _.storage);

    return record;
  }

  return {
    getTaskSuggestions: async () => rankTaskSuggestions(await _.storage.getTasks()),
    listEvents: () => _.storage.getEvents(),
    listTasks: () => _.storage.getTasks(),
    recordEvent,
  };
}
