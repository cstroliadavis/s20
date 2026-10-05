const BIN_REGEX = /^0b[01]+$/;
const FLOAT_DOT_REGEX = /^[+-]?\.\d+(?:[eE][+-]?\d+)?$/;
const FLOAT_REGEX = /^[+-]?(?:0|[1-9]\d*)\.\d+(?:[eE][+-]?\d+)?$/;
const HEX_REGEX = /^0x[0-9a-fA-F]+$/;
const INT_REGEX = /^[+-]?(?:0|[1-9]\d*)$/;
const NULL_TOKENS = ['', '~', 'null'];
const OCT_REGEX = /^0o[0-7]+$/;

const NUMERIC_PATTERNS = [INT_REGEX, FLOAT_REGEX, FLOAT_DOT_REGEX, HEX_REGEX, OCT_REGEX, BIN_REGEX];

/**
 * Handles flow delimiter commas outside nested brackets.
 */
function handleFlowDelimiter(char: string, state: FlowItemState, items: string[]): boolean {
  if (char !== ',' || state.depth !== 0) return false;

  items.push(state.current.trim());
  state.current = '';

  return true;
}

/**
 * Checks whether text is enclosed by matching open and close delimiter characters.
 */
function isEnclosed(text: string, open: string, close: string): boolean {
  return text.startsWith(open) && text.endsWith(close) && text.length >= 2;
}

/**
 * Tests whether text matches any supported numeric representation regex.
 */
function isNumericToken(text: string): boolean {
  return NUMERIC_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Determines whether parser position is currently outside both quote types.
 */
function isOutsideFlowQuotes(state: FlowItemState): boolean {
  return !state.inSingle && !state.inDouble;
}

/**
 * Parses a boolean scalar representation.
 */
function parseBoolean(text: string): boolean | undefined {
  const lower = text.toLowerCase();

  if (['true', 'yes', 'on'].includes(lower)) return true;

  if (['false', 'no', 'off'].includes(lower)) return false;

  return undefined;
}

/**
 * Parses a double-quoted string with JSON escape handling.
 */
function parseDoubleQuoted(text: string): string | undefined {
  if (!isEnclosed(text, '"', '"')) return undefined;

  try {
    return JSON.parse(text) as string;
  } catch {
    return text.slice(1, -1).replaceAll('\\"', '"').replaceAll('\\\\', '\\');
  }
}

/**
 * Parses an inline flow mapping (e.g. `{ a: 1, b: 2 }`).
 */
function parseFlowMapping(text: string): Record<string, unknown> | undefined {
  if (!isEnclosed(text, '{', '}')) return undefined;

  const inner = text.slice(1, -1).trim();

  if (inner === '') return {};

  const result: Record<string, unknown> = {};

  splitFlowItems(inner).forEach((item) => {
    parseFlowMappingEntry(item, result);
  });

  return result;
}

/**
 * Parses a single key-value entry within a flow mapping.
 */
function parseFlowMappingEntry(item: string, result: Record<string, unknown>): void {
  const colonIndex = item.indexOf(':');

  if (colonIndex === -1) return;

  const rawKey = item.slice(0, colonIndex).trim();
  const rawVal = item.slice(colonIndex + 1).trim();

  result[String(parseScalar(rawKey))] = parseScalar(rawVal);
}

/**
 * Parses an inline flow sequence (e.g. `[1, 2, 3]`).
 */
function parseFlowSequence(text: string): unknown[] | undefined {
  if (!isEnclosed(text, '[', ']')) return undefined;

  const inner = text.slice(1, -1).trim();

  if (inner === '') return [];

  return splitFlowItems(inner).map((item) => parseScalar(item));
}

/**
 * Parses a null scalar representation.
 */
function parseNull(text: string): null | undefined {
  if (NULL_TOKENS.includes(text.toLowerCase())) return null;

  return undefined;
}

/**
 * Parses a numeric scalar representation.
 */
function parseNumber(text: string): number | undefined {
  return isNumericToken(text) ? Number(text) : undefined;
}

/**
 * Parses boolean, null, or numeric scalar primitives.
 */
function parsePrimitiveScalar(trimmed: string): unknown | undefined {
  const boolVal = parseBoolean(trimmed);

  if (boolVal !== undefined) return boolVal;

  const nullVal = parseNull(trimmed);

  if (nullVal !== undefined) return nullVal;

  return parseNumber(trimmed);
}

/**
 * Parses single or double quoted strings.
 */
function parseQuotedString(text: string): string | undefined {
  return parseSingleQuoted(text) ?? parseDoubleQuoted(text);
}

/**
 * Parses single-quoted strings with escaped single quote handling.
 */
function parseSingleQuoted(text: string): string | undefined {
  if (!isEnclosed(text, "'", "'")) return undefined;

  return text.slice(1, -1).replaceAll("''", "'");
}

/**
 * Parses quoted strings or flow collections.
 */
function parseStructuredScalar(trimmed: string): unknown | undefined {
  return parseQuotedString(trimmed) ?? parseFlowSequence(trimmed) ?? parseFlowMapping(trimmed);
}

/**
 * Processes a single character during flow collection parsing.
 */
function processFlowChar(char: string, state: FlowItemState, items: string[]): void {
  updateFlowQuote(char, state);

  if (isOutsideFlowQuotes(state)) {
    updateBracketDepth(char, state);

    if (handleFlowDelimiter(char, state, items)) return;
  }

  state.current += char;
}

/**
 * Splits comma-separated items inside flow collections respecting quotes and brackets.
 */
function splitFlowItems(inner: string): string[] {
  const items: string[] = [];
  const state: FlowItemState = {
    current: '',
    depth: 0,
    inDouble: false,
    inSingle: false,
  };

  for (let index = 0; index < inner.length; index++) {
    processFlowChar(inner[index], state, items);
  }

  if (state.current.trim().length > 0) {
    items.push(state.current.trim());
  }

  return items;
}

/**
 * Toggles double quote state for flow character processing.
 */
function toggleDoubleFlowQuote(char: string, state: FlowItemState): void {
  if (char === '"' && !state.inSingle) {
    state.inDouble = !state.inDouble;
  }
}

/**
 * Toggles single quote state for flow character processing.
 */
function toggleSingleFlowQuote(char: string, state: FlowItemState): void {
  if (char === "'" && !state.inDouble) {
    state.inSingle = !state.inSingle;
  }
}

/**
 * Adjusts nesting bracket depth when encountering flow delimiters.
 */
function updateBracketDepth(char: string, state: FlowItemState): void {
  if ('[{'.includes(char)) {
    state.depth++;
  }

  if (']}'.includes(char)) {
    state.depth--;
  }
}

/**
 * Toggles quote tracking state during flow parsing.
 */
function updateFlowQuote(char: string, state: FlowItemState): void {
  toggleSingleFlowQuote(char, state);
  toggleDoubleFlowQuote(char, state);
}

/**
 * Parses a scalar YAML token string into its inferred JavaScript primitive or flow collection.
 *
 * @param text - Raw scalar string from YAML input.
 * @returns The parsed JavaScript primitive or collection value.
 *
 * @example
 * ```ts
 * const value = parseScalar('true');
 * // Returns true
 * ```
 */
export function parseScalar(text: string): unknown {
  const trimmed = text.trim();
  const structured = parseStructuredScalar(trimmed);

  if (structured !== undefined) return structured;

  const primitive = parsePrimitiveScalar(trimmed);

  if (primitive !== undefined) return primitive;

  return trimmed;
}

interface FlowItemState {
  current: string;
  depth: number;
  inDouble: boolean;
  inSingle: boolean;
}
