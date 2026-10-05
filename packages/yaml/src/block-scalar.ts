import type { YamlLine } from './types.js';

const BLOCK_SCALAR_INDICATORS = ['|', '|-', '|+', '>', '>-', '>+'];

/**
 * Appends a folded line onto the accumulating result state.
 */
function appendFoldedLine(line: string, state: { pendingBreak: boolean; result: string }): void {
  if (handleFoldedEmptyLine(line, state)) return;

  if (shouldPrependSpace(state)) {
    state.result += ' ';
  }

  state.result += line;
  state.pendingBreak = false;
}

/**
 * Applies YAML chomping rules (strip, keep, clip) to a block scalar string.
 */
function applyChomping(joined: string, indicator: string): string {
  if (indicator.includes('-')) return joined.replace(/\n+$/, '');

  if (indicator.includes('+')) return keepTrailingNewlines(joined);

  return clipTrailingNewlines(joined);
}

/**
 * Clips trailing newlines to exactly one newline character.
 */
function clipTrailingNewlines(joined: string): string {
  const trimmed = joined.replace(/\n+$/, '');

  return trimmed.length > 0 ? `${trimmed}\n` : '';
}

/**
 * Folds lines into a single string, replacing single newlines with spaces.
 */
function foldLines(lines: string[]): string {
  const state = { pendingBreak: false, result: '' };

  lines.forEach((line) => {
    appendFoldedLine(line, state);
  });

  return state.result;
}

/**
 * Handles empty lines during block scalar folding.
 */
function handleEmptyBlockLine(line: YamlLine, state: BlockScalarState): boolean {
  if (!line.isEmpty) return false;

  if (state.contentIndent !== undefined) {
    state.collected.push('');
  }

  return true;
}

/**
 * Handles whitespace-only lines when folding block scalars.
 */
function handleFoldedEmptyLine(
  line: string,
  state: { pendingBreak: boolean; result: string },
): boolean {
  if (line.trim() !== '') return false;

  state.result += '\n';
  state.pendingBreak = true;

  return true;
}

/**
 * Joins collected block lines based on whether folded mode is active.
 */
function joinCollectedLines(collected: string[], isFolded: boolean): string {
  return isFolded ? foldLines(collected) : joinLiteralLines(collected);
}

/**
 * Joins literal lines preserving exact line breaks.
 */
function joinLiteralLines(lines: string[]): string {
  return lines.join('\n');
}

/**
 * Preserves trailing newlines for keep chomping mode.
 */
function keepTrailingNewlines(joined: string): string {
  return joined.endsWith('\n') ? joined : `${joined}\n`;
}

/**
 * Evaluates a single line during block scalar collection.
 */
function processBlockScalarLine(line: YamlLine, state: BlockScalarState): boolean {
  if (handleEmptyBlockLine(line, state)) return true;

  if (!validateLineIndentation(line, state)) return false;

  state.collected.push(line.raw.slice(state.contentIndent));

  return true;
}

/**
 * Establishes content indentation based on the first non-empty line.
 */
function resolveContentIndent(line: YamlLine, state: BlockScalarState): boolean {
  if (state.contentIndent !== undefined) return true;

  if (line.indent <= state.parentIndent) return false;

  state.contentIndent = line.indent;

  return true;
}

/**
 * Determines whether space separator should precede next folded word.
 */
function shouldPrependSpace(state: { pendingBreak: boolean; result: string }): boolean {
  return state.result.length > 0 && !state.pendingBreak;
}

/**
 * Validates that current line meets required indentation depth.
 */
function validateLineIndentation(line: YamlLine, state: BlockScalarState): boolean {
  if (!resolveContentIndent(line, state)) return false;

  return line.indent >= (state.contentIndent as number);
}

/**
 * Determines whether a scalar value string denotes a YAML block scalar indicator.
 *
 * @param value - Scalar string to test.
 * @returns True if the string is a block scalar indicator (`|` or `>`).
 *
 * @example
 * ```ts
 * const isBlock = isBlockScalarIndicator('|');
 * // Returns true
 * ```
 */
export function isBlockScalarIndicator(value: string): boolean {
  return BLOCK_SCALAR_INDICATORS.includes(value.trim());
}

/**
 * Parses block scalar content (literal `|` or folded `>`) from source lines.
 *
 * @param params - Configuration parameters for block scalar extraction.
 * @returns Extracted string value and the next line index.
 *
 * @example
 * ```ts
 * const { value, nextIndex } = parseBlockScalar({
 *   indicator: '|',
 *   lines: [],
 *   parentIndent: 0,
 *   startIndex: 1,
 * });
 * // Returns block string
 * ```
 */
export function parseBlockScalar(params: ParseBlockScalarParams): BlockScalarResult {
  const { indicator, lines, parentIndent, startIndex } = params;
  const state: BlockScalarState = {
    collected: [],
    contentIndent: undefined,
    parentIndent,
  };
  let index = startIndex;

  while (index < lines.length) {
    if (!processBlockScalarLine(lines[index], state)) break;

    index++;
  }

  const joined = joinCollectedLines(state.collected, indicator.startsWith('>'));
  const value = applyChomping(joined, indicator);

  return { nextIndex: index, value };
}

interface BlockScalarResult {
  readonly nextIndex: number;
  readonly value: string;
}

interface BlockScalarState {
  readonly collected: string[];
  contentIndent: number | undefined;
  readonly parentIndent: number;
}

interface ParseBlockScalarParams {
  readonly indicator: string;
  readonly lines: YamlLine[];
  readonly parentIndent: number;
  readonly startIndex: number;
}
