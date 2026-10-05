import type { CsvParserOptions, CsvRecord, CsvRow } from './types.js';

export interface ParserState {
  columnHeaders: string[] | null;
  currentField: string;
  currentRow: string[];
  delimiter: string;
  escape: string;
  hasProcessedFirstChunk: boolean;
  inQuotes: boolean;
  isFieldStart: boolean;
  isQuotedField: boolean;
  outputRows: (CsvRow | CsvRecord)[];
  quote: string;
  sawCarriageReturn: boolean;
  sawQuote: boolean;
  skipEmptyLines: boolean;
  trim: boolean;
  useHeaderColumns: boolean;
}

const DEFAULT_STATE: Omit<ParserState, 'columnHeaders' | 'useHeaderColumns'> = {
  currentField: '',
  currentRow: [],
  delimiter: ',',
  escape: '"',
  hasProcessedFirstChunk: false,
  inQuotes: false,
  isFieldStart: true,
  isQuotedField: false,
  outputRows: [],
  quote: '"',
  sawCarriageReturn: false,
  sawQuote: false,
  skipEmptyLines: false,
  trim: false,
};

/**
 * Converts a raw row array into a keyed record object using the header names.
 */
function createRecord(headers: string[], row: string[]): CsvRecord {
  const record: CsvRecord = {};

  for (let i = 0; i < headers.length; i++) {
    setRecordField(record, headers[i], row[i]);
  }

  return record;
}

/**
 * Decodes a chunk to string using the text decoder if needed.
 */
function decodeChunk(decoder: TextDecoder, chunk: Uint8Array | string): string {
  return typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
}

/**
 * Checks whether an uncommitted field is currently being accumulated.
 */
function hasPendingField(_: ParserState): boolean {
  return !_.isFieldStart || _.currentField.length > 0;
}

/**
 * Checks whether the current row is an empty line that should be skipped.
 */
function isIgnoredEmptyRow(_: ParserState): boolean {
  return _.skipEmptyLines && _.currentRow.length === 1 && _.currentRow[0] === '';
}

/**
 * Checks whether the first row should be treated as header columns.
 */
function isPendingHeaderRow(_: ParserState): boolean {
  return _.useHeaderColumns && _.columnHeaders === null;
}

/**
 * Resolves the column headers and header usage flag from options.
 */
function resolveColumns(columns?: boolean | string[]): {
  columnHeaders: string[] | null;
  useHeaderColumns: boolean;
} {
  return Array.isArray(columns)
    ? { columnHeaders: columns, useHeaderColumns: false }
    : { columnHeaders: null, useHeaderColumns: columns === true };
}

/**
 * Assigns a field value to a record object for a specified header key.
 */
function setRecordField(record: CsvRecord, header: string, val?: string): void {
  record[header] = val ?? '';
}

/**
 * Commits the current row into output storage as an array or record object.
 */
export function commitRow(_: ParserState): void {
  if (_.columnHeaders !== null) {
    _.outputRows.push(createRecord(_.columnHeaders, _.currentRow));

    return;
  }

  _.outputRows.push(_.currentRow);
}

/**
 * Creates the initial parser state from configuration options.
 */
export function createParserState(options?: CsvParserOptions): ParserState {
  const colInfo = resolveColumns(options?.columns);

  return Object.assign({}, DEFAULT_STATE, options, colInfo, { currentRow: [], outputRows: [] });
}

/**
 * Drains completed rows and clears the internal buffer.
 */
export function drainOutputRows(_: ParserState): (CsvRow | CsvRecord)[] {
  const completed = _.outputRows;

  _.outputRows = [];

  return completed;
}

/**
 * Flushes any remaining pending field or row data into the output buffer.
 */
export function flushPendingData(_: ParserState): void {
  if (!hasPendingData(_)) return;

  pushField(_);
  pushRow(_);
}

/**
 * Checks whether uncommitted field or row data remains in the parser.
 */
export function hasPendingData(_: ParserState): boolean {
  return hasPendingField(_) || _.currentRow.length > 0;
}

/**
 * Strips leading UTF-8 Byte Order Mark (BOM) from the first chunk.
 */
export function normalizeFirstChunk(
  chunk: string,
  state: { hasProcessedFirstChunk: boolean },
): string {
  if (state.hasProcessedFirstChunk) return chunk;

  state.hasProcessedFirstChunk = true;

  return chunk.charCodeAt(0) === 0xfeff ? chunk.slice(1) : chunk;
}

/**
 * Pushes the resolved current field into the current row buffer.
 */
export function pushField(_: ParserState): void {
  _.currentRow.push(resolveField(_));
  _.currentField = '';
  _.isFieldStart = true;
  _.isQuotedField = false;
}

/**
 * Pushes the current row to headers or committed output rows.
 */
export function pushRow(_: ParserState): void {
  if (isIgnoredEmptyRow(_)) {
    _.currentRow = [];

    return;
  }

  if (isPendingHeaderRow(_)) {
    _.columnHeaders = _.currentRow;
    _.currentRow = [];

    return;
  }

  commitRow(_);
  _.currentRow = [];
}

/**
 * Resets state properties for reuse across parse calls.
 */
export function resetParserState(_: ParserState, initialHeaders: string[] | null): void {
  Object.assign(_, {
    columnHeaders: initialHeaders,
    currentField: '',
    currentRow: [],
    hasProcessedFirstChunk: false,
    inQuotes: false,
    isFieldStart: true,
    isQuotedField: false,
    outputRows: [],
    sawCarriageReturn: false,
    sawQuote: false,
  });
}

/**
 * Resets trailing boolean flags at the end of input.
 */
export function resetTrailingFlags(_: ParserState): void {
  _.sawQuote = false;
  _.inQuotes = false;
  _.sawCarriageReturn = false;
}

/**
 * Resolves the final value of the current field, applying trimming if configured.
 */
export function resolveField(_: ParserState): string {
  return _.trim && !_.isQuotedField ? _.currentField.trim() : _.currentField;
}

/**
 * Transitions parser state to begin ingesting a quoted field.
 */
export function startQuotedField(_: ParserState): void {
  _.inQuotes = true;
  _.isFieldStart = false;
  _.isQuotedField = true;
}

/**
 * Generates string chunks from stream or async iterable sources.
 */
export async function* toTextChunks(
  source: AsyncIterable<Uint8Array | string> | ReadableStream<Uint8Array | string>,
): AsyncGenerator<string> {
  const decoder = new TextDecoder();

  for await (const chunk of source as AsyncIterable<Uint8Array | string>) {
    yield decodeChunk(decoder, chunk);
  }

  const trailing = decoder.decode();

  if (trailing.length > 0) yield trailing;
}
