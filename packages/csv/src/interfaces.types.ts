import type { CsvRecord, CsvRow, CsvValue } from './options.types.js';

/**
 * Low-level, push-based stateful CSV parser instance.
 */
export interface CsvParser {
  /**
   * Signals the end of input and returns any remaining completed rows from buffered data.
   *
   * @returns Array of parsed rows or records flushed from the parser.
   * @example
   * ```ts
   * const finalRows = parser.end();
   * // Flushes any trailing rows
   * ```
   */
  end(): (CsvRow | CsvRecord)[];

  /**
   * Parses an entire CSV string synchronously in one step.
   *
   * Resets internal state before parsing and flushes all completed rows.
   *
   * @param text - Complete CSV text content to parse.
   * @returns Array of parsed rows or records.
   * @example
   * ```ts
   * const rows = parser.parse('a,b\n1,2');
   * // [['a', 'b'], ['1', '2']]
   * ```
   */
  parse(text: string): (CsvRow | CsvRecord)[];

  /**
   * Resets the parser state machine so the instance can be reused for new input.
   *
   * @example
   * ```ts
   * parser.reset();
   * // Ready for fresh CSV input
   * ```
   */
  reset(): void;

  /**
   * Writes an incoming text chunk to the parser and returns newly completed rows.
   *
   * @param chunk - Arbitrary string chunk of CSV data.
   * @returns Array of rows completed by processing this chunk.
   * @example
   * ```ts
   * const rows = parser.write('col1,col2\n');
   * // Returns newly completed rows
   * ```
   */
  write(chunk: string): (CsvRow | CsvRecord)[];
}

/**
 * Low-level CSV stringifier providing row and record serialization methods.
 */
export interface CsvStringifier {
  /**
   * Serializes a single key-value record object into a CSV string line.
   *
   * @param record - Object mapping column names to cell values.
   * @returns Formatted CSV line including line break.
   * @example
   * ```ts
   * const line = stringifier.stringifyRecord({ age: 30, name: 'Alice' });
   * // "Alice,30\r\n"
   * ```
   */
  stringifyRecord(record: Record<string, CsvValue>): string;

  /**
   * Serializes an iterable collection of record objects into CSV text with a header.
   *
   * @param records - Iterable collection of key-value records.
   * @returns Complete formatted CSV text.
   * @example
   * ```ts
   * const csv = stringifier.stringifyRecords([{ x: 1 }]);
   * // "x\r\n1\r\n"
   * ```
   */
  stringifyRecords(records: Iterable<Record<string, CsvValue>>): string;

  /**
   * Serializes a single row of cell values into a CSV line.
   *
   * @param row - Array of cell values to serialize.
   * @returns Formatted CSV line including line break.
   * @example
   * ```ts
   * const line = stringifier.stringifyRow(['Alice', 95]);
   * // "Alice,95\r\n"
   * ```
   */
  stringifyRow(row: CsvValue[]): string;

  /**
   * Serializes an iterable collection of array rows into formatted CSV text.
   *
   * @param rows - Iterable collection of row arrays.
   * @returns Complete formatted CSV text.
   * @example
   * ```ts
   * const csv = stringifier.stringifyRows([['a', 'b'], ['1', '2']]);
   * // "a,b\r\n1,2\r\n"
   * ```
   */
  stringifyRows(rows: Iterable<CsvValue[]>): string;
}

/**
 * Asynchronous streaming reader for reading and transforming CSV data.
 *
 * Provides async iteration (`for await`), Web Stream integration, pipeline transformations, and
 * array collection.
 *
 * @template T - The parsed item type yielded by the reader: either `CsvRow` (an array of cell
 *   strings) when parsing raw rows, or `CsvRecord` (an object of header-keyed strings) when
 *   `columns: true` is configured.
 * @example
 * ```ts
 * const reader = createCsvReader<CsvRecord>(stream, { columns: true });
 * for await (const record of reader) {
 *   console.log(record.name);
 *   // record is typed as CsvRecord
 * }
 * ```
 */
