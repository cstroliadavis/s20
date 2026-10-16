/**
 * @file S20 CSV persistence adapter implementing the S20Storage port.
 *
 * Persists and retrieves EventRecord and TaskRecord domain entities to and from local CSV
 * files using @s20/csv, completely decoupled from domain business logic.
 */
import fs from 'node:fs';
import type { EventRecord, S20Storage, TaskRecord } from '@s20/app';
import { appendCsvFile, readCsvFile, writeCsvFile } from '@s20/csv';
import { logger } from '@s20/logging';
import { EVENT_COLUMNS, type StoragePaths, TASK_COLUMNS } from './types.js';

const log = logger({ category: 'storage', name: 'csv-storage.ts' });

/**
 * Options required to initialize the CSV storage adapter.
 */
export type CsvStorageOptions = Pick<StoragePaths, 'dataDir' | 'eventsFilePath' | 'tasksFilePath'>;

/**
 * Appends a single event record to events.csv.
 */
async function appendEventRecord(event: EventRecord, paths: CsvStorageOptions): Promise<void> {
  await initCsvStorage(paths);

  const row = mapEventToRow(event);

  await appendCsvFile(paths.eventsFilePath, [row], { columns: EVENT_COLUMNS });
  log.info('Persisted event record', {
    duration: event.duration,
    id: event.id,
    task: event.task,
  });
}

/**
 * Appends a single task record to tasks.csv.
 */
async function appendTaskRecord(task: TaskRecord, paths: CsvStorageOptions): Promise<void> {
  await initCsvStorage(paths);

  const row = mapTaskToRow(task);

  await appendCsvFile(paths.tasksFilePath, [row], { columns: TASK_COLUMNS });
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
async function initCsvStorage(paths: CsvStorageOptions): Promise<void> {
  if (!fs.existsSync(paths.dataDir)) {
    fs.mkdirSync(paths.dataDir, { recursive: true });
  }

  await ensureFileWithHeaders(paths.eventsFilePath, EVENT_COLUMNS);
  await ensureFileWithHeaders(paths.tasksFilePath, TASK_COLUMNS);
}

/**
 * Maps an EventRecord domain model into CSV row object.
 */
function mapEventToRow(event: EventRecord): Record<string, string> {
  return {
    id: String(event.id),

    date: event.date,
    duration: String(event.duration),
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
    id: Number(row.id),

    date: row.date,
    duration: Number(row.duration),
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
    id: Number(row.id),

    category: row.category,
    config: row.config,
    details: row.details,
    finished: row.finished,
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
    id: String(task.id),

    category: task.category,
    config: task.config,
    details: task.details,
    finished: task.finished,
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
 * Reads and maps all events from disk.
 */
async function readEventRecords(paths: CsvStorageOptions): Promise<EventRecord[]> {
  await initCsvStorage(paths);

  const rows = (await readCsvFile(paths.eventsFilePath, {
    columns: true,
  })) as unknown as Record<string, string>[];

  return rows.map(mapRowToEvent);
}

/**
 * Reads and maps all tasks from disk.
 */
async function readTaskRecords(paths: CsvStorageOptions): Promise<TaskRecord[]> {
  await initCsvStorage(paths);

  const rows = (await readCsvFile(paths.tasksFilePath, {
    columns: true,
  })) as unknown as Record<string, string>[];

  return rows.map(mapRowToTask);
}

/**
 * Writes updated tasks collection back to CSV file.
 */
async function saveTaskRecords(tasks: TaskRecord[], paths: CsvStorageOptions): Promise<void> {
  await initCsvStorage(paths);

  const rows = tasks.map(mapTaskToRow);

  await writeCsvFile(paths.tasksFilePath, rows, { columns: TASK_COLUMNS });
}

/**
 * Creates a CSV persistence adapter implementing the S20Storage port interface.
 *
 * @param paths Local filesystem directory and file paths for events.csv and tasks.csv
 * @returns S20Storage adapter backed by CSV files
 * @example
 * ```ts
 * const paths = createDefaultStoragePaths();
 * const storage = createCsvStorage(paths);
 * const events = await storage.getEvents();
 * // Returns array of EventRecord entries read from events.csv
 * ```
 */
export function createCsvStorage(paths: CsvStorageOptions): S20Storage {
  const _ = {
    paths,
  };

  return {
    appendEvent: (event: EventRecord) => appendEventRecord(event, _.paths),
    appendTask: (task: TaskRecord) => appendTaskRecord(task, _.paths),
    getEvents: () => readEventRecords(_.paths),
    getTasks: () => readTaskRecords(_.paths),
    init: () => initCsvStorage(_.paths),
    saveTasks: (tasks: TaskRecord[]) => saveTaskRecords(tasks, _.paths),
  };
}

/**
 * Alias for createCsvStorage.
 */
export const createStorage = createCsvStorage;
