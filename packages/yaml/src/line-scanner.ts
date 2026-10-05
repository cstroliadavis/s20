import type { YamlLine } from './types.js';

const COMMENT_PRECEDING = ['', ' ', '\t'];

/**
 * Calculates the indentation spaces count for a raw source line.
 */
function calculateIndentation(raw: string): number {
  let count = 0;

  for (let index = 0; index < raw.length; index++) {
    const step = getLeadingCharIndent(raw[index]);

    if (step === 0) break;

    count += step;
  }

  return count;
}

/**
 * Checks a character at index to determine if it starts a comment while tracking quotes.
 */
function checkCommentChar(char: string, prev: string, state: QuoteState): boolean {
  toggleSingleQuote(char, state);
  toggleDoubleQuote(char, state);

  return isCommentStart(char, prev, state);
}

/**
 * Locates the starting index of a comment on a line outside of quotes.
 */
function findCommentIndex(raw: string): number {
  const state: QuoteState = { inDouble: false, inSingle: false };

  for (let index = 0; index < raw.length; index++) {
    const prev = getPrevChar(raw, index);

    if (checkCommentChar(raw[index], prev, state)) return index;
  }

  return -1;
}

/**
 * Computes indentation increment for a leading character.
 */
function getLeadingCharIndent(char: string): number {
  if (char === ' ') return 1;
  if (char === '\t') return 2;

  return 0;
}

/**
 * Retrieves the preceding character on a line or empty string.
 */
function getPrevChar(raw: string, index: number): string {
  return index > 0 ? raw[index - 1] : '';
}

/**
 * Checks if a character marks the beginning of an unquoted comment.
 */
function isCommentStart(char: string, prev: string, state: QuoteState): boolean {
  return isOutsideQuotes(state) && isCommentToken(char, prev);
}

/**
 * Checks if a character and its preceding delimiter match comment syntax.
 */
function isCommentToken(char: string, prev: string): boolean {
  return char === '#' && COMMENT_PRECEDING.includes(prev);
}

/**
 * Determines whether parser position is currently outside both quote types.
 */
function isOutsideQuotes(state: QuoteState): boolean {
  return !state.inSingle && !state.inDouble;
}

/**
 * Strips comments from a line while preserving hash characters within quotes.
 */
function stripComment(raw: string): string {
  const commentIndex = findCommentIndex(raw);

  if (commentIndex === -1) return raw.trimEnd();

  return raw.slice(0, commentIndex).trimEnd();
}

/**
 * Toggles double quote state if active.
 */
function toggleDoubleQuote(char: string, state: QuoteState): void {
  if (char === '"' && !state.inSingle) {
    state.inDouble = !state.inDouble;
  }
}

/**
 * Toggles single quote state if active.
 */
function toggleSingleQuote(char: string, state: QuoteState): void {
  if (char === "'" && !state.inDouble) {
    state.inSingle = !state.inSingle;
  }
}

/**
 * Converts a raw line string into a structured YamlLine model.
 */
function toYamlLine(raw: string, index: number): YamlLine {
  const stripped = stripComment(raw);
  const text = stripped.trim();
  const isEmpty = text.length === 0;
  const indent = isEmpty ? 0 : calculateIndentation(raw);

  return {
    indent,
    isEmpty,
    lineNumber: index + 1,
    raw,
    text,
  };
}

/**
 * Scans and preprocesses a YAML document string into structured lines with indentation metadata.
 *
 * @param content - Raw YAML string content to process.
 * @returns An array of preprocessed YAML lines.
 *
 * @example
 * ```ts
 * const lines = scanYamlLines('name: s20\nversion: 0.1.0');
 * // Returns structured YamlLine items
 * ```
 */
export function scanYamlLines(content: string): YamlLine[] {
  const rawLines = content.split(/\r?\n/);

  return rawLines.map(toYamlLine);
}

interface QuoteState {
  inDouble: boolean;
  inSingle: boolean;
}
