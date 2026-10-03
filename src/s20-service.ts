import type { S20Config } from './config.js';
import type { createStorage } from './storage.js';
import {
  calculateDefaultStartTime,
  getCurrentTimeString,
  getTodayDateString,
  parseDuration,
} from './time-utils.js';
import type { EventInput, EventRecord } from './types.js';

/**
 * Input options for adding a new tracking event via the service.
 */
export interface AddEventOptions {
  date?: string | Date;
  done?: boolean;
  duration?: string | number;
  notes?: string;
  start?: string;
  task: string;
}

/**
 * Service dependencies bundle.
 */
export interface ServiceDependencies {
  config: S20Config;
  storage: ReturnType<typeof createStorage>;
}

/**
 * Builds normalized EventInput payload ready for CSV persistence.
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
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
 * Creates S20 application service coordinating time calculations and storage.
 *
 * @param deps Config and storage dependencies
 * @returns Application service instance
 */
export function createS20Service(deps: ServiceDependencies) {
  const _ = {
    config: deps.config,
    storage: deps.storage,
  };

  /**
   * Records an event and updates task records.
   */
  async function recordEvent(options: AddEventOptions): Promise<EventRecord> {
    const payload = buildEventPayload(options, _.config);

    return _.storage.addEvent(payload);
  }

  return {
    getTaskSuggestions: () => _.storage.getTaskSuggestions(),
    listEvents: () => _.storage.getEvents(),
    listTasks: () => _.storage.getTasks(),
    recordEvent,
  };
}
