import { isBlockScalarIndicator, parseBlockScalar } from './block-scalar.js';
import { findFirstKeyColon } from './key-detector.js';
import { scanYamlLines } from './line-scanner.js';
import { parseScalar } from './scalar-parser.js';
import type { YamlLine, YamlParser, YamlParserOptions } from './types.js';

/**
 * Validates whether a duplicate mapping key is allowed under parser options.
 */
function checkDuplicateKey(
  key: string,
  context: ParseContext,
  result: Record<string, unknown>,
): void {
  if (!context.options.disallowDuplicateKeys) return;

  if (Object.hasOwn(result, key)) {
    throw new Error(`Duplicate key detected: "${key}"`);
  }
}

/**
 * Extracts a mapping key and raw value string from a YAML line.
 */
function extractKeyAndValue(line: YamlLine): KeyValueResult | undefined {
  if (isSequenceItem(line)) return undefined;

  const colonIndex = findFirstKeyColon(line.text);

  if (colonIndex === -1) return undefined;

  const rawKey = line.text.slice(0, colonIndex).trim();
  const rawValue = line.text.slice(colonIndex + 1).trim();
  const key = String(parseScalar(rawKey));

  return { key, rawValue };
}

/**
 * Verifies if line is eligible for inclusion at the current mapping indentation level.
 */
function isMatchingMappingLine(line: YamlLine | undefined, blockIndent: number): boolean {
  return line?.indent === blockIndent;
}

/**
 * Verifies if line matches current sequence indentation and prefix.
 */
function isMatchingSequenceLine(line: YamlLine | undefined, blockIndent: number): boolean {
  return line?.indent === blockIndent && isSequenceItem(line);
}

/**
 * Determines whether a line begins a sequence list item.
 */
function isSequenceItem(line: YamlLine): boolean {
  return line.text === '-' || line.text.startsWith('- ');
}

/**
 * Checks whether a candidate line is an indented child of a sequence mapping item.
 */
function isSubEntryLine(line: YamlLine | undefined, currentIndent: number): boolean {
  return line !== undefined && line.indent > currentIndent;
}

/**
 * Recursively parses a child block at an indentation level greater than the parent.
 */
function parseBlock(context: ParseContext, parentIndent: number): unknown {
  skipEmptyLines(context);

  if (context.index >= context.lines.length) return null;

  const firstLine = context.lines[context.index];

  if (firstLine.indent <= parentIndent) return null;

  return parseBlockContent(context, firstLine);
}

/**
 * Dispatches parsing of child block content based on leading line syntax.
 */
function parseBlockContent(context: ParseContext, firstLine: YamlLine): unknown {
  if (isSequenceItem(firstLine)) return parseSequence(context, firstLine.indent);

  if (extractKeyAndValue(firstLine) !== undefined) return parseMapping(context, firstLine.indent);

  context.index++;

  return parseScalar(firstLine.text);
}

/**
 * Parses mapping key-value pairs at a consistent indentation level.
 */
function parseMapping(context: ParseContext, blockIndent: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  while (parseMappingStep(context, blockIndent, result)) {
    // Parser step advances index
  }

  return result;
}

/**
 * Executes a single step of mapping entry extraction.
 */
function parseMappingStep(
  context: ParseContext,
  blockIndent: number,
  result: Record<string, unknown>,
): boolean {
  skipEmptyLines(context);

  const line = context.lines[context.index];

  if (!isMatchingMappingLine(line, blockIndent)) return false;

  const kv = extractKeyAndValue(line);

  if (!kv) return false;

  checkDuplicateKey(kv.key, context, result);
  context.index++;
  result[kv.key] = resolveMappingValue(kv.rawValue, line.indent, context);

  return true;
}

/**
 * Parses the root level block of a YAML document.
 */
function parseRootBlock(context: ParseContext): unknown {
  skipEmptyLines(context);

  if (context.index >= context.lines.length) return null;

  const firstLine = context.lines[context.index];

  return parseBlockContent(context, firstLine);
}

/**
 * Parses sequence items at a consistent indentation level.
 */
function parseSequence(context: ParseContext, blockIndent: number): unknown[] {
  const result: unknown[] = [];

  while (parseSequenceStep(context, blockIndent, result)) {
    // Parser step advances index
  }

  return result;
}

/**
 * Parses an inline mapping that starts on a sequence item dash line.
 */
function parseSequenceMappingItem(
  afterDash: string,
  currentLine: YamlLine,
  context: ParseContext,
): Record<string, unknown> {
  const colonIndex = findFirstKeyColon(afterDash);
  const rawKey = afterDash.slice(0, colonIndex).trim();
  const rawVal = afterDash.slice(colonIndex + 1).trim();
  const key = String(parseScalar(rawKey));
  const itemMap: Record<string, unknown> = {
    [key]: resolveMappingValue(rawVal, currentLine.indent + 1, context),
  };

  while (parseSequenceSubEntry(currentLine.indent, context, itemMap)) {
    // Sub-entry loop advances index
  }

  return itemMap;
}