export interface CsvReader<T = CsvRow | CsvRecord> {
  /**
   * Enables asynchronous iteration over parsed CSV rows or records using `for await...of`.
   *
   * @returns An async iterator yielding items of type `T` (`CsvRow` array or `CsvRecord` object).
   * @example
   * ```ts
   * for await (const row of reader) {
   *   console.log(row);
   *   // Iterates row by row without buffering full file
   * }
   * ```
   */
  [Symbol.asyncIterator](): AsyncIterator<T>;

  /**
   * Streams the parsed items back out as formatted CSV string lines.
   *
   * Useful for piping or streaming re-formatted CSV text to HTTP responses or loggers.
   *
   * @returns An async iterable yielding serialized CSV text lines one by one.
   * @example
   * ```ts
   * for await (const line of reader.lines()) {
   *   process.stdout.write(line);
   *   // Prints each formatted CSV line
   * }
   * ```
   */
  lines(): AsyncIterable<string>;

  /**
   * Pipes the reader's items through a standard Web `TransformStream`.
   *
   * @template U - The output type produced by the transform stream.
   * @param transform - Standard Web TransformStream converting type `T` to type `U`.
   * @returns A ReadableStream emitting transformed items of type `U`.
   * @example
   * ```ts
   * const upperStream = reader.pipeThrough(customTransform);
   * // Chains web streams together
   * ```
   */
  pipeThrough<U>(transform: TransformStream<T, U>): ReadableStream<U>;

  /**
   * Converts the reader into a standard Web `ReadableStream`.
   *
   * Enables streaming integration with standard Web APIs like `Response`, `fetch`, and pipes.
   *
   * @returns A ReadableStream yielding items of type `T`.
   * @example
   * ```ts
   * const stream = reader.stream();
   * return new Response(stream);
   * // Returns web stream response
   * ```
   */
  stream(): ReadableStream<T>;

  /**
   * Collects all parsed items from the stream into an in-memory array.
   *
   * @returns A promise resolving to an array of all parsed items of type `T`.
   * @example
   * ```ts
   * const allRows = await reader.toArray();
   * // Resolves when entire stream is read
   * ```
   */
  toArray(): Promise<T[]>;
}

/**
 * Streaming destination sink for writing CSV rows and records to files or writable streams.
 */
export interface CsvWriter {
  /**
   * Closes the underlying file or stream sink and flushes any pending buffered data.
   *
   * @returns A promise that resolves when the sink is closed.
   * @example
   * ```ts
   * await writer.close();
   * // Closes the file writer
   * ```
   */
  close(): Promise<void>;

  /**
   * Flushes any buffered data directly to the destination sink without closing it.
   *
   * @returns A promise that resolves when buffered data is flushed.
   * @example
   * ```ts
   * await writer.flush();
   * // Ensures all data is written to disk
   * ```
   */
  flush(): Promise<void>;

  /**
   * Writes an iterable collection of rows or records to the sink in sequence.
   *
   * @param items - Iterable of row arrays (`CsvValue[]`) or record objects.
   * @returns A promise that resolves when all items have been written.
   * @example
   * ```ts
   * await writer.writeAll([['a', 1], ['b', 2]]);
   * // Writes all rows sequentially
   * ```
   */
  writeAll(items: Iterable<CsvValue[]> | Iterable<Record<string, CsvValue>>): Promise<void>;

  /**
   * Serializes and writes a single record object to the destination sink.
   *
   * Automatically writes a header line on the first record if configured.
   *
   * @param record - Key-value record object to serialize and write.
   * @returns A promise that resolves when the record is written.
   * @example
   * ```ts
   * await writer.writeRecord({ age: 25, name: 'Bob' });
   * // Writes record line
   * ```
   */
  writeRecord(record: Record<string, CsvValue>): Promise<void>;

  /**
   * Serializes and writes a single row of cell values to the destination sink.
   *
   * @param row - Array of cell values to serialize and write.
   * @returns A promise that resolves when the row is written.
   * @example
   * ```ts
   * await writer.writeRow(['Charlie', 42]);
   * // Writes row line
   * ```
   */
  writeRow(row: CsvValue[]): Promise<void>;
}
