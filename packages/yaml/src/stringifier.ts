import type { YamlStringifier, YamlStringifyOptions } from './types.js';

const NUMERIC_REGEX = /^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
const RESERVED_WORDS = ['true', 'false', 'yes', 'no', 'on', 'off', 'null', '~'];
const SPECIAL_CHARS_REGEX = /[:#{}[\]\n,]/;
const SPECIAL_FIRST_CHARS = ['-', '?', '!', '&', '*', '%', '@', '`', "'", '"'];

/**
 * Formats a single item inside an array for YAML serialization.
 */
function formatArrayItem(item: unknown, indentSpaces: string, context: StringifyContext): string {
  if (isObjectValue(item)) return formatArrayObjectItem(item, indentSpaces, context);

  return `${indentSpaces}- ${formatScalar(item, context.options)}`;
}

/**
 * Formats an object or nested array item inside an array.
 */
function formatArrayObjectItem(
  item: object,
  indentSpaces: string,
  context: StringifyContext,
): string {
  const nextContext: StringifyContext = {
    indentLevel: context.indentLevel + 1,
    options: context.options,
  };
  const formatted = stringifyValue(item, nextContext);

  if (Array.isArray(item)) return `${indentSpaces}-\n${formatted}`;

  const itemLines = formatted.split('\n');
  const first = `${indentSpaces}- ${itemLines[0].trimStart()}`;
  const rest = itemLines.slice(1);

  return [first, ...rest].join('\n');
}

/**
 * Formats boolean values into literal string representations.
 */
function formatBoolean(value: unknown): string | undefined {
  if (typeof value !== 'boolean') return undefined;

  return value ? 'true' : 'false';
}

/**
 * Formats empty array or empty object shorthand for object properties.
 */
function formatEmptyCollection(key: string, val: object, indentSpaces: string): string | undefined {
  if (!isEmptyCollection(val)) return undefined;

  return Array.isArray(val) ? `${indentSpaces}${key}: []` : `${indentSpaces}${key}: {}`;
}

/**
 * Formats null or undefined into its YAML string representation.
 */
function formatNullOrUndefined(value: unknown, options: YamlStringifyOptions): string | undefined {
  if (!isNil(value)) return undefined;

  return options.useTildeForNull ? '~' : 'null';
}

/**
 * Formats finite numbers into literal string representations.
 */
function formatNumber(value: unknown): string | undefined {
  if (typeof value !== 'number') return undefined;

  return Number.isFinite(value) ? String(value) : 'null';
}

/**
 * Formats an object or array child property within a mapping.
 */
function formatObjectChild(key: string, val: object, context: StringifyContext): string {
  const indentSpaces = ' '.repeat(context.indentLevel * (context.options.indent ?? 2));
  const emptyFormatted = formatEmptyCollection(key, val, indentSpaces);

  if (emptyFormatted !== undefined) return emptyFormatted;

  const nextContext: StringifyContext = {
    indentLevel: context.indentLevel + 1,
    options: context.options,
  };

  return `${indentSpaces}${key}:\n${stringifyValue(val, nextContext)}`;
}

/**
 * Formats a single key-value entry for an object mapping.
 */
function formatObjectEntry(entry: [string, unknown], context: StringifyContext): string {
  const [rawKey, val] = entry;
  const key = formatObjectKey(rawKey);

  if (isObjectValue(val)) return formatObjectChild(key, val, context);

  const indentSpaces = ' '.repeat(context.indentLevel * (context.options.indent ?? 2));

  return `${indentSpaces}${key}: ${formatScalar(val, context.options)}`;
}

/**
 * Quotes an object property key if required by YAML syntax.
 */
function formatObjectKey(rawKey: string): string {
  return needsQuotes(rawKey) ? `'${rawKey.replaceAll("'", "''")}'` : rawKey;
}

/**
 * Formats a boolean or number primitive into its YAML representation.
 */
function formatPrimitive(value: unknown): string | undefined {
  return formatBoolean(value) ?? formatNumber(value);
}

/**
 * Formats a scalar value into its YAML string representation with quoting if needed.
 */
function formatScalar(value: unknown, options: YamlStringifyOptions): string {
  const nullStr = formatNullOrUndefined(value, options);

  if (nullStr !== undefined) return nullStr;

  const primStr = formatPrimitive(value);

  if (primStr !== undefined) return primStr;

  return formatString(String(value));
}

/**
 * Formats a string value with quotes if special characters or tokens are present.
 */
function formatString(str: string): string {
  if (needsQuotes(str)) return `'${str.replaceAll("'", "''")}'`;

  return str;
}

/**
 * Tests whether leading character in a string requires quoting.
 */
function hasSpecialFirstChar(text: string): boolean {
  return SPECIAL_FIRST_CHARS.includes(text[0]);
}

/**
 * Tests whether string matches numeric or special character patterns.
 */
function hasSpecialSyntax(text: string): boolean {
  return NUMERIC_REGEX.test(text) || SPECIAL_CHARS_REGEX.test(text);
}

/**
 * Tests whether string contains special first char or syntax patterns.
 */
function hasSpecialToken(text: string): boolean {
  return hasSpecialFirstChar(text) || hasSpecialSyntax(text);
}

/**
 * Evaluates whether an object is an empty array or empty dictionary.
 */
function isEmptyCollection(val: object): boolean {
  return Array.isArray(val) ? val.length === 0 : Object.keys(val).length === 0;
}

/**
 * Tests whether a value is null or undefined.
 */
function isNil(value: unknown): boolean {
  return value === null || value === undefined;
}

/**
 * Tests whether a value is a non-null object.
 */
function isObjectValue(val: unknown): val is object {
  return val !== null && typeof val === 'object';
}

/**
 * Determines whether a string requires quotes in YAML output.
 */
function needsQuotes(text: string): boolean {
  if (text.length === 0) return true;

  return RESERVED_WORDS.includes(text.toLowerCase()) || hasSpecialToken(text);
}

/**
 * Serializes an array of items into YAML sequence lines.
 */
function stringifyArray(arr: unknown[], context: StringifyContext): string {
  if (arr.length === 0) return '[]';

  const indentSpaces = ' '.repeat(context.indentLevel * (context.options.indent ?? 2));
  const lines = arr.map((item) => formatArrayItem(item, indentSpaces, context));

  return lines.join('\n');
}

/**
 * Serializes an object dictionary into YAML mapping lines.
 */
function stringifyObject(obj: Record<string, unknown>, context: StringifyContext): string {
  const entries = Object.entries(obj);

  if (entries.length === 0) return '{}';

  const lines = entries.map((entry) => formatObjectEntry(entry, context));

  return lines.join('\n');
}

/**
 * Recursively stringifies an arbitrary value at a given indentation depth.
 */
function stringifyValue(value: unknown, context: StringifyContext): string {
  if (isObjectValue(value)) {
    return Array.isArray(value)
      ? stringifyArray(value, context)
      : stringifyObject(value as Record<string, unknown>, context);
  }

  return formatScalar(value, context.options);
}

/**
 * Creates a closure-based YAML stringifier instance with optional serialization settings.
 *
 * @param options - Stringifier configuration options.
 * @returns A YamlStringifier instance.
 *
 * @example
 * ```ts
 * const stringifier = createYamlStringifier({ indent: 2 });
 * const yaml = stringifier.stringify({ name: 's20' });
 * // Returns "name: s20\n"
 * ```
 */
export function createYamlStringifier(options: YamlStringifyOptions = {}): YamlStringifier {
  const _ = {
    options,
  };

  return {
    stringify(data: unknown, overrideOptions?: YamlStringifyOptions): string {
      const mergedOptions = { ..._.options, ...overrideOptions };
      const context: StringifyContext = {
        indentLevel: 0,
        options: mergedOptions,
      };
      const output = stringifyValue(data, context);

      return output.endsWith('\n') ? output : `${output}\n`;
    },
  };
}

/**
 * Serializes a JavaScript data structure into formatted YAML text.
 *
 * @param data - The data structure to serialize.
 * @param options - Stringifier configuration options.
 * @returns The resulting formatted YAML string.
 *
 * @example
 * ```ts
 * const yaml = stringifyYaml({ name: 's20', version: '0.1.0' });
 * // Returns YAML text
 * ```
 */
export function stringifyYaml(data: unknown, options: YamlStringifyOptions = {}): string {
  const stringifier = createYamlStringifier(options);

  return stringifier.stringify(data);
}

interface StringifyContext {
  readonly indentLevel: number;
  readonly options: YamlStringifyOptions;
}
