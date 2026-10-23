/**
 * Configuration options for YAML parsing.
 */
export interface YamlParserOptions {
  /**
   * If true, throws an error when a duplicate key is encountered in a mapping. Defaults to false.
   */
  readonly disallowDuplicateKeys?: boolean;
}

/**
 * Represents a preprocessed line of YAML source text.
 */
export interface YamlLine {
  /**
   * Number of leading whitespace indentation spaces on the line.
   */
  readonly indent: number;

  /**
   * Indicates whether the line is empty or contains only comments.
   */
  readonly isEmpty: boolean;

  /**
   * 1-based line number in the source input.
   */
  readonly lineNumber: number;

  /**
   * Original unmodified line content.
   */
  readonly raw: string;

  /**
   * Stripped line content with leading indentation and comments removed.
   */
  readonly text: string;
}

/**
 * Interface for YAML parser instance.
 */
export interface YamlParser {
  /**
   * Parses YAML content string into JavaScript data structure.
   */
  parse<T = unknown>(content: string): T;
}
