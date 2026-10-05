import {
  createParserState,
  drainOutputRows,
  flushPendingData,
  normalizeFirstChunk,
  pushField,
  pushRow,
  resetParserState,
  resetTrailingFlags,
  startQuotedField,
  toTextChunks,
  type ParserState,
} from './parser-state.js';
import type { CsvParser, CsvParserOptions, CsvRecord, CsvRow } from './types.js';

const WHITESPACE = '\t ';

/**
 * Appends an unquoted character to the current field buffer.
 */
function appendUnquotedChar(char: string, _: ParserState): void {
  if (shouldSkipWhitespace(char, _)) return;

  _.isFieldStart = false;
  _.currentField += char;
}

/**
 * Determines whether a line feed character follows a carriage return and should be skipped.
 */
function checkCarriageReturnSkip(char: string, _: ParserState): boolean {
  if (!_.sawCarriageReturn) return false;

  _.sawCarriageReturn = false;

  return char === '\n';
}

/**
 * Finalizes parsing and returns any remaining completed rows.
 */
function endParser(_: ParserState): (CsvRow | CsvRecord)[] {
  resetTrailingFlags(_);
  flushPendingData(_);

  return drainOutputRows(_);
}

/**
 * Processes trailing characters following a closing quote.
 */
function handleClosingQuote(char: string, _: ParserState): void {
  _.inQuotes = false;

  if (char === _.delimiter) {
    pushField(_);

    return;
  }

  if (isNewline(char)) {
    handleRowBreak(char, _);

    return;
  }

  handlePostQuoteChar(char, _);
}

/**
 * Processes delimiter and newline characters encountered outside of quotes.
 */
function handleDelimiter(char: string, _: ParserState): boolean {
  if (char === _.delimiter) {
    pushField(_);

    return true;
  }

  if (isNewline(char)) {
    handleRowBreak(char, _);

    return true;
  }

  return false;
}

/**
 * Handles character ingestion while inside an open quoted field.
 */
function handleInsideQuotes(char: string, _: ParserState): void {
  if (char === _.quote) {
    _.sawQuote = true;

    return;
  }

  _.currentField += char;
}

/**
 * Dispatches character handling when outside of a quoted field.
 */
function handleOutsideQuotes(char: string, _: ParserState): void {
  if (handleDelimiter(char, _)) return;

  if (isOpeningQuote(char, _)) {
    startQuotedField(_);

    return;
  }

  appendUnquotedChar(char, _);
}

/**
 * Ingests characters immediately following a closing quote before the delimiter or newline.
 */
function handlePostQuoteChar(char: string, _: ParserState): void {
  if (_.trim && WHITESPACE.includes(char)) return;

  _.currentField += char;
}

/**
 * Handles quotes and characters inside quoted strings.
 */
function handleQuotedChar(char: string, _: ParserState): boolean {
  if (_.sawQuote) {
    handleSawQuote(char, _);

    return true;
  }

  if (_.inQuotes) {
    handleInsideQuotes(char, _);

    return true;
  }

  return false;
}

/**
 * Finalizes the current row and registers a newline or carriage return.
 */
function handleRowBreak(char: string, _: ParserState): void {
  if (char === '\r') {
    _.sawCarriageReturn = true;
  }

  pushField(_);
  pushRow(_);
}

/**
 * Handles an escaped quote pair or the closing quote of a field.
 */
function handleSawQuote(char: string, _: ParserState): void {
  _.sawQuote = false;

  if (char === _.quote) {
    _.currentField += _.quote;

    return;
  }

  handleClosingQuote(char, _);
}

/**
 * Determines whether whitespace is eligible for trimming based on field state.
 */
function isEligibleWhitespaceState(_: ParserState): boolean {
  return _.isFieldStart || _.isQuotedField;
}

/**
 * Checks whether a character represents a line break character.
 */
function isNewline(char: string): boolean {
  return '\r\n'.includes(char);
}

/**
 * Determines whether a character should initiate a quoted field.
 */
