/**
 * Finds the index of the closing double quote in a text string.
 */
function findClosingDoubleQuote(text: string): number {
  for (let index = 1; index < text.length; index++) {
    if (isUnescapedDoubleQuote(text, index)) return index;
  }

  return -1;
}

/**
 * Locates the key colon delimiter after a quoted key.
 */
function findQuotedKeyColon(text: string): number {
  const endQuote = getClosingQuoteIndex(text);

  if (endQuote === -1) return -1;

  const colon = text.indexOf(':', endQuote);

  if (colon === -1) return -1;

  return verifyColonAt(text, colon);
}

/**
 * Locates unquoted mapping key colon delimiters.
 */
function findUnquotedKeyColon(text: string): number {
  for (let index = 0; index < text.length; index++) {
    if (isColonAt(text, index)) return index;
  }

  return -1;
}

/**
 * Finds the closing quote character index for single or double quoted strings.
 */
function getClosingQuoteIndex(text: string): number {
  return text.startsWith("'") ? text.indexOf("'", 1) : findClosingDoubleQuote(text);
}

/**
 * Tests whether character at index is a valid colon mapping separator.
 */
function isColonAt(text: string, index: number): boolean {
  return text[index] === ':' && isKeyColon(text, index);
}

/**
 * Verifies that a colon character represents a valid YAML mapping separator.
 */
function isKeyColon(text: string, index: number): boolean {
  if (index === text.length - 1) return true;

  return [' ', '\t'].includes(text[index + 1]);
}

/**
 * Determines whether text begins with a single or double quote.
 */
function isQuotedKey(text: string): boolean {
  return text.startsWith("'") || text.startsWith('"');
}

/**
 * Checks whether quote char at index is not escaped by preceding backslash.
 */
function isUnescapedDoubleQuote(text: string, index: number): boolean {
  return text[index] === '"' && text[index - 1] !== '\\';
}

/**
 * Validates that colon at given position is a proper key separator.
 */
function verifyColonAt(text: string, colonIndex: number): number {
  return isKeyColon(text, colonIndex) ? colonIndex : -1;
}

/**
 * Locates the 0-based character index of the key-value colon delimiter on a YAML line.
 *
 * @param text - The raw line content.
 * @returns Index of the key colon or -1 if not a mapping line.
 *
 * @example
 * ```ts
 * const colonIndex = findFirstKeyColon('name: s20');
 * // Returns 4
 * ```
 */
export function findFirstKeyColon(text: string): number {
  return isQuotedKey(text) ? findQuotedKeyColon(text) : findUnquotedKeyColon(text);
}
