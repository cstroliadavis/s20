import { appendFile } from 'node:fs/promises';
import { parseCsvStream } from './parser.js';
import { createCsvStringifier, stringifyCsv } from './stringifier.js';
import type {
  CsvParserOptions,
  CsvRecord,
  CsvRow,
  CsvStringifierOptions,
  CsvValue,
} from './types.js';

/**
 * Checks whether a given Bun file is nonexistent or zero bytes in size.
 */
async function isFileEmpty(file: ReturnType<typeof Bun.file>): Promise<boolean> {
  const exists = await file.exists();

  return !exists || file.size === 0;
}

/**
 * Determines whether the header line should be included during file append.
 */
function resolveAppendHeader(isEmpty: boolean, headerOption: boolean = true): boolean {
  return isEmpty && headerOption;
}

/**
 * Writes an in-memory collection of rows or records to disk using Bun.write.
 */
async function writeArrayToFile(
  filePath: string,
  data: CsvValue[][] | Record<string, CsvValue>[],
  options: CsvStringifierOptions,
): Promise<number> {
  const csvContent = stringifyCsv(data, options);

  return Bun.write(filePath, csvContent);
}

/**
 * Serializes and writes a single item to an open file sink.
 */
async function writeItemToSink(
  item: CsvValue[] | Record<string, CsvValue>,
  writer: ReturnType<ReturnType<typeof Bun.file>['writer']>,
  stringifier: ReturnType<typeof createCsvStringifier>,
): Promise<number> {
  const line = Array.isArray(item)
    ? stringifier.stringifyRow(item)
    : stringifier.stringifyRecord(item);
  const written = await writer.write(line);

  return typeof written === 'number' ? written : line.length;
}

/**
 * Streams an async iterable of rows or records directly into a file on disk.
 */
async function writeStreamToFile(
  filePath: string,
  stream: AsyncIterable<CsvValue[] | Record<string, CsvValue>>,
  options: CsvStringifierOptions,
): Promise<number> {
  const writer = Bun.file(filePath).writer();
  const stringifier = createCsvStringifier(options);
  let bytesWritten = 0;

  for await (const item of stream) {
    const count = await writeItemToSink(item, writer, stringifier);

    bytesWritten += count;
  }

  await writer.end();

  return bytesWritten;
}

/**
 * Appends rows or records to an existing CSV file on disk.
 *
 * @param filePath - Destination path for the CSV file.
 * @param data - Array of rows or records to append.
 * @param options - Serialization options. Header is automatically disabled if file has content.
 * @returns A promise resolving when the append operation completes.
 * @example
 * ```ts
 * await appendCsvFile('log.csv', [['2026-10-02', 'INFO', 'System started']]);
 * ```
 */
export async function appendCsvFile(
  filePath: string,
  data: CsvValue[][] | Record<string, CsvValue>[],
  options: CsvStringifierOptions = {},
): Promise<void> {
  const file = Bun.file(filePath);
  const isEmpty = await isFileEmpty(file);
  const header = resolveAppendHeader(isEmpty, options.header);
  const mergedOptions = Object.assign({}, options, { header });
  const csvContent = stringifyCsv(data, mergedOptions);

  await appendFile(filePath, csvContent);
}

/**
 * Reads and parses an entire CSV file from disk using Bun.file streams.
 *
 * @template T - The parsed row type returned in the array (`CsvRow` array or `CsvRecord` object).
 * @param filePath - Path to the CSV file.
 * @param options - Configuration options for delimiter, quotes, headers, and trimming.
 * @returns A promise resolving to an array of parsed rows or records.
 * @example
 * ```ts
 * const rows = await readCsvFile('data.csv');
 * // Returns [['header1', 'header2'], ['val1', 'val2']]
 * ```
 */
export async function readCsvFile<T = CsvRow | CsvRecord>(
  filePath: string,
  options: CsvParserOptions = {},
): Promise<T[]> {
  const results: T[] = [];

  for await (const row of streamCsvFile<T>(filePath, options)) {
    results.push(row);
  }

  return results;
}

/**
 * Streams parsed rows or records from a file on disk using Bun.file.
 *
 * @template T - The parsed row type emitted by the stream (`CsvRow` array or `CsvRecord` object).
 * @param filePath - Path to the CSV file.
 * @param options - Configuration options for delimiter, quotes, headers, and trimming.
 * @returns An async generator yielding parsed rows or records.
 * @example
 * ```ts
 * for await (const record of streamCsvFile('users.csv', { columns: true })) {
 *   console.log(record.name);
 * }
 * ```
 */
export async function* streamCsvFile<T = CsvRow | CsvRecord>(
  filePath: string,
  options: CsvParserOptions = {},
): AsyncGenerator<T> {
  const file = Bun.file(filePath);
  const stream = file.stream();

  yield* parseCsvStream<T>(stream, options);
}

/**
 * Writes data rows, records, or an async stream of items to a CSV file.
 *
 * @param filePath - Destination path for the CSV file.
 * @param data - Array of rows, array of records, or an async iterable yielding items.
 * @param options - Serialization options for delimiter, quotes, headers, and line breaks.
 * @returns A promise resolving to the number of bytes written.
 * @example
 * ```ts
 * await writeCsvFile('output.csv', [
 *   { age: 30, name: 'Alice' },
 *   { age: 25, name: 'Bob' },
 * ]);
 * ```
 */
export async function writeCsvFile(
  filePath: string,
  data:
    | CsvValue[][]
    | Record<string, CsvValue>[]
    | AsyncIterable<CsvValue[] | Record<string, CsvValue>>,
  options: CsvStringifierOptions = {},
): Promise<number> {
  return Symbol.asyncIterator in data
    ? writeStreamToFile(
        filePath,
        data as AsyncIterable<CsvValue[] | Record<string, CsvValue>>,
        options,
      )
    : writeArrayToFile(filePath, data as CsvValue[][] | Record<string, CsvValue>[], options);
}