function isOpeningQuote(char: string, _: ParserState): boolean {
  return char === _.quote && _.isFieldStart;
}

/**
 * Resets state, parses a complete text payload, and returns all parsed rows.
 */
function parseText(
  text: string,
  _: ParserState,
  initialHeaders: string[] | null,
): (CsvRow | CsvRecord)[] {
  resetParser(_, initialHeaders);

  const chunkRows = writeChunk(text, _);
  const endRows = endParser(_);

  return [...chunkRows, ...endRows];
}

/**
 * Dispatches a single character to the appropriate state handler.
 */
function processChar(char: string, _: ParserState): void {
  if (checkCarriageReturnSkip(char, _)) return;
  if (handleQuotedChar(char, _)) return;

  handleOutsideQuotes(char, _);
}

/**
 * Resets parser state back to its initial configuration.
 */
function resetParser(_: ParserState, initialHeaders: string[] | null): void {
  resetParserState(_, initialHeaders);
}

/**
 * Checks whether a character is leading whitespace that should be trimmed.
 */
function shouldSkipWhitespace(char: string, _: ParserState): boolean {
  return _.trim && WHITESPACE.includes(char) && isEligibleWhitespaceState(_);
}

/**
 * Ingests a text chunk and returns any rows completed during processing.
 */
function writeChunk(chunk: string, _: ParserState): (CsvRow | CsvRecord)[] {
  const text = normalizeFirstChunk(chunk, _);

  for (const char of text) {
    processChar(char, _);
  }

  return drainOutputRows(_);
}

/**
 * Creates a streaming, stateful CSV parser instance.
 *
 * @param options - Configuration options for delimiter, quotes, headers, and trimming.
 * @returns A stateful parser object with write, end, parse, and reset methods.
 * @example
 * ```ts
 * const parser = createCsvParser({ delimiter: ',' });
 * const rows = parser.parse('name,age\nAlice,30');
 * // Returns [['name', 'age'], ['Alice', '30']]
 * ```
 */
export function createCsvParser(options?: CsvParserOptions): CsvParser {
  const _ = createParserState(options);
  const initialHeaders = _.columnHeaders;

  return {
    end: () => endParser(_),
    parse: (text) => parseText(text, _, initialHeaders),
    reset: () => resetParser(_, initialHeaders),
    write: (chunk) => writeChunk(chunk, _),
  };
}

/**
 * Parses a complete CSV string into an array of rows or records.
 *
 * @template T - The parsed row type returned in the array (`CsvRow` array or `CsvRecord` object).
 * @param text - The full CSV string to parse.
 * @param options - Configuration options for delimiter, quotes, headers, and trimming.
 * @returns An array of parsed rows or records.
 * @example
 * ```ts
 * const records = parseCsv('name,age\nBob,25', { columns: true });
 * // Returns [{ name: 'Bob', age: '25' }]
 * ```
 */
export function parseCsv<T = CsvRow | CsvRecord>(text: string, options?: CsvParserOptions): T[] {
  const parser = createCsvParser(options);

  return parser.parse(text) as T[];
}

/**
 * Asynchronously streams and parses CSV rows from an async iterable or ReadableStream.
 *
 * @template T - The parsed row type emitted by the stream (`CsvRow` array or `CsvRecord` object).
 * @param source - The async iterable or ReadableStream supplying text or byte chunks.
 * @param options - Configuration options for delimiter, quotes, headers, and trimming.
 * @returns An async generator yielding parsed rows or records one by one.
 * @example
 * ```ts
 * for await (const row of parseCsvStream(fileStream)) {
 *   console.log(row);
 *   // Process row without buffering entire file in memory
 * }
 * ```
 */
export async function* parseCsvStream<T = CsvRow | CsvRecord>(
  source: AsyncIterable<Uint8Array | string> | ReadableStream<Uint8Array | string>,
  options?: CsvParserOptions,
): AsyncGenerator<T> {
  const parser = createCsvParser(options);

  for await (const chunk of toTextChunks(source)) {
    yield* parser.write(chunk) as T[];
  }

  yield* parser.end() as T[];
}
