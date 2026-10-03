/**
 * @file S20 CSV storage engine.
 *
 * Provides persistence and synchronization logic for events and tasks using csv-lib.
 * Handles auto-incrementing record IDs, task duration accumulation, status updates,
 * and completion suggestion ranking.
 */
import fs from 'node:fs';
import { appendCsvFile, readCsvFile, writeCsvFile } from 'csv-lib';
import type { S20Config } from './config.js';
import { calculateFinishTime } from './time-utils.js';
import {
  EVENT_COLUMNS,
  type EventInput,
  type EventRecord,
  TASK_COLUMNS,
  type TaskRecord,
} from './types.js';

export type { EventInput, EventRecord, TaskRecord } from './types.js';

/**
 * Appends an event record and synchronizes associated task status.
 */
async function addEventRecord(event: EventInput, config: S20Config): Promise<EventRecord> {
  await initStorage(config);

  const existingEvents = await readEventRecords(config);
  const nextId = computeNextId(existingEvents);

  const record: EventRecord = {
    date: event.date,
    duration: event.duration,
    id: nextId,
    isDone: event.isDone,
    notes: event.notes,
    start: event.start,
    task: event.task,
  };

  const row = mapEventToRow(record);

  await appendCsvFile(config.eventsFilePath, [row], { columns: EVENT_COLUMNS });

  const tasks = await readTaskRecords(config);

  await syncTaskRecord(tasks, event, config);

  return record;
}

/**
 * Appends a newly tracked task to tasks.csv.
 */
async function appendNewTask(
  tasks: TaskRecord[],
  event: EventInput,
  config: S20Config,
): Promise<void> {
  const nextTaskId = computeNextId(tasks);
  const newTask = createNewTaskRecord(event, nextTaskId, config);
  const row = mapTaskToRow(newTask);

  await appendCsvFile(config.tasksFilePath, [row], { columns: TASK_COLUMNS });
}

/**
 * Updates existing task total time and finish status in memory.
 */
function applyTaskTime(existing: TaskRecord, event: EventInput): void {
  existing.totalTime += event.duration;
  existing.finished = computeFinishTimestamp(event);
}

/**
 * Computes finish timestamp string based on event completion status.
 */
function computeFinishTimestamp(event: EventInput): string {
  if (!event.isDone) return '';

  return `${event.date} ${calculateFinishTime(event.start, event.duration)}`;
}

/**
 * Calculates next incremental ID for a collection of records.
 */
function computeNextId(records: { id: number }[]): number {
  if (records.length === 0) return 1;

  const ids = records.map((r) => r.id);

  return Math.max(...ids) + 1;
}

/**
 * Creates new task record populated with event details.
 */
function createNewTaskRecord(event: EventInput, nextId: number, config: S20Config): TaskRecord {
  const category = resolveTaskCategory(event.task, config);

  return {
    category,
    config: '{}',
    details: '',
    finished: computeFinishTimestamp(event),
    id: nextId,
    importance: '',
    metadata: '{}',
    priority: '',
    started: `${event.date} ${event.start}`,
    task: event.task,
    totalTime: event.duration,
    urgency: '',
  };
}

/**
 * Ensures CSV file exists on disk with standard header row.
 */
async function ensureFileWithHeaders(filePath: string, headers: string[]): Promise<void> {
  const file = Bun.file(filePath);
  const exists = await file.exists();

  if (!exists || file.size === 0) {
    await writeCsvFile(filePath, [headers]);
  }
}

/**
 * Initializes data directory and empty CSV tables if nonexistent.
 */
async function initStorage(config: S20Config): Promise<void> {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }

  await ensureFileWithHeaders(config.eventsFilePath, EVENT_COLUMNS);
  await ensureFileWithHeaders(config.tasksFilePath, TASK_COLUMNS);
}

/**
 * Maps an EventRecord domain model into CSV row object.
 */
function mapEventToRow(event: EventRecord): Record<string, string> {
  return {
    date: event.date,
    duration: String(event.duration),
    id: String(event.id),
    'is done': String(event.isDone),
    notes: event.notes,
    start: event.start,
    task: event.task,
  };
}

/**
 * Maps a raw CSV row into an EventRecord domain model.
 */
function mapRowToEvent(row: Record<string, string>): EventRecord {
  return {
    date: row.date,
    duration: Number(row.duration),
    id: Number(row.id),
    isDone: row['is done'] === 'true',
    notes: row.notes,
    start: row.start,
    task: row.task,
  };
}

