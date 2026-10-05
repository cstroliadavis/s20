import type { CsvStringifier, CsvStringifierOptions, CsvValue } from './types.js';

interface StringifierConfig {
  columns: string[] | null;
  delimiter: string;
  escape: string;
  hasWrittenHeader: boolean;
  header: boolean;
  lineBreak: string;
  quote: string;
  quoted: boolean;
}

const DEFAULT_OPTIONS: StringifierConfig = {
  columns: null,
  delimiter: ',',
  escape: '"',
  hasWrittenHeader: false,
  header: true,
  lineBreak: '\r\n',
  quote: '"',
  quoted: false,
};

/**
 * Formats an individual cell value into an escaped CSV field.
 */
function formatCell(
  value: CsvValue,
  config: { delimiter: string; quote: string; quoted: boolean },
): string {
  const raw = toRawString(value);

  if (!raw) return '';

  return shouldQuote(raw, config) ? quoteField(raw, config.quote) : raw;
}

/**
 * Formats full collection of rows or records.
 */
function formatCollection(
  data: CsvValue[][] | Record<string, CsvValue>[],
  first: CsvValue[] | Record<string, CsvValue>,
  stringifier: CsvStringifier,
): string {
  return Array.isArray(first)
    ? stringifier.stringifyRows(data as CsvValue[][])
    : stringifier.stringifyRecords(data as Record<string, CsvValue>[]);
}

/**
 * Formats a single item from an async stream.
 */
function formatStreamItem(
  item: CsvValue[] | Record<string, CsvValue>,
  stringifier: CsvStringifier,
): string {
  return Array.isArray(item) ? stringifier.stringifyRow(item) : stringifier.stringifyRecord(item);
}

/**
 * Checks whether a formatted string value contains delimiter or quote characters.
 */
function hasDelimOrQuote(str: string, delimiter: string, quote: string): boolean {
  return str.includes(delimiter) || str.includes(quote);
}

/**
 * Checks whether a formatted string value contains newlines.
 */
function hasLineBreak(str: string): boolean {
  return str.includes('\n') || str.includes('\r');
}

/**
 * Checks whether a formatted string value requires enclosing quotes.
 */
function needsQuotes(val: string, delimiter: string, quote: string): boolean {
  return hasLineBreak(val) || hasDelimOrQuote(val, delimiter, quote);
}

/**
 * Quotes and escapes an individual field string.
 */
function quoteField(raw: string, quote: string): string {
  const escaped = raw.replaceAll(quote, `${quote}${quote}`);

  return `${quote}${escaped}${quote}`;
}

/**
 * Resolves the target column names for record serialization.
 */
function resolveColumns(record: Record<string, CsvValue>, state: StringifierConfig): string[] {
  if (state.columns !== null) return state.columns;

  state.columns = Object.keys(record);

  return state.columns;
}

/**
 * Determines whether a cell needs to be wrapped in quotes.
 */
function shouldQuote(
  raw: string,
  config: { delimiter: string; quote: string; quoted: boolean },
): boolean {
  return config.quoted || needsQuotes(raw, config.delimiter, config.quote);
}

/**
 * Serializes a single key-value record into a CSV line.
 */
function stringifyRecord(record: Record<string, CsvValue>, state: StringifierConfig): string {
  const cols = resolveColumns(record, state);
  const parts: string[] = [];

  if (state.header && !state.hasWrittenHeader) {
    state.hasWrittenHeader = true;
    parts.push(stringifyRow(cols, state));
  }

  const values = cols.map((col) => record[col]);

  parts.push(stringifyRow(values, state));

  return parts.join('');
}

/**
 * Serializes an iterable collection of key-value records into a complete CSV string.
 */
function stringifyRecords(
  records: Iterable<Record<string, CsvValue>>,
  state: StringifierConfig,
): string {
  const parts: string[] = [];

  for (const record of records) {
    parts.push(stringifyRecord(record, state));
  }

  return parts.join('');
}

/**
 * Serializes a single row of values into a CSV line with trailing line break.
 */
function stringifyRow(row: CsvValue[], state: StringifierConfig): string {
  const cells = row.map((cell) => formatCell(cell, state));

  return `${cells.join(state.delimiter)}${state.lineBreak}`;
}

/**
 * Serializes an iterable collection of rows into a complete CSV string.
 */
function stringifyRows(rows: Iterable<CsvValue[]>, state: StringifierConfig): string {
  const parts: string[] = [];

  for (const row of rows) {
    parts.push(stringifyRow(row, state));
  }

  return parts.join('');
}

/**
 * Converts a raw cell value into its preliminary string representation.
 */
function toRawString(value: CsvValue): string {
  if (value == null) return '';

  return value instanceof Date ? value.toISOString() : String(value);
}

/**
 * Creates a CSV stringifier instance for serializing rows and records.
 *
 * @param options - Configuration options for delimiter, quote, escaping, and line breaks.
 * @returns A stringifier object with formatting methods.
 * @example
 * ```ts
 * const stringifier = createCsvStringifier({ lineBreak: '\n' });
 * const csv = stringifier.stringifyRows([['name', 'city'], ['Alice', 'New York']]);
 * // Returns "name,city\nAlice,New York\n"
 * ```
 */
export function createCsvStringifier(options: CsvStringifierOptions = {}): CsvStringifier {
  const _ = Object.assign({}, DEFAULT_OPTIONS, options);

  return {
    stringifyRecord: (record) => stringifyRecord(record, _),
    stringifyRecords: (records) => stringifyRecords(records, _),
    stringifyRow: (row) => stringifyRow(row, _),
    stringifyRows: (rows) => stringifyRows(rows, _),
  };
}

/**
 * Serializes an array of rows or records into a complete CSV string.
 *
 * @param data - Array of row arrays or key-value record objects.
 * @param options - Configuration options for delimiter, quote, escaping, and line breaks.
 * @returns The formatted CSV string.
 * @example
 * ```ts
 * const csv = stringifyCsv([
 *   { age: 30, name: 'Alice' },
 *   { age: 25, name: 'Bob' },
 * ]);
 * // Returns formatted CSV with header row
 * ```
 */
export function stringifyCsv(
  data: CsvValue[][] | Record<string, CsvValue>[],
  options: CsvStringifierOptions = {},
): string {
  if (data.length === 0) return '';

  const stringifier = createCsvStringifier(options);

  return formatCollection(data, data[0], stringifier);
}

/**
 * Asynchronously streams formatted CSV chunks from rows or records.
 *
 * @param items - An async iterable yielding rows (CsvValue[]) or records.
 * @param options - Configuration options for delimiter, quote, escaping, and line breaks.
 * @returns An async generator yielding serialized CSV text lines.
 * @example
 * ```ts
 * for await (const line of stringifyCsvStream(rows)) {
 *   writer.write(line);
 *   // Stream lines directly to destination
 * }
 * ```
 */
export async function* stringifyCsvStream(
  items: AsyncIterable<CsvValue[] | Record<string, CsvValue>>,
  options: CsvStringifierOptions = {},
): AsyncGenerator<string> {
  const stringifier = createCsvStringifier(options);

  for await (const item of items) {
    yield formatStreamItem(item, stringifier);
  }
}
