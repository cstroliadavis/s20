/**
 * Represents any JavaScript primitive or date value acceptable as a CSV cell.
 *
 * Supported values are automatically stringified during serialization (dates are converted to
 * ISO strings, numbers/booleans are converted to text, and null/undefined become empty cells).
 *
 * @example
 * ```ts
 * const cell: CsvValue = 42;
 * // Serializes to "42"
 * ```
 */
export type CsvValue = boolean | bigint | number | string | null | undefined | Date;

/**
 * Represents a single parsed CSV row as an array of cell string values.
 *
 * Used when parsing or writing CSV data as positional arrays rather than keyed objects.
 *
 * @example
 * ```ts
 * const row: CsvRow = ['Alice', '30', 'New York'];
 * // A 3-column row
 * ```
 */
export type CsvRow = string[];

/**
 * Represents a single parsed CSV row as a key-value record mapping column headers to cell strings.
 *
 * Produced by the parser when `columns: true` or custom header arrays are supplied.
 *
 * @example
 * ```ts
 * const record: CsvRecord = { age: '30', name: 'Alice' };
 * // Access cells by header name
 * ```
 */
export type CsvRecord = Record<string, string>;

/**
 * Configuration options controlling CSV parsing behavior and header mapping.
 */
export interface CsvParserOptions {
  /**
   * Column configuration for record mapping.
   *
   * Set to `true` to use the first row as headers, or pass an array of string column names.
   * When omitted or `false`, the parser emits array rows (`CsvRow`).
   */
  columns?: boolean | string[];

  /**
   * Field separator character separating individual cells on each line.
   *
   * @defaultValue `','`
   */
  delimiter?: string;

  /**
   * Escape character used for quoted fields.
   *
   * @defaultValue `'"'`
   */
  escape?: string;

  /**
   * Quote character wrapping fields containing delimiters, newlines, or quotes.
   *
   * @defaultValue `'"'`
   */
  quote?: string;

  /**
   * Whether lines with no content or only whitespace should be skipped.
   *
   * @defaultValue `false`
   */
  skipEmptyLines?: boolean;

  /**
   * Whether unquoted leading and trailing whitespace should be stripped from cells.
   *
   * @defaultValue `false`
   */
  trim?: boolean;
}

/**
 * Configuration options controlling CSV serialization and formatting.
 */
export interface CsvStringifierOptions {
  /**
   * List of column keys to include and their ordering when stringifying records.
   */
  columns?: string[];

  /**
   * Field separator character written between cells.
   *
   * @defaultValue `','`
   */
  delimiter?: string;

  /**
   * Escape character used for doubling quotes inside quoted fields.
   *
   * @defaultValue `'"'`
   */
  escape?: string;

  /**
   * Whether to automatically output an initial header row when stringifying record objects.
   *
   * @defaultValue `true`
   */
  header?: boolean;

  /**
   * End-of-line delimiter written after each row.
   *
   * @defaultValue `'\r\n'`
   */
  lineBreak?: '\r\n' | '\n';

  /**
   * Quote character used to enclose cell values requiring quoting.
   *
   * @defaultValue `'"'`
   */
  quote?: string;

  /**
   * When `true`, forces enclosing double quotes around every cell, even if unneeded.
   *
   * @defaultValue `false`
   */
  quoted?: boolean;
}

/**
 * Low-level, push-based stateful CSV parser instance.
 */
export interface CsvParser {
  /**
   * Signals the end of input and returns any remaining completed rows from buffered data.
   */
  end(): (CsvRow | CsvRecord)[];

  /**
   * Parses an entire CSV string synchronously in one step.
   */
  parse(text: string): (CsvRow | CsvRecord)[];

  /**
   * Resets the parser state machine so the instance can be reused for new input.
   */
  reset(): void;

  /**
   * Writes an incoming text chunk to the parser and returns newly completed rows.
   */
  write(chunk: string): (CsvRow | CsvRecord)[];
}

/**
 * Low-level CSV stringifier providing row and record serialization methods.
 */
export interface CsvStringifier {
  /**
   * Serializes a single key-value record object into a CSV string line.
   */
  stringifyRecord(record: Record<string, CsvValue>): string;

  /**
   * Serializes an iterable collection of record objects into CSV text with a header.
   */
  stringifyRecords(records: Iterable<Record<string, CsvValue>>): string;

  /**
   * Serializes a single row of cell values into a CSV line.
   */
  stringifyRow(row: CsvValue[]): string;

  /**
   * Serializes an iterable collection of array rows into formatted CSV text.
   */
  stringifyRows(rows: Iterable<CsvValue[]>): string;
}

/**
 * Asynchronous streaming reader for reading and transforming CSV data.
 *
 * @template T - The parsed item type yielded by the reader (`CsvRow` or `CsvRecord`).
 */
export interface CsvReader<T = CsvRow | CsvRecord> {
  /**
   * Enables asynchronous iteration over parsed CSV rows or records using `for await...of`.
   */
  [Symbol.asyncIterator](): AsyncIterator<T>;

  /**
   * Streams the parsed items back out as formatted CSV string lines.
   */
  lines(): AsyncIterable<string>;

  /**
   * Pipes the reader's items through a standard Web `TransformStream`.
   */
  pipeThrough<U>(transform: TransformStream<T, U>): ReadableStream<U>;

  /**
   * Converts the reader into a standard Web `ReadableStream`.
   */
  stream(): ReadableStream<T>;

  /**
   * Collects all parsed items from the stream into an in-memory array.
   */
  toArray(): Promise<T[]>;
}

/**
 * Streaming destination sink for writing CSV rows and records to files or writable streams.
 */
export interface CsvWriter {
  /**
   * Closes the underlying file or stream sink and flushes any pending buffered data.
   */
  close(): Promise<void>;

  /**
   * Flushes any buffered data directly to the destination sink without closing it.
   */
  flush(): Promise<void>;

  /**
   * Writes an iterable collection of rows or records to the sink in sequence.
   */
  writeAll(items: Iterable<CsvValue[]> | Iterable<Record<string, CsvValue>>): Promise<void>;

  /**
   * Serializes and writes a single record object to the destination sink.
   */
  writeRecord(record: Record<string, CsvValue>): Promise<void>;

  /**
   * Serializes and writes a single row of cell values to the destination sink.
   */
  writeRow(row: CsvValue[]): Promise<void>;
}
