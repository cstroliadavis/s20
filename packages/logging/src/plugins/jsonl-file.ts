/**
 * @file Rotating JSONL file output plugin for @s20/logging.
 *
 * Writes structured JSON Lines to sequential files (e.g. `s20-0001.jsonl`, `s20-0002.jsonl`)
 * and automatically rolls over to a new file once the current file reaches `maxRows` (default 5000).
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { formatAsJson } from '../formatters.js';
import type { JsonlFilePluginOptions, LogEvent, LoggerTarget, Unsubscribe } from '../types.js';

const DEFAULT_BASE_NAME = 's20';
const DEFAULT_MAX_ROWS = 5000;

/**
 * Internal state tracking the active log file index and row count.
 */
interface FileRotationState {
  baseName: string;
  currentIndex: number;
  currentRows: number;
  formatter: (event: LogEvent) => string;
  logDir: string;
  maxRows: number;
}

/**
 * Counts the number of non-empty lines currently present in an existing log file.
 */
function countFileLines(filePath: string): number {
  if (!fs.existsSync(filePath)) return 0;

  const content = fs.readFileSync(filePath, 'utf8');

  return content.split('\n').filter(Boolean).length;
}

/**
 * Builds the default configuration for the rotating JSONL file plugin.
 */
function createDefaultOptions(): Required<JsonlFilePluginOptions> {
  return {
    baseName: DEFAULT_BASE_NAME,
    formatter: formatAsJson,
    logDir: path.resolve(process.cwd(), 'data', 'logs'),
    maxRows: DEFAULT_MAX_ROWS,
  };
}

/**
 * Initializes the rotating file state and discovers any existing sequential log files.
 */
function createRotationState(options: JsonlFilePluginOptions = {}): FileRotationState {
  const resolved = Object.assign(createDefaultOptions(), stripUndefined(options));

  ensureLogDir(resolved.logDir);

  const initial = discoverInitialFile(resolved.logDir, resolved.baseName, resolved.maxRows);

  return {
    baseName: resolved.baseName,
    currentIndex: initial.index,
    currentRows: initial.rows,
    formatter: resolved.formatter,
    logDir: resolved.logDir,
    maxRows: resolved.maxRows,
  };
}

/**
 * Determines the starting file index and row count by inspecting the latest file in logDir.
 */
function discoverInitialFile(
  logDir: string,
  baseName: string,
  maxRows: number,
): { index: number; rows: number } {
  const highest = findHighestFileIndex(logDir, baseName);

  if (highest === 0) return { index: 1, rows: 0 };

  const latestPath = formatLogFilePath(logDir, baseName, highest);
  const rows = countFileLines(latestPath);

  if (rows >= maxRows) return { index: highest + 1, rows: 0 };

  return { index: highest, rows };
}

/**
 * Creates the target log directory recursively if it does not already exist.
 */
function ensureLogDir(logDir: string): void {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Extracts the numeric sequence index from a `<baseName>-NNNN.jsonl` filename, or 0 if unmatched.
 */
function extractFileNumber(fileName: string, baseName: string): number {
  const prefix = `${baseName}-`;

  if (!isMatchingLogFile(fileName, prefix)) return 0;

  const rawNum = fileName.slice(prefix.length, -6);
  const parsed = Number.parseInt(rawNum, 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Scans the log directory to find the highest existing sequential file number.
 */
function findHighestFileIndex(logDir: string, baseName: string): number {
  const entries = fs.readdirSync(logDir);

  return entries.reduce((max, entry) => Math.max(max, extractFileNumber(entry, baseName)), 0);
}

/**
 * Formats the full filesystem path for a numbered `.jsonl` log file.
 */
function formatLogFilePath(logDir: string, baseName: string, index: number): string {
  const padded = String(index).padStart(4, '0');

  return path.join(logDir, `${baseName}-${padded}.jsonl`);
}

/**
 * Checks whether a filename matches the `<baseName>-*.jsonl` naming convention.
 */
function isMatchingLogFile(fileName: string, prefix: string): boolean {
  if (!fileName.startsWith(prefix)) return false;

  return fileName.endsWith('.jsonl');
}

/**
 * Advances to the next sequential file index when the active file reaches `maxRows`.
 */
function rotateIfNeeded(state: FileRotationState): void {
  if (state.currentRows >= state.maxRows) {
    state.currentIndex += 1;
    state.currentRows = 0;
  }
}

/**
 * Removes undefined properties from an options object before merging with defaults.
 */
function stripUndefined(options: JsonlFilePluginOptions): Partial<JsonlFilePluginOptions> {
  return Object.fromEntries(Object.entries(options).filter(([, val]) => val !== undefined));
}

/**
 * Serializes a log event and appends it to the active rotating `.jsonl` file.
 */
function writeEventLine(state: FileRotationState, event: LogEvent): void {
  ensureLogDir(state.logDir);
  rotateIfNeeded(state);

  const filePath = formatLogFilePath(state.logDir, state.baseName, state.currentIndex);
  const line = state.formatter(event);

  fs.appendFileSync(filePath, `${line}\n`, 'utf8');
  state.currentRows += 1;
}

/**
 * Attaches a rotating JSONL file writer plugin to the logger, rolling over every `maxRows` (5000).
 *
 * @param logger - Logger singleton or scoped log function to observe.
 * @param options - Directory, base filename, custom formatter, and row limit options.
 * @returns Unsubscribe function to stop writing log events to disk.
 * @example
 * ```ts
 * import { jsonlFilePlugin, logger } from '@s20/logging';
 *
 * logger.use(jsonlFilePlugin, { logDir: './data/logs', maxRows: 5000 });
 * ```
 */
export function jsonlFilePlugin(
  logger: LoggerTarget,
  options?: JsonlFilePluginOptions,
): Unsubscribe {
  const _ = createRotationState(options);

  return logger.on('log', (event) => {
    writeEventLine(_, event);
  });
}