/**
 * Executes a single step of sequence item extraction.
 */
function parseSequenceStep(context: ParseContext, blockIndent: number, result: unknown[]): boolean {
  skipEmptyLines(context);

  const line = context.lines[context.index];

  if (!isMatchingSequenceLine(line, blockIndent)) return false;

  const afterDash = line.text === '-' ? '' : line.text.slice(2).trim();

  context.index++;
  result.push(resolveSequenceItem(afterDash, line, context));

  return true;
}

/**
 * Extracts subsequent key-value pairs belonging to a sequence mapping item.
 */
function parseSequenceSubEntry(
  currentIndent: number,
  context: ParseContext,
  itemMap: Record<string, unknown>,
): boolean {
  skipEmptyLines(context);

  const nextLine = context.lines[context.index];

  if (!isSubEntryLine(nextLine, currentIndent)) return false;

  const kv = extractKeyAndValue(nextLine as YamlLine);

  if (!kv) return false;

  context.index++;
  itemMap[kv.key] = resolveMappingValue(kv.rawValue, (nextLine as YamlLine).indent, context);

  return true;
}

/**
 * Consumes and resolves a block scalar into its string value.
 */
function resolveBlockScalar(indicator: string, indent: number, context: ParseContext): string {
  const { nextIndex, value } = parseBlockScalar({
    indicator,
    lines: context.lines,
    parentIndent: indent,
    startIndex: context.index,
  });

  context.index = nextIndex;

  return value;
}

/**
 * Resolves a mapping value either from an inline scalar, block scalar, or child block.
 */
function resolveMappingValue(rawValue: string, indent: number, context: ParseContext): unknown {
  if (rawValue === '') return parseBlock(context, indent);

  if (isBlockScalarIndicator(rawValue)) return resolveBlockScalar(rawValue, indent, context);

  return parseScalar(rawValue);
}

/**
 * Resolves block scalar or child block values for sequence items.
 */
function resolveNonScalarSequenceItem(
  afterDash: string,
  line: YamlLine,
  context: ParseContext,
): unknown | undefined {
  if (afterDash === '') return parseBlock(context, line.indent);

  if (isBlockScalarIndicator(afterDash)) return resolveBlockScalar(afterDash, line.indent, context);

  return undefined;
}

/**
 * Resolves a sequence item value from inline content, block scalars, or nested blocks.
 */
function resolveSequenceItem(afterDash: string, line: YamlLine, context: ParseContext): unknown {
  const nonScalar = resolveNonScalarSequenceItem(afterDash, line, context);

  if (nonScalar !== undefined) return nonScalar;

  if (findFirstKeyColon(afterDash) !== -1) {
    return parseSequenceMappingItem(afterDash, line, context);
  }

  return parseScalar(afterDash);
}

/**
 * Advances the parse context index over empty or comment-only lines.
 */
function skipEmptyLines(context: ParseContext): void {
  while (context.index < context.lines.length && context.lines[context.index].isEmpty) {
    context.index++;
  }
}

/**
 * Creates a closure-based YAML parser instance with optional configuration options.
 *
 * @param options - Parser configuration options.
 * @returns A YamlParser instance.
 *
 * @example
 * ```ts
 * const parser = createYamlParser();
 * const data = parser.parse('name: s20');
 * // Returns { name: 's20' }
 * ```
 */
export function createYamlParser(options: YamlParserOptions = {}): YamlParser {
  const _ = {
    options,
  };

  return {
    parse<T = unknown>(content: string): T {
      const lines = scanYamlLines(content);
      const context: ParseContext = {
        index: 0,
        lines,
        options: _.options,
      };

      return parseRootBlock(context) as T;
    },
  };
}

/**
 * Parses a YAML string into a typed JavaScript data structure.
 *
 * @template T - Inferred or explicit result data type.
 * @param content - Raw YAML string content.
 * @param options - Parser configuration options.
 * @returns The parsed JavaScript object, array, or primitive.
 *
 * @example
 * ```ts
 * const config = parseYaml<{ name: string }>('name: s20');
 * // Returns { name: 's20' }
 * ```
 */
export function parseYaml<T = unknown>(content: string, options: YamlParserOptions = {}): T {
  const parser = createYamlParser(options);

  return parser.parse<T>(content);
}

interface KeyValueResult {
  readonly key: string;
  readonly rawValue: string;
}

interface ParseContext {
  index: number;
  readonly lines: YamlLine[];
  readonly options: YamlParserOptions;
}
