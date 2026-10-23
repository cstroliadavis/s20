/**
 * @file Pure domain business rules for S20 task lifecycle, ID calculation, and suggestion ranking.
 *
 * Encapsulates persistence-independent logic for creating tasks, accumulating total duration,
 * computing completion timestamps, and prioritizing active tasks for autocompletion.
 */
import { findTaskDefault, type S20Config } from './config.js';
import { calculateFinishTime } from './time-utils.js';
import type { EventInput, TaskRecord } from './types.js';

/**
 * Computes finish timestamp string based on event completion status.
 */
function computeFinishTimestamp(event: EventInput): string {
  if (!event.isDone) return '';

  return `${event.date} ${calculateFinishTime(event.start, event.duration)}`;
}

/**
 * Resolves category for task name from defaults or general fallback.
 */
function resolveTaskCategory(taskName: string, config: S20Config): string {
  const taskDef = findTaskDefault(taskName, config);

  return taskDef?.category ?? config.defaultCategory;
}

/**
 * Rounds accumulated hours to 4 decimal places to avoid floating-point drift.
 */
function roundTotalTime(hours: number): number {
  return Math.round(hours * 10000) / 10000;
}

/**
 * Sorts task records with unfinished items prioritized at the beginning in reverse order.
 */
function sortTasksForSuggestions(tasks: TaskRecord[]): TaskRecord[] {
  const groups = Object.groupBy(tasks, (t) => (t.finished === '' ? 'unfinished' : 'finished'));
  const unfinished = groups.unfinished ?? [];
  const finished = groups.finished ?? [];

  return [...unfinished.toReversed(), ...finished.toReversed()];
}

/**
 * Applies a newly recorded event to an existing task record without mutating the original object.
 *
 * @param existing Existing aggregate task record
 * @param event Newly recorded event input
 * @returns Updated task record with accumulated duration and completion timestamp
 * @example
 * ```ts
 * const updated = applyEventToTask(existingTask, {
 *   date: '2026-10-03',
 *   duration: 0.5,
 *   isDone: true,
 *   notes: '',
 *   start: '10:00',
 *   task: 'Ticket 5260',
 * });
 * // Returns new TaskRecord with totalTime increased by 0.5 and finished set to '2026-10-03 10:30'
 * ```
 */
export function applyEventToTask(existing: TaskRecord, event: EventInput): TaskRecord {
  return {
    ...existing,
    finished: computeFinishTimestamp(event),
    totalTime: roundTotalTime(existing.totalTime + event.duration),
  };
}

/**
 * Calculates the next sequential integer identifier for a collection of records.
 *
 * @param records Collection of records containing numeric id properties
 * @returns Next available incremental integer ID (starting at 1)
 * @example
 * ```ts
 * const nextId = computeNextId([{ id: 1 }, { id: 4 }]);
 * // Returns 5
 * ```
 */
export function computeNextId(records: { id: number }[]): number {
  return records.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

/**
 * Creates a new aggregate task record initialized from its first tracked event.
 *
 * @param event Event input triggering task creation
 * @param nextId Assigned unique task identifier
 * @param config S20 domain configuration for category resolution
 * @returns Newly constructed TaskRecord
 * @example
 * ```ts
 * const task = createNewTaskRecord(eventInput, 1, createDefaultConfig());
 * // Returns initialized TaskRecord with started timestamp and resolved category
 * ```
 */
export function createNewTaskRecord(
  event: EventInput,
  nextId: number,
  config: S20Config,
): TaskRecord {
  const category = resolveTaskCategory(event.task, config);

  return {
    id: nextId,

    category,
    config: '{}',
    details: '',
    finished: computeFinishTimestamp(event),
    importance: '',
    metadata: '{}',
    priority: '',
    started: `${event.date} ${event.start}`,
    task: event.task,
    totalTime: roundTotalTime(event.duration),
    urgency: '',
  };
}

/**
 * Ranks and deduplicates task names with unfinished tasks prioritized first.
 *
 * @param tasks Collection of aggregate task records
 * @returns Ordered list of unique task names for completion suggestions
 * @example
 * ```ts
 * const suggestions = rankTaskSuggestions(tasks);
 * // Returns ['Active Task', 'Completed Task']
 * ```
 */
export function rankTaskSuggestions(tasks: TaskRecord[]): string[] {
  const sorted = sortTasksForSuggestions(tasks);
  const trimmed = sorted.map((t) => t.task.trim()).filter(Boolean);

  return Array.from(new Set(trimmed));
}