/**
 * Maps a raw CSV row into a TaskRecord domain model.
 */
function mapRowToTask(row: Record<string, string>): TaskRecord {
  return {
    category: row.category,
    config: row.config,
    details: row.details,
    finished: row.finished,
    id: Number(row.id),
    importance: row.importance,
    metadata: row.metadata,
    priority: row.priority,
    started: row.started,
    task: row.task,
    totalTime: Number(row['total time']),
    urgency: row.urgency,
  };
}

/**
 * Maps a TaskRecord domain model into CSV row object.
 */
function mapTaskToRow(task: TaskRecord): Record<string, string> {
  return {
    category: task.category,
    config: task.config,
    details: task.details,
    finished: task.finished,
    id: String(task.id),
    importance: task.importance,
    metadata: task.metadata,
    priority: task.priority,
    started: task.started,
    task: task.task,
    'total time': String(task.totalTime),
    urgency: task.urgency,
  };
}

/**
 * Retrieves unique task suggestions ordered with active tasks first.
 */
async function queryTaskSuggestions(config: S20Config): Promise<string[]> {
  const tasks = await readTaskRecords(config);
  const sorted = sortTasksForSuggestions(tasks);
  const unique = new Set<string>();

  for (const t of sorted) {
    if (t.task.trim()) {
      unique.add(t.task.trim());
    }
  }

  return Array.from(unique);
}

/**
 * Reads and maps all events from disk.
 */
async function readEventRecords(config: S20Config): Promise<EventRecord[]> {
  await initStorage(config);

  const rows = (await readCsvFile(config.eventsFilePath, {
    columns: true,
  })) as unknown as Record<string, string>[];

  return rows.map(mapRowToEvent);
}

/**
 * Reads and maps all tasks from disk.
 */
async function readTaskRecords(config: S20Config): Promise<TaskRecord[]> {
  await initStorage(config);

  const rows = (await readCsvFile(config.tasksFilePath, {
    columns: true,
  })) as unknown as Record<string, string>[];

  return rows.map(mapRowToTask);
}

/**
 * Resolves category for task name from defaults or general fallback.
 */
function resolveTaskCategory(taskName: string, config: S20Config): string {
  const taskDef = config.taskDefaults[taskName];

  return taskDef?.category ?? config.defaultCategory;
}

/**
 * Writes updated tasks collection back to CSV file.
 */
async function saveTaskRecords(tasks: TaskRecord[], filePath: string): Promise<void> {
  const rows = tasks.map(mapTaskToRow);

  await writeCsvFile(filePath, rows, { columns: TASK_COLUMNS });
}

/**
 * Sorts task records with unfinished items prioritized at the beginning.
 */
function sortTasksForSuggestions(tasks: TaskRecord[]): TaskRecord[] {
  const unfinished = tasks.filter((t) => t.finished === '');
  const finished = tasks.filter((t) => t.finished !== '');

  return [...unfinished.reverse(), ...finished.reverse()];
}

/**
 * Synchronizes task record by adding new task or updating existing task total time.
 */
async function syncTaskRecord(
  tasks: TaskRecord[],
  event: EventInput,
  config: S20Config,
): Promise<void> {
  const matchIndex = tasks.findIndex((t) => t.task.toLowerCase() === event.task.toLowerCase());

  if (matchIndex === -1) {
    await appendNewTask(tasks, event, config);

    return;
  }

  applyTaskTime(tasks[matchIndex], event);
  await saveTaskRecords(tasks, config.tasksFilePath);
}

/**
 * Creates storage engine for managing S20 CSV events and tasks.
 *
 * @param config S20 configuration settings
 * @returns Storage interface
 * @example
 * ```ts
 * const config = createDefaultConfig();
 * const storage = createStorage(config);
 *
 * const events = await storage.getEvents();
 * // Returns array of EventRecord entries from events.csv
 * ```
 */
export function createStorage(config: S20Config) {
  const _ = {
    config,
  };

  return {
    addEvent: (event: EventInput) => addEventRecord(event, _.config),
    getEvents: () => readEventRecords(_.config),
    getTasks: () => readTaskRecords(_.config),
    getTaskSuggestions: () => queryTaskSuggestions(_.config),
    init: () => initStorage(_.config),
  };
}
